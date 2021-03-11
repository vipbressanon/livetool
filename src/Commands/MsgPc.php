<?php

namespace Vipbressanon\LiveTool\Commands;

use Illuminate\Console\Command;
use Workerman\Worker;
use Workerman\Lib\Timer;
use Workerman\Connection\TcpConnection;
use Workerman\Protocols\Http\Request;
use PHPSocketIO\SocketIO;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Vipbressanon\LiveTool\Servers\CourseServer;
use Vipbressanon\LiveTool\Servers\RecordServer;
use Vipbressanon\LiveTool\Servers\RoomServer;
use Vipbressanon\LiveTool\Servers\UsersServer;
use Vipbressanon\LiveTool\Servers\BalanceServer;
use Vipbressanon\LiveTool\Servers\LogsServer;
use Vipbressanon\LiveTool\Servers\SpeedServer;
use Log;
use Illuminate\Support\Facades\Redis;

class MsgPc extends Command
{
    protected $signature = 'wkpc 
    {action=start : start | restart | reload(平滑重启) | stop | status | connetions}
    {--d : deamon or debug}';
    
    protected $description = 'web消息推送服务';
    
    //PHPSocketIO服务
    private static $senderIo = null;
    // 是否老师（1,0），上下台（1,0），白板授权（1,0），开麦闭麦（1,0），摄像头（1,0），来源（0-6）
    // 来源:0是pc端，1是h5手机端，2是h5平板端 3是android 4是android平板 5是ios 6是ios的平板
    private static $teainit = ['isteacher'=>1, 'plat'=>1, 'board'=>1, 'voice'=>1, 'camera'=>1, 'platform'=>0, 'nickname' => '', 'zan' => 0, 'imgurl' => ''];
    // issharing:
    private static $stuinit = ['isteacher'=>0, 'plat'=>0, 'board'=>0, 'voice'=>0, 'camera'=>0, 'platform'=>0, 'nickname' => '', 'zan' => 0, 'imgurl' => '', 'issharing' => 0];
    // 房间内开关参数，type，1屏幕分享模式，2白板模式；ischat，0是禁止聊天，1是允许聊天；ishand，0是禁止举手，1是允许举手；share, 老师获取学生分享屏幕hash_id
    private static $onoffinit = ['roomtype'=>2, 'ischat'=>1, 'ishand'=>1, 'max'=>'', 'boardscale' => 100, 'share' => ''];
    public function __construct()
    {
        parent::__construct();
    }
    
    /**
     * 根据脚本参数开启PHPSocketIO服务
     * PHPSocketIO服务的端口是`2120`
     * 传递数据的端口是`2121`
     */
    public function handle()
    {
        global $argv;
        $action = $this->argument('action');

        // $argv[0] = 'wk';
        $argv[1] = $action;
        $argv[2] = $this->option('d') ? '-d' : '';
        
        // global $argv;
        // //启动php脚本所需的命令行参数
        // $argv[0] = 'MsgPush';
        // $argv[1] = $this->argument('action'); // start | restart | reload(平滑重启) | stop | status | connetions
        // $argv[2] = $this->option('d') ? '-d' : ''; // 守护进程模式或调试模式启动
        
        // 设置所有连接的默认应用层发送缓冲区大小
        TcpConnection::$defaultMaxSendBufferSize = 2 * 1024 * 1024;
        // PHPSocketIO服务
        self::$senderIo = new SocketIO(4120);
        
        // 客户端发起连接事件时，设置连接socket的各种事件回调
        self::$senderIo->on('connection', function ($socket) {
            // 登录
            // 传参：room_id(房间id), hash_id(登录人哈希), isteacher(是否讲师), platform(来源)
            $socket->on('login', function ($request) use ($socket) {
                try {
                    if (!is_array($request)) {
                        $request = json_decode($request, true);
                    }
                    // 已经登录过了
                    if (isset($socket->hash_id)) return;
                    // 用户数据
                    $socket->join($request['room_id']);
                    $socket->room_id = $request['room_id'];
                    $socket->hash_id = $request['hash_id'];
                    $socket->isteacher = $request['isteacher'];
                    $socket->zan = isset($request['zan'])?$request['zan']:0;
                    $socket->nickname = isset($request['nickname'])?$request['nickname']:'';
                    $socket->platform = isset($request['platform']) ? $request['platform'] : 0;
                    $socket->imgurl = isset($request['imgurl']) ? $request['imgurl'] : '';
                    $socket->islistener = (isset($request['islistener']) && $request['islistener']) ? $request['islistener'] : false;
                    $socket->isplat = isset($request['isplat'])?$request['isplat']:1;
                    // socket日志
                    self::logs($socket, ['type' => 'connection']);
                    // 判断是否有课程的结束时间，没有去取
                    if (!Redis::exists($socket->room_id.'room_endtime')) {
                        $cs = new CourseServer();
                        $endtime_str = $cs->endtime($socket->room_id);
                        $room_endtime = $endtime_str ? strtotime($endtime_str) + 1800 : 0;

                        $starttime = strtotime(date("Y-m-d H:i:s"));
                        $redistime = $room_endtime - $starttime;
                        $redistime = $redistime > 0 ? $redistime : 9000;
                        self::redisSet($socket->room_id, $socket->room_id.'room_endtime', $room_endtime, $redistime);
                    }

                    //加锁，防止并发情况下redis里users数据不同步
                    do {
                        $timeout = 2;
                        $key = 'room_lock_' . $socket->room_id;
                        $value = 'user_' . $socket->hash_id;    //分配一个随机的值,防止误删其他请求创建的锁
                        $is_lock = Redis::set($key, $value, 'ex', $timeout, 'nx');
                        if ($is_lock) {
                            //相关逻辑处理
                            if (!$socket->islistener) {
                                // 在线人员处理
                                self::userlist($socket, 'add');
                                // 如果自动上台，做上台处理，否则做手动上台处理
                                if ($socket->isplat) {
                                    self::addplat($socket, $socket->hash_id, $socket->isteacher, $request['up_top']);
                                } else {
                                    self::handplat($socket, $socket->hash_id, $socket->isteacher, $request['up_top']);
                                }
                            } else {
                                // 在线人员处理  index+1
                                self::userlist($socket, 'listener');
                                $userlistener = Redis::exists($socket->room_id.'listener')?self::redisGet($socket->room_id.'listener'):[];
                                $userlistener[$socket->hash_id] = $socket->id;
                                self::redisSet($socket->room_id, $socket->room_id.'listener', $userlistener);
                            }
                            $users = self::redisGet($socket->room_id.'users');

                            if (Redis::get($key) == $value) {   //防止提前过期，误删其它请求创建的锁
                                Redis::del($key);
                                continue;
                            }
                        } else {
                            usleep(500);    //睡眠，降低抢锁频率，缓解redis压力
                        }
                    } while (!$is_lock);

                    // 更新维护 usersocket数组  用于限制单设备登录
                    $usersocket = Redis::exists($socket->room_id.'usersocket')?self::redisGet($socket->room_id.'usersocket'):[];
                    $usersocket[$socket->hash_id] = $socket->id;
                    self::redisSet($socket->room_id, $socket->room_id.'usersocket', $usersocket);
                    // 房间开关初始化
                    if (Redis::exists($socket->room_id.'onoff')) {
                        $arr = self::redisGet($socket->room_id.'onoff');
                        $onoff = $arr['onoff'];
                    } else {
                        $onoff = self::$onoffinit;
                        self::redisSet($socket->room_id, $socket->room_id.'onoff', ['onoff'=>$onoff, 'index'=>0]);
                        self::logs($socket, ['type' => 'roominit']);
                    }
                    
                    self::$senderIo->to($socket->room_id)->emit(
                        'addusers',
                        [
                            'users' => $users['users'],
                            'index' => $users['index'],
                            'onoff' => $onoff,
                            'socketid' => $socket->id,
                            'hashid' => $socket->hash_id
                        ]
                    );
                    $socket->emit('servertime', ['time'=>time()]);
                } catch(\Exception $e) {
                    self::errors($socket, '[login] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });

            // 主动获取房间内用户列表
            $socket->on('userslist', function () use ($socket) {
                try {
                    $users = self::redisGet($socket->room_id.'users');
                    $onoff = self::redisGet($socket->room_id.'onoff');
                    $socket->emit('userslist', [
                        'users' => $users['users'],
                        'index' => $users['index'],
                        'onoff' => $onoff['onoff'],
                        'socketid' => $socket->id,
                        'hashid' => $socket->hash_id
                    ]);
                } catch(\Exception $e) {
                    self::errors($socket, '[userslist] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            
            // 讲师创建房间后邀请所有人进入
            $socket->on('create', function () use ($socket) {
                try {
                    $cs = new CourseServer();
                    $time = $cs->starttime($socket->room_id);
                    if($time) {
                        self::$senderIo->to($socket->room_id)->emit(
                            'create',
                            [
                                'teacher_hash_id' => $socket->hash_id,
                                'starttime' => $time
                            ]
                        );
                    } else {
                        self::$senderIo->to($socket->room_id)->emit('fail');
                    }
                    self::logs($socket, ['type' => 'create']);
                } catch(\Exception $e) {
                    self::errors($socket, '[create] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            
            // 开始上课
            // 传参：up_top(上台人数上限), teacher_hash_id(讲师哈希)
            $socket->on('enter', function () use ($socket) {
                try {
                    // 已通过腾讯云接口获取数据，该方法弃用
                    // $us = new UsersServer();
                    // $us->start($socket->room_id, $socket->hash_id, $socket->platform, $socket->islistener);
                    
                    // if ($socket->isteacher) {
                    //     $interval = config('livetool.intervaltime');
                    //     $balance = new BalanceServer();
                    //     // 每隔一段时间执行一次结算
                    //     $socket->timer_id = Timer::add($interval, [$balance, 'handle'], [$socket->room_id], true);
                    // }
                    self::logs($socket, ['type' => 'enter']);
                } catch(\Exception $e) {
                    self::errors($socket, '[enter] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            
            // 下课
            $socket->on('over', function () use ($socket) {
                try {
                    $record = new RecordServer();
                    $record->handle($socket->room_id, 3);
                    $balance = new BalanceServer();
                    // 10秒以后执行一次结算,定时器只执行一次
                    //Timer::add(10, [$balance, 'handle'], [$socket->room_id], false);
                    self::$senderIo->to($socket->room_id)->emit('over');
                    self::logs($socket, ['type' => 'over']);
                } catch(\Exception $e) {
                    self::errors($socket, '[over] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            // 离开页面,退出房间
            $socket->on('disconnect', function () use ($socket) {
                try {
                    if (empty($socket->hash_id)) {
                        return;
                    }
                    //记录白板授权时长
                    $course = new CourseServer();
                    $course->addBoardLog($socket->room_id, $socket->hash_id);
                    // 已通过腾讯云接口获取数据，该方法弃用
                    // $us = new UsersServer();
                    // $us->end($socket->room_id, $socket->hash_id);
                    // 如果是教师 走结算
                    // if ($socket->isteacher) {
                    //     $balance = new BalanceServer();
                    //     $balance->handle($socket->room_id);
                    //     if (isset($socket->timer_id)) {
                    //         Timer::del($socket->timer_id);
                    //     }
                    // }
                    // 多地登陆，前者被下线 不走用户退出全网通知
                    $usersocket = self::redisGet($socket->room_id.'usersocket')?:[];
                    if (array_key_exists($socket->hash_id, $usersocket) && $usersocket[$socket->hash_id] != $socket->id) {
                        $userlistener = self::redisGet($socket->room_id.'listener')?:[];
                        if (array_key_exists($socket->hash_id, $userlistener)) {
                            unset($userlistener[$socket->hash_id]);
                            self::redisSet($socket->room_id, $socket->room_id.'listener', $userlistener);
                        } else {
                            self::logs($socket, ['type' => 'relogin']);
                            return;
                        }
                    }
                    $arr = self::redisGet($socket->room_id.'onoff');
                    if ($socket->hash_id == $arr['onoff']['max']) {
                        $arr['onoff']['max'] = '';
                        if ($socket->isteacher) {
                            $arr['onoff']['roomtype'] = 2;
                        }
                        self::redisSet($socket->room_id, $socket->room_id.'onoff', ['onoff'=>$arr['onoff'], 'index'=>$arr['index']]);
                        self::logs($socket, [
                            'type' => 'roomtype',
                            'status' => 2
                        ]);
                    }
                    if ($socket->hash_id.'screen' == $arr['onoff']['share']) {
                        $arr['onoff']['share'] = '';
                        self::redisSet($socket->room_id, $socket->room_id.'onoff', ['onoff'=>$arr['onoff'], 'index'=>$arr['index']]);
                    }
                    self::userlist($socket, 'cut');
                    if (Redis::exists($socket->room_id.'users')) {
                        $users = self::redisGet($socket->room_id.'users');
                        self::$senderIo->to($socket->room_id)->emit(
                            'cutusers',
                            [
                                'users' => $users['users'],
                                'index' => $users['index'],
                                'onoff' => $arr['onoff']
                            ]
                            
                        );
                    }
                    self::logs($socket, ['type' => 'disconnect']);
                } catch(\Exception $e) {
                    self::errors($socket, '[disconnect] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            
            // 传参：hash_id(被更改权限人哈希), type(权限类型), status(权限更改后状态)
            $socket->on('permission', function ($request) use ($socket)  {
                try {
                    if ($request['type'] == 'plat' && $request['status'] == 1) {
                        $res = self::addplat($socket, $request['hash_id'], 0, $request['up_top']);
                    } elseif ($request['type'] == 'plat' && $request['status'] == 0) {
                        $res = self::cutplat($socket, $request['hash_id']);
                    } elseif ($request['type'] == 'issharing' && $request['status'] == 1) {
                        // 学生点击同意屏幕分享 判断$arr['onoff']['share']是否为空 为空则老师点击了关闭屏幕分享
                        $arr = self::redisGet($socket->room_id . 'onoff');
                        if($arr['onoff']['share']){
                            $res = self::permission($socket, $request['hash_id'], $request['type'], $request['status']);
                        }else{
                            return;
                        }

                    } else {
                        $res = self::permission($socket, $request['hash_id'], $request['type'], $request['status']);
                    }

                    $nickname = isset($request['nickname']) ? $request['nickname'] : '';
                    self::$senderIo->to($socket->room_id)->emit(
                        'permission',
                        [
                            'type' => $request['type'],
                            'users' => $res,
                            'nickname' => $nickname
                        ]
                    );
                } catch(\Exception $e) {
                    self::errors($socket, '[permission] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            
            // 批量修改上台人员状态
            $socket->on('platbatch', function ($request) use ($socket)  {
                try {
                    $users = [];
                    $index = 0;
                    // 从Redis读取在线人员信息
                    if (Redis::exists($socket->room_id.'users')) {
                        $arr = self::redisGet($socket->room_id.'users');
                        $users = $arr['users'];
                        $index = $arr['index'];
                    }
                    if (in_array($request['type'], ['board', 'voice'])) {
                        foreach ($users as &$v) {
                            if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                                $v[$request['type']] = $request['status'];
                            }
                        }
                    }
                    $index++;

                    self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
                    self::$senderIo->to($socket->room_id)->emit(
                        'platbatch',
                        [
                            'type' => $request['type'],
                            'status' => $request['status'],
                            'users' => $users,
                            'index' => $index
                        ]
                    );
                    self::logs($socket, [
                        'type' => 'plat'.$request['type'],
                        'status' => $request['status']
                    ]);
                } catch(\Exception $e) {
                    self::errors($socket, '[platbatch] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
            
            // 房间开关设置
            $socket->on('onoff', function ($request) use ($socket)  {
                try {
                    if (!is_array($request)) {
                        $request = json_decode($request, true);
                    }
                    $index = 0;
                    if (Redis::exists($socket->room_id.'onoff')) {
                        $onoff = self::redisGet($socket->room_id.'onoff');
                        $arr = $onoff['onoff'];
                        $index = $onoff['index'];
                    } else {
                        $arr = self::$onoffinit;
                    }
                    if (isset($arr[$request['type']])) {
                        $arr[$request['type']] = $request['status'];
                    }
                    if ($request['type'] == 'roomtype') {
                        $arr['max'] = $request['status'] == 1 ? $socket->hash_id.'screen' : '';
                    }
                    $index++;
                    self::redisSet($socket->room_id, $socket->room_id.'onoff', ['onoff'=>$arr, 'index'=>$index]);
                    self::$senderIo->to($socket->room_id)->emit(
                        'onoff',
                        [
                            'type' => $request['type'],
                            'status' => $request['status'],
                            'onoff' => $arr,
                            'index' => $index
                        ]
                    );
                    self::logs($socket, [
                        'type' => $request['type'],
                        'status' => $request['status']
                    ]);
                } catch(\Exception $e) {
                    self::errors($socket, '[onoff] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            }); 
            
            // 消息转发
            $socket->on('im', function ($request) use ($socket)  {
                try {
                    if (!is_array($request)) {
                        $request = json_decode($request, true);
                    }
                    if ($request['type'] == 'MAX') {
                        $arr = self::redisGet($socket->room_id.'onoff');
                        $arr['onoff']['max'] = $request['text'] == 1 ? $request['hash_id'] : '';
                        self::redisSet($socket->room_id, $socket->room_id.'onoff', ['onoff'=>$arr['onoff'], 'index'=>$arr['index']]);
                    } else if ($request['type'] == 'PLATZAN') {
                        if (Redis::exists($socket->room_id.'users')) {
                            $usersarr = self::redisGet($socket->room_id.'users');
                            $users = $usersarr['users'];
                            $index = $usersarr['index'];
                            $filtered = collect($users)->map(function ($item) {
                                if ($item['isteacher'] == 0 && $item['plat'] == 1) {
                                    $item['zan']++;
                                }
                                return $item;
                            });
                            $users = $filtered->all();
                            self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
                        }
                    } else if ($request['type'] == 'ZAN') {
                        if (Redis::exists($socket->room_id.'users')) {
                            $usersarr = self::redisGet($socket->room_id.'users');
                            $users = $usersarr['users'];
                            $index = $usersarr['index'];
                            if (array_key_exists($request['hash_id'], $users)) {
                                $users[$request['hash_id']]['zan']++;
                            }
                            self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
                        }
                    } else if ($request['type'] == 'SHARE') {
                        $arr = self::redisGet($socket->room_id . 'onoff');
                        $arr['onoff']['share'] = $request['text'] == 1 ? $request['hash_id'] . 'screen' : '';
                        self::redisSet($socket->room_id, $socket->room_id . 'onoff', ['onoff' => $arr['onoff'], 'index' => $arr['index']]);
                        $users = self::redisGet($socket->room_id . 'users');
                        $request['issharing'] = 0;
                        if ($request['text'] == 1) {
                            $request['issharing'] = $users['users'][$request['hash_id']]['issharing'];
                        }

                        /*$request['share'] = $arr['onoff']['share'];

                        $users = self::redisGet($socket->room_id . 'users');
                        $request['users'] = $users['users'];*/
                    } else if ($request['type'] == 'practice') {
                        // 编程的练习模式
                        $arrRoomPractice['hash_id'] = isset($request['hash_id']) ? $request['hash_id'] : '';
                        $arrRoomPractice['course_hash_id'] = isset($request['course_hash_id']) ? $request['course_hash_id'] : '';
                        $arrRoomPractice['chapter_hash_id'] = isset($request['chapter_hash_id']) ? $request['chapter_hash_id'] : '';
                        $arrRoomPractice['class_hash_id'] = isset($request['class_hash_id']) ? $request['class_hash_id'] : '';
                        self::redisSet($socket->room_id, $socket->room_id . 'practice', $arrRoomPractice);
                    }

                    self::$senderIo->to($socket->room_id)->emit('im', $request);
                    // 如果学生已经同意过就不再显示确认同意页面 直接分享视频
                    if ($request['type'] == 'SHARE' && $arr['onoff']['share'] && $users['users'][$request['hash_id']]['issharing'] == 1) {
                        self::$senderIo->to($socket->room_id)->emit(
                            'permission',
                            [
                                'type' => 'issharing',
                                'users' => [$request['hash_id'] => $users['users'][$request['hash_id']]],
                            ]
                        );
                    }
                    self::logs($socket, [
                        'type' => $request['type'],
                        'hash_id' => isset($request['hash_id']) ? $request['hash_id'] : '',
                        'nickname' => isset($request['nickname']) ? $request['nickname'] : '',
                        'text' => isset($request['text']) ? $request['text'] : '',
                        'status' => isset($request['status']) ? $request['status'] : ''
                    ]);
                } catch(\Exception $e) {
                    self::errors($socket, '[im] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });

            $socket->on('device', function ($request) use ($socket)  {
                try {
                    if ($request['type'] == 'switch') {

                    }
                    self::logs($socket, [
                        'type' => $request['type'],
                        'camera' => $request['camera'],
                        'mic' => $request['mic']
                    ]);
                } catch(\Exception $e) {
                    self::errors($socket, '[device] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });

            $socket->on('speedtest', function ($request) use ($socket)  {
                try {
                    $data = null;
                    if ($request['type'] == 'speed1') {
                        // 通知被测人员
                        self::$senderIo->to($socket->room_id)->emit(
                            'speedtest',
                            [
                                'type' => $request['type'],
                                'hash_id' => $request['hash_id']
                            ]
                        );
                    } elseif ($request['type'] == 'speed2') {
                        // 被测人员回传结果，并返回给老师
                        $data = $request['data'];
                        self::$senderIo->to($socket->room_id)->emit(
                            'speedtest',
                            [
                                'type' => $request['type'],
                                'hash_id' => $request['hash_id'],
                                'data' => $data
                            ]
                        );
                        $option = [
                            'room_id' => $socket->room_id,
                            'hash_id' => $request['hash_id'],
                            'speeddata' => $data
                        ];
                        $ss = new SpeedServer();
                        $ss->save($option);
                    }
                    self::logs($socket, [
                        'type' => $request['type'],
                        'hash_id' => $request['hash_id'],
                        'data' => $data
                    ]);
                } catch(\Exception $e) {
                    self::errors($socket, '[speedtest] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            });
        });
        // self::$senderIo->onBufferFull = function($socket)
        // {
        //     //暂停发送
        //     var_dump('暂停发送');
        // };
        // self::$senderIo->onBufferDrain = function($socket)
        // {
        //     //继续发送
        //     var_dump('继续发送');
        // };
        
        // 当self::$senderIo启动后监听一个http端口，通过这个端口可以给任意uid或者所有uid推送数据
        self::$senderIo->on('workerStart', function () {
            // 监听一个http端口
            $innerHttpWorker = new Worker('http://0.0.0.0:4121');
            // 当http客户端发来数据时触发
            $innerHttpWorker->onMessage = function ($httpConnection, $request) {
                try {
                    $type = !empty($request->get('type')) ? $request->get('type') : '';
                    $content = !empty($request->get('content')) ? $request->get('content') : '';
                    $content = $content ? json_decode($content, true) : '';
                    $room_id = !empty($request->get('room_id')) ? $request->get('room_id') : '';
                    // 推送数据的url格式 type=publish&to=uid&content=xxxx
                    if ($room_id == '' && $type != 'classover') {
                        return $httpConnection->send(json_encode(['error'=>'暂不支持全局消息']));
                    }
                    switch ($type) {
                        // 超时强制下课
                        case 'classover':
                            if (array_key_exists('course_id', $content)) {
                                // 改变直播间状态
                                $rs = new RoomServer();
                                $rs->end($content['course_id'], $room_id);
                                if ($room_id) {                     // 开课 存在roomid 做房间相关处理
                                    // 关闭录制
                                    $record = new RecordServer();
                                    $record->handle($room_id, 3);
                                    // 结算
                                    $balance = new BalanceServer();
                                    // 10秒以后执行一次结算,定时器只执行一次
                                    //Timer::add(10, [$balance, 'handle'], [$socket->room_id], false);
                                    self::$senderIo->to($room_id)->emit('over');
                                }
                            }
                            return $httpConnection->send($this->output());
                            break;
                        case 'downtips':
                            self::$senderIo->to($room_id)->emit($type);
                            return $httpConnection->send($this->output());
                            break;
                        case 'userlist':
                            if (Redis::exists($room_id.'users')) {
                                $users = self::redisGet($room_id.'users');
                                return $httpConnection->send($this->output(200, '操作成功', $users['users']));
                            } else {
                                return $httpConnection->send($this->output(201, '数据不存在'));
                            }
                            break;
                        default:
                            # code...
                            break;
                    }
                    return $httpConnection->send(json_encode(['error'=>'没有匹配的发送类型']));
                } catch(\Exception $e) {
                    self::errors($socket, '[workerStart] '.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
                    Log::info('websocket:', $e->getTrace());
                }
            };
            // 执行监听
            $innerHttpWorker->listen();
        });

        Worker::runAll();
    }
    
    // 在线人员
    public static function userlist($socket, $type)
    {
        $room_id = $socket->room_id;
        $hash_id = $socket->hash_id;
        $isteacher = $socket->isteacher;
        $platform = $socket->platform;
        $zan = $socket->zan;
        $nickname = $socket->nickname;
        // 截取图片公共域名 只保存真实图片路径 减小返回数据大小
        $imgarr = explode(".com/", $socket->imgurl);
        $imgurl = count($imgarr) > 1 ? $imgarr[1]: 'face.png';
        // 变量初始值
        $users = [];
        $index = 0;
        // 从Redis读取在线人员信息
        if (Redis::exists($room_id.'users')) {
            $arr = self::redisGet($room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if ($type == 'add') {           // 人员增加
            
            if (Redis::exists($room_id.$hash_id)) {     // 缓存中是否存有该人员数据
                self::logs($socket, ['type' => 'useradd']);
                $users[$hash_id] = self::redisGet($room_id.$hash_id);
            } elseif (!array_key_exists($hash_id, $users)) {    // 初始化数据
                self::logs($socket, ['type' => 'userinit']);
                $users[$hash_id] = $isteacher ? self::$teainit : self::$stuinit;
            }
            $users[$hash_id]['nickname'] = $nickname;
            $users[$hash_id]['zan'] = $zan;
            $users[$hash_id]['platform'] = $platform;
            $users[$hash_id]['imgurl'] = $imgurl;
        } elseif ($type == 'cut') {     // 人员减少
            
            if (array_key_exists($hash_id, $users)) {
                self::logs($socket, ['type' => 'userdel']);
                self::redisSet($socket->room_id, $room_id.$hash_id, $users[$hash_id]);
                unset($users[$hash_id]);
            }
            // 用户数组为空 清除redis
            if (count($users) == 0) {
                Redis::del($room_id.'users');
                Redis::del($room_id.'onoff');
                return ;
            }
        }
        $index++;
        self::redisSet($socket->room_id, $room_id.'users', ['users'=>$users, 'index'=>$index]);
    }
    
    // 权限处理
    public static function permission($socket, $hash_id, $type, $status)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        // 从Redis读取在线人员信息
        if (Redis::exists($socket->room_id.'users')) {
            $arr = self::redisGet($socket->room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if (!array_key_exists($hash_id, $users)) {
            $users[$hash_id] = self::$stuinit;
        }
        if (isset($users[$hash_id][$type])) {
            $users[$hash_id][$type] = $status;
        }
        $index++;
        self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
        // 持久化保留用户状态
        if (array_key_exists($hash_id, $users)) {
            self::redisSet($socket->room_id, $socket->room_id.$hash_id, $users[$hash_id]);
        }
        self::logs($socket, [
            'type' => $type,
            'hash_id' => $hash_id,
            'status' => $status
        ]);
        return [$hash_id => $users[$hash_id]];
    }

    // 自动上台处理
    public static function addplat($socket, $hash_id, $isteacher, $up_top)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        $stucount = 0;
        // 从Redis读取在线人员信息
        if (Redis::exists($socket->room_id.'users')) {
            $arr = self::redisGet($socket->room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if (!$isteacher) {
            foreach ($users as $v) {
                if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                    $stucount ++;
                }
            }
            // 缓存中是否存有该人员数据
            if (Redis::exists($socket->room_id.$hash_id)) {
                $temp = self::redisGet($socket->room_id.$hash_id);
                if ($temp['plat'] == 1 && $stucount > intval($up_top)) {
                    $users[$hash_id]['plat'] = 0;
                    $users[$hash_id]['camera'] = 0;
                    $users[$hash_id]['board'] = 0;
                    $users[$hash_id]['voice'] = 0;
                }
            }
            // 未超出上台人数上限
            if ($users[$hash_id]['plat'] == 0 && $stucount < intval($up_top)) {
                $users[$hash_id]['plat'] = 1;
                $users[$hash_id]['camera'] = 1;
            }
        }
        
        $index++;
        self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
        if ($users[$hash_id]['plat'] == 1) {
            self::logs($socket, [
                'type' => 'plat',
                'hash_id' => $hash_id,
                'status' => 1
            ]);
        }
        return [$hash_id => $users[$hash_id]];
    }

    // 手动上台处理，主要检查保留权限人员再进来时是否超过上台人数上限
    public static function handplat($socket, $hash_id, $isteacher, $up_top)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        $stucount = 0;
        // 从Redis读取在线人员信息
        if (Redis::exists($socket->room_id.'users')) {
            $arr = self::redisGet($socket->room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if (!$isteacher) {
            foreach ($users as $v) {
                if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                    $stucount ++;
                }
            }
            // 缓存中是否存有该人员数据
            if (Redis::exists($socket->room_id.$hash_id)) {
                $temp = self::redisGet($socket->room_id.$hash_id);
                if ($temp['plat'] == 1 && $stucount > intval($up_top)) {
                    $users[$hash_id]['plat'] = 0;
                    $users[$hash_id]['camera'] = 0;
                    $users[$hash_id]['board'] = 0;
                    $users[$hash_id]['voice'] = 0;
                }
            }
        }
        
        $index++;
        self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
        if ($users[$hash_id]['plat'] == 0) {
            self::logs($socket, [
                'type' => 'plat',
                'hash_id' => $hash_id,
                'status' => 0
            ]);
        }
        return [$hash_id => $users[$hash_id]];
    }
    
    // 下台处理
    public static function cutplat($socket, $hash_id)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        $stucount = 0;
        // 从Redis读取在线人员信息
        if (Redis::exists($socket->room_id.'users')) {
            $arr = self::redisGet($socket->room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
            if (array_key_exists($hash_id, $users)) {
                $users[$hash_id]['plat'] = 0;
                $users[$hash_id]['board'] = 0;
                $users[$hash_id]['voice'] = 0;
                $users[$hash_id]['camera'] = 0;
            }
        }
        $index++;
        self::redisSet($socket->room_id, $socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
        if ($users[$hash_id]['plat'] == 0) {
            self::logs($socket, [
                'type' => 'plat',
                'hash_id' => $hash_id,
                'status' => 0
            ]);
        }
        return [$hash_id => $users[$hash_id]];
    }
    
    private function output($code = 200, $msg = '操作成功', $data = [])
    {
        $json = [
            'meta' => [
                'code' => $code,
                'msg' => $msg
            ],
            'data' => $data
        ];
        return json_encode($json);
    }

    public static function logs($socket, $arr)
    {
        $res = new LogsServer();
        $res->handle($socket, $arr);
    }

    public static function errors($socket, $msg)
    {
        $res = new LogsServer();
        $res->errors($socket, $msg);
    }

    public static function redisSet($room_id, $key, $arr = [], $redistime = 9000)
    {
        try {
            if ($key != $room_id.'room_endtime' && Redis::exists($room_id.'room_endtime')) {
                $endtime = self::redisGet($room_id.'room_endtime');
                $starttime = strtotime(date("Y-m-d H:i:s"));
                $redistime = $endtime - $starttime;
            }
            $redistime = $redistime > 0 ? $redistime : 9000;
        } catch(\Exception $e) {
            self::errors($socket, '[saveredis] '.$e->getMessage().' line:'.$e->getLine());
            Log::info('websocket:'.$e->getMessage().' line:'.$e->getLine());
            Log::info('websocket:', $e->getTrace());
            $redistime = 9000;
        }
        Redis::setex($key, $redistime, serialize($arr));
    }

    public static function redisGet($key)
    {
        return unserialize(Redis::get($key));
    }
}
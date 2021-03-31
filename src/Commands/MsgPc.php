<?php

namespace Vipbressanon\LiveTool\Commands;

use Illuminate\Console\Command;
use phpDocumentor\Reflection\Types\Self_;
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
    private static $teainit = ['isteacher'=>1, 'plat'=>1, 'board'=>1, 'voice'=>1, 'camera'=>1, 'platform'=>0,'pdetail'=>'', 'nickname' => '', 'zan' => 0, 'imgurl' => ''];
    // issharing:    ;stuvoice:0-关，1-开，2-有问题；stucamera:0-关，1-开，2-有问题；pdetail:设备的详细信息
    private static $stuinit = ['isteacher'=>0, 'plat'=>0, 'board'=>0, 'voice'=>0, 'camera'=>0,'stuvoice'=>1,'stucamera'=>1, 'platform'=>0,'pdetail'=>'' ,'nickname' => '', 'zan' => 0, 'imgurl' => '', 'issharing' => 0];
    // 房间内开关参数，type，1屏幕分享模式，2白板模式；ischat，0是禁止聊天，1是允许聊天；ishand，0是禁止举手，1是允许举手；share, 老师获取学生分享屏幕hash_id，isplat：0-非自动上下台，1-自动上下台,allshare:0-非全员共享，1-全员共享
    private static $onoffinit = ['roomtype'=>2, 'ischat'=>1, 'ishand'=>1, 'max'=>'', 'boardscale' => 100, 'share' => '', 'isplat'=>'','allshare'=>0];
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
                    $socket->user_id = $request['user_id']; //新增参数用户id
                    $socket->room_id = $request['room_id'];
                    $socket->hash_id = $request['hash_id'];
                    $socket->isteacher = $request['isteacher'];
                    $socket->zan = isset($request['zan'])?$request['zan']:0;
                    $socket->nickname = isset($request['nickname'])?$request['nickname']:'';
                    $socket->platform = isset($request['platform']) ? $request['platform'] : 0;
                    $socket->pdetail = isset($request['pdetail']) ? $request['pdetail'] : '';
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
                                //白名单首个进入，将白名单学生list存入离线数组；将该人员存入缓存
                                self::set_user_cache($socket);
                                // 如果自动上台，做上台处理，否则做手动上台处理
                                if ($socket->isplat) {
                                    self::addplat($socket, $socket->hash_id, $socket->isteacher, $request['up_top']);
                                } else {
                                    self::handplat($socket, $socket->hash_id, $socket->isteacher, $request['up_top']);
                                }
                            } else {
                                // 在线人员处理  index+1
                                //self::userlist($socket, 'listener');
                                $userlistener = Redis::exists($socket->room_id.'listener')?self::redisGet($socket->room_id.'listener'):[];
                                $userlistener[$socket->hash_id] = $socket->id;
                                self::redisSet($socket->room_id, $socket->room_id.'listener', $userlistener);
                            }
                            $users_plat = self::redisGet($socket->room_id . 'users_plat');
                            $users_notplat = self::redisGet($socket->room_id . 'users_notplat');
                            $users_notinroom = self::redisGet($socket->room_id . 'users_notinroom');


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
                    $onoff_index = 0;
                    if (Redis::exists($socket->room_id.'onoff')) {
                        $arr = self::redisGet($socket->room_id.'onoff');
                        $onoff = $arr['onoff'];
                        $onoff_index = $arr['index'];
                    } else {
                        $onoff = self::$onoffinit;
                        self::redisSet($socket->room_id, $socket->room_id.'onoff', ['onoff'=>$onoff, 'index'=>0]);
                        self::logs($socket, ['type' => 'roominit']);
                    }

                    self::$senderIo->to($socket->room_id)->emit(
                        'addusers',
                        [
                            'users_plat' => $users_plat['users'],
                            'index_plat' => $users_plat['index'],
                            'users_notplat' => $users_notplat['users'],
                            'index_notplat' => $users_notplat['index'],
                            'users_notinroom' => $users_notinroom['users'],
                            'index_notinroom' => $users_notinroom['index'],
                            'onoff' => $onoff,
                            'onoff_index' => $onoff_index,
                            'socketid' => $socket->id,
                            'hashid' => $socket->hash_id,
                            'userid' => $socket->user_id,
                            // 'list' => $list,
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
                    $users_plat = self::redisGet($socket->room_id . 'users_plat');
                    $users_notplat = self::redisGet($socket->room_id . 'users_notplat');
                    $users_notinroom = self::redisGet($socket->room_id . 'users_notinroom');
                    $onoff = self::redisGet($socket->room_id.'onoff');
                    $socket->emit('userslist', [
                        'users_plat' => $users_plat['users'],
                        'index_plat' => $users_plat['index'],
                        'users_notplat' => $users_notplat['users'],
                        'index_notplat' => $users_notplat['index'],
                        'users_notinroom' => $users_notinroom['users'],
                        'index_notinroom' => $users_notinroom['index'],
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
                    // self::userlist($socket, 'cut');
                    self::cutuser($socket, $socket->hash_id, $socket->isteacher);

                    $users_plat = self::redisGet($socket->room_id . 'users_plat');
                    $users_notplat = self::redisGet($socket->room_id . 'users_notplat');
                    $users_notinroom = self::redisGet($socket->room_id . 'users_notinroom');
                    self::$senderIo->to($socket->room_id)->emit(
                        'cutusers',
                        [
                            'users_plat' => $users_plat['users'],
                            'index_plat' => $users_plat['index'],
                            'users_notplat' => $users_notplat['users'],
                            'index_notplat' => $users_notplat['index'],
                            'users_notinroom' => $users_notinroom['users'],
                            'index_notinroom' => $users_notinroom['index'],
                            'onoff' => $arr['onoff'],
                            'usersocket' => $usersocket,
                            'socketid' => $socket->id,
                        ]
                    );
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
                    $users_plat = [];
                    $index_plat = 0;
                    // 从Redis读取台上人员信息
                    if (Redis::exists($socket->room_id.'users_plat')) {
                        $arr = self::redisGet($socket->room_id . 'users_plat');
                        $users_plat = $arr['users'];
                        $index_plat = $arr['index'];
                    }
                    if (in_array($request['type'], ['board', 'voice'])) {
                        foreach ($users_plat as &$v) {
                            if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                                $v[$request['type']] = $request['status'];
                            }
                        }
                    }
                    $index_plat++;

                    self::redisSet($socket->room_id, $socket->room_id.'users_plat', ['users'=>$users_plat, 'index'=>$index_plat]);
                    self::$senderIo->to($socket->room_id)->emit(
                        'platbatch',
                        [
                            'type' => $request['type'],
                            'status' => $request['status'],
                            'users_plat' => $users_plat,
                            'index_plat' => $index_plat
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
                        if (Redis::exists($socket->room_id.'users_plat')) {
                            $usersarr = self::redisGet($socket->room_id.'users_plat');
                            $users_plat = $usersarr['users'];
                            $index_plat = $usersarr['index'];
                            $filtered = collect($users_plat)->map(function ($item) {
                                if ($item['isteacher'] == 0 && $item['plat'] == 1) {
                                    $item['zan']++;
                                }
                                return $item;
                            });
                            $users_plat = $filtered->all();
                            self::redisSet($socket->room_id, $socket->room_id.'users_plat', ['users'=>$users_plat, 'index'=>$index_plat]);
                        }
                    } else if ($request['type'] == 'ZAN') {
                        if (Redis::exists($socket->room_id.'users_plat')) {
                            $usersarr = self::redisGet($socket->room_id.'users_plat');
                            $users_plat = $usersarr['users'];
                            $index_plat = $usersarr['index'];
                            if (array_key_exists($request['hash_id'], $users_plat)) {
                                $users_plat[$request['hash_id']]['zan']++;
                            }
                            self::redisSet($socket->room_id, $socket->room_id.'users_plat', ['users'=>$users_plat, 'index'=>$index_plat]);
                        }
                    } else if ($request['type'] == 'SHARE') {
                        $arr = self::redisGet($socket->room_id . 'onoff');

                        //zln
                        $users_plat = self::redisGet($socket->room_id . 'users_plat');
                        $request['issharing'] = 0;
                        if ($request['text'] == 1) {
                            $request['issharing'] = $users_plat['users'][$request['hash_id']]['issharing'];
                            $request['old'] = $arr['onoff']['share'] ? $arr['onoff']['share'] : '';
                        }

                        $arr['onoff']['share'] = $request['text'] == 1 ? $request['hash_id'] . 'screen' : '';
                        self::redisSet($socket->room_id, $socket->room_id . 'onoff', ['onoff' => $arr['onoff'], 'index' => $arr['index']]);

                    } else if ($request['type'] == 'practice') {
                        // 编程的练习模式
                        $arrRoomPractice['hash_id'] = isset($request['hash_id']) ? $request['hash_id'] : '';
                        $arrRoomPractice['course_hash_id'] = isset($request['course_hash_id']) ? $request['course_hash_id'] : '';
                        $arrRoomPractice['chapter_hash_id'] = isset($request['chapter_hash_id']) ? $request['chapter_hash_id'] : '';
                        $arrRoomPractice['class_hash_id'] = isset($request['class_hash_id']) ? $request['class_hash_id'] : '';
                        self::redisSet($socket->room_id, $socket->room_id . 'practice', $arrRoomPractice);
                    } else if ($request['type'] == 'TEXT') {
                        $request['time'] = time();
                    }

                    self::$senderIo->to($socket->room_id)->emit('im', $request);
                    // 如果学生已经同意过就不再显示确认同意页面 直接分享视频
                    if ($request['type'] == 'SHARE' && $arr['onoff']['share'] && $users_plat['users'][$request['hash_id']]['issharing'] == 1) {
                        self::$senderIo->to($socket->room_id)->emit(
                            'permission',
                            [
                                'type' => 'issharing',
                                'users' => [$request['hash_id'] => $users_plat['users'][$request['hash_id']]],
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
                            list(
                                $users_plat,
                                $users_notplat,
                                $users_notinroom,
                                $index_plat,
                                $index_notplat,
                                $index_notinroom
                                ) = self::users_arr_init($room_id);
                            $allusers = array_merge($users_plat, $users_notplat, $users_notinroom);
                            if ($allusers) {
                                return $httpConnection->send($this->output(200, '操作成功', $allusers));
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

    /**
     * Notice: 白名单首个进入，将白名单学生list存入离线数组；将该人员存入缓存
     * Author: chenxl
     * DateTime 2021/3/17 16:35
     * @param $socket
     * @return array|mixed
     */
    public static function set_user_cache($socket)
    {
        Log::info('set_user_cache------start');

        $user_id = $socket->user_id;
        $room_id = $socket->room_id;
        $hash_id = $socket->hash_id;
        $isteacher = $socket->isteacher;
        $platform = $socket->platform;
        $pdetail = $socket->pdetail;//设备详细信息
        $zan = $socket->zan;
        $nickname = $socket->nickname;
        // 截取图片公共域名 只保存真实图片路径 减小返回数据大小
        $imgarr = explode(".com/", $socket->imgurl);
        $imgurl = count($imgarr) > 1 ? $imgarr[1]: 'face.png';

        //查询课程信息
        $course = app(CourseServer::class)->getCourseByRoomId($room_id);
        //白名单课程
        if ($course->invite_type == 2) {
            //首个人员进入，将白名单学生list存入redis离线数组中 以user_id为键，暂时无法拿到腾讯云hash_id
            if (!Redis::exists($socket->room_id . 'users_notinroom')) {
                //获取白名单学生list
                Log::info('首个进入白名单课程');
                $whitelist = app(CourseServer::class)->getWhiteList($course->id);
                $list = [];
                foreach ($whitelist as $item) {
                    $list[$item['id']] = self::$stuinit;
                    $list[$item['id']]['nickname'] = $item['nickname'];
                    // 截取图片公共域名 只保存真实图片路径 减小返回数据大小
                    $img_arr = explode(".com/", $item['imgurl']);
                    $img_url = count($img_arr) > 1 ? $img_arr[1]: 'face.png';
                    $list[$item['id']]['imgurl'] = $img_url;
                    $list[$item['id']]['time'] = time();
                }
                //白名单学生list存入离线数组中
                self::redisSet($socket->room_id, $socket->room_id . 'users_notinroom', ['users' => $list,  'index' => 0]);
            }

            //白名单人员首次进入，将离线数组的键 user_id 改为 hash_id
            $arr_notinroom = self::redisGet($socket->room_id . 'users_notinroom');
            $users_notinroom = $arr_notinroom['users'];
            $index_notinroom = $arr_notinroom['index'];
            if (array_key_exists($user_id, $users_notinroom)) {
                $users_notinroom[$hash_id] = $users_notinroom[$user_id];
                unset($users_notinroom[$user_id]);
                $index_notinroom++;
                self::redisSet($room_id, $room_id . 'users_notinroom', ['users' => $users_notinroom, 'index' => $index_notinroom]);
            }
        }

        //将该人员信息存入缓存
        if (Redis::exists($room_id . $hash_id)) {
            self::logs($socket, ['type' => 'useradd']); //获取用户保留参数
            $cur_user = self::redisGet($room_id . $hash_id);
        } else {
            self::logs($socket, ['type' => 'userinit']);    //初始化用户参数
            $cur_user = $isteacher ? self::$teainit : self::$stuinit;
            $cur_user['nickname'] = $nickname;
            $cur_user['zan'] = $zan;
            $cur_user['platform'] = $platform;
            $cur_user['imgurl'] = $imgurl;
        }
        self::redisSet($room_id, $room_id . $hash_id, $cur_user);

        if (!Redis::exists($room_id . 'users_plat')) {
            self::redisSet($room_id, $room_id . 'users_plat', ['users' => [], 'index' => 0]);
        }
        if (!Redis::exists($room_id . 'users_notplat')) {
            self::redisSet($room_id, $room_id . 'users_notplat', ['users' => [], 'index' => 0]);
        }
        if (!Redis::exists($room_id . 'users_notinroom')) {
            self::redisSet($room_id, $room_id . 'users_notinroom', ['users' => [], 'index' => 0]);
        }

        Log::info('set_user_cache------end');
        return $cur_user;
    }

    /**
     * Notice: 初始化三个数组变量
     * Author: chenxl
     * DateTime 2021/3/17 16:45
     * @param $room_id
     * @return array
     */
    public static function users_arr_init($room_id)
    {
        // 变量初始值
        $users_plat = []; //台上数组
        $users_notplat = [];    //台下数组
        $users_notinroom = [];  //离线数组
        $index_plat = 0;
        $index_notplat = 0;
        $index_notinroom = 0;
        // 从Redis读取台上数组人员信息
        if (Redis::exists($room_id . 'users_plat')) {
            $arr_plat = self::redisGet($room_id . 'users_plat');
            $users_plat = $arr_plat['users'];
            $index_plat = $arr_plat['index'];
        }
        //从Redis读取台下数组人员信息
        if (Redis::exists($room_id . 'users_notplat')) {
            $arr_notplat = self::redisGet($room_id . 'users_notplat');
            $users_notplat = $arr_notplat['users'];
            $index_notplat = $arr_notplat['index'];
        }
        //从Redis读取离线数组人员信息
        if (Redis::exists($room_id . 'users_notinroom')) {
            $arr_notinroom = self::redisGet($room_id . 'users_notinroom');
            $users_notinroom = $arr_notinroom['users'];
            $index_notinroom = $arr_notinroom['index'];
        }

        return [$users_plat, $users_notplat, $users_notinroom, $index_plat, $index_notplat, $index_notinroom];
    }

    /**
     * Notice: 自动上台处理
     * Author: chenxl
     * DateTime 2021/3/17 16:36
     * @param $socket
     * @param $hash_id
     * @param $isteacher
     * @param $up_top
     * @return array[]
     */
    public static function addplat($socket, $hash_id, $isteacher, $up_top)
    {
        Log::info('addplat------start');
        // 变量初始值
        $stucount = 0;
        list(
            $users_plat,
            $users_notplat,
            $users_notinroom,
            $index_plat,
            $index_notplat,
            $index_notinroom
            ) = self::users_arr_init($socket->room_id);

        //从缓存中读取该人员信息
        $cur_user = self::redisGet($socket->room_id . $hash_id);
        if (!$isteacher) {
            //台上学生数量
            foreach ($users_plat as $v) {
                if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                    $stucount++;
                }
            }

            //未超出台上人数
            if ($stucount < intval($up_top)) {
                $cur_user['plat'] = 1;
                $cur_user['camera'] = 1;
                $cur_user['voice'] = 1;
                $cur_user['time'] = time(); //用于花名册排序
                $users_plat[$hash_id] = $cur_user;
                $index_plat++;
                //将该学生放入台上数组
                self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users' => self::users_sort($users_plat, 'plat'), 'index' => $index_plat]);
                //如果台下数组中有该人员需删除（异常退出，没有走disconnect）
                if (array_key_exists($hash_id, $users_notplat)) {
                    unset($users_notplat[$hash_id]);
                    $index_notplat++;
                    self::redisSet($socket->room_id, $socket->room_id . 'users_notplat', ['users'=>$users_notplat, 'index'=>$index_notplat]);
                }
            } else { //超出台上人数
                $cur_user['plat'] = 0;
                $cur_user['camera'] = 0;
                $cur_user['board'] = 0;
                $cur_user['voice'] = 0;
                $cur_user['time'] = time();  //用于花名册排序
                $users_notplat[$hash_id] = $cur_user;
                $index_notplat++;
                //将该学生放入台下数组
                self::redisSet($socket->room_id, $socket->room_id . 'users_notplat', ['users' => self::users_sort($users_notplat, 'notplat'), 'index' => $index_notplat]);
                //如果台上数组中有该人员需删除（异常退出，没有走disconnect）
                if (array_key_exists($hash_id, $users_plat)) {
                    unset($users_plat[$hash_id]);
                    $index_plat++;
                    self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users'=> $users_plat, 'index'=>$index_plat]);
                }
            }
            //将离线数组中该学生信息删除
            if (array_key_exists($hash_id, $users_notinroom)) {
                unset($users_notinroom[$hash_id]);
                $index_notinroom++;
                self::redisSet($socket->room_id, $socket->room_id . 'users_notinroom', ['users' => $users_notinroom, 'index' => $index_notinroom]);
            }
        } else {    //将老师存入台上数组
            $cur_user['time'] = time();  //用于花名册排序
            $users_plat[$hash_id] = $cur_user;
            $index_plat++;
            self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users' => self::users_sort($users_plat, 'plat'), 'index' => $index_plat]);
        }

        //将该人员信息存入缓存
        self::redisSet($socket->room_id, $socket->room_id . $hash_id, $cur_user);

        if ($cur_user['plat'] == 1) {
            self::logs($socket, [
                'type' => 'plat',
                'hash_id' => $hash_id,
                'status' => 1
            ]);
        }
        Log::info('addplat------end');
        return [$hash_id => $cur_user];
    }

    /**
     * Notice: 手动上台处理
     * Author: chenxl
     * DateTime 2021/3/17 16:36
     * @param $socket
     * @param $hash_id
     * @param $isteacher
     * @param $up_top
     * @return array[]
     */
    public static function handplat($socket, $hash_id, $isteacher, $up_top)
    {
        Log::info('handplat------start');
        // 变量初始值
        $stucount = 0;
        list(
            $users_plat,
            $users_notplat,
            $users_notinroom,
            $index_plat,
            $index_notplat,
            $index_notinroom
            ) = self::users_arr_init($socket->room_id);

        //从缓存中读取该人员信息
        $cur_user = self::redisGet($socket->room_id . $hash_id);
        if (!$isteacher) {
            //台上学生数量
            foreach ($users_plat as $v) {
                if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                    $stucount++;
                }
            }

            if ($cur_user['plat'] == 1 && $stucount < intval($up_top)) { //放台上数组
                $cur_user['time'] = time(); //用于花名册排序
                $users_plat[$hash_id] = $cur_user;
                $index_plat++;
                //将该学生放入台上数组
                self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users' => self::users_sort($users_plat, 'plat'), 'index' => $index_plat]);
            } else {    //放台下数组
                $cur_user['plat'] = 0;
                $cur_user['camera'] = 0;
                $cur_user['board'] = 0;
                $cur_user['voice'] = 0;
                $cur_user['time'] = time();  //用于花名册排序
                $users_notplat[$hash_id] = $cur_user;
                $index_notplat++;
                //将该学生放入台下数组
                self::redisSet($socket->room_id, $socket->room_id . 'users_notplat', ['users' => self::users_sort($users_notplat, 'notplat'), 'index' => $index_notplat]);
                //如果台上数组中有该人员需删除（异常退出，没有走disconnect）
                if (array_key_exists($hash_id, $users_plat)) {
                    unset($users_plat[$hash_id]);
                    $index_plat++;
                    self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users'=>$users_plat, 'index'=>$index_plat]);
                }
            }
            //将离线数组中该学生信息删除
            if (array_key_exists($hash_id, $users_notinroom)) {
                unset($users_notinroom[$hash_id]);
                $index_notinroom++;
                self::redisSet($socket->room_id, $socket->room_id . 'users_notinroom', ['users' => $users_notinroom, 'index' => $index_notinroom]);
            }
        } else {    //将老师存入台上数组
            $cur_user['time'] = time();  //用于花名册排序
            $users_plat[$hash_id] = $cur_user;
            $index_plat++;
            self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users' => self::users_sort($users_plat, 'plat'), 'index' => $index_plat]);
        }

        //将该人员信息存入缓存
        self::redisSet($socket->room_id, $socket->room_id . $hash_id, $cur_user);
        if ($cur_user['plat'] == 0) {
            self::logs($socket, [
                'type' => 'plat',
                'hash_id' => $hash_id,
                'status' => 0
            ]);
        }
        Log::info('handplat------end');
        return [$hash_id => $cur_user];
    }

    /**
     * Notice:用户排序，用于花名册排序
     * Author: chenxl
     * DateTime 2021/3/23 16:51
     * @param $users
     * @param string $sort
     * @return mixed
     */
    public static function users_sort($users,$type='plat', $sort='asc')
    {
        $sort_arr = [
            'asc' => SORT_ASC,
            'desc' => SORT_DESC,
        ];
        if (!array_key_exists($sort, $sort_arr)) return $users;
        if ($type == 'plat') {  //将老师排在首位
            array_multisort(array_column($users,'isteacher'), SORT_DESC, array_column($users,'time'),$sort_arr[$sort], $users);
        } else {
            array_multisort(array_column($users,'time'),$sort_arr[$sort], $users);
        }
        return $users;
    }

    /**
     * Notice: 离开页面,退出房间
     * Author: chenxl
     * DateTime 2021/3/22 14:14
     * @param $socket
     * @param $hash_id
     * @param $isteacher
     */
    public static function cutuser($socket, $hash_id, $isteacher)
    {
        // 变量初始值
        list(
            $users_plat,
            $users_notplat,
            $users_notinroom,
            $index_plat,
            $index_notplat,
            $index_notinroom
            ) = self::users_arr_init($socket->room_id);

        //从缓存中取出当前人员信息
        $cur_user = self::redisGet($socket->room_id . $hash_id);
        if (isset($users_plat[$hash_id])) {
            unset($users_plat[$hash_id]);
            $index_plat++;
            self::redisSet($socket->room_id, $socket->room_id . 'users_plat', ['users' => $users_plat, 'index' => $index_plat]);
        }
        if (isset($users_notplat[$hash_id])) {
            unset($users_notplat[$hash_id]);
            $index_notplat++;
            self::redisSet($socket->room_id, $socket->room_id . 'users_notplat', ['users' => $users_notplat, 'index' => $index_notplat]);
        }
        if (!$isteacher) {
            //将当前人员放到离线数组
            $users_notinroom[$hash_id] = $cur_user;
            $index_notinroom++;
            self::redisSet($socket->room_id, $socket->room_id . 'users_notinroom', ['users' => $users_notinroom, 'index' => $index_notinroom]);
        }
    }

    // 在线人员 弃用
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

    /**
     * Notice: 权限处理
     * Author: chenxl
     * DateTime 2021/3/22 14:03
     * @param $socket
     * @param $hash_id
     * @param $type
     * @param $status
     * @return array
     */
    public static function permission($socket, $hash_id, $type, $status)
    {
        //初始化变量
        list(
            $users_plat,
            $users_notplat,
            $users_notinroom,
            $index_plat,
            $index_notplat,
            $index_notinroom
            ) = self::users_arr_init($socket->room_id);

        //台上人员权限处理
        if (isset($users_plat[$hash_id][$type])) {
            $users_plat[$hash_id][$type] = $status;
            $index_plat++;
            self::redisSet($socket->room_id, $socket->room_id.'users_plat', ['users'=>$users_plat, 'index'=>$index_plat]);
            $cur_user = $users_plat[$hash_id];
        }

        //台下人员权限处理
        if (isset($users_notplat[$hash_id][$type])) {
            $users_notplat[$hash_id][$type] = $status;
            $index_notplat++;
            self::redisSet($socket->room_id, $socket->room_id.'users_notplat', ['users'=>$users_notplat, 'index'=>$index_notplat]);
            $cur_user = $users_notplat[$hash_id];
        }

        //离线人员权限处理
        if (isset($users_notinroom[$hash_id][$type])) {
            $users_notinroom[$hash_id][$type] = $status;
            $index_notinroom++;
            self::redisSet($socket->room_id, $socket->room_id.'users_notinroom', ['users'=>$users_notinroom, 'index'=>$index_notinroom]);
            $cur_user = $users_notinroom[$hash_id];
        }

        // 持久化保留用户状态
        self::redisSet($socket->room_id, $socket->room_id.$hash_id, $cur_user);
        self::logs($socket, [
            'type' => $type,
            'hash_id' => $hash_id,
            'status' => $status
        ]);
        return [$hash_id => $cur_user];
    }

    // 下台处理
    public static function cutplat($socket, $hash_id)
    {
        // 从Redis读取当前人员信息
        $cur_user = self::redisGet($socket->room_id . $hash_id);
        // 从Redis读取台上人员信息
        if (Redis::exists($socket->room_id.'users_plat')) {
            $arr = self::redisGet($socket->room_id . 'users_plat');
            $users_plat = $arr['users'];
            $index_plat = $arr['index'];
            if (array_key_exists($hash_id, $users_plat)) {
                $cur_user = $users_plat[$hash_id];
                unset($users_plat[$hash_id]);//在台上数组中删除
                $index_plat++;
                self::redisSet($socket->room_id, $socket->room_id.'users_plat', ['users'=>$users_plat, 'index'=>$index_plat]);
            }
        }
        if (Redis::exists($socket->room_id.'users_notplat')) {
            $arr_notplat = self::redisGet($socket->room_id . 'users_notplat');
            $users_notplat = $arr_notplat['users'];
            $index_notplat = $arr_notplat['index'];
            $cur_user['plat'] = 0;
            $cur_user['board'] = 0;
            $cur_user['voice'] = 0;
            $cur_user['camera'] = 0;
            $cur_user['time'] = time();
            $users_notplat[$hash_id] = $cur_user;   //添加到台下数组
            $index_notplat++;
            self::redisSet($socket->room_id, $socket->room_id.'users_notplat', ['users'=>self::users_sort($users_notplat, 'notplat'), 'index'=>$index_notplat]);
        }
        self::redisSet($socket->room_id, $socket->room_id . $hash_id, $cur_user);

        if ($cur_user['plat'] == 0) {
            self::logs($socket, [
                'type' => 'plat',
                'hash_id' => $hash_id,
                'status' => 0
            ]);
        }
        return [$hash_id => $cur_user];
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

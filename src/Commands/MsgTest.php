<?php

namespace Vipbressanon\LiveTool\Commands;

use Illuminate\Console\Command;
use Workerman\Worker;
use Workerman\Lib\Timer;
use PHPSocketIO\SocketIO;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Vipbressanon\LiveTool\Servers\CourseServer;
use Vipbressanon\LiveTool\Servers\RecordServer;
use Vipbressanon\LiveTool\Servers\RoomServer;
use Vipbressanon\LiveTool\Servers\UsersServer;
use Vipbressanon\LiveTool\Servers\BalanceServer;
use Log;
use Session;

class MsgTest extends Command
{
    protected $signature = 'wktest 
    {action=start : start | restart | reload(平滑重启) | stop | status | connetions}
    {--d : deamon or debug}';
    
    protected $description = 'web消息推送服务';
    
    //PHPSocketIO服务
    private static $senderIo = null;
    // 是否老师（1,0），上下台（1,0），白板授权（1,0），开麦闭麦（1,0），摄像头（1,0），来源（0-6）
    // 来源:0是pc端，1是h5手机端，2是h5平板端 3是android 4是android平板 5是ios 6是ios的平板
    private static $teainit = ['isteacher'=>1, 'plat'=>1, 'board'=>1, 'voice'=>1, 'camera'=>1, 'platform'=>0];
    private static $stuinit = ['isteacher'=>0, 'plat'=>0, 'board'=>0, 'voice'=>0, 'camera'=>0, 'platform'=>0];
    // 房间内开关参数，type，1屏幕分享模式，2白板模式；ischat，0是禁止聊天，1是允许聊天；ishand，0是禁止举手，1是允许举手；
    private static $onoffinit = ['roomtype'=>2, 'ischat'=>1, 'ishand'=>1, 'max'=>''];
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
        
        // PHPSocketIO服务
        self::$senderIo = new SocketIO(3120);
        
        // 客户端发起连接事件时，设置连接socket的各种事件回调
        self::$senderIo->on('connection', function ($socket) {
            // 登录
            // 传参：room_id(房间id), hash_id(登录人哈希), isteacher(是否讲师), platform(来源)
            $socket->on('login', function ($request) use ($socket) {
                var_dump('login111');
                var_dump($socket->id);
                
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
                $socket->platform = isset($request['platform']) ? $request['platform'] : 0;
                // 在线人员处理
                self::userlist($socket->room_id, $socket->hash_id, $socket->isteacher, $socket->platform, 'add');
                // 上台人员处理
                self::addplat($socket->room_id, $socket->hash_id, $socket->isteacher, $request['up_top']);
                // 更新维护 usersocket数组  用于限制单设备登录
                $usersocket = Session::has($socket->room_id.'usersocket')?Session::get($socket->room_id.'usersocket'):[];
                $usersocket[$socket->hash_id] = $socket->id;
                Session::put($socket->room_id.'usersocket', $usersocket);
                // 房间开关初始化
                if (!Session::has($socket->room_id.'onoff')) {
                    Session::put($socket->room_id.'onoff', ['onoff'=>self::$onoffinit, 'index'=>0]);
                }
                $users = Session::get($socket->room_id.'users');
                $onoff = Session::get($socket->room_id.'onoff');
                
                self::$senderIo->to($socket->room_id)->emit(
                    'addusers',
                    [
                        'users' => $users['users'],
                        'index' => $users['index'],
                        'onoff' => $onoff['onoff'],
                        'socketid' => $socket->id,
                        'hashid' => $socket->hash_id
                    ]
                );
                var_dump(Session::all());
            });
            
            // 讲师创建房间后邀请所有人进入
            $socket->on('create', function () use ($socket) {
                $cs = new CourseServer();
                $time = $cs->starttime($socket->room_id);
                if(count($time) == 2) {
                    self::$senderIo->to($socket->room_id)->emit(
                        'create',
                        [
                            'teacher_hash_id' => $socket->hash_id,
                            'starttime' => $time['starttime'],
                            'expectendtime' => $time['expectendtime']
                        ]
                    );
                } else {
                    self::$senderIo->to($socket->room_id)->emit(
                        'create',
                        [
                            'teacher_hash_id' => $socket->hash_id,
                            'starttime' => $starttime
                        ]
                    );
                }
            });
            
            // 开始上课
            // 传参：up_top(上台人数上限), teacher_hash_id(讲师哈希)
            $socket->on('enter', function () use ($socket) {
                $us = new UsersServer();
                $us->start($socket->room_id, $socket->hash_id);
                
                // if ($socket->isteacher) {
                //     $interval = config('livetool.intervaltime');
                //     $balance = new BalanceServer();
                //     // 每隔一段时间执行一次结算
                //     $socket->timer_id = Timer::add($interval, [$balance, 'handle'], [$socket->room_id], true);
                // }
            });
            
            // 下课
            $socket->on('over', function () use ($socket) {
                $record = new RecordServer();
                $record->hander($socket->room_id, 3);
                $balance = new BalanceServer();
                // 10秒以后执行一次结算,定时器只执行一次
                //Timer::add(10, [$balance, 'handle'], [$socket->room_id], false);
                self::$senderIo->to($socket->room_id)->emit('over');
            });
            // 离开页面,退出房间
            $socket->on('disconnect', function () use ($socket) {
                $us = new UsersServer();
                $us->end($socket->room_id, $socket->hash_id);
                // 如果是教师 走结算
                // if ($socket->isteacher) {
                //     $balance = new BalanceServer();
                //     $balance->handle($socket->room_id);
                //     if (isset($socket->timer_id)) {
                //         Timer::del($socket->timer_id);
                //     }
                // }
                // 多地登陆，前者被下线 不走用户退出全网通知
                $usersocket = Session::get($socket->room_id.'usersocket')?:[];
                if (array_key_exists($socket->hash_id, $usersocket) && $usersocket[$socket->hash_id] != $socket->id) {
                    return;
                }
                $arr = Session::get($socket->room_id.'onoff');
                if ($socket->hash_id == $arr['onoff']['max']) {
                    $arr['onoff']['max'] = '';
                    Session::put($socket->room_id.'onoff', ['onoff'=>$arr['onoff'], 'index'=>$arr['index']]);
                }
                self::userlist($socket->room_id, $socket->hash_id, '', '', 'cut');
                
                $users = Session::get($socket->room_id.'users');
                $onoff = Session::get($socket->room_id.'onoff');
                
                self::$senderIo->to($socket->room_id)->emit(
                    'cutusers',
                    [
                        'users' => $users['users'],
                        'index' => $users['index'],
                        'onoff' => $onoff['onoff']
                    ]
                    
                );
            });
            
            // 传参：hash_id(被更改权限人哈希), type(权限类型), status(权限更改后状态)
            $socket->on('permission', function ($request) use ($socket)  {
                if ($request['type'] == 'plat' && $request['status'] == 1) {
                    $res = self::addplat($socket->room_id, $request['hash_id'], 0, $request['up_top']);
                } elseif ($request['type'] == 'plat' && $request['status'] == 0) {
                    $res = self::cutplat($socket->room_id, $request['hash_id']);
                } else {
                    $res = self::permission($socket->room_id, $request['hash_id'], $request['type'], $request['status']);
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
            });
            
            // 批量修改上台人员状态
            $socket->on('platbatch', function ($request) use ($socket)  {
                var_dump('platbatch');
                $users = [];
                $index = 0;
                // 从session读取在线人员信息
                if (Session::has($socket->room_id.'users')) {
                    $arr = Session::get($socket->room_id.'users');
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
                Session::put($socket->room_id.'users', ['users'=>$users, 'index'=>$index]);
                self::$senderIo->to($socket->room_id)->emit(
                    'platbatch',
                    [
                        'type' => $request['type'],
                        'status' => $request['status'],
                        'users' => $users,
                        'index'=>$index
                    ]
                );
            });
            
            // 房间开关设置
            $socket->on('onoff', function ($request) use ($socket)  {
                $index = 0;
                if (Session::has($socket->room_id.'onoff')) {
                    $onoff = Session::get($socket->room_id.'onoff');
                    $arr = $onoff['onoff'];
                    $index = $onoff['index'];
                } else {
                    $arr = self::$onoffinit;
                }
                if (isset($arr[$request['type']])) {
                    $arr[$request['type']] = $request['status'];
                }
                if ($request['type'] == 'roomtype') {
                    $arr['max'] = $request['status'] == 1 ? $socket->hash_id : '';
                }
                $index++;
                Session::put($socket->room_id.'onoff', ['onoff'=>$arr, 'index'=>$index]);
                self::$senderIo->to($socket->room_id)->emit(
                    'onoff',
                    [
                        'type' => $request['type'],
                        'status' => $request['status'],
                        'onoff' => $arr,
                        'index' => $index
                    ]
                );
            }); 
            
            
            // 消息转发
            $socket->on('im', function ($request) use ($socket)  {
                var_dump('im', [$request]);
                if (!is_array($request)) {
                    $request = json_decode($request, true);
                }
                if ($request['type'] == 'MAX') {
                    $arr = Session::get($socket->room_id.'onoff');
                    $arr['onoff']['max'] = $request['text'] == 1 ? $request['hash_id'] : '';
                    Session::put($socket->room_id.'onoff', ['onoff'=>$arr['onoff'], 'index'=>$arr['index']]);
                }
                self::$senderIo->to($socket->room_id)->emit('im', $request);
            }); 
        });
        
        // 当self::$senderIo启动后监听一个http端口，通过这个端口可以给任意uid或者所有uid推送数据
        self::$senderIo->on('workerStart', function () {
            // 监听一个http端口
            $innerHttpWorker = new Worker('http://0.0.0.0:3121');
            // 当http客户端发来数据时触发
            $innerHttpWorker->onMessage = function ($httpConnection, $data) {
                $type = isset($_REQUEST['type']) ? $_REQUEST['type'] : '';
                $content = isset($_REQUEST['content']) ? $_REQUEST['content'] : '';
                $content = $content ? json_decode($content, true) : '';
                $room_id = isset($_REQUEST['room_id']) ? $_REQUEST['room_id'] : '';
                // 推送数据的url格式 type=publish&to=uid&content=xxxx
                if ($room_id == '') {
                    return $httpConnection->send(json_encode(['error'=>'暂不支持全局消息']));
                }
                switch ($type) {
                    // 超时强制下课
                    case 'classover':
                        if (array_key_exists('course_id', $content)) {
                            // 改变直播间状态
                            $rs = new RoomServer();
                            $rs->end($content['course_id'], $room_id);
                            // 关闭录制
                            $record = new RecordServer();
                            $record->hander($room_id, 3);
                            // 结算
                            $balance = new BalanceServer();
                            // 10秒以后执行一次结算,定时器只执行一次
                            //Timer::add(10, [$balance, 'handle'], [$socket->room_id], false);
                            self::$senderIo->to($room_id)->emit('over');
                        }
                        return $httpConnection->send($this->output());
                        break;
                    case 'downtips':
                        self::$senderIo->to($room_id)->emit($type);
                        return $httpConnection->send($this->output());
                        break;
                    case 'userlist':
                        if (Session::has($room_id.'users')) {
                            $users = Session::get($room_id.'users');
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
            };
            // 执行监听
            $innerHttpWorker->listen();
        });

        Worker::runAll();
    }
    
    // 在线人员
    public static function userlist($room_id, $hash_id, $isteacher, $platform, $type)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        // 从session读取在线人员信息
        if (Session::has($room_id.'users')) {
            $arr = Session::get($room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if ($type == 'add') {           // 人员增加
            if (!array_key_exists($hash_id, $users)) {
                $users[$hash_id] = $isteacher ? self::$teainit : self::$stuinit;
            }
            $users[$hash_id]['platform'] = $platform;
        } elseif ($type == 'cut') {     // 人员减少
            if (array_key_exists($hash_id, $users)) {
                unset($users[$hash_id]);
            }
        }
        $index++;
        Session::put($room_id.'users', ['users'=>$users, 'index'=>$index]);
    }
    
    // 权限处理
    public static function permission($room_id, $hash_id, $type, $status)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        // 从session读取在线人员信息
        if (Session::has($room_id.'users')) {
            $arr = Session::get($room_id.'users');
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
        Session::put($room_id.'users', ['users'=>$users, 'index'=>$index]);
        return [$hash_id => $users[$hash_id]];
    }

    // 上台处理
    public static function addplat($room_id, $hash_id, $isteacher, $up_top)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        $stucount = 0;
        // 从session读取在线人员信息
        if (Session::has($room_id.'users')) {
            $arr = Session::get($room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if (!$isteacher) {
            foreach ($users as $v) {
                if ($v['isteacher'] == 0 && $v['plat'] == 1) {
                    $stucount ++;
                }
            }
            // 超出上台人数上限
            if ($stucount >= $up_top) {
                return [$hash_id => $users[$hash_id]];
            }
            $users[$hash_id]['plat'] = 1;
            $users[$hash_id]['camera'] = 1;
        }
        
        $index++;
        Session::put($room_id.'users', ['users'=>$users, 'index'=>$index]);
        return [$hash_id => $users[$hash_id]];
    }
    
    // 下台处理
    public static function cutplat($room_id, $hash_id)
    {
        // 变量初始值
        $users = [];
        $index = 0;
        $stucount = 0;
        // 从session读取在线人员信息
        if (Session::has($room_id.'users')) {
            $arr = Session::get($room_id.'users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        $users[$hash_id]['plat'] = 0;
        $users[$hash_id]['board'] = 0;
        $users[$hash_id]['voice'] = 0;
        $users[$hash_id]['camera'] = 0;
        $index++;
        Session::put($room_id.'users', ['users'=>$users, 'index'=>$index]);
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
}
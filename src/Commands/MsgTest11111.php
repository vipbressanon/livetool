<?php

namespace Vipbressanon\LiveTool\Commands;

use Illuminate\Console\Command;
use Workerman\Worker;
use Workerman\Lib\Timer;
use PHPSocketIO\SocketIO;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Vipbressanon\LiveTool\Servers\CourseServer;
use Vipbressanon\LiveTool\Servers\RecordServer;
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
    private static $initPermission = ['voice' => 0, 'board' => 0, 'platform' => 0];
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
                var_dump('login');
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

                self::userlist($socket->room_id, $socket->hash_id, $socket->platform, 'add');
                self::addplat($socket->room_id, $socket->hash_id, $socket->isteacher, $request['up_top'], '');
            });
            
            // 讲师创建房间后邀请所有人进入
            $socket->on('create', function ($request) use ($socket) {
                // 变量初始值
                $users = [];
                $index = 0;
                // 从session读取在线人员信息
                if (Session::has($socket->room_id.'.users')) {
                    $arr = Session::get($socket->room_id.'.users');
                    $users = $arr['users'];
                    $users = array_diff($users, [$socket->hash_id]);
                    $users = array_slice($users, 0, $request['up_top']);
                }
                if (Session::has($socket->room_id.'.plat')) {
                    $arr = Session::get($socket->room_id.'.plat');
                    $index = $arr['index'];
                }
                $index++;
                Session::put($socket->room_id.'.plat', [
                    'teacher'=>[$socket->hash_id],
                    'student'=>$users,
                    'index'=>$index
                ]);
                self::$senderIo->to($socket->room_id)->emit('create', [
                    'teacher_hash_id' => $socket->hash_id,
                    'hash_id' => array_merge(array_values($teacher), array_values($student)),
                ]);
            });
            
            // 开始上课
            // 传参：up_top(上台人数上限), teacher_hash_id(讲师哈希)
            $socket->on('enter', function () use ($socket) {
                $us = new UsersServer();
                $us->start($socket->room_id, $socket->hash_id);
                $cs = new CourseServer();
                $starttime = $cs->starttime($socket->room_id);
                $socket->emit('starttime', $starttime);
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
                Timer::add(10, [$balance, 'handle'], [$socket->room_id], false);
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
                // }
                self::userlist($socket->room_id, $socket->hash_id, $socket->platform, 'cut');
                self::cutplat($socket->room_id, $socket->hash_id, $socket->isteacher, '');
                if (isset($socket->timer_id)) {
                    Timer::del($socket->timer_id);
                }
            });
            
            // 上台
            // 传参：hash_id(上台人哈希), platform(来源), up_top(上台人数上限)
            $socket->on('onplat', function ($request) use ($socket) {
                self::addplat($socket->room_id, $request['hash_id'], 0, $request['up_top'], $request['nickname']);
            });

            // 下台
            // 传参：hash_id(下台人哈希)
            $socket->on('displat', function ($request) use ($socket) {
                self::cutplat($socket->room_id, $request['hash_id'], 0, $request['nickname']);
            });
            
            // 权限处理 麦、白板
            // 传参：hash_id(被更改权限人哈希), type(权限类型), status(权限更改后状态)
            $socket->on('permission', function ($request) use ($socket)  {
                var_dump('permission', [$request]);
                self::permission(request);
                self::$senderIo->to($socket->room_id)->emit('permission', $request);
            });
            
            // 消息转发
            $socket->on('im', function ($request) use ($socket)  {
                var_dump('im', [$request]);
                if (!is_array($request)) {
                    $request = json_decode($request, true);
                }
                self::$senderIo->to($socket->room_id)->emit('im', $request);
            }); 
            
            // 连接检测心跳包
            $socket->on('heart', function ($request) use ($socket) {
                 if (isset($socket->room_id)) {
                    self::$senderIo->to($socket->room_id)->emit('heart', time());
                }
            });
        });
        
        // 当self::$senderIo启动后监听一个http端口，通过这个端口可以给任意uid或者所有uid推送数据
        self::$senderIo->on('workerStart', function ($socket) {
            // 监听一个http端口
            $innerHttpWorker = new Worker('http://0.0.0.0:3121');
            // 当http客户端发来数据时触发
            $innerHttpWorker->onMessage = function ($httpConnection, $data) {
                $type = isset($_REQUEST['type']) ? $_REQUEST['type'] : '';
                $content = isset($_REQUEST['content']) ? $_REQUEST['content'] : '';
                $room_id = isset($_REQUEST['room_id']) ? $_REQUEST['room_id'] : '';
                
                // 推送数据的url格式 type=publish&to=uid&content=xxxx
                if ($room_id == '') {
                    return $httpConnection->send(json_encode(['error'=>'暂不支持全局消息']));
                }
                if ($type == 'classover') {      // 结束时间已到，强制下课
                    self::$senderIo->to($room_id)->emit($type, $content);
                    return $httpConnection->send(json_encode(['error'=>'']));
                }
                return $httpConnection->send(json_encode(['error'=>'没有匹配的发送类型']));
            };
            // 执行监听
            $innerHttpWorker->listen();
        });

        Worker::runAll();
    }
    
    // 在线人员
    public static function userlist($room_id, $hash_id, $platform, $type)
    {
        // 变量初始值
        $users = [];
        $permissions = [];
        $index = 0;
        // 从session读取在线人员信息
        if (Session::has($room_id.'.users')) {
            $arr = Session::get($room_id.'.users');
            $users = $arr['users'];
            $index = $arr['index'];
        }
        if (Session::has($room_id.'.permissions')) {
            $permissions = Session::get($room_id.'.permissions');
        }
        if ($type == 'add') {           // 人员增加
            if (!in_array($hash_id, $users)) {
                $users[] = $hash_id;
                $index++;
                Session::put($room_id.'.users', ['users'=>$users, 'index'=>$index]);
            }
            if (!array_key_exists($hash_id, $permissions)) {
                $permissions[$hash_id] = self::$initPermission;
                $permissions[$hash_id]['platform'] = $platform;
                Session::put($room_id.'.permissions', $permissions);
            }
        } elseif ($type == 'cut') {     // 人员减少
            if (in_array($hash_id, $users)) {
                $users = array_diff($users, [$hash_id]);
                $users = array_values($users);
                $index++;
                Session::put($room_id.'.users', ['users'=>$users, 'index'=>$index]);
            }
            if (array_key_exists($hash_id, $permissions)) {
                unset($permissions[$hash_id]);
                Session::put($room_id.'.permissions', $permissions);
            }
        }
        // 给所有人发送在线人员消息
        self::$senderIo->to($room_id)->emit('users', [
            'type' => $type,
            'hash_id' => $users,
            'permissions' => $permissions,
            'index' => $index
        ]);
    }
    
    // 权限处理
    public static function permission($request)
    {
        // 变量初始值
        $permissions = [];
        $index = 0;
        // 从session读取人员权限信息
        if (Session::has($room_id.'.permissions')) {
            $permissions = Session::get($room_id.'.permissions');
        }
        if (array_key_exists($request['hash_id'], $permissions)) {
            $permissions[$request['hash_id']][$request['type']] = $request['status'];
        } else {
            $permissions[$request['hash_id']] = self::$initPermission;
            $permissions[$request['hash_id']][$request['type']] = $request['status'];
        }
        Session::put($room_id.'.permissions', $permissions);
    }

    // 上台处理
    public static function addplat($room_id, $hash_id, $isteacher, $up_top, $nickname)
    {
        // 变量初始值
        $teacher = [];
        $student = [];
        $index = 0;
        // 从session读取上台人员信息
        if (Session::has($room_id.'.plat')) {
            $arr = Session::get($room_id.'.plat');
            $teacher = $arr['teacher'];
            $student = $arr['student'];
            $index = $arr['index'];
        }
        if ($isteacher) {
            $teacher = [$hash_id];
        } else {
            // 已在名单里
            if (in_array($hash_id, $student)) {
                return; 
            }
            // 超出上台人数上限
            if (count($student) >= $up_top) {
                return;
            }
            $student[] = $hash_id;
        }
        $index++;
        Session::put($room_id.'.plat', [
            'teacher'=>$teacher,
            'student'=>$student,
            'index'=>$index
        ]);
        // 给所有人发送台上人员消息
        self::$senderIo->to($room_id)->emit('plat', [
            'type' => 'add',
            'hash_id' => array_merge(array_values($teacher), array_values($student)),
            'index' => $index,
            'nickname' => $nickname
        ]);
    }
    
    // 下台处理
    public static function cutplat($room_id, $hash_id, $isteacher, $nickname)
    {
        // 变量初始值
        $teacher = [];
        $student = [];
        $index = 0;
        // 从session读取上台人员信息
        if (Session::has($room_id.'.plat')) {
            $arr = Session::get($room_id.'.plat');
            $teacher = $arr['teacher'];
            $student = $arr['student'];
            $index = $arr['index'];
        }
        if ($isteacher) {
            $teacher = [];
        } else {
            if (!in_array($hash_id, $student)) {
                return;
            }
            $student = array_diff($student, [$hash_id]);
            $student = array_values($student);
        }
        $index++;
        Session::put($room_id.'.plat', [
            'teacher'=>$teacher,
            'student'=>$student,
            'index'=>$index
        ]);
        // 给所有人发送台上人员消息
        self::$senderIo->to($room_id)->emit('plat', [
            'type' => 'cut',
            'hash_id' => array_merge(array_values($teacher), array_values($student)),
            'platform' => '',
            'index' => $index,
            'nickname' => $nickname
        ]);
    }
}
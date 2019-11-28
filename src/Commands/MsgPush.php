<?php

namespace Vipbressanon\LiveTool\Commands;

use Illuminate\Console\Command;
use Workerman\Worker;
use Workerman\Lib\Timer;
use PHPSocketIO\SocketIO;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Vipbressanon\LiveTool\Servers\CourseServer;
use Vipbressanon\LiveTool\Servers\RoomServer;
use Vipbressanon\LiveTool\Servers\UsersServer;
use Vipbressanon\LiveTool\Servers\BalanceServer;
use Log;
use DB;

class MsgPush extends Command
{
    protected $signature = 'wk 
    {action=start : start | restart | reload(平滑重启) | stop | status | connetions}
    {--d : deamon or debug}';
    
    protected $description = 'web消息推送服务';
    
    // 全局数组保存uid在线数据
    private static $userscount = [];
    //PHPSocketIO服务
    private static $senderIo = null;
    
    private $timer_id;

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

        //$argv[0] = 'wk';
        $argv[1] = $action;
        $argv[2] = $this->option('d') ? '-d' : '';
        
        // global $argv;
        // //启动php脚本所需的命令行参数
        // $argv[0] = 'MsgPush';
        // $argv[1] = $this->argument('action'); // start | restart | reload(平滑重启) | stop | status | connetions
        // $argv[2] = $this->option('d') ? '-d' : ''; // 守护进程模式或调试模式启动
        
        // PHPSocketIO服务
        self::$senderIo = new SocketIO(2120);
        
        // 客户端发起连接事件时，设置连接socket的各种事件回调
        self::$senderIo->on('connection', function ($socket) {
            // 进入页面,im已登录
            $socket->on('login', function ($request) use ($socket) {
                var_dump('login');
                // 已经登录过了
                if (isset($socket->users_id)) return;
                // 初始化用户房间数据
                $course_id = $request['course_id'];
                $room_id = $request['room_id'];
                $users_id = $request['users_id'];
                $socket->join($room_id);
                $socket->course_id = $course_id;
                $socket->room_id = $room_id;
                $socket->users_id = $users_id;
                self::onlinenum($room_id, $users_id, 'add');
            });
            
            // 讲师创建房间后邀请所有人进入
            $socket->on('create', function () use ($socket) {
                self::$senderIo->to($socket->room_id)->emit('create');
            });
            
            // 加入房间
            $socket->on('enter', function ($request) use ($socket) {
                var_dump('enter');
                $course_id = $request['course_id'];
                $room_id = $request['room_id'];
                $users_id = $request['users_id'];
                $isteacher = $request['isteacher'];
                $us = new UsersServer();
                $us->start($course_id, $room_id, $users_id);
                $cs = new CourseServer();
                $starttime = $cs->starttime($course_id);
                $socket->emit('starttime', $starttime);
                
                if ($isteacher) {
                    $interval = config('livetool.intervaltime');
                    $balance = new BalanceServer();
                    // 每隔一段时间执行一次结算
                    $this->timer_id = Timer::add($interval, [$balance, 'handle'], [$course_id], true);
                    // $this->timer_id = Timer::add(3, function(){var_dump(1);});
                }
            });
            
            // 下课
            $socket->on('over', function () use ($socket) {
                var_dump('over');
                $balance = new BalanceServer();
                // 10秒以后执行一次结算,定时器只执行一次
                Timer::add(10, [$balance, 'handle'], [$socket->course_id], false);
                self::$senderIo->to($socket->room_id)->emit('over');
            });
            
            // 离开页面,退出房间
            $socket->on('disconnect', function () use ($socket) {
                var_dump('disconnect');
                if (!isset($socket->users_id)) {
                    return;
                }
                $us = new UsersServer();
                $us->end($socket->room_id, $socket->users_id);
                self::onlinenum($socket->room_id, $socket->users_id, 'cut');
                Timer::del($this->timer_id);
            });
            
        });
        
        // 当self::$senderIo启动后监听一个http端口，通过这个端口可以给任意uid或者所有uid推送数据
        self::$senderIo->on('workerStart', function ($socket) {
            // 监听一个http端口
            $innerHttpWorker = new Worker('http://0.0.0.0:2121');
            // 当http客户端发来数据时触发
            $innerHttpWorker->onMessage = function ($httpConnection, $data) {
                
                $type = $_REQUEST['type'] ?? '';
                $content = htmlspecialchars($_REQUEST['content'] ?? '');
                $to = (string)($_REQUEST['to'] ?? '');
                
                // 推送数据的url格式 type=publish&to=uid&content=xxxx
                switch ($type) {
                    case 'publish':
                        // 有指定uid则向uid所在socket组发送数据
                        if ($to) {
                            self::$senderIo->to($to)->emit('new_msg', $content);
                        } else {
                            // 否则向所有uid推送数据
                            self::$senderIo->emit('new_msg', $content);
                        }
                        // http接口返回，如果用户离线socket返回fail
                        if ($to && !isset(self::$userscount[$to])) {
                            return $httpConnection->send('offline');
                        } else {
                            return $httpConnection->send('ok');
                        }
                }
                return $httpConnection->send('fail');
            };
            // 执行监听
            $innerHttpWorker->listen();
        });

//        Worker::$daemonize = true;
        Worker::runAll();
    }
    
    // 计算在线人数
    public static function onlinenum($room_id, $users_id, $type)
    {
        var_dump('onlinenum '.$type);
        if ($type == 'add') {
            if (!isset(self::$userscount[$room_id])) {
                self::$userscount[$room_id] = [];
            }
            if (!in_array($users_id, self::$userscount[$room_id])) {
                self::$userscount[$room_id][] = $users_id;
            }
            self::$senderIo->to($room_id)->emit('online', self::$userscount[$room_id]);
        } else {
            self::$userscount[$room_id] = array_diff(self::$userscount[$room_id], [$users_id]);
            if (count(self::$userscount[$room_id]) == 0) {
                unset(self::$userscount[$room_id]);
            } else {
                self::$senderIo->to($room_id)->emit('online', self::$userscount[$room_id]);
            }
        }
    }
}
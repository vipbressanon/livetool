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
use DB;

class MsgPush extends Command
{
    protected $signature = 'wk 
    {action=start : start | restart | reload(平滑重启) | stop | status | connetions}
    {--d : deamon or debug}';
    
    protected $description = 'web消息推送服务';
    
    // 全局数组保存uid在线数据
    private static $userscount = [];
    // 全局数组保存uid在线数据索引
    private static $usersindex = [];
    // 全局数组保存uid当前上台用户
    private static $userscount_plat = [];
    //PHPSocketIO服务
    private static $senderIo = null;
    
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
        self::$senderIo = new SocketIO(2120);
        
        // 客户端发起连接事件时，设置连接socket的各种事件回调
        self::$senderIo->on('connection', function ($socket) {
            // 进入页面,im已登录
            $socket->on('login', function ($request) use ($socket) {
                var_dump('login');
                // 避免 iOS 穿过来的数组被转义
                if (!is_array($request)) {
                    $request = json_decode($request, true);
                }
                // 已经登录过了
                if (isset($socket->users_id)) return;
                // 初始化用户房间数据
                $room_id = $request['room_id'];
                $users_id = $request['users_id'];
                $hash_id = $request['hash_id'];
                $isteacher = $request['isteacher'];
                $platform = isset($request['platform']) ? $request['platform'] : 0;
                $socket->join($room_id);
                $socket->room_id = $room_id;
                $socket->users_id = $users_id;
                $socket->hash_id = $hash_id;
                $socket->isteacher = $isteacher;

                self::onlinenum($room_id, $users_id, $hash_id, $platform, 'add');
            });
            
            // 讲师创建房间后邀请所有人进入
            $socket->on('create', function ($request) use ($socket) {
                self::$senderIo->to($socket->room_id)->emit('create', [
                    'teacher_id' => $request['teacher_id'],
                    'teacher_hash_id' => $request['teacher_hash_id']
                ]);
            });
            
            // 加入房间
            $socket->on('enter', function () use ($socket) {
                var_dump('enter');
                $us = new UsersServer();
                $us->start($socket->room_id, $socket->users_id);
                $cs = new CourseServer();
                $starttime = $cs->starttime($socket->room_id);
                $socket->emit('starttime', $starttime);
                
                if ($socket->isteacher) {
                    $interval = config('livetool.intervaltime');
                    $balance = new BalanceServer();
                    // 每隔一段时间执行一次结算
                    $socket->timer_id = Timer::add($interval, [$balance, 'handle'], [$socket->room_id], true);
                    // $socket->timer_id = Timer::add(3, function(){var_dump(1);});
                }
                self::onplatnum($socket->room_id, $socket->users_id, $socket->hash_id, 'enter');
                $key = array_keys(self::$userscount_plat[$socket->room_id]);
                $value = array_values(self::$userscount_plat[$socket->room_id]);
                $socket->emit('onplat', [
                    'key' => $key,
                    'value' => $value
                ]);
            });
            
            // 下课
            $socket->on('over', function () use ($socket) {
                var_dump('over');
                unset(self::$usersindex[$socket->room_id]);
                $record = new RecordServer();
                $record->hander($socket->room_id, 3);
                $balance = new BalanceServer();
                // 10秒以后执行一次结算,定时器只执行一次
                Timer::add(10, [$balance, 'handle'], [$socket->room_id], false);
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
                // 如果是教师 走结算
                if ($socket->isteacher) {
                    $balance = new BalanceServer();
                    $balance->handle($socket->room_id);
                }
                self::onlinenum($socket->room_id, $socket->users_id, $socket->hash_id, 0, 'cut');
                self::onplatnum($socket->room_id, $socket->users_id, $socket->hash_id, 'cut');
                if (isset($socket->timer_id)) {
                    Timer::del($socket->timer_id);
                }
            });

            // 上台
            $socket->on('onplat', function ($request) use ($socket) {
                var_dump('onplat');
                $users_id = $request['users_id'];
                $hash_id = $request['hash_id'];
                self::onplatnum($socket->room_id, $users_id, $hash_id, 'add');
            });

            // 下台
            $socket->on('displat', function ($request) use ($socket) {
                var_dump('displat');
                $users_id = $request['users_id'];
                self::onplatnum($socket->room_id, $users_id, '', 'cut');
            });

            //清除上台信息 当老师点击全员上台以后清除部分上台信息
            $socket->on('displat_all', function () use ($socket) {
                var_dump('displat_all');
                if (isset(self::$userscount_plat[$socket->room_id])) {
                    unset(self::$userscount_plat[$socket->room_id]);
                }
            });
        });
        
        // 当self::$senderIo启动后监听一个http端口，通过这个端口可以给任意uid或者所有uid推送数据
        self::$senderIo->on('workerStart', function ($socket) {
            // 监听一个http端口
            $innerHttpWorker = new Worker('https://0.0.0.0:2121');
            // 当http客户端发来数据时触发
            $innerHttpWorker->onMessage = function ($httpConnection, $data) {
                
                $type = $_REQUEST['type'] ?? '';
                $content = htmlspecialchars($_REQUEST['content'] ?? '');
                $to = (string)($_REQUEST['to'] ?? '');
                
                // 推送数据的url格式 type=publish&to=uid&content=xxxx
                if ($to) {
                    self::$senderIo->to($to)->emit($type, $content);
                } else {
                    // 否则向所有uid推送数据
                    self::$senderIo->emit($type, $content);
                }
                // http接口返回，如果用户离线socket返回fail
                if ($to && !isset(self::$userscount[$to])) {
                    return $httpConnection->send('offline');
                } else {
                    return $httpConnection->send('ok');
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
    public static function onlinenum($room_id, $users_id, $hash_id, $platform, $type)
    {
        if (isset(self::$usersindex[$room_id])) {
            self::$usersindex[$room_id] ++;
        } else {
            self::$usersindex[$room_id] = 0;
        }
        $users_id = strval($users_id);
        if ($type == 'add') {
            if (!isset(self::$userscount[$room_id])) {
                self::$userscount[$room_id] = [];
            }
            if (!isset(self::$userscount[$room_id][$users_id])) {
                self::$userscount[$room_id][$users_id] = $hash_id;
            }
            $key = array_keys(self::$userscount[$room_id]);
            $value = array_values(self::$userscount[$room_id]);
            self::$senderIo->to($room_id)->emit('userslist', [
                'type' => 'online',
                'key' => $key,
                'value' => $value,
                'platform' => $platform,
                'index' => self::$usersindex[$room_id]
            ]);
        } else {
            unset(self::$userscount[$room_id][$users_id]);
            if (isset(self::$userscount[$room_id])) {
                if (count(self::$userscount[$room_id]) == 0) {
                    unset(self::$userscount[$room_id]);
                } else {
                    $key = array_keys(self::$userscount[$room_id]);
                    self::$senderIo->to($room_id)->emit('userslist', [
                        'type' => 'offline',
                        'key' => $key,
                        'value' => [],
                        'index' => self::$usersindex[$room_id]
                    ]);
                }
            }
        }
    }

    // 计算上台人数
    public static function onplatnum($room_id, $users_id, $hash_id, $type)
    {
        var_dump('onplatnum '.$type);
        if (!isset(self::$userscount_plat[$room_id])) {
                self::$userscount_plat[$room_id] = [];
        }
        if ($type == 'add') {
            if (!isset(self::$userscount_plat[$room_id][$users_id])) {
                self::$userscount_plat[$room_id][$users_id] = $hash_id;
            }
        } else if ($type == 'cut') {
            unset(self::$userscount_plat[$room_id][$users_id]);
            if (count(self::$userscount_plat[$room_id]) == 0) {
                unset(self::$userscount_plat[$room_id]);
            }
        }
    }
}
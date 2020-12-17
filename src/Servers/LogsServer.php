<?php
namespace Vipbressanon\LiveTool\Servers;

use Illuminate\Support\Facades\Redis;

class LogsServer
{

    public function __construct()
    {
    }

    // 行为操作：connection(连接), disconnect(断开)
    // 用户参数：useradd(获取保留参数), userinit(参数初始化), userdel(参数清除)
    // 房间操作：create(上课), enter(进入), over(下课)
    // 房间参数：roominit(参数初始化), roomtype(模式切换), ischat(聊天), ishand(举手) , MAX(放大), boardscale(白板缩放), 
    // 权限参数：PLATZAN(台上批量点赞), ZAN(点赞), platboard(台上批量白板), platvoice(台上批量麦克风), board(白板), voice(麦克风), camera(摄像头), plat(上台)
    // 其他操作：HAND(举手), KICK(被踢), ROTATE(画面翻转), FILE(切换文件), TEXT(文本消息), switch(切换设备)
    public function handle($socket, $arr)
    {
        $room = [];
        $users = [];
        if (Redis::exists($socket->room_id.'room')) {
            $room = self::redisGet($socket->room_id.'room');
        }
        if (Redis::exists($socket->room_id.'users')) {
            $temp = self::redisGet($socket->room_id.'users');
            $users = isset($temp['users'][$socket->hash_id]) ? $temp['users'][$socket->hash_id] : [];
        }
        if (!isset($room[$socket->hash_id])) {
            $room[$socket->hash_id] = $socket->hash_id;
            self::redisSet($socket->room_id.'room', $room);
        }
        $msg = '';
        switch ($arr['type']) {
            case 'connection':
                $msg = '连接socket并登录成功';
                break;
            case 'relogin':
                $msg = '在其他地方登录';
                break;
            case 'disconnect':
                $msg = '断开socket连接';
                break;
            case 'create':
                $msg = '上课并创建房间';
                break;
            case 'enter':
                $msg = '进入房间';
                break;
            case 'over':
                $msg = '下课并退出房间';
                break;
            case 'useradd':
                $msg = '获取用户保留参数';
                break;
            case 'userinit':
                $msg = '初始化用户参数';
                break;
            case 'userdel':
                $msg = '清除用户参数';
                break;
            case 'roominit':
                $msg = '初始化房间参数';
                break;
            case 'roomtype':
                if ($arr['status'] == 1) {
                    $msg = '切换房间模式为屏幕分享';
                } else {
                    $msg = '切换房间模式为白板';
                }
                break;
            case 'ischat':
                if ($arr['status'] == 1) {
                    $msg = '允许房间内聊天';
                } else {
                    $msg = '禁止房间内聊天';
                }
                break;
            case 'ishand':
                if ($arr['status'] == 1) {
                    $msg = '允许房间内举手';
                } else {
                    $msg = '禁止房间内举手';
                }
                break;
            case 'MAX':
                if ($arr['text'] == 1) {
                    $msg = '放大了'.$arr['hash_id'].'的画面';
                } else {
                    $msg = '关闭了放大画面';
                }
                break;
            case 'boardscale':
                $msg = '调整白板缩放大小为'.$arr['status'];
                break;
            case 'PLATZAN':
                $msg = '奖励全部台上人员';
                break;
            case 'ZAN':
                $msg = '奖励'.$arr['hash_id'];
                break;
            case 'platboard':
                if ($arr['status'] == 1) {
                    $msg = '授权全部台上人员操作白板';
                } else {
                    $msg = '取消授权全部台上人员操作白板';
                }
                break;
            case 'platvoice':
                if ($arr['status'] == 1) {
                    $msg = '打开全部台上人员麦克风';
                } else {
                    $msg = '关闭全部台上人员麦克风';
                }
                break;
            case 'board':
                if ($arr['status'] == 1) {
                    $msg = '授权'.$arr['hash_id'].'操作白板';
                } else {
                    $msg = '取消授权'.$arr['hash_id'].'操作白板';
                }
                break;
            case 'camera':
                if ($arr['status'] == 1) {
                    $msg = '打开'.$arr['hash_id'].'摄像头';
                } else {
                    $msg = '关闭'.$arr['hash_id'].'摄像头';
                }
                break;    
            case 'voice':
                if ($arr['status'] == 1) {
                    $msg = '打开'.$arr['hash_id'].'麦克风';
                } else {
                    $msg = '关闭'.$arr['hash_id'].'麦克风';
                }
                break;
            case 'plat':
                if ($socket->hash_id == $arr['hash_id']) {
                    if ($arr['status'] == 1) {
                        $msg = '我上台了';
                    } else {
                        $msg = '我下台了';
                    }
                } else {
                    if ($arr['status'] == 1) {
                        $msg = '让'.$arr['hash_id'].'上台了';
                    } else {
                        $msg = '让'.$arr['hash_id'].'下台了';
                    }
                }
                break;
            case 'HAND':
                $msg = '举手了';
                break;
            case 'KICK':
                $msg = '将'.$arr['hash_id'].'踢出了房间';
                break;
            case 'FILE':
                if ($arr['status'] == 1) {
                    $msg = '打开了白板文件';
                } else {
                    $msg = '关闭了白板文件';
                }
                break;
            case 'switch':
                $msg = '切换了设备：'.$arr['camera'].'，'.$arr['mic'];
                break;
            case 'TEXT':
                $msg = $arr['nickname'].'：'.$arr['text'];
                break;
            default:
                $msg = implode(',', $arr);
                break;
        }
        if ($arr['type'] == 'TEXT') {
            $this->chat($socket->room_id, $msg);
        } else {
            $this->save($socket->room_id, $socket->hash_id, $users, $msg);
            // 保存其他人的状态变化
            if (isset($arr['hash_id']) && $arr['hash_id'] != '' && $socket->hash_id != $arr['hash_id']) {
                $this->othersave($socket->room_id, $arr);
            }
        }
    }

    private function save($room_id, $hash_id, $users, $msg)
    {
        $now = date('Y-m-d H:i:s');
        $res = [];
        if (Redis::exists($room_id.'users'.$hash_id)) {
            $res = self::redisGet($room_id.'users'.$hash_id);
        }
        $arr = [];
        if (count($users) > 0) {
            $arr['plat'] = isset($users['plat']) ? $users['plat'] : '';
            $arr['board'] = isset($users['board']) ? $users['board'] : '';
            $arr['voice'] = isset($users['voice']) ? $users['voice'] : '';
            $arr['camera'] = isset($users['camera']) ? $users['camera'] : '';
            $arr['platform'] = isset($users['platform']) ? $users['platform'] : '';
            $arr['zan'] = isset($users['zan']) ? $users['zan'] : '';
        }
        $res[] = ['msg' => $msg, 'users' => $arr, 'time' => $now];
        self::redisSet($room_id.'users'.$hash_id, $res);
    }

    private function othersave($room_id, $arr)
    {
        $hash_id = $arr['hash_id'];
        $users = [];
        if (Redis::exists($room_id.'users')) {
            $temp = self::redisGet($room_id.'users');
            $users = isset($temp['users'][$hash_id]) ? $temp['users'][$hash_id] : [];
        }
        $msg = '';
        switch ($arr['type']) {
            case 'MAX':
                if ($arr['text'] == 1) {
                    $msg = '放大了我的画面';
                } else {
                    $msg = '关闭了放大画面';
                }
                break;
            case 'ZAN':
                $msg = '奖励了我';
                break;
            case 'board':
                if ($arr['status'] == 1) {
                    $msg = '授权我操作白板';
                } else {
                    $msg = '取消授权我操作白板';
                }
                break;
            case 'voice':
                if ($arr['status'] == 1) {
                    $msg = '打开了我的麦克风';
                } else {
                    $msg = '关闭了我的麦克风';
                }
                break;
            case 'plat':
                if ($arr['status'] == 1) {
                    $msg = '我上台了';
                } else {
                    $msg = '我下台了';
                }
                break;
            case 'KICK':
                $msg = '我被踢出了房间';
                break;
            default:
                break;
        }
        if ($msg) {
           $this->save($room_id, $arr['hash_id'], $users, $msg); 
        }
    }

    private function chat($room_id, $msg)
    {
        $now = date('Y-m-d H:i:s');
        if (Redis::exists($room_id.'roomchat')) {
            $chat = self::redisGet($room_id.'roomchat');
        }
        $chat[] = ['msg' => $msg, 'time' => $now];
        self::redisSet($room_id.'roomchat', $chat);
    }

    public function chathistory($room_id)
    {
        $res = [];
        if (Redis::exists($room_id.'roomchat')) {
            $res = self::redisGet($room_id.'roomchat');
        }
        return $res;
    }
    
    public function errors($socket, $msg)
    {
        $now = date('Y-m-d H:i:s');
        if (Redis::exists($socket->room_id.'roomerrors')) {
            $errors = self::redisGet($socket->room_id.'roomerrors');
        }
        $errors[] = ['msg' => $msg, 'time' => $now];
        self::redisSet($socket->room_id.'roomerrors', $errors);
    }

    // 7*24*3600
    public function redisSet($key, $arr = [], $time = 604800) {
        Redis::setex($key, $time, serialize($arr));
    }

    public function redisGet($key) {
        return unserialize(Redis::get($key));
    }
}

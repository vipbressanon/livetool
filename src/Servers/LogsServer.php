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
    // 权限参数：PLATZAN(台上批量点赞), ZAN(点赞), platboard(台上批量白板), platvoice(台上批量麦克风), board(白板), voice(麦克风)
    // 其他操作：HAND(举手), KICK(被踢), ROTATE(画面翻转), FILE(), TEXT(文本消息)
    public function handle($socket, $arr)
    {
        $room = [];
        if (Redis::exists($socket->room_id.'room')) {
            $room = self::redisGet($socket->room_id.'room');
        }
        if (!isset($room[$socket->hash_id])) {
            $room[$socket->hash_id] = $socket->hash_id;
            self::redisSet($socket->room_id.'room', $room);
        }
        $msg = '';
        switch ($arr['type']) {
            case 'connection':
                $msg = '连接socket并登录成功';
                $this->save($socket->hash_id, $msg);
                break;
            case 'relogin':
                $msg = '在其他地方登录';
                $this->save($socket->hash_id, $msg);
                break;
            case 'disconnect':
                $msg = '断开socket连接';
                $this->save($socket->hash_id, $msg);
                break;
            case 'create':
                $msg = '上课并创建房间';
                $this->save($socket->hash_id, $msg);
                break;
            case 'enter':
                $msg = '进入房间';
                $this->save($socket->hash_id, $msg);
                break;
            case 'over':
                $msg = '下课并退出房间';
                $this->save($socket->hash_id, $msg);
                break;
            case 'useradd':
                $msg = '获取用户保留参数';
                $this->save($socket->hash_id, $msg);
                break;
            case 'userinit':
                $msg = '初始化用户参数';
                $this->save($socket->hash_id, $msg);
                break;
            case 'userdel':
                $msg = '清除用户参数';
                $this->save($socket->hash_id, $msg);
                break;
            case 'roominit':
                $msg = '初始化房间参数';
                $this->save($socket->hash_id, $msg);
                break;
            case 'roomtype':
                if ($arr['status'] == 1) {
                    $msg = '切换房间模式为屏幕分享';
                } else {
                    $msg = '切换房间模式为白板';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'ischat':
                if ($arr['status'] == 1) {
                    $msg = '允许房间内聊天';
                } else {
                    $msg = '禁止房间内聊天';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'ishand':
                if ($arr['status'] == 1) {
                    $msg = '允许房间内举手';
                } else {
                    $msg = '禁止房间内举手';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'MAX':
                if ($arr['status'] == 1) {
                    $msg = '放大了'.$arr['hash_id'].'的画面';
                } else {
                    $msg = '关闭了放大画面';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'boardscale':
                $msg = '调整白板缩放大小为'.$arr['status'];
                $this->save($socket->hash_id, $msg);
                break;
            case 'PLATZAN':
                $msg = '奖励全部台上人员';
                $this->save($socket->hash_id, $msg);
                break;
            case 'ZAN':
                $msg = '奖励'.$arr['hash_id'];
                $this->save($socket->hash_id, $msg);
                break;
            case 'platboard':
                if ($arr['status'] == 1) {
                    $msg = '授权全部台上人员操作白板';
                } else {
                    $msg = '取消授权全部台上人员操作白板';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'platvoice':
                if ($arr['status'] == 1) {
                    $msg = '打开全部台上人员麦克风';
                } else {
                    $msg = '关闭全部台上人员麦克风';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'board':
                if ($arr['status'] == 1) {
                    $msg = '授权'.$arr['hash_id'].'操作白板';
                } else {
                    $msg = '取消授权'.$arr['hash_id'].'操作白板';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'voice':
                if ($arr['status'] == 1) {
                    $msg = '打开'.$arr['hash_id'].'麦克风';
                } else {
                    $msg = '关闭'.$arr['hash_id'].'麦克风';
                }
                $this->save($socket->hash_id, $msg);
                break;
            case 'HAND':
                $msg = '举手了';
                $this->save($socket->hash_id, $msg);
                break;
            case 'KICK':
                $msg = '将'.$arr['hash_id'].'踢出了房间';
                $this->save($socket->hash_id, $msg);
                break;
            case 'FILE':
                $msg = '切换了白板tab页';
                $this->save($socket->hash_id, $msg);
                break;
            case 'TEXT':
                $msg = $arr['hash_id'].'：'.$arr['text'];
                $this->chat($socket->room_id, $msg);
                break;
            default:
                $msg = implode(',', $arr);
                $this->save($socket->hash_id, $msg);
                break;
        }
    }

    private function save($hash_id, $msg)
    {
        $now = date('Y-m-d H:i:s');
        if (Redis::exists($hash_id.'roomusers')) {
            $users = self::redisGet($hash_id.'roomusers');
        }
        $users[] = ['msg' => $msg, 'time' => $now];
        self::redisSet($hash_id.'roomusers', $users);
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
    
    public function errors($msg)
    {
        $now = date('Y-m-d H:i:s');
        if (Redis::exists($hash_id.'roomerrors')) {
            $errors = self::redisGet($hash_id.'roomerrors');
        }
        $errors[] = ['msg' => $msg, 'time' => $now];
        self::redisSet($hash_id.'roomerrors', $errors);
    }

    // 7*24*3600
    public function redisSet($key, $arr = [], $time = 604800) {
        Redis::setex($key, $time, serialize($arr));
    }

    public function redisGet($key) {
        return unserialize(Redis::get($key));
    }
}

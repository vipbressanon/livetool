<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Cache;
use Log;
use Auth;

class ApiServer
{
    
    private $api;

    public function __construct()
    {
        $this->api = config('livetool.api');
    }

    // 获取房间编号
    public function number($room_id, $users_id)
    {
        $data = '';
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/room/number',
            ['room_id' => $room_id, 'users_id' => $users_id],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = $res->data;
        } else {
            Log::error($this->api['url'].'/api/room/number: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 获取用户口令
    public function userssig($users_id)
    {
        $data = '';
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/users/sig',
            ['users_id' => $users_id],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = $res->data;
        } else {
            Log::error($this->api['url'].'/api/users/sig: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 上课
    public function roomstart($room_id, $time)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/room/start',
            ['room_id' => $room_id, 'starttime' => $time],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/room/start: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 下课
    public function roomend($room_id, $time)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/room/end',
            ['room_id' => $room_id, 'endtime' => $time],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/room/end: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 用户进入
    public function usersstart($room_id, $users_id, $time)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/users/start',
            ['room_id' => $room_id, 'users_id' => $users_id, 'starttime' => $time],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/users/start: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 用户退出
    public function usersend($room_id, $users_id, $time)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/users/end',
            ['room_id' => $room_id, 'users_id' => $users_id, 'endtime' => $time],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );Log::info('124行', [$res]);
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/users/end: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 录制开始
    public function recordstart($room_id)
    {
        $data = false;
        $team = DB::table('team')
        ->leftjoin('course','course.team_id','=','team.id')
        ->leftjoin('room','room.course_id','=','course.id')
        ->select('team.logo_id')->where('room.id',$room_id)->first();
        $accesstoken = $this->accesstoken();
        $backurl =  env('APP_URL')=="http://localhost/" ? "https://zjtest.xueyoubangedu.com/" : env('APP_URL');
        $res = $this->sendRequest(
            $this->api['url'].'/api/record/start',
            ['room_id' => $room_id, 'callbackurl'=>$backurl.'livetool/record/callback','logo_id'=>$team->logo_id],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/record/start: '.$res->meta->msg);
        }
        return $res;
    }
    
    // 录制暂停
    public function recordpause($room_id)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/record/pause',
            ['room_id' => $room_id],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/record/pause: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 录制恢复
    public function recordresume($room_id)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/record/resume',
            ['room_id' => $room_id],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/record/sresumetart: '.$res->meta->msg);
        }
        return $data;
    }
    
    // 录制结束
    public function recordend($room_id,$share=array())
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/record/end',
            ['room_id' => $room_id,'share'=>$share],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if ($res->meta->code == 200) {
            $data = true;
        } else {
            Log::error($this->api['url'].'/api/record/end: '.$res->meta->msg);
        }
        return $res;
    }
    
    private function accesstoken()
    {
        if (!Cache::has('accesstoken')) {
            $accesstoken = $this->sendRequest(
                $this->api['url'].'/api/auth/login',
                ['appid' => $this->api['appid'], 'secret' => $this->api['secret']],
                [],
                'POST'
            );
            Cache::put('accesstoken', $accesstoken, $accesstoken->expires_in/60-20);
        }
        return Cache::get('accesstoken');
    }
    
    private function sendRequest($url, $option = array(), $header = array(), $type = 'POST') {
        $curl = curl_init (); // 启动一个CURL会话
        curl_setopt ( $curl, CURLOPT_URL, $url ); // 要访问的地址
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYPEER, FALSE ); // 对认证证书来源的检查
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYHOST, FALSE ); // 从证书中检查SSL加密算法是否存在
        curl_setopt ( $curl, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)' ); // 模拟用户使用的浏览器
        if(!empty($option)){
            $options = json_encode ( $option ,JSON_UNESCAPED_UNICODE);
            curl_setopt ( $curl, CURLOPT_POSTFIELDS, $options ); // Post提交的数据包
        }
        $header = array_merge($header, ['Content-Type: application/json']);
        curl_setopt ( $curl, CURLOPT_TIMEOUT, 30 ); // 设置超时限制防止死循环
        curl_setopt ( $curl, CURLOPT_HTTPHEADER, $header ); // 设置HTTP头
        curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, 1 ); // 获取的信息以文件流的形式返回
        curl_setopt ( $curl, CURLOPT_CUSTOMREQUEST, $type );
        $result = curl_exec ( $curl ); // 执行操作
        $result = json_decode($result);
        curl_close ( $curl ); // 关闭CURL会话
        return $result;
    }
}

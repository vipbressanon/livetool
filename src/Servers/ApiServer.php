<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Cache;
use Log;
use Auth;
use stdClass;
class ApiServer
{
    
    private $api;
    const TRANSCODE_ERROR = [
        "AuthFailure" => "CAM签名/鉴权错误,请联系客服人员",
        "FailedOperation.FileDownloadFail" => "文档下载失败，请检查请求参数中URL是否正确",
        "FailedOperation.FileFormatError" => "文档格式错误，不支持转换只读文档或者已加密的文档",
        "FailedOperation.FileOpenFail" => "文档打开失败，请检查提交转码的文档是否加密或有其他格式问题",
        "FailedOperation.FileUploadFail" => "转码后上传结果失败，请稍候重试",
        "FailedOperation.Transcode" => "转码失败，具体请参考错误描述或联系客服人员",
        "FailedOperation.TranscodeServerError" => "转码服务出现内部错误，请稍候重试或联系客户人员",
        "InvalidParameter.BodyParameterTypeUnmatched" => "参数类型不匹配",
        "InvalidParameter.FileFormatUnsupported" => "文档后缀名对应的格式不支持",
        "InvalidParameter.TaskNotFound" => "需要查询的任务不存在",
        "InvalidParameter.TranscodeParameter" => "文档转码参数格式不正确",
        "InvalidParameter.UrlFormatError" => "文档下载格式错误",
        "LimitExceeded.TranscodePagesLimitation" => "超过文档最大页数限制，目前不支持超过500页的文件转码",
        "ResourceUnavailable.NotRegistered" => "未开通互动白板",
        "ResourceUnavailable.ServiceExpired" => "账户欠费或者互动白板服务已过期",
        "UnauthorizedOperation.SdkAppId" => "SdkAppId不存在或者SdkAppId与当前腾讯云账号不对应"
    ];
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
        if (isset($res) && $res->meta->code == 200) {
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
        if (isset($res) && $res->meta->code == 200) {
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
    public function recordend($room_id)
    {
        $data = false;
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/record/end',
            ['room_id' => $room_id],
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
    // 白板-文件开始转码
    public function setDescribe($file_id, $fileurl, $file_name, $is_static = false)
    {
        $result = $this->getDescribe($file_id);
        if (isset($result) && $result != '' && $result->status == "TranscodeFinished") {
            $json = [
                'meta' => [
                    'code' => 300,
                    'msg'  => '已经转码完成',
                ],
                'data' => $result,
            ];
            return json_decode(json_encode($json));
        }
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/transcode/setdescribe',
            ['file_id' => $file_id, 'fileurl' => $fileurl, 'file_name' => $file_name, 'static' => $is_static],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if (!isset($res)) {
            Log::error($this->api['url'].'/api/transcode/setdescribe: ', [$res]);
        }
        return $res;
    }

    // 白板-文件获取转码结果
    public function getDescribe($file_id)
    {
        $data = '';
        $accesstoken = $this->accesstoken();
        $res = $this->sendRequest(
            $this->api['url'].'/api/transcode/getdescribe',
            ['file_id' => $file_id],
            ['Authorization: '.$accesstoken->token_type.' '.$accesstoken->access_token],
            'POST'
        );
        if (isset($res) && $res->meta->code == 200) {
            if ($res->data && $res->data->status == 'ERROR') {
                $res->data->fail_msg = array_key_exists($res->data->fail_code, self::TRANSCODE_ERROR) ? self::TRANSCODE_ERROR[$res->data->fail_code] : '文件转码失败，请稍后重试（1）';
                if (strstr($res->data->fail_msg, '-14,')) {
                    $b = mb_strpos($res->data->fail_msg, 'page [') + mb_strlen('page [');
                    $e = mb_strpos($res->data->fail_msg, ']') - $b;
                    $num = mb_substr($res->data->fail_msg, $b, $e);
                    $res->data->fail_msg.='：第'.$num.'页包含不支持的元素或动效，转码失败';
                } else if (strstr($res->data->fail_msg, '-6,')) {
                    $res->data->fail_msg = '文件已损坏无法打开，请检查文件';
                }
            }
            $data = $res->data;
        } else {
            Log::error($this->api['url'].'/api/transcode/getdescribe: ', [$res]);
        }
        return $data;
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

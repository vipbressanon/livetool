<?php

namespace Vipbressanon\LiveTool\Controllers;

use Illuminate\Routing\Controller;
use View;
use Illuminate\Http\Request;
use Auth;
use Illuminate\Support\Facades\Redis;
use Vipbressanon\LiveTool\Servers\CourseServer;
use Vipbressanon\LiveTool\Servers\RoomServer;
use Vipbressanon\LiveTool\Servers\UsersServer;
use Vipbressanon\LiveTool\Servers\RecordServer;
use Vipbressanon\LiveTool\Servers\BalanceServer;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Vipbressanon\LiveTool\Servers\TranscodeServer;
use Vipbressanon\LiveTool\Servers\LogsServer;
use Vipbressanon\LiveTool\Servers\SpeedServer;
use Log;
use Session;

class LiveController extends Controller
{

    // 进入直播间
    public function getRoom(Request $request, $hash_id = '')
    {
        $from = $request->input('frompage', '');
        $auth = config('livetool.auth');
        $auth_team = config('livetool.auth_team');
        $users = Auth::guard($auth)->user();
        $team = Auth::guard($auth_team)->user();

        $cs = new CourseServer();
        $course = $cs->detail($hash_id);
        if ($course) {
            $tel = $request->input('tel', '');
            if ($tel != '') {
                if ($from == 'monitor') {
                    // 兼课的自动登录
                    $this->autoMonitorLogin($course['id'], $course['team_id'], $tel);
                } else {
                    // 编程白名单课程的自动登录
                    $this->autologin($course['id'], $course['team_id'], $tel);
                }
                $users = Auth::guard($auth)->user();
                $team = Auth::guard($auth_team)->user();
            }
            if (!$users) {
                // 当前未登录跳转登录页面
                $url = config('livetool.loginurl');
                return redirect($url.'/'.$hash_id);
            }
            $platform = $this->platform();
            $rs = new RoomServer();
            // 判断用户是否为讲师
            $isteacher = $users->id == $course['teacher_id'] ? 1 : 0;
            // 获取房间信息
            $room = $rs->detail($course['id'], $course['teacher_id']);
            $us = new UsersServer();
            // 获取房间用户信息
            $us->detail($course['id'], $room['id'], $users->id, $platform, $course['team_id']);
            // 获取用户令牌
            $info = $us->sig($users, $room['id'], $isteacher);
            // 获取讲师信息
            $teacher = $us->teacher($room['id'], $course['team_id'], $course['teacher_id']);
            // 用户黑名单,被讲师踢出的将不能再次进入
            $black = $rs->black($room['id'], $info['id']);
            // 判断用户是否在白名单内
            $iswhite = $cs->iswhite($course['id'], $users->id);
            //是否被禁用
            $isDisplay = $cs->isDisplay($course['team_id'], $users->id);
            // 判断课程所属团队余额是否大于等于0
            $balance = $cs->balance($course['team_id']);
            // 判断是否是学管监课进入 $islistener
            $islistener = false;
            if ($from == 'monitor') {
                $islistener = $us->islistener($course['team_id'], $users->id);
            }
            $isadmin = $us->isadmin($course['team_id'], $users->id);
            // if (!$iswhite && $isadmin) {
            //     // 口令课程 后台登录后一键进入 默认填充白名单数据
            //     $cs->addwhite($course, $users->id, $isteacher);
            // }
            // 判断是否有权限进入
            $role = $this->role($course, $black, $iswhite, $balance, $info['online_num'], $isDisplay, $islistener, $isadmin);
            if ($role[0] == 203 && !$isadmin) {
                $url = config('livetool.loginurl');
                return redirect($url.'/'.$hash_id);
            }
            // 根据用户身份进入不同页面
            $viewtype = 'livetool::small';
            if ($course['type'] == 1) {
                $viewtype = 'livetool::small';
            } elseif ($course['type'] == 2) {
                $viewtype = 'livetool::large';
            } elseif ($course['type'] == 3) {
                $viewtype = 'livetool::public';
            }
            //查询团队logo信息
            $team = $rs->getTeam($course['team_id']);
            $logo_url = isset($team->logo_url)?$team->logo_url:'';
            $title = isset($team->title)?$team->title:'';
            // 获取设备检测信息
            $device = $us->device($users->id, $course['id']);
            // 获取房间聊天历史记录
            $logs = new LogsServer();
            $history = $logs->chathistory($room['id']);
            $view = $isteacher ? $viewtype.'.teacher' : $viewtype.'.student';
            return view($view)
                    ->with('platform', $platform)
                    ->with('course', $course)
                    ->with('room', $room)
                    ->with('info', $info)
                    ->with('device', $device)
                    ->with('isteacher', $isteacher)
                    ->with('role', $role)
                    ->with('islistener', $islistener)
                    ->with('logo_url', $logo_url)
                    ->with('title', $title)
                    ->with('teacher', $teacher)
                    ->with('history', $history);
        } else {
            abort(404);
        }
    }
    
    private function platform()
    {
        $num = 0;
        $agent = strtolower($_SERVER['HTTP_USER_AGENT']);
        $is_pc = (strpos($agent, 'windows nt')) ? true : false;
        $is_mobile = (strpos($agent, 'iphone') || strpos($agent, 'android') || strpos($agent, 'ios')) ? true : false;
        $is_ipad = (strpos($agent, 'ipad') || strpos($agent, 'ipod')) ? true : false;
        if ($is_mobile) {
            $num = 1;
        } else if ($is_ipad) {
            $num = 2;
        } else {
            $num = 0;
        }
        return $num;
    }
    
    // 记录报错信息
    public function postErrors(Request $request)
    {
		$status = config('livetool.error_status');
		if ($status) {
			$auth = config('livetool.auth');
			$users = Auth::guard($auth)->user();
			$cs = new CourseServer();
			$cs->errors($request->all());
		}
        return response()->json(['error'=>'']);
    }

    // 上课
    public function postRoomStart(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $rs = new RoomServer();
        $starttime = $rs->start($course_id, $room_id);
        return response()->json(['error'=>'', 'starttime' => $starttime]);
    }

    // 开课失败，重置状态
    public function postRoomError(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $rs = new RoomServer();
        $rs->error($course_id, $room_id);
        return response()->json(['error'=>'']);
    }

    // 课程状态：0未上课，1已上课，2下课
    public function postRoomStatus(Request $request)
    {
        $course_id = $request->input('course_id');
        $rs = new RoomServer();
        $status = $rs->status($course_id);
        return response()->json(['error'=>'', 'status' => $status]);
    }
    
    // 下课
    public function postRoomEnd(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $rs = new RoomServer();
        $rs->end($course_id, $room_id);
        return response()->json(['error'=>'']);
    }
    
    // 切换聊天讨论
    public function postRoomChat(Request $request)
    {
        $room_id = $request->input('room_id');
        $roomchat = $request->input('roomchat');
        $rs = new RoomServer();
        $rs->chat($room_id, $roomchat);
        return response()->json(['error'=>'']);
    }
    
    // 切换全员上台
    public function postRoomSpeak(Request $request)
    {
        $room_id = $request->input('room_id');
        $roomspeak = $request->input('roomspeak');
        $rs = new RoomServer();
        $rs->speak($room_id, $roomspeak);
        return response()->json(['error'=>'']);
    }
    
    // 切换是否可举手
    public function postRoomHand(Request $request)
    {
        $room_id = $request->input('room_id');
        $roomhand = $request->input('roomhand');
        $rs = new RoomServer();
        $rs->hand($room_id, $roomhand);
        return response()->json(['error'=>'']);
    }
    
    // 踢出课堂
    public function postRoomKick(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $hash_id = $request->input('hash_id');
        $us = new UsersServer();
        $us->kick($course_id, $room_id, $hash_id);
        return response()->json(['error'=>'']);
    }
    
    // 点赞，上台，举手记录次数
    public function postOperate(Request $request)
    {
        $room_id = $request->input('room_id');
        $hash_id = $request->input('hash_id');
        $type = $request->input('type');
        $us = new UsersServer();
        $res = $us->operate($room_id, $hash_id, $type);
        return response()->json(['error'=>'']);
    }
    
    // 在线人员信息
    public function postOnline(Request $request)
    {
        $add = $request->input('add', []);
        $room_id = $request->input('room_id');
        $us = new UsersServer();
        $info = $us->info($add, $room_id);
        return response()->json(['error'=>'', 'info'=>$info]);
    }

    // 设备选择，检测
    public function getCheck(Request $request)
    {
        $type = $request->input('type', 1);
        $tea = $request->input('tea', 0);
        $room_id = $request->input('room_id', 0);
        $hash_id = $request->input('hash_id', '');
        // $stream = $request->input('stream', []);
        $push_microphoneId = $request->input('push_microphoneId', "default");
        if ($type == 1) {
            $ss = new SpeedServer();
            $speed = $ss->detail($room_id, $hash_id);
        } else {
            $speed = null;
        }
        // $stream = utf8_encode($stream);
        // $stream = $this->str_change($stream);
        return view('livetool::check')
                ->with('speed', $speed)
                ->with('type', $type)
                // ->with('stream', $stream)
                ->with('push_microphoneId', $push_microphoneId)
                ->with('tea', $tea)
                ->with('room_id', $room_id)
                ->with('hash_id', $hash_id);
    }

    // 重新签名
    public function resetSign(Request $request)
    {
        $us = new UsersServer();
        $data = $us->resetSign($request);
        return response()->json(['data' => $data]);
    }
    
    private function str_change($data) {
        $str=str_replace('[','',$data);
        $str=str_replace(']','',$str);
        $str=stripslashes($str);
        $upimg=explode('},',$str);
        $upimg=str_replace('}','',$upimg);
        $arr=[];
        foreach ($upimg as $k=>$v){
            $new=$v.'}';
            array_push($arr,$this->object_to_array(json_decode($new)));
        }
        return $arr;
    }

    private function object_to_array($obj) {
        $obj = (array)$obj;
        foreach ($obj as $k => $v) {
            if (gettype($v) == 'resource') {
                return;
            }
     
            if (gettype($v) == 'object' || gettype($v) == 'array') {
                $obj[$k] = (array)$this->object_to_array($v);
            }
        }
     
        return $obj;
    }

    // 保存设备检测数据
    public function saveDevice(Request $request)
    {
        $us = new UsersServer();
        $info = $us->saveDevice($request);
        return response()->json($info);
    }

     // 录制开始
    public function postRecord(Request $request)
    {
        Log::info("录制事件111 request",array('re' => $request->all()));
        $room_id = $request->input('room_id');
        $status = $request->input('status');
        $rs = new RecordServer();
        $res = $rs->handle($room_id, $status);
        if($res->meta->code == 200){
          return response()->json(['error'=>'']);  
        }
        return response()->json(['error'=>$res->meta->msg]);
    }

    // 录制回调
    public function postRecordCallBack(Request $request)
    {
        $rs = new RecordServer();
        $res = $rs->balance($request->all());
        return response()->json(['error'=>'']);
    }

    public function getBrowser(Request $request)
    {
        return view('livetool::browser');
    }

    // 文件转码开始
    public function setDescribe(Request $request)
    {
        $file_id = $request->input('file_id', '');
        $fileurl = $request->input('fileurl', '');
        $file_name = $request->input('file_name', '');
        $is_static = $request->input('is_static', false);
        $api = new ApiServer();
        $data = $api->setDescribe($file_id, $fileurl, $file_name, $is_static);
        if ($data && $data->meta->code) {
          return response()->json(['error' => ($data->meta->code == 200 || $data->meta->code == 300) ? '' : '转码失败', 'code' => $data->meta->code, 'data' => $data->data]);  
        }
        return response()->json(['error'=>'转码失败，请稍后再试', 'data' => '转码失败，请稍后再试']);
    }

    // 文件转码结果查询
    public function getDescribe(Request $request)
    {
        $file_id = $request->input('file_id', '');
        $api = new ApiServer();
        $data = $api->getDescribe($file_id);
        if ($data) {
          return response()->json(['error'=>'', 'data' => $data]);  
        }
        return response()->json(['error'=>'文件转码失败，请稍后再试', 'data' => '']);
    }    
    // 清除直播间数据
    public function clearRedis(Request $request) {
        $room_id = $request->input('room_id', '');
        $hash_id = $request->input('hash_id', '');
        if ($room_id && $hash_id) {
            if (Redis::exists($room_id.'users')) {
                $arr = unserialize(Redis::get($room_id.'users'));
                $users = array_key_exists('users', $arr) ? $arr['users'] : [];
                if (array_key_exists($hash_id, $users)) {
                    unset($arr['users'][$hash_id]);
                    if (count($arr['users']) == 0) {
                        Redis::del($room_id.'users');
                    } else {
                        Redis::setex($room_id.'users', 9000, serialize($arr));
                    }
                }
            }
            if (Redis::exists($room_id.'usersocket')){
                $usersocket = unserialize(Redis::get($room_id.'usersocket'));
                if (array_key_exists($hash_id, $usersocket)) {
                    unset($usersocket[$hash_id]);
                    if (count($usersocket) == 0) {
                        Redis::del($room_id.'usersocket');
                    } else {
                        Redis::setex($room_id.'usersocket', 9000, serialize($usersocket));
                    }
                }
            }
            $us = Redis::exists($room_id.'users') ? unserialize(Redis::get($room_id.'users')) : [];
            if (!Redis::exists($room_id.'users') || (Redis::exists($room_id.'users') && (!array_key_exists('users', $us) || count($us['users']) == 0))) {
                Redis::del($room_id.'onoff');
            }
        }
    }

    // session刷新
    public function getRefresh(Request $request)
    {
        $auth = config('livetool.auth');
        return view('livetool::refresh')
            ->with('auth', $auth);
    }

    // 保存网络测速数据
    public function postSpeed(Request $request)
    {
        $ss = new SpeedServer();
        $res = $ss->save($request->all());
        return response()->json(['error'=>'']);
    }

    // 传入手机号，并且是白名单课程，允许直接登录进入直播间
    private function autologin($course_id, $team_id, $tel)
    {
        $auth = config('livetool.auth');
        $team = config('livetool.auth_team');
        $us = new UsersServer();
        $users_id = $us->autologin($course_id, $tel);
        if ($users_id) {
            Auth::guard($auth)->loginUsingId($users_id);
            Auth::guard($team)->loginUsingId($team_id);
        } else {
            Auth::guard($auth)->logout();
            Auth::guard($team)->logout();
        }
    }

    // 兼课的自动登录
    private function autoMonitorLogin($course_id, $team_id, $tel)
    {
        $auth = config('livetool.auth');
        $team = config('livetool.auth_team');
        $us = new UsersServer();
        $users_id = $us->autoMonitorLogin($course_id,$team_id, $tel);
        if ($users_id) {
            Auth::guard($auth)->loginUsingId($users_id);
            Auth::guard($team)->loginUsingId($team_id);
        } else {
            Auth::guard($auth)->logout();
            Auth::guard($team)->logout();
        }
    }


    private function role($course, $black, $iswhite, $balance, $online_num, $isDisplay, $islistener = false, $isadmin = false)
    {
        $data = [201, '无法进入直播间'];
        if (!$islistener) {
        	if (!$iswhite && !$isadmin && $course['invite_type'] == 0) {
        		return [201, '无法进入直播间'];
        	}
        	if (!$iswhite && !$isadmin && $course['invite_type'] == 1) {
        		return [203, '请输入口令'];
        	}		
            if(!$iswhite && !$isadmin && $course['invite_type'] == 2){
                return [ 201 ,'不在白名单内，无法进入'];
            }   
            if($online_num >= $course['up_top'] + $course['down_top']){
                return [ 201 ,'房间人数已满，无法进入'];
            }
        }
        if ($course['status'] == 0) {
            if ($balance) {
                $data = [202, '请等待讲师开课'];
            } else {
                $data = [204, '讲师账户余额不足'];
            }
        } elseif ($course['status'] == 1) {
            if (!$balance) {
                $data = [204, '讲师账户余额不足'];
            } elseif ($black && !$islistener) {
                $data = [201, '被讲师踢出'];
            } else {
                $data = [200, '正常进入'];
            }
        } elseif ($course['status'] == 2) {
            $data = [201, '已下课'];
        }
        if($isDisplay == 1){
            $data = [213, '账号已被禁用，不能进入'];
        }
        return $data;
    }

    public function postRecordStatus(Request $request){


        $input = $request->all();
        $rs = new RecordServer();
        $flag = $rs->postRecordStatus($input['course_id'], $input['room_id']);
        return response()->json(['error'=>'', 'flag' => $flag]);
    }
}
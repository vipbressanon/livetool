<?php

namespace Vipbressanon\LiveTool\Controllers;

use Illuminate\Routing\Controller;
use View;
use Illuminate\Http\Request;
use Auth;

use Vipbressanon\LiveTool\Servers\CourseServer;
use Vipbressanon\LiveTool\Servers\RoomServer;
use Vipbressanon\LiveTool\Servers\UsersServer;
use Vipbressanon\LiveTool\Servers\RecordServer;

class LiveController extends Controller
{
    // 进入直播间
    public function getRoom(Request $request, $hash_id = '')
    {
        $auth = config('livetool.auth');
        $users = Auth::guard($auth)->user();
        if (!$users) {
            Auth::guard($auth)->loginUsingId($request->input('uid'));
            $users = Auth::guard($auth)->user();
            // $url = config('livetool.loginurl');
            // return redirect($url.'/'.$hash_id);
        }
        $cs = new CourseServer();
        $course = $cs->detail($hash_id);
        if ($course) {
            $platform = 0;
            $rs = new RoomServer();
            $room = $rs->detail($course['id'], $course['teacher_id']);
            $us = new UsersServer();
            $us->init($course['id'], $room['id'], $users->id, $platform);
            
            $info = $us->sig($users->hash_id, $users->id);
            $isteacher = $users->id == $course['teacher_id'] ? 1 : 0;
            $view = $isteacher ? 'livetool::teacher' : 'livetool::student';
            $black = $rs->black($room['id'], $info['id']);
            $share = $cs->share($course['id']);
            return view($view)
                    ->with('course', $course)
                    ->with('room', $room)
                    ->with('info', $info)
                    ->with('black', $black)
                    ->with('share', $share)
                    ->with('isteacher', $isteacher);
        } else {
            abort(404);
        }
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
    
    // 下课
    public function postRoomEnd(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $rs = new RoomServer();
        $rs->end($course_id, $room_id);
        return response()->json(['error'=>'']);
    }
    
    // 切换直播模式
    public function postRoomType(Request $request)
    {
        $room_id = $request->input('room_id');
        $roomtype = $request->input('roomtype');
        $rs = new RoomServer();
        $rs->type($room_id, $roomtype);
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
    
    // 用户进入直播间
    public function postUsersStart(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $users_id = $request->input('users_id');
        $us = new UsersServer();
        $us->start($course_id, $room_id, $users_id);
        return response()->json(['error'=>'']);
    }
    
    // 用户离开直播间
    public function postUsersEnd(Request $request)
    {
        $course_id = $request->input('course_id');
        $room_id = $request->input('room_id');
        $users_id = $request->input('users_id');
        $us = new UsersServer();
        $us->end($course_id, $room_id, $users_id);
        return response()->json(['error'=>'']);
    }
    
    // 踢出课堂
    public function postRoomKick(Request $request)
    {
        $room_id = $request->input('room_id');
        $users_id = $request->input('users_id');
        $rs = new RoomServer();
        $rs->kick($room_id, $users_id);
        return response()->json(['error'=>'']);
    }
    
    // 点赞，上台，举手记录次数
    public function postOperate(Request $request)
    {
        $room_id = $request->input('room_id');
        $users_id = $request->input('users_id');
        $type = $request->input('type');
        $us = new UsersServer();
        $res = $us->operate($room_id, $users_id, $type);
        return response()->json(['error'=>'']);
    }
    
    // 在线人员信息
    public function postOnline(Request $request)
    {
        $old = $request->input('old', []);
        $new = $request->input('new', []);
        $room_id = $request->input('room_id');
        $us = new UsersServer();
        $info = $us->info($old, $new, $room_id);
        return response()->json(['error'=>'', 'add'=>$info[0], 'cut'=>$info[1]]);
    }
    
    // 设备选择，检测
    public function getCheck(Request $request)
    {
        $type = $request->input('type', '1');
        return view('livetool::check')
                ->with('type', $type);
    }
    
    // 录制开始
    public function postRecord(Request $request)
    {
        $room_id = $request->input('room_id');
        $status = $request->input('status');
        $rs = new RecordServer();
        $res = $rs->hander($room_id, $status);
        return response()->json(['error'=>'']);
    }
}
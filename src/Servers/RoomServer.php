<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Room;
use Vipbressanon\LiveTool\Models\RoomBlack;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Illuminate\Support\Facades\Redis;
use Log;

class RoomServer
{

    public function __construct()
    {
    }

    public function detail($course_id, $teacher_id, $isteacher)
    {
        $res = Room::select('id', 'hash_id', 'course_id', 'roomtype', 'roomchat', 'roomspeak', 'roomhand', 'roomrecord')
                ->where('course_id', $course_id)
                ->first();
        if (!$res) {
            $now = date('Y-m-d H:i:s');
            $res = new Room();
            $res->hash_id = '';
            $res->course_id = $course_id;
            $res->roomtype = 2;
            $res->roomchat = 1;
            $res->roomspeak = 0;
            $res->roomhand = 1;
            $res->roomrecord = 0;
            $res->save();
        }
        if ($res->hash_id == '') {
            $api = new ApiServer();
            $data = $api->number($res->id, $teacher_id);
            $res->hash_id = $data ? $data->hash_id : '';
            $res->save();
        }
        $online_num = 0;
        
        if (!$isteacher) {
            $users = unserialize(Redis::get($res->id.'users'));
            if ($users) {
                foreach ($users['users'] as $v) {
                    if(!$v['isteacher']) $online_num++;
                }
            }
        }
        
        return [
            'id' => $res->id,
            'hash_id' => $res->hash_id,
            'course_id' => $res->course_id,
            'roomtype' => $res->roomtype,
            'roomchat' => $res->roomchat,
            'roomspeak' => $res->roomspeak,
            'roomhand' => $res->roomhand,
            'roomrecord' => $res->roomrecord,
            'online_num' =>  $online_num
        ];
    }
    
    public function start($course_id, $room_id)
    {
        $now = date('Y-m-d H:i:s');
        $course = config('livetool.course');
        $detail = DB::table($course['table'])->where($course['field']['id'], $course_id)->first();
        DB::table($course['table'])
            ->where($course['field']['id'], $course_id)
            ->update([
                $course['field']['starttime'] => $now,
                $course['field']['endtime'] => null,
                $course['field']['status'] => 1,
                $course['field']['updated_at'] => $now
            ]);
        $api = new ApiServer();
        $api->roomstart($room_id, $now);
        return $now;
    }
    
    public function end($course_id, $room_id)
    {
        $now = date('Y-m-d H:i:s');
        $course = config('livetool.course');
        $res = DB::table($course['table'])
            ->select($course['field']['starttime'].' as starttime', $course['field']['id'].' as id')
            ->where($course['field']['id'], $course_id)
            ->first();
        if ($res) {
            $num = isset($res->starttime) ? (strtotime($now) - strtotime($res->starttime)) : 0;
            DB::table($course['table'])
                ->where($course['field']['id'], $res->id)
                ->update([
                    $course['field']['endtime'] => $now,
                    $course['field']['second'] => $num,
                    $course['field']['status'] => 2,
                    $course['field']['updated_at'] => $now
                ]);
            if ($room_id) {
                $room = Room::find($room_id);
                $room->roomrecord = 3;
                $room->save();
                $api = new ApiServer();
                $api->roomend($room_id, $now);
                // 在socket中进行结算
                // $api->recordend($room_id);
            } 
        }
        return true;
    }
    
    public function type($room_id, $type)
    {
        $res = Room::find($room_id);
        $res->roomtype = $type;
        $res->save();
    }
    
    public function chat($room_id, $chat)
    {
        $res = Room::find($room_id);
        $res->roomchat = $chat;
        $res->save();
    }
    
    public function speak($room_id, $speak)
    {
        $res = Room::find($room_id);
        $res->roomspeak = $speak;
        $res->save();
    }
    
    public function hand($room_id, $hand)
    {
        $res = Room::find($room_id);
        $res->roomhand = $hand;
        $res->save();
    }
    
    public function black($room_id, $users_id)
    {
        $res = RoomBlack::where('room_id', $room_id)
            ->where('users_id', $users_id)
            ->first();
        return $res ? true : false;
    }
}

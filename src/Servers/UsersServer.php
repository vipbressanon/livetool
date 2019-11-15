<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Room;
use Vipbressanon\LiveTool\Models\RoomSig;
use Vipbressanon\LiveTool\Servers\ApiServer;

class UsersServer
{

    public function __construct()
    {
    }

    public function sig($hash_id, $users_id)
    {
        $now = date('Y-m-d H:i:s');
        $res = RoomSig::where('users_id', $users_id)->first();
        if (!$res) {
            $res = new RoomSig();
            $res->sdkappid = '';
            $res->users_id = $users_id;
            $res->hash_id = '';
            $res->usersig = '';
            $res->overtime = null;
            $res->save();
        }
        if ($res->usersig == '' || $res->overtime < $now) {
            $api = new ApiServer();
            $sig = $api->userssig($users_id);
            $res->sdkappid = $sig ? $sig->sdkappid : '';
            $res->hash_id = $sig ? $sig->hash_id : '';
            $res->usersig = $sig ? $sig->usersig : '';
            $res->overtime = $sig ? $sig->overtime : null;
            $res->save();
        }
        $users = config('livetool.users');
        $info = DB::table($users['table'])
            ->select(
                $users['field']['nickname'].' as nickname'
            )
            ->where($users['field']['id'], $users_id)
            ->first();
        $nickname = $info ? $info->nickname : '';
        return [
            'id' => $users_id,
            'nickname' => $nickname,
            'sdkappid' => $res->sdkappid,
            'hash_id' => $res->hash_id,
            'usersig' => $res->usersig
        ];
    }
    
    public function init($course_id, $room_id, $users_id, $platform)
    {
        $course_users = config('livetool.course_users');
        $res = DB::table($course_users['table'])
                ->where($course_users['field']['room_id'], $room_id)
                ->where($course_users['field']['users_id'], $users_id)
                ->first();
        if (!$res) {
            $now = date('Y-m-d H:i:s');
            $id = DB::table($course_users['table'])->insertGetId([
                $course_users['field']['course_id'] => $course_id,
                $course_users['field']['room_id'] => $room_id,
                $course_users['field']['users_id'] => $users_id,
                $course_users['field']['zan'] => 0,
                $course_users['field']['speak'] => 0,
                $course_users['field']['hand'] => 0,
                $course_users['field']['platform'] => $platform,
                $course_users['field']['created_at'] => $now,
                $course_users['field']['updated_at'] => $now
            ]);
        }
    }
    
    public function start($course_id, $room_id, $users_id)
    {
        $this->end($room_id, $users_id);
        $now = date('Y-m-d H:i:s');
        $users_log = config('livetool.course_users_log');
        DB::table($users_log['table'])->insert([
            $users_log['field']['room_id'] => $room_id,
            $users_log['field']['course_id'] => $course_id,
            $users_log['field']['users_id'] => $users_id,
            $users_log['field']['starttime'] => $now,
            $users_log['field']['endtime'] => null,
            $users_log['field']['total'] => 0,
            $users_log['field']['status'] => 0,
            $users_log['field']['created_at'] => $now,
            $users_log['field']['updated_at'] => $now
        ]);
        $api = new ApiServer();
        $api->usersstart($room_id, $users_id, $now);
        return true;
    }
    
    public function end($room_id, $users_id)
    {
        $now = date('Y-m-d H:i:s');
        $users_log = config('livetool.course_users_log');
        
        $res = DB::table($users_log['table'])
                ->select($users_log['field']['starttime'].' as starttime', $users_log['field']['id'].' as id')
                ->where($users_log['field']['room_id'], $room_id)
                ->where($users_log['field']['users_id'], $users_id)
                ->where($users_log['field']['status'], 0)
                ->orderBy($users_log['field']['created_at'], 'desc')
                ->first();
        if ($res) {
            $num = strtotime($now) - strtotime($res->starttime);
            DB::table($users_log['table'])
                ->where($users_log['field']['id'], $res->id)
                ->update([
                    $users_log['field']['endtime'] => $now,
                    $users_log['field']['total'] => $num,
                    $users_log['field']['status'] => 1,
                    $users_log['field']['updated_at'] => $now
                ]);
            $api = new ApiServer();
            $api->usersend($room_id, $users_id, $now);
        }
        return true;
    }
    
    public function operate($room_id, $users_id, $type)
    {
        $course_users = config('livetool.course_users');
        $res = DB::table($course_users['table'])
                ->where($course_users['field']['room_id'], $room_id)
                ->where($course_users['field']['users_id'], $users_id)
                ->increment($type);
        return true;
    }
    
    public function info($old, $new, $room_id)
    {
        $add = array_diff($new, $old);
        $cut = array_diff($old, $new);
        $users = config('livetool.users');
        $course_users = config('livetool.course_users');
        $res = DB::table($course_users['table'])
                ->leftJoin(
                $users['table'],
                $course_users['table'].'.'.$course_users['field']['users_id'],
                '=',
                $users['table'].'.'.$users['field']['id']
                )->leftJoin(
                'room_sig',
                $course_users['table'].'.'.$course_users['field']['users_id'],
                '=',
                'room_sig.users_id'
                )
                ->select(
                    $users['table'].'.'.$users['field']['id'].' as id',
                    $users['table'].'.'.$users['field']['nickname'].' as nickname',
                    $users['table'].'.'.$users['field']['imgurl'].' as imgurl',
                    $course_users['table'].'.'.$course_users['field']['zan'].' as zan',
                    'room_sig.hash_id as hash_id'
                    // $course_users['table'].'.'.$course_users['field']['speak'].' as speak',
                    // $course_users['table'].'.'.$course_users['field']['hand'].' as hand'
                )
                ->where($course_users['table'].'.'.$course_users['field']['room_id'], $room_id)
                ->whereIn($course_users['table'].'.'.$course_users['field']['users_id'], $add)
                ->get();
        return [$res, $cut];
    }
}

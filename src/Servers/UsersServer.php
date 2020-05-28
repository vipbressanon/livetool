<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Room;
use Vipbressanon\LiveTool\Models\RoomSig;
use Vipbressanon\LiveTool\Models\RoomBlack;
use Vipbressanon\LiveTool\Servers\ApiServer;

class UsersServer
{

    public function __construct()
    {
    }

    public function sig($users, $room_id)
    {
        $now = date('Y-m-d H:i:s');
        $res = RoomSig::where('users_id', $users->id)->first();
        if (!$res) {
            $res = new RoomSig();
            $res->sdkappid = '';
            $res->users_id = $users->id;
            $res->hash_id = '';
            $res->usersig = '';
            $res->overtime = null;
            $res->save();
        }
        if ($res->usersig == '' || $res->overtime < $now) {
            $api = new ApiServer();
            $sig = $api->userssig($users->id);
            $res->sdkappid = $sig ? $sig->sdkappid : '';
            $res->hash_id = $sig ? $sig->hash_id : '';
            $res->usersig = $sig ? $sig->usersig : '';
            $res->overtime = $sig ? $sig->overtime : null;
            $res->save();
        }
        $users_form = config('livetool.usersinfo');
        $users_form = DB::table($users_form['table'])
                ->select('nickname', 'zan')
                ->where($users_form['field']['room_id'], $room_id)
                ->where($users_form['field']['users_id'], $users->id)
                ->first();
        $zan = $users_form ? $users_form->zan : 0;
        $nickname = $users_form ? $users_form->nickname : '';
        return [
            'id' => $users->id,
            'nickname' => $nickname,
            'imgurl' => $users->imgurl,
            'zan' => $zan,
            'sdkappid' => $res->sdkappid,
            'hash_id' => $res->hash_id,
            'usersig' => $res->usersig
        ];
    }
    
    public function detail($course_id, $room_id, $users_id, $platform, $team_id)
    {
        $course_users = config('livetool.course_users');
        $res = DB::table($course_users['table'])
                ->select(
                    $course_users['field']['id'].' as id',
                    $course_users['field']['platform'].' as platform'
                )
                ->where($course_users['field']['room_id'], $room_id)
                ->where($course_users['field']['users_id'], $users_id)
                ->first();
        if ($res) {
            if ($platform != $res->platform) {
                DB::update(
                    "update ".$course_users['table']." set ".$course_users['field']['platform'].
                    "=".$platform." where ".$course_users['field']['id']."=".$res->id
                );
            }
        } else {
            $now = date('Y-m-d H:i:s');
            $id = DB::table($course_users['table'])->insertGetId([
                $course_users['field']['team_id'] => $team_id,
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
    
    public function start($room_id, $hash_id)
    {
        $room = Room::find($room_id);
        if (!$room) {
            return false;
        }
        $this->end($room_id, $hash_id);
        $users_id = $this->hashid($hash_id);
        if ($users_id == '') {
            return false;
        }
        $now = date('Y-m-d H:i:s');
        $users_log = config('livetool.course_users_log');
        DB::table($users_log['table'])->insert([
            $users_log['field']['room_id'] => $room_id,
            $users_log['field']['course_id'] => $room->course_id,
            $users_log['field']['users_id'] => $users_id,
            $users_log['field']['starttime'] => $now,
            $users_log['field']['balancetime'] => null,
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
    
    public function end($room_id, $hash_id)
    {
        $now = date('Y-m-d H:i:s');
        $users_log = config('livetool.course_users_log');
        $users_id = $this->hashid($hash_id);
        if ($users_id == '') {
            return false;
        }
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
    
    public function operate($room_id, $hash_id, $type)
    {
        if (is_array($hash_id)) {
            $users_id = RoomSig::whereIn('hash_id', $hash_id)->pluck('users_id')->toArray();
            if (count($users_id) == 0) {
                return false;
            }
            $course_users = config('livetool.course_users');
            $res = DB::table($course_users['table'])
                    ->where($course_users['field']['room_id'], $room_id)
                    ->whereIn($course_users['field']['users_id'], $users_id)
                    ->increment($type);
        } else {
            $users_id = $this->hashid($hash_id);
            if ($users_id == '') {
                return false;
            }
            $course_users = config('livetool.course_users');
            $res = DB::table($course_users['table'])
                    ->where($course_users['field']['room_id'], $room_id)
                    ->where($course_users['field']['users_id'], $users_id)
                    ->increment($type);
        }
        
        return true;
    }
    
    public function info($add, $room_id)
    {
        $usersinfo = config('livetool.usersinfo');
        $table = DB::table($usersinfo['table'])
                ->select(
                    $usersinfo['field']['users_id'].' as id',
                    $usersinfo['field']['nickname'].' as nickname',
                    $usersinfo['field']['zan'].' as zan',
                    $usersinfo['field']['platform'].' as platform',
                    $usersinfo['field']['hash_id'].' as hash_id',
                    $usersinfo['field']['imgurl'].' as imgurl'
                )
                ->where($usersinfo['field']['room_id'], $room_id);
        
        if (is_array($add)) {
            $table->whereIn($usersinfo['field']['hash_id'], $add);
        } else {
            $table->where($usersinfo['field']['hash_id'], $add);
        }
        $res = $table->get();  
        return $res;
    }
    
    public function kick($course_id, $room_id, $hash_id)
    {
        $users_id = $this->hashid($hash_id);
        if ($users_id == '') {
            return false;
        }
        $res = new RoomBlack();
        $res->course_id = $course_id;
        $res->room_id = $room_id;
        $res->users_id = $users_id;
        $res->save();
        return true;
    }
    
    public function teacher($room_id, $team_id, $teacher_id)
    {
        $users_from = config('livetool.users_from');
        $res = DB::table($users_from['table'])
                ->leftJoin(
                    'room_sig',
                    $users_from['table'].'.'.$users_from['field']['users_id'],
                    '=',
                    'room_sig.users_id'
                )
                ->select(
                    $users_from['table'].'.'.$users_from['field']['users_id'].' as id',
                    $users_from['table'].'.'.$users_from['field']['nickname'].' as nickname',
                    'room_sig.hash_id'
                )
                ->where($users_from['table'].'.'.$users_from['field']['team_id'], $team_id)
                ->where($users_from['table'].'.'.$users_from['field']['users_id'], $teacher_id)
                ->first();
        return [
            'id' => $res ? $res->id : '',
            'nickname' => $res ? $res->nickname : '',
            'hash_id' => $res ? $res->hash_id : ''
        ];
    }
    
    private function hashid($hash_id)
    {
        $res = RoomSig::where('hash_id', $hash_id)->first();
        return $res ? $res->users_id : '';
    }

}

<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Log;
use Vipbressanon\LiveTool\Models\Room;
use Vipbressanon\LiveTool\Models\RoomSig;

class CourseServer
{

    public function __construct()
    {
    }

    public function detail($hash_id)
    {
        $course = config('livetool.course');
        $res = DB::table($course['table'])
                ->select(
                    $course['table'].'.'.$course['field']['id'].' as id',
                    $course['table'].'.'.$course['field']['hash_id'].' as hash_id',
                    $course['table'].'.'.$course['field']['title'].' as title',
                    $course['table'].'.'.$course['field']['type'].' as type',
                    $course['table'].'.'.$course['field']['teacher_id'].' as teacher_id',
                    $course['table'].'.'.$course['field']['status'].' as status',
                    $course['table'].'.'.$course['field']['expectstart'].' as expectstart',
                    $course['table'].'.'.$course['field']['expectend'].' as expectend',
                    $course['table'].'.'.$course['field']['starttime'].' as starttime',
                    $course['table'].'.'.$course['field']['endtime'].' as endtime',
                    $course['table'].'.'.$course['field']['invite_type'].' as invite_type',
                    $course['table'].'.'.$course['field']['top_usersid'].' as top_usersid',
                    $course['table'].'.'.$course['field']['team_id'].' as team_id',
                    $course['table'].'.'.$course['field']['code_url'].' as code_url',
                    $course['table'].'.'.$course['field']['up_top'].' as up_top',
                    $course['table'].'.'.$course['field']['down_top'].' as down_top',
                    $course['table'].'.'.$course['field']['isrecord'].' as isrecord'
                )
                ->where($course['table'].'.'.$course['field']['hash_id'], $hash_id)
                ->first();
        if ($res) {
            return [
                'id' => $res->id,
                'hash_id' => $res->hash_id,
                'title' => $res->title,
                'type' => $res->type,
                'teacher_id' => $res->teacher_id,
                'status' => $res->status,
                'expectstart' => $res->expectstart,
                'expectend' => $res->expectend,
                'starttime' => $res->starttime,
                'endtime' => $res->endtime,
                'invite_type' => $res->invite_type,
                'top_usersid' => $res->top_usersid,
                'team_id' => $res->team_id,
                'code_url' => $res->code_url,
                'up_top' => $res->up_top,
                'down_top' => $res->down_top,
                'isrecord' => $res->isrecord
            ];
        } else {
            return null;
        }
    }
    
    public function errors($input)
    {
        $now = date('Y-m-d H:i:s');
        $errors = config('livetool.course_errors');
        $res = DB::table($errors['table'])->insert([
            $errors['field']['course_id'] => $input['course_id'],
            $errors['field']['room_id'] => $input['room_id'],
            $errors['field']['users_id'] => $input['users_id'],
            $errors['field']['platform'] => $input['platform'],
            $errors['field']['type'] => $input['type'],
            $errors['field']['contents'] => $input['contents'],
            $errors['field']['created_at'] => $now,
            $errors['field']['updated_at'] => $now
        ]);
    }
    
    public function starttime($room_id)
    {
        $room = Room::find($room_id);
        if (!$room) {
            return '';
        }
        $course = config('livetool.course');
        $res = DB::table($course['table'])
                ->select(
                    $course['field']['starttime'].' as starttime'
                )
                ->where($course['field']['id'], $room->course_id)
                ->first();
        return $res ? $res->starttime : '';
    }
    
    public function share($course_id)
    {
        $share = config('livetool.share');
        $res = DB::table($share['table'])
                ->select(
                    $share['field']['id'].' as id',
                    $share['field']['title'].' as title',
                    $share['field']['invite_type'].' as invite_type',
                    $share['field']['content'].' as content'
                )
                ->where($share['field']['id'], $course_id)
                ->first();
        return [
            'id' => $res->id,
            'title' => $res->title,
            'invite_type' => $res->invite_type,
            'content' => $res->content
        ];
    }
    
    public function iswhite($course_id, $users_id)
    {
        $white = config('livetool.white');
        $res = DB::table($white['table'])
                ->where($white['field']['course_id'], $course_id)
                ->where($white['field']['users_id'], $users_id)
                ->first();
        return $res ? 1 : 0;
    }
    // 后台快捷登录用户 进入直播间 添加白名单记录
    public function addwhite($course, $users_id, $isteacher)
    {
        $white = $course['invite_type'] == 1 ? config('livetool.course_word_white') : config('livetool.course_white_list');
        $type = $isteacher ? 2 : 3;
        $now = date('Y-m-d H:i:s');
        $res = DB::table($white['table'])->insert([
            $white['field']['course_id'] => $course['id'],
            $white['field']['users_id'] => $users_id,
            $white['field']['type'] => $type,
            $white['field']['created_at'] => $now,
            $white['field']['updated_at'] => $now
        ]);
    }    
    public function balance($team_id)
    {
        $team = config('livetool.team');
        $res = DB::table($team['table'])
                ->where($team['field']['id'], $team_id)
                ->select($team['field']['amount_money'].' as amount_money')
                ->first();
        return $res && $res->amount_money >= 0 ? 1 : 0;
    }

     public function isDisplay($team_id, $users_id){
        $user_from = config('livetool.users_from');
        $from = DB::table($user_from['table'])
            ->where([
                $user_from['field']['team_id']   =>  $team_id,
                $user_from['field']['users_id']  =>  $users_id
            ])->first();
        if($from){

            return  $from->display;

        }else{
            
            return  0;
        }
    }
}

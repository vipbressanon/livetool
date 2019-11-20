<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Log;

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
                    $course['field']['id'].' as id',
                    $course['field']['hash_id'].' as hash_id',
                    $course['field']['title'].' as title',
                    $course['field']['teacher_id'].' as teacher_id',
                    $course['field']['status'].' as status',
                    $course['field']['expectstart'].' as expectstart',
                    $course['field']['starttime'].' as starttime',
                    $course['field']['endtime'].' as endtime',
                    $course['field']['invite_type'].' as invite_type',
                    $course['field']['top_usersid'].' as top_usersid',
                )
                ->where($course['field']['hash_id'], $hash_id)
                ->first();
        return [
            'id' => $res->id,
            'hash_id' => $res->hash_id,
            'title' => $res->title,
            'teacher_id' => $res->teacher_id,
            'status' => $res->status,
            'expectstart' => $res->expectstart,
            'starttime' => $res->starttime,
            'endtime' => $res->endtime,
            'invite_type' => $res->invite_type,
            'top_usersid' => $res->top_usersid
        ];
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
    
    public function starttime($course_id)
    {
        $course = config('livetool.course');
        $res = DB::table($course['table'])
                ->where($course['field']['id'], $course_id)
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
    
    public function word($course_id, $users_id, $isteacher, $word)
    {
        $type = $isteacher ? 2 : 3;
        $cw = config('livetool.course_word');
        $res = DB::table($cw['table'])
                ->where($cw['field']['course_id'], $course_id)
                ->where($cw['field']['word'], $word)
                ->where($cw['field']['type'], $type)
                ->first();
        if ($res) {
            $now = date('Y-m-d H:i:s');
            $cww = config('livetool.course_word_white');
            $res = DB::table($cww['table'])->insert([
                $cww['field']['course_id'] => $course_id,
                $cww['field']['users_id'] => $users_id,
                $cww['field']['created_at'] => $now,
                $cww['field']['updated_at'] => $now
            ]);
            return true;
        } else {
            return false;
        }     
        return $res ? 1 : 0;
    }
}

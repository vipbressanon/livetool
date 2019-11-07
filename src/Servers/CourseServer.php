<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;

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
                    $course['field']['endtime'].' as endtime'
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
            'endtime' => $res->endtime
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
    
    public function filelist($course_id)
    {
        $course = config('livetool.course_file');
        $res = DB::table($course['table'])
                ->select(
                    $course['field']['id'].' as id',
                    $course['field']['course_id'].' as course_id',
                    $course['field']['filename'].' as filename',
                    $course['field']['domain'].' as domain',
                    $course['field']['fileurl'].' as fileurl',
                    $course['field']['filesize'].' as filesize',
                    $course['field']['filesuffix'].' as filesuffix',
                    $course['field']['status'].' as status'
                )
                ->where($course['field']['course_id'], $course_id)
                ->get();
        return $res;
    }
    
    public function filestatus($file_id, $status)
    {
        $course = config('livetool.course_file');
        $res = DB::table($course['table'])
                ->where($course['field']['id'], $file_id)
                ->update([$course['field']['status'] => $status]);
        return true;
    }
}

<?php
/**
 * Created by PhpStorm.
 * Description: 白名单
 * User: chenxl
 * Date: 2021/3/13
 * Time: 10:49
 */

namespace Vipbressanon\LiveTool\Models;

use Illuminate\Database\Eloquent\Model;

class CourseWhiteList extends Model
{

    const TEACHER = 2;
    const STUDENT = 3;

    protected $table = 'course_white_list';

    public function users()
    {
        return $this->belongsTo('Vipbressanon\LiveTool\Models\User', 'users_id', 'id');
    }

}

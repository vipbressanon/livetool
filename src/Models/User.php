<?php
/**
 * Created by PhpStorm.
 * Description: 用户相关
 * User: chenxl
 * Date: 2021/3/13
 * Time: 10:49
 */

namespace Vipbressanon\LiveTool\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    public function whitelist()
    {
        return $this->hasMany('Vipbressanon\LiveTool\Models\CourseWhiteList', 'users_id', 'id');
    }
}

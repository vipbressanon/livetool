<?php namespace Vipbressanon\LiveTool\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{

    public $timestamps = true;

    protected $table = 'room';

    public function course()
    {
        return $this->hasOne('Vipbressanon\LiveTool\Models\Course', 'course_id', 'id');
    }

}

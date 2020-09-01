<?php namespace Vipbressanon\LiveTool\Models;

use Illuminate\Database\Eloquent\Model;
class Device extends Model
{
    public $timestamps = true;
    protected $table = 'devices';
    protected $fillable = ['user_id', 'message', 'status', 'audio_input', 'audio_output', 'video'];
}

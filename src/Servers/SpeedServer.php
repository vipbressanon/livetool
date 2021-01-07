<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Speedtest;
use Log;

class SpeedServer
{

    public function __construct()
    {
    }

    public function save($input)
    {
        if ($input['room_id'] != 0 && $input['hash_id'] != '' && $input['speeddata']) {
            $res = new Speedtest();
            $res->room_id = $input['room_id'];
            $res->hash_id = $input['hash_id'];
            $res->download = $input['speeddata']['dlStatus'];
            $res->upload = $input['speeddata']['ulStatus'];
            $res->ping = $input['speeddata']['pingStatus'];
            $res->jitter = $input['speeddata']['jitterStatus'];
            $res->save();
        }
    }

    public function detail($room_id, $hash_id)
    {
        $res = Speedtest::where('room_id', $room_id)
                ->where('hash_id', $hash_id)
                ->select('download', 'upload', 'ping', 'jitter')
                ->orderBy('created_at', 'desc')
                ->first();
        return $res;
    }
}

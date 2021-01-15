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
        if ($res) {
            if ($res->download < 1) {
                $res->downloadcolor = 'red';
                $res->downloadstr = '较差';
            } else if ($res->download >= 1 && $res->download < 2) {
                $res->downloadcolor = 'blue';
                $res->downloadstr = '中等';
            } else if ($res->download >= 2) {
                $res->downloadcolor = 'green';
                $res->downloadstr = '良好';
            }

            if ($res->upload < 1) {
                $res->uploadcolor = 'red';
                $res->uploadstr = '较差';
            } else if ($res->upload >= 1 && $res->upload < 2) {
                $res->uploadcolor = 'blue';
                $res->uploadstr = '中等';
            } else if ($res->upload >= 2) {
                $res->uploadcolor = 'green';
                $res->uploadstr = '良好';
            }

            if ($res->ping < 100) {
                $res->pingcolor = 'green';
                $res->pingstr = '良好';
            } else if ($res->ping >= 100 && $res->ping < 500) {
                $res->pingcolor = 'blue';
                $res->pingstr = '中等';
            } else if ($res->ping >= 500) {
                $res->pingcolor = 'red';
                $res->pingstr = '较差';
            }

            if ($res->jitter < 10) {
                $res->jittercolor = 'green';
                $res->jitterstr = '良好';
            } else if ($res->jitter >= 10 && $res->jitter < 20) {
                $res->jittercolor = 'blue';
                $res->jitterstr = '中等';
            } else if ($res->jitter >= 20) {
                $res->jittercolor = 'red';
                $res->jitterstr = '较差';
            }
        }
        return $res;
    }
}

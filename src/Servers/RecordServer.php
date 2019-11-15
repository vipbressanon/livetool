<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Room;
use Vipbressanon\LiveTool\Models\RoomSig;
use Vipbressanon\LiveTool\Servers\ApiServer;

class RecordServer
{

    public function __construct()
    {
    }
    
    public function hander($room_id, $status)
    {
        $room = Room::find($room_id);
        $oldstatus = $room->roomrecord;
        $room->roomrecord = $status;
        $room->save();
        if ($oldstatus ==0 && $room->roomrecord == 1) {
            $api = new ApiServer();
            $api->recordstart($room_id);
        } elseif ($oldstatus ==1 && $room->roomrecord == 2) {
            $api = new ApiServer();
            $api->recordpause($room_id);
        } elseif ($oldstatus ==2 && $room->roomrecord == 1) {
            $api = new ApiServer();
            $api->recordresume($room_id);
        }
    }
}

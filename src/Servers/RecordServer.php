<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Room;
use Vipbressanon\LiveTool\Models\RoomSig;
use Vipbressanon\LiveTool\Servers\ApiServer;
use Log;

class RecordServer
{

    public function __construct()
    {
    }
    
    public function hander($room_id, $status)
    {
        $room = Room::find($room_id);
        $oldstatus = $room->roomrecord;
        if (($oldstatus == 0 || $oldstatus == 3) && $room->roomrecord == 1) {
            $api = new ApiServer();
            $re = $api->recordstart($room_id);
        } else{
            $api = new ApiServer();
            $re = $api->recordend($room_id);
        }
        Log::info("RecordServer hander re",['re'=>$re]);
        if($re->meta->code == 200){
            
            $room->roomrecord = $status;
            $room->save();
        }
        return $re;
        // elseif ($oldstatus == 1 && $room->roomrecord == 2) {
        //     $api = new ApiServer();
        //     $api->recordpause($room_id);
        // } elseif ($oldstatus == 2 && $room->roomrecord == 1) {
        //     $api = new ApiServer();
        //     $api->recordresume($room_id);
        // } elseif ($oldstatus > 0 && $room->roomrecord == 3) {
        //     $api = new ApiServer();
        //     $api->recordend($room_id);
        // }
    }


    // 录制结算
    public function balance($input)
    {
        Log::info("录制回调");
        $room_id = $input["room_id"]?:"";
        $filesize = $input["video_size"]?:"";
        $finish_reason = $input['finish_reason']?:"";
        $now = date('Y-m-d H:i:s');
        $status = 2; // 状态失败 （升级以后点击上传改变状态扣费）
        if ($room_id) {
            $room = Room::find($room_id);
            $course_id = $room->course_id;
            Log::info("course_id".$course_id);
            // 获取团队账户余额
            $account = $this->getmoney($course_id);
            // 单位M         b   kb   mb
            $str_m = $filesize/1024/1024;
            $filesize_m = sprintf("%.2f", ceil($str_m*100)/100);
            // 保存文件
            $record = $this->insertData($account, $room_id, $course_id, $input, $filesize, $filesize_m, $finish_reason, $now);
            // 结算
            if (($account->amount_space_z - $account->amount_space) >= $filesize_m) {
                $status = 1; // 状态成功
                // 扣费
                $amount_space = $account->amount_space + $filesize_m;
                $this->team($account, $amount_space, $now);
                $this->orders($account, $filesize_m, $now);
                $this->ordersspacelog($account, $amount_space, $filesize_m, $record->id, $now);
            } 
            // 更新状态
            $this->changeStatus ($room_id, $status, $record->id, $finish_reason, $now);
        }
        Log::info("录制回调--完成");
        return true;
    }

    // 存数据
    private function insertData($account, $room_id, $course_id, $input, $filesize, $filesize_m, $finish_reason, $now) {
        $fileurl = $input["fileurl"]?:"";

        $file_duration = $input["video_duration"]?:"";
        $starttime = $input["starttime"]?:"";
        $endtime = $input["endtime"]?:"";
        $file_type = $input['video_type']?:"";
        $fileid = $input['fileid']?:"";
        
        // 处理时长
        $file_duration_str =  $this->dataformat($file_duration);
        $course_record = config('livetool.course_record');
        DB::table($course_record['table'])->insert([
                $course_record['field']['room_id'] => $room_id,
                $course_record['field']['team_id'] => $account->team_id,
                $course_record['field']['course_id'] => $course_id,
                $course_record['field']['fileurl'] => $fileurl,
                $course_record['field']['fileid'] => $fileid,
                $course_record['field']['filesize'] => $filesize?:"",
                $course_record['field']['filesize_m'] => $filesize_m,

                $course_record['field']['file_duration'] => $file_duration,
                $course_record['field']['file_duration_str'] => $file_duration_str,
                $course_record['field']['starttime'] => $starttime,
                $course_record['field']['endtime'] => $endtime,
                $course_record['field']['finish_reason'] => $finish_reason,
                $course_record['field']['file_type'] => $file_type,

                $course_record['field']['created_at'] => $now,
                $course_record['field']['updated_at'] => $now
            ]);

        $record = DB::table($course_record['table'])
            ->where($course_record['table'].'.'.$course_record['field']['team_id'], $account->team_id)
            ->where($course_record['table'].'.'.$course_record['field']['course_id'], $course_id)
            ->where($course_record['table'].'.'.$course_record['field']['fileurl'], $fileurl)
            ->first();
        return $record;
    }

    /*
    * 更新状态
    */
    private function changeStatus ($room_id, $status, $record_id, $finish_reason, $now) {
        $course_record = config('livetool.course_record');
        DB::update(
            "update ".$course_record['table']." set ".$course_record['field']['status'].
            "=".$status.",".$course_record['field']['updated_at'].
            "='".$now."' where ".$course_record['field']['id'].
            "=".$record_id
        );
        if ($finish_reason == "auto") { //更改房间录制的状态
            $room = Room::find($room_id);
            $room->roomrecord = 3;
            $room->save();
        }
    }

    // 获取团队余额
    private function getmoney($course_id)
    {
        $course = config('livetool.course');
        $team = config('livetool.team');
        $tres = DB::table($course['table'])
                ->leftJoin(
                    $team['table'],
                    $course['table'].'.'.$course['field']['team_id'],
                    '=',
                    $team['table'].'.'.$team['field']['id']
                )
                ->select(
                    $course['table'].'.'.$course['field']['id'].' as course_id',
                    $course['table'].'.'.$course['field']['top_usersid'].' as top_usersid',
                    $course['table'].'.'.$course['field']['team_id'].' as team_id',
                    $team['table'].'.'.$team['field']['amount_money'].' as amount_money',
                    $team['table'].'.'.$team['field']['amount_time'].' as amount_time',
                    $team['table'].'.'.$team['field']['amount_play'].' as amount_play',
                    $team['table'].'.'.$team['field']['amount_space'].' as amount_space',
                    $team['table'].'.'.$team['field']['amount_space_z'].' as amount_space_z'
                )
                ->where($course['table'].'.'.$course['field']['id'], $course_id)
                ->first();
        return $tres;
    }

    // 结算
    private function team($account, $amount_space, $now)
    {
        $team = config('livetool.team');
        $tres = DB::table($team['table'])
                ->where('id', $account->team_id)
                ->update([
                    $team['field']['amount_space'] => $amount_space,
                    $team['field']['updated_at'] => $now
                ]);
    }
    
    private function orders($account, $filesize_m, $now)
    {
        $orders = config('livetool.orders');
        $res = DB::table($orders['table'])
                ->where($orders['table'].'.'.$orders['field']['team_id'], $account->team_id)
                ->where($orders['table'].'.'.$orders['field']['course_id'], $account->course_id)
                ->first();
        
        if ($res) {
            DB::update(
                "update ".$orders['table']." set ".$orders['field']['consume_space'].
                "=".$orders['field']['consume_space']."+".$filesize_m.
                " where ".$orders['field']['team_id'].
                "=".$account->team_id." and ".$orders['field']['course_id']."=".$account->course_id
            );
        } else {
            DB::table($orders['table'])->insert([
                $orders['field']['team_id'] => $account->team_id,
                $orders['field']['top_usersid'] => $account->top_usersid,
                $orders['field']['course_id'] => $account->course_id, 
                $orders['field']['consume_money'] => 0,
                $orders['field']['consume_time'] => 0,
                $orders['field']['consume_play'] => 0,
                $orders['field']['consume_space'] => $filesize_m,
                $orders['field']['created_at'] => $now,
                $orders['field']['updated_at'] => $now
            ]);
        }
    }


    private function ordersspacelog($account, $amount_space, $filesize_m, $record_id, $now)
    {
        $orders_space_log = config('livetool.orders_space_log');
        DB::table($orders_space_log['table'])->insert([
            $orders_space_log['field']['team_id'] => $account->team_id,
            $orders_space_log['field']['course_id'] => $account->course_id,
            $orders_space_log['field']['course_record_id'] => $record_id,
            $orders_space_log['field']['type'] => 1,
            $orders_space_log['field']['consume_z'] => $filesize_m,
            $orders_space_log['field']['amount_money'] => $account->amount_money,
            $orders_space_log['field']['amount_time'] => $account->amount_time,
            $orders_space_log['field']['amount_play'] => $account->amount_play,
            $orders_space_log['field']['amount_space'] => $amount_space,
            $orders_space_log['field']['created_at'] => $now,
            $orders_space_log['field']['updated_at'] => $now
        ]);
    }



    /**
     * 毫秒转化为天小时分钟秒
     *
     * @param ms 毫秒值
     * @return
     */
    private function dataformat($num) {
        $hour = floor($num/3600/1000);
        $minute = ceil(($num-3600*1000*$hour)/(60*1000));
        return $hour.':'.$minute;
    }
}

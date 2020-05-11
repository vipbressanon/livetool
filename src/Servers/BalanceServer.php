<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;
use Vipbressanon\LiveTool\Models\Room;
use App\Common\Helper;

class BalanceServer
{

    public function __construct()
    {
    }
    /**
     * 计算上课费用（老师上课时长*（（学生人数）*（课单价+白板单价）+白板单价））
     * @DateTime 2020-05-11T10:55:16+0800
     * @param    [type]                   $room_id [description]
     * @return   [type]                            [description]
     */
    public function handle($room_id)
    {
        $room = Room::find($room_id);
        if (!$room) {
            return;
        }

        // 统计耗时
        $consume = $this->consume($room->course_id);
        
        $user = $this->getStrudentNum($room->course_id);
        if ($user['teacher_online_time'] == 0 || $user['num'] <=1) {
            return;
        }
        //计算费用
        $Helper = new Helper();
        $money_total = $Helper->getTotleMoney($user['num']-1,0,$user['teacher_online_time']);
        // 获取团队账户余额
        $account = $this->getmoney($room->course_id);        
        // 消耗的分钟数
        $mins = $user['teacher_online_time'];
        //计算白板费用0507
        // 扣除团队消耗
        $money = $this->setmoney($account, $consume->now, $money_total,$mins);

        $this->orders($account, $money, $consume->now);
        
        $this->orderslog($account, $money, $consume->now);
        // 保存结算时间
        $this->balance($room->course_id, $consume->now);
        
        if ($money['over']) {
            $domainurl = config('livetool.domainurl');
            $this->sendRequest($domainurl.':2121?type=feeover&to='.$room_id);
        } elseif ($money['owe']) {
            $domainurl = config('livetool.domainurl');
            $this->sendRequest($domainurl.':2121?type=feeowe&to='.$room_id);
        }
    }
    
    // 当前时间课程内成员耗时情况
    private function consume($course_id)
    {
        $course_users_log = config('livetool.course_users_log');
        $lres = DB::table($course_users_log['table'])
                ->select(
                    DB::raw(
                        'ifnull(sum(TIMESTAMPDIFF(SECOND, if('.$course_users_log['field']['balancetime'].
                        ' is null, '.$course_users_log['field']['starttime'].', '.$course_users_log['field']['balancetime'].
                        '), if(status=0, now(), '.$course_users_log['field']['endtime'].'))), 0) as total'
                    ),
                    DB::raw('now() as now')
                )
                ->where($course_users_log['field']['course_id'], $course_id)
                ->first();        
        return $lres;
    }
    
    private function getStrudentNum($course_id){
        DB::connection()->enableQueryLog(); 
        $course_users_log = config('livetool.course_users_log');
        $course = DB::table(config('livetool.course')['table'])
                ->find($course_id);
        //老师开课前已进入教室，学生开课后才能进入教室,结算时可能还有人为退出房间
        $teacher = DB::table($course_users_log['table'])
                ->where($course_users_log['field']['course_id'], $course_id)
                ->where($course_users_log['field']['users_id'], $course->teacher_id)
                ->sum('total');
        $teacher_online_time = number_format($teacher/60,2);

        
        $sres = DB::table($course_users_log['table'])
            ->select(DB::raw('sum(total) as total'),'users_id')
            ->where($course_users_log['field']['course_id'], $course_id)
            ->groupBy('users_id')
            ->get()
            ->toArray();
        $num = 0;
        foreach ($sres as $key => &$value) {
            if($value->total/60 < 10) unset($sres[$key]);
            $num++;
        }
        // $sres['teacher_online_time'] = $teacher_online_time;
        return ['re' => $sres,'teacher_online_time' =>  $teacher_online_time ,'num' =>$num];
    }
    // 保存结算时间
    private function balance($course_id, $now)
    {
        $course_users_log = config('livetool.course_users_log');
        DB::table($course_users_log['table'])
            ->where($course_users_log['field']['course_id'], $course_id)
            ->where($course_users_log['field']['status'], 0)
            ->update([
                $course_users_log['field']['balancetime'] => $now,
                $course_users_log['field']['updated_at'] => $now
            ]);
        DB::update(
            "update ".$course_users_log['table']." set ".$course_users_log['field']['balancetime'].
            "=".$course_users_log['field']['endtime'].",".$course_users_log['field']['updated_at'].
            "='".$now."' where ".$course_users_log['field']['course_id'].
            "=".$course_id." and ".$course_users_log['field']['status']."=1"
        );
    }
    
    // 获取团队余额
    private function getmoney($course_id)
    {
        $course = config('livetool.course');
        $team = config('livetool.team');
        $cash = config('livetool.cash_desc');
        $tres = DB::table($course['table'])
                ->leftJoin(
                    $team['table'],
                    $course['table'].'.'.$course['field']['team_id'],
                    '=',
                    $team['table'].'.'.$team['field']['id']
                )
                ->leftJoin(
                    $cash['table'],
                    $team['table'].'.'.$team['field']['cash_id'],
                    '=',
                    $cash['table'].'.'.$cash['field']['id']
                )
                ->select(
                    $course['table'].'.'.$course['field']['id'].' as course_id',
                    $course['table'].'.'.$course['field']['top_usersid'].' as top_usersid',
                    $course['table'].'.'.$course['field']['team_id'].' as team_id',
                    $team['table'].'.'.$team['field']['amount_money'].' as amount_money',
                    $team['table'].'.'.$team['field']['amount_time'].' as amount_time',
                    $team['table'].'.'.$team['field']['amount_play'].' as amount_play',
                    $team['table'].'.'.$team['field']['amount_space'].' as amount_space',
                    $cash['table'].'.'.$cash['field']['live'].' as live'
                )
                ->where($course['table'].'.'.$course['field']['id'], $course_id)
                ->first();
        return $tres;
    }
    
    private function setmoney($account, $now, $money,$mins)
    {
        $over = false;
        $owe = false;
        $consume_money = 0;
        $consume = 0;
        // 账户剩余分钟数大于等于消耗的分钟数
        // if ($account->amount_time >= $mins) {
        //     // 消耗情况
        //     $consume = $mins;
        //     $consume_money = 0;
        //     // 剩余情况
        //     $amount_time =  $account->amount_time - $consume;
        //     $amount_money = $account->amount_money - $account->board_money;
        // } else {    // 账户剩余分钟数不足,则按未抵扣完的分钟数乘以单价来消耗账户余额
            // 消耗情况
            $consume = $account->amount_time;
            $consume_money = ($mins - $account->amount_time) * $account->live;
            // 剩余情况
            $amount_time =  0;
            $amount_money = $account->amount_money - $money;
            // 剩余金额小于等于欠费金额阈值,则退出直播间
            if ($amount_money <= config('livetool.fee')) {
                $over = true;
            }
            // 欠费提醒
            if ($amount_money <= 0) {
                $owe = true;
            }
        // }
        $team = config('livetool.team');
        $tres = DB::table($team['table'])
                ->where('id', $account->team_id)
                ->update([
                    $team['field']['amount_money'] => $amount_money,
                    $team['field']['amount_time'] => $amount_time,
                    $team['field']['updated_at'] => $now
                ]);
        return [
            'consume_money' => number_format($money,2),
            'consume' => number_format($consume,2),
            'price' => $account->live,
            'consume_z' => number_format($mins,2),
            'amount_money' => number_format($amount_money,2),
            'amount_time' => $amount_time,
            'over' => $over,
            'owe' => $owe
        ];
    }
    
    private function orders($account, $money, $now)
    {
        $orders = config('livetool.orders');
        $res = DB::table($orders['table'])
                ->where($orders['table'].'.'.$orders['field']['team_id'], $account->team_id)
                ->where($orders['table'].'.'.$orders['field']['course_id'], $account->course_id)
                ->first();
        if ($res) {
            DB::update(
                "update ".$orders['table']." set ".$orders['field']['consume_money'].
                "=".$orders['field']['consume_money']."+".$money['consume_money'].",".
                $orders['field']['consume_time']."=".$orders['field']['consume_time']."+".$money['consume'].
                " where ".$orders['field']['team_id'].
                "=".$account->team_id." and ".$orders['field']['course_id']."=".$account->course_id
            );
        } else {
            DB::table($orders['table'])->insert([
                $orders['field']['team_id'] => $account->team_id,
                $orders['field']['top_usersid'] => $account->top_usersid,
                $orders['field']['course_id'] => $account->course_id,
                $orders['field']['consume_money'] => $money['consume_money'],
                $orders['field']['consume_time'] => $money['consume'],
                $orders['field']['consume_play'] => 0,
                $orders['field']['consume_space'] => 0,
                $orders['field']['created_at'] => $now,
                $orders['field']['updated_at'] => $now
            ]);
        }
    }
    
    private function orderslog($account, $money, $now)
    {
        $orders_log = config('livetool.orders_log');
        DB::table($orders_log['table'])->insert([
            $orders_log['field']['team_id'] => $account->team_id,
            $orders_log['field']['course_id'] => $account->course_id,
            $orders_log['field']['from'] => 1,
            $orders_log['field']['consume'] => $money['consume'],
            $orders_log['field']['consume_money'] => $money['consume_money'],
            // $orders_log['field']['board_money'] => $account->board_money,
            $orders_log['field']['price'] => $money['price'],
            $orders_log['field']['consume_z'] => $money['consume_z'],
            $orders_log['field']['amount_money'] => $money['amount_money'],
            $orders_log['field']['amount_time'] => $money['amount_time'],
            $orders_log['field']['amount_play'] => $account->amount_play,
            $orders_log['field']['amount_space'] => $account->amount_space,
            $orders_log['field']['created_at'] => $now,
            $orders_log['field']['updated_at'] => $now
        ]);
    }
    
    public function sendRequest($url, $option = array(), $header = array(), $type = 'POST') {
        $curl = curl_init (); // 启动一个CURL会话
        curl_setopt ( $curl, CURLOPT_URL, $url ); // 要访问的地址
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYPEER, FALSE ); // 对认证证书来源的检查
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYHOST, FALSE ); // 从证书中检查SSL加密算法是否存在
        curl_setopt ( $curl, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)' ); // 模拟用户使用的浏览器
        if(!empty($option)){
            $options = json_encode ( $option );
            curl_setopt ( $curl, CURLOPT_POSTFIELDS, $options ); // Post提交的数据包
        }
        if(empty($header)){
            $header = array('Content-Type: application/json');
        }
        curl_setopt ( $curl, CURLOPT_TIMEOUT, 30 ); // 设置超时限制防止死循环
        curl_setopt ( $curl, CURLOPT_HTTPHEADER, $header ); // 设置HTTP头
        curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, 1 ); // 获取的信息以文件流的形式返回
        curl_setopt ( $curl, CURLOPT_CUSTOMREQUEST, $type );
        $result = curl_exec ( $curl ); // 执行操作
        $result = json_decode($result);
        curl_close ( $curl ); // 关闭CURL会话
        return $result;
    }
}

<?php
namespace Vipbressanon\LiveTool\Servers;

use DB;

class BalanceServer
{

    public function __construct()
    {
    }

    public function handle($course_id)
    {
        $over = false;
        // 统计耗时
        $consume = $this->consume($course_id);
        // 保存结算时间
        $this->balance($course_id, $consume->now);
        // 获取团队账户余额
        $account = $this->getmoney($course_id);
        // 消耗的分钟数
        $mins = ceil($consume->total/60);
        // 扣除团队消耗
        $money = $this->setmoney($account, $consume->now, $mins);
        
        $this->orders($account, $money, $consume->now);
        
        $this->orderslog($account, $money, $consume->now);
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
    
    private function setmoney($account, $now, $mins)
    {
        $over = false;
        $consume_money = 0;
        $consume = 0;
        // 账户剩余分钟数大于等于消耗的分钟数
        if ($account->amount_time >= $mins) {
            // 消耗情况
            $consume = $mins;
            $consume_money = 0;
            // 剩余情况
            $amount_time =  $account->amount_time - $consume;
            $amount_money = $account->amount_money;
        } else {    // 账户剩余分钟数不足,则按未抵扣完的分钟数乘以单价来消耗账户余额
            // 消耗情况
            $consume = $account->amount_time;
            $consume_money = ($mins - $account->amount_time) * $account->live;
            // 剩余情况
            $amount_time =  0;
            $amount_money = $account->amount_money - $consume_money;
            // 剩余金额小于等于欠费金额阈值,则退出直播间
            if ($amount_money <= config('livetool.fee')) {
                $over = true;
            }
        }
        $team = config('livetool.team');
        $tres = DB::table($team['table'])
                ->where('id', $account->team_id)
                ->update([
                    $team['field']['amount_money'] => $amount_money,
                    $team['field']['amount_time'] => $amount_time,
                    $team['field']['updated_at'] => $now
                ]);
        return [
            'consume_money' => $consume_money,
            'consume' => $consume,
            'price' => $account->live,
            'consume_z' => $mins,
            'amount_money' => $amount_money,
            'amount_time' => $amount_time,
            'over' => $over
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
}

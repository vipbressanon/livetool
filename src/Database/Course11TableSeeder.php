<?php
namespace Vipbressanon\LiveTool\Database;

use Illuminate\Database\Seeder;

class Course11TableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        \DB::table('course11')->delete();
        
        \DB::table('course11')->insert(array (
            0 => 
            array (
                'id' => 1,
                'hash_id' => '111',
                'users_id' => 111,
                'top_usersid' => 22,
                'teacher_id' => 33,
                'title' => '44',
                'cate_id' => 55,
                'contents' => '66',
                'invite_type' => 127,
                'created_at' => '2019-09-25 09:53:19',
                'updated_at' => '2019-09-25 09:53:23',
            ),
        ));
        
        
    }
}
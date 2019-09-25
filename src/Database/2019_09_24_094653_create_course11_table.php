<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateCourse11Table extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('course11', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('hash_id', 10)->nullable()->comment('hash值');
			$table->integer('users_id')->nullable()->comment('创建者id');
			$table->integer('top_usersid')->nullable()->comment('顶级用户id');
			$table->integer('teacher_id')->nullable()->comment('教师id');
			$table->string('title', 50)->nullable()->comment('课标题');
			$table->integer('cate_id')->nullable()->comment('所属分类');
			$table->text('contents', 65535)->nullable()->comment('课程描述');
			$table->boolean('invite_type')->nullable()->default(1)->comment('邀请方式1口令(默认) 2指定人员');
			$table->timestamps();
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('course');
	}

}

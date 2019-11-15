<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateRoomTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('room', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('hash_id', 20)->nullable()->comment('虚拟房间号');
			$table->integer('course_id')->nullable();
			$table->integer('roomtype')->nullable()->default(1)->comment('1屏幕分享模式，2白板模式');
			$table->integer('roomchat')->nullable()->comment('0是禁止聊天，1是正常聊天');
			$table->integer('roomspeak')->nullable()->comment('0是未全员上台，1是全员上台');
			$table->integer('roomhand')->nullable()->comment('0是禁止举手，1是允许举手');
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
		Schema::drop('room');
	}

}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateRoomSigTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('room_sig', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('sdkappid', 20)->nullable();
			$table->integer('users_id')->nullable()->comment('用户编号');
			$table->string('hash_id', 15)->nullable();
			$table->string('usersig', 400)->nullable();
			$table->dateTime('overtime')->nullable()->comment('usersig过期时间');
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
		Schema::drop('room_sig');
	}

}

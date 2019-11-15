<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateRoomBlackTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('room_black', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->integer('room_id')->nullable();
			$table->integer('users_id')->nullable()->comment('被踢出禁止再进');
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
		Schema::drop('room_black');
	}

}

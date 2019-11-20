<?php


Route::group(["middleware" => 'web'], function () {
    Route::get("/livetool/room/{hash_id?}", "Vipbressanon\LiveTool\Controllers\LiveController@getRoom");
    Route::post("/livetool/errors", "Vipbressanon\LiveTool\Controllers\LiveController@postErrors");
    Route::post("/livetool/room/start", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomStart");
    Route::post("/livetool/room/end", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomEnd");
    Route::post("/livetool/room/type", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomType");
    Route::post("/livetool/room/chat", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomChat");
    Route::post("/livetool/room/speak", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomSpeak");
    Route::post("/livetool/room/hand", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomHand");
    Route::post("/livetool/room/kick", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomKick");
    Route::post("/livetool/room/word", "Vipbressanon\LiveTool\Controllers\LiveController@postRoomWord");
    Route::post("/livetool/operate", "Vipbressanon\LiveTool\Controllers\LiveController@postOperate");
    Route::post("/livetool/online", "Vipbressanon\LiveTool\Controllers\LiveController@postOnline");
    Route::get("/livetool/check", "Vipbressanon\LiveTool\Controllers\LiveController@getCheck");
    Route::post("/livetool/record", "Vipbressanon\LiveTool\Controllers\LiveController@postRecord");
    Route::get("/livetool/browser", "Vipbressanon\LiveTool\Controllers\LiveController@getBrowser");
});

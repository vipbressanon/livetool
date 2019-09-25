<?php

namespace Vipbressanon\LiveTool\Facades;

use Illuminate\Support\Facades\Facade;

class LiveTool extends Facade
{
    public static function getFacadeAccessor()
    {   
        //return 的字符串会在相应的provider中使用
        return 'livetool';
    }
}
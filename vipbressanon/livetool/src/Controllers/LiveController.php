<?php

namespace Vipbressanon\LiveTool\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\View;
use Request;

class LiveController extends Controller
{
    public function getIndex(Request $request)
    {
        
        return view('lcview::index');
    }
}
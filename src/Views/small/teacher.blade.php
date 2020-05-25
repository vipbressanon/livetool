<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="referrer" content="never">
        <title>讲师端-直击课堂</title>
        <link href="/vendor/livetool/layui/css/layui.css" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/css/common.css" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/css/small/live.css" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/font/iconfont.css" rel="stylesheet">
        <link href="https://lib.baomitu.com/jquery-toast-plugin/1.3.2/jquery.toast.css" rel="stylesheet">
        <style type="text/css">
            .layui-slider {margin-right:0!important;}
            .layui-field-title{margin: 10px 0;}
            .layui-slider-wrap{
                top: -14px!important;
            }
            .layui-slider-wrap-btn{
                border: 3px solid #A1A6AA!important;
                width: 14px;
                height: 14px;
                background: #575858!important;
            }
            .layui-slider{
                height: 8px;
                background: #C6C6C6;
            }
            .percentBox{
                color:#3C9CFE;
                font-size:12px;
            }
            .layui-field-title{
                border:none!important;
            }
        </style>
    </head>
    <body>
        <div class="fullScreen">
            <div class="mount">
                <div class="wrapper">
                    <span>{{$course['title']}}</span>
                    <span>在线学员（<b class="stucount">0</b>人）</span>
                    <!-- 只展示一种 -->
                    <span class="roomtime"></span>
                    <span class="span_red" style="display: none;">请点击右方上课按钮立即开课！</span>
                    @if(!$course['endtime'])
                    <!--下课不检测网络状态-->
                    <span class="checkNet">您当前网络状态：<b class="netStatus">--</b></span>
                    <span>当前网速：<b class="netSpeed">0K/S</b></span>
                    @endif
                    @if($course['isrecord']==1)
                    <a class='span_red span_record' data-record="1" href="javascript:;" style="display:block">
                        <img src="/vendor/livetool/images/img_record.png" alt="">
                        录制中
                    </a>
                    @endif
                    <a id="startbtn" class="startBtn @if($course['status'] != 0) hide @endif" href="javascript:;">开始上课</a>
                    <a id="endbtn" class="overBtn @if($course['status'] != 1) hide @endif" href="javascript:;">下课</a>
                </div>
                <span class='fullBtn_box'>
                    <img src="/vendor/livetool/images/img_max.png" alt="">
                    <i class='fullBtn fullBtn_a'>最大化</i>
                </span>
                <span class='fullBtn_b switchbtn'><img src="/vendor/livetool/images/img_setting.png" alt="">设置</span>
            </div>
            <!-- 添加课件进度条 -->
            <div class="layui-progress layui-progress-big coursefile_progress" lay-filter="addProgress">
                <div class="loading"><img src="/vendor/livetool/images/loading.png"></div>
               <div class="layui-progress-bar" lay-percent="0%"></div>
            </div>
            
            <div class="roommain">
                <div class="gatherBox"></div>

                <!-- 侧边栏 -->
                <div class="sideBar" @if($course['status']==2) style="display: none;" @endif>
                    <ul class="sideTab">
                        <li>
                            <div class="blackCircle">
                                <label class="sidePic sideIcon1"></label>
                                <span class="sideName">教学课件</span>
                                <div class="course">
                                    <a class="addBtn uploadbtn" href="javascript:;">+添加</a>
                                    <p class="support">支持 ppt、pdf、doc文件</p>
                                    <div class="list uploadlist">
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="blackCircle roomtype1">
                                <label class="sidePic sideIcon2"></label>
                                <span class="sideName">屏幕共享</span>
                            </div>
                        </li>
                        <li>
                            <div class="blackCircle roomtype2 active">
                                <label class="sidePic sideIcon3"></label>
                                <span class="sideName">白板教学</span>
                            </div>
                        </li>
                        <li>
                            <div class="blackCircle switchbtn">
                                <label class="sidePic sideIcon4"></label>
                                <span class="sideName">设备检测</span>
                                <i class="gantanhao">!</i>
                            </div>
                        </li>
                        <!-- <li>
                            @if($room['roomrecord']==1)
                            <div class="blackCircle recordbtn recording" data-record="1">
                                <label class="sidePic sideIcon6"></label>
                                <span class="sideName">录制中</span>
                            </div>
                            @else
                            <div class="blackCircle recordbtn" data-record="{{$room['roomrecord']}}">
                                <label class="sidePic sideIcon5"></label>
                                <span class="sideName">课程录制</span>
                            </div>
                            @endif
                        </li> -->
                    </ul>
                </div>
                
                <!-- 中间部分 -->
                <div class="middle">
                    
                    <!-- 直播视频地址 -->
                    <div id="paint_box"></div>
                    <!-- 暂未开课、已下课 -->
                    @if($role[0] == 201)
                    <div class="status">
                        <a class="tag end" href="javascript:;">{{$role[1]}}</a>
                    </div>
                    @elseif($role[0] == 202)
                    <!-- <div class="status">
                        <a id="startbtn" class="tag start" href="javascript:;">开始上课</a>
                    </div> -->
                    @elseif($role[0] == 204)
                    <div class="status">
                        <a class="tag end" href="javascript:;">{{$role[1]}}</a>
                    </div>
                    @endif
                    <!-- 课件按钮 -->
                    <div class="boardTab clearfix"></div>
                    <div id="edu-toolbar-fieldset" style="width: 225px;position: absolute;left: 30px;top: 10px;z-index: 1;">
                        <fieldset class="layui-elem-field layui-field-title" id="slideTest1" title="拖动放大白板"></fieldset>
                        <div class="percentBox"><span id="percentShow">0</span>%</div>
                    </div>
                    <div id="edu-toolbar-box" class="edu-toolbar-box">
                        <ul class="edu-toolbar-menu">
                            <li class="tool-bgcolor" title="色板">
                                <div class="choose-state showoption"><span class="bg-red"></span></div>
                                <div class="choose-drop-down">
                                    <ul>
                                        <li data-type="#006eff"><span class="bg-blue"></span></li>
                                        <li data-type="#0c0"><span class="bg-green"></span></li>
                                        <li data-type="#ff9903"><span class="bg-yellow"></span></li>
                                        <li data-type="#ff0100"><span class="bg-red"></span></li>
                                        <li data-type="#000"><span class="bg-black"></span></li>
                                        <li data-type="#ccc"><span class="bg-gray"></span></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="paint-brush" title="画笔">
                                <div class="choose-state showoption"><i class="roomicon ri-tools2"></i></div>
                                <div class="choose-drop-down">
                                    <ul>
                                        <li data-type="50"><span class="paint-brush-size-4"></span></li>
                                        <li data-type="100"><span class="paint-brush-size-8"></span></li>
                                        <li data-type="150"><span class="paint-brush-size-12"></span></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="straight-line" title="直线">
                                <div class="choose-state draw_line"><i class="roomicon ri-tools3"></i></div>
                                <div class="choose-drop-down draw_line_type">
                                    <ul>
                                        <li data-type="1"  title="直线"><span class="draw_line_solid"></span></li>
                                        <li data-type="2"  title="虚线"><span class="draw_line_dotted"></span></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="graphical" title="图形">
                                <div class="choose-state showoption"><i class="roomicon ri-tools1"></i></div>
                                <div class="choose-drop-down">
                                    <ul class="graphicalul">
                                        <li><span class="graphical-square-empty"></span></li>
                                        <li><span class="graphical-square-entity"></span></li>
                                        <li><span class="graphical-ellipse-empty"></span></li>
                                        <li><span class="graphical-ellipse-entity"></span></li>
                                    </ul>
                                    <p class="graphical-title">描边厚度</p>
                                    <ul class="graphical-size">
                                        <li data-type="50"><span class="paint-brush-size-4"></span></li>
                                        <li data-type="100"><span class="paint-brush-size-8"></span></li>
                                        <li data-type="150"><span class="paint-brush-size-12"></span></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="tool-path eraser" title="橡皮擦">
                                <div class="choose-state2"><i class="roomicon ri-tools4"></i></div>
                            </li>
                            <li class="tool-path recselect" title="框选">
                                <div class="choose-state2"><i class="roomicon ri-tools5"></i></div>
                            </li>
                            <li class="tool-path pointselect" title="点选">
                                <div class="choose-state"><i class="roomicon ri-tools6"></i></div>
                            </li>
                            <li class="tool-path cleardraw" title="清空涂鸦">
                                <div class="choose-state2"><i class="roomicon ri-tools7"></i></div>
                            </li>
                            <li class="tool-path boardtext" title="文字输入">
                                <div class="choose-state2"><i class="roomicon ri-tools8"></i></div>
                            </li>
                            <!-- <li class="tool-path">
                                <div class="choose-state" v-on:click="paint.setBackgroundColor(paint.formatColor(paint.color))"><i class="roomicon ri-tools1" style="background-image: url(./css/img/fill.png);background-position: 0;background-size: 28px 24px;" title="设置背景色"></i></div>
                            </li>
                            <li class="tool-path">
                                <div class="choose-state" v-on:click="paint.setGlobalBackgroundColor(paint.formatColor(paint.color))"><i class="roomicon ri-tools1" style="background-image: url(./css/img/fill.png);background-position: 0;background-size: 28px 24px;" title="设置全局背景色"></i></div>
                            </li> -->
                            <li class="tool-path revert" title="撤销">
                                <div class="choose-state2"><i class="roomicon ri-tools9"></i></div>
                            </li>
                            <li class="tool-path process" title="前进">
                                <div class="choose-state2"><i class="roomicon ri-tools10"></i></div>
                            </li>
                            <li class="tool-path remove_baiban" title="移动">
                                <div class="choose-state2"><i class="roomicon ri-tools11"></i></div>
                            </li>
                        </ul>
                        <input id="fileSelector" data-id="" class="hide" type="file" accept="image/*,application/pdf, application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                    </div>
                    <!-- 课件翻页 -->
                    <div class="operate align_item">
                        <div class="up_down">
                            <div id="page">
                                <div class="layui-box layui-laypage layui-laypage-default">
                                    <a href="javascript:;" class="layui-laypage-prev prevBoard">上</a>
                                    <a href="javascript:;" class="layui-laypage-next nextBoard">下</a>
                                </div>
                            </div>
                            <span class="allPage">0 / 0</span>
                        </div>
                        <span class="add addBoard">添加</span>
                        <span class="del deleteBoard">删除</span>
                    </div>
                </div>

                <div class='recordBtnBox'>
                    <div class="div_1">
                        <span class="banbtn" title="提示">提示</span>
                        <span class="iconfont icon-close closebtn closebtn1" title="关闭"></span>
                    </div>
                    <div class='div_2'>
                        当前录制课程画面质量为：高清（1280*720），<br/>
                        为了保证录课质量，请检查一下注意事项：<br/>
                        1、CPU要求：Intel i5及以上；<br/>
                        2、占用空间：录课文件每分钟增加2MB。
                    </div>
                    <div class='div_3'>
                        <span class='a_start' href="">开始录课</span>
                        <span class='a_stop closebtn closebtn1' href="">否</span>
                    </div>
                </div>
            </div>
            <!-- 全屏显示 -->
            <div class="fullBtn">全屏<br>显示</div>
            <!-- 讨论区 start -->
            <div class="discussBtn align_item">
                <span class="iconfont icon-liaotian"></span>
                <i class="redDot" style="display:none;"></i>
            </div>
            <div class="dialog">
                <div class="title between">
                    <ul class="Tab row">
                        <li class="active">讨论</li>
                    </ul>
                    <div class="btns row">
                        <span class="iconfont icon-close closebtn" title="关闭"></span>
                    </div>
                </div>
                <ul class="discussList">
                </ul>
                <div class="relayBox clearfix">
                    <textarea id="chattext" placeholder="请输入"></textarea>
                    <button id="chatbtn" class="fr row send">发送</button>
                    <input type="hidden" id="tousers" value="" />
                </div>
            </div>
            <!-- 讨论区 end -->
            <!-- 在线人数  start-->
            <div class="onlinePeopleBtn align_item">
                <img src="/vendor/livetool/images/huamingce.png" alt="">
            </div>
            <div class="dialog_online_people">
                <div class="title">
                    <span>花名册</span>
                    <span class="iconfont icon-close closebtn" title="关闭"></span>
                </div>
                <div class="tabdiv">
                    <div class="chatroom-list" id="student-list">
                        <p>老师：{{$info['nickname']}}</p>
                        <table>
                            <thead>
                            <tr>
                                <th width='130'>学生姓名（<span class="stucount2">0</span>/<span class="stucount3">{{$course['down_top']+$course['up_top']}}</span>）</th>
                                <th>上下台</th>
                                <th>授权</th>
                                <th>麦克风</th>
                                <th>摄像头</th>
                                <th>设备</th>
                                <th>奖励</th>
                                <th width='80'>举手（<span class="handcount">0</span>）</th>
                                <th style='color:#ff0000;'>移出</th>
                            </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="handUpBtn align_item">
                <i class="handimg handimg1"></i>
                <span><span class="handcount">0</span>/{{$course['down_top']+$course['up_top']}}</span>
                <div class='handUpList'></div>
            </div>

            <!-- 在线人数 end -->
        </div>
        <input type="hidden" id="status" value="{{$course['status']}}" />
        <input type="hidden" id="_token" name="_token" value="{{csrf_token()}}" />
    </body>
</html>
<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.0/jquery.min.js"></script>
<script src="/vendor/livetool/font/iconfont.js"></script>
<script src="/vendor/livetool/layui/layui.js"></script>
<!-- axios SDK -->
 <script src="https://resources-tiw.qcloudtrtc.com/thirdpart/axios/axios.min.js"></script>
<!-- WebRTC SDK -->				  
<!-- <script src="https://zjclass.xueyoubangedu.com/js/trtc.4.3.1.js"></script> -->
<!-- <script src="https://zjclass.xueyoubangedu.com/js/trtc.js"></script> -->
<script src="/vendor/livetool/js/trtc.js"></script>
<!-- WebIM SDK -->
<script src="https://resources-tiw.qcloudtrtc.com/webim/webim.min.js"></script>
<!-- COS SDK -->
<script src="https://resources-tiw.qcloudtrtc.com/thirdpart/cos/5.1.0/cos.min.js"></script>
<!-- 白板SDK -->
<script src="https://resources-tiw.qcloudtrtc.com/board/2.4.6/TEduBoard.min.js"></script>
<!-- TIC SDK -->
<script src="https://resources-tiw.qcloudtrtc.com/tic/2.4.1/TIC.min.js"></script>
<!-- socket.io -->
<script src="https://lib.baomitu.com/socket.io/2.0.3/socket.io.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@9"></script>
<script src="https://lib.baomitu.com/jquery-toast-plugin/1.3.2/jquery.toast.min.js"></script>
<script>
    this.users = JSON.parse('{!!json_encode($info)!!}');
    this.room = JSON.parse('{!!json_encode($room)!!}');
    this.course = JSON.parse('{!!json_encode($course)!!}');
    this.socketurl = '{{config("livetool.socketurl")}}';
    this.isteacher = {{$isteacher}};
    this.role = JSON.parse('{!!json_encode($role)!!}');
    this.fileurl = '{{config("livetool.fileurl")}}';
    this.fileurl_delete = '{{config("livetool.fileurl_delete")}}';
    this.TRTC = TRTC;
    this.platform = {{$platform}}; // 来源 0pc 1移动端 2平板
</script>
<script src="/vendor/livetool/js/small/loadroom.js"></script>
<script src="/vendor/livetool/js/checkNetwork.js?t="+Math.random()></script>
<script src="/vendor/livetool/js/small/live.js"></script> 

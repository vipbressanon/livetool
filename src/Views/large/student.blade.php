<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <meta name="referrer" content="never">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" id="viewport" content="width=device-width, initial-scale=0.5, maximum-scale=0.5">
        <title>学生端-直击课堂</title>
		<link href="/vendor/livetool/layui/css/layui.css" rel="stylesheet" type="text/css">
		<link href="/vendor/livetool/css/common.css" rel="stylesheet" type="text/css">
		<link href="/vendor/livetool/css/large/live.css" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/font/iconfont.css" rel="stylesheet">
        <link href="https://lib.baomitu.com/jquery-toast-plugin/1.3.2/jquery.toast.css" rel="stylesheet">   
    </head>
    <body> 
        <div class="fullScreen">
            <div class="mount">
                <div class="wrapper">
                    <span>{{$course['title']}}</span>
                    <span>开课时间：<b class="roomtime">00:00</b></span>
                    @if(!$course['endtime'])
                     <!--下课不检测网络状态-->
                    <span class="checkNet">您当前网络状态：<b class="netStatus">--</b></span>
                    <span>当前网速：<b class="netSpeed">0K/S</b></span>
                    @endif
                </div>
            </div>

            <div class="room-left">
                <!-- 直播视频地址 -->
                <div id="paint_box"></div>
                
                <!-- 侧边栏 -->
                <div class="sideBar">
                    <a href="javascript:;" class="toggleside">&lt;&lt;</a>
                    <ul class="sideTab">
                        <li>
                            <div class="blackCircle switchbtn">
                                <label class="sidePic sideIcon4"></label>
                                <span class="sideName">设备检测</span>
                                <i class="gantanhao">!</i>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <!-- 暂未开课、已下课 -->
                @if($role[0] == 201)
                <div class="status">
                    <a class="tag end" href="javascript:;">{{$role[1]}}</a>
                </div>
                @elseif($role[0] == 202)
                <div class="status">
                    <a class="tag start" href="javascript:;">请等待讲师开课</a>
                </div>
                @elseif($role[0] == 204)
                <div class="status">
                    <a class="tag end" href="javascript:;">{{$role[1]}}</a>
                </div>
                @endif
                
				<!-- 摄像头最大化 -->
                <div class="maxWindow">
                    <span class="iconfont icon-close" title="关闭" onclick="maxHide()"></span>
                    <!-- 摄像头未正常开启 -->
                    <div class="without">
                        <span class="iconfont icon-shexiangtou"></span>
                        <span class="iconfont icon-xiantiao"></span>
                    </div>
                    <!-- 摄像头正常开启 -->
                    <div class="with">
                        
                    </div>
                </div>					  
                <div id="edu-toolbar-box" class="edu-toolbar-box" style="display: none;">
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
                    </ul>
                    <input id="fileSelector" class="hide" type="file" accept="image/*,application/pdf, application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
                </div>
            </div>
            <div class="room-right">
                <div class="teachervideo livevideo" data-id="{{$course['teacher_id']}}" data-index="">
                    <div id="live{{$course['teacher_hash_id']}}" class="videodiv"></div>
                    <img class="videobg" src="http://liveqn.xueyoubangedu.com/novideo.jpg" />
                    <img class="teacherSign" src="/vendor/livetool/images/sanjiao.png">
                    <div class="teacherTag align_item">
                        <div class="name row">
                            <div class="micicon"><i></i></div>
                            <span class="nickname">讲师</span>
                            <div class="network"><i></i></div>
                        </div>
                        <div class="row righticon">
                            <div class="speakicon"></div>
                        </div>
                    </div>
                    <div class="volume">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div class="handle">
                        <div class="icon04 teacher-zuidahua" title="点击最大化">
                            <span class="iconfont icon-zuidahua"></span>
                        </div>
                    </div>
                </div>
                <div class="studentvideo"></div>
                <ul class="nav nav-tabs nav-fill" role="tablist">
                    <li class="nav-item"><a class="nav-link" data-toggle="tab" href="javascript:;" role="tab">讨论</a></li>
                    <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="javascript:;" role="tab">在线学员（<span class="stucount">0</span>）</a></li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane" id="messtab" style="display: none;">
                        <div class="tabdiv">
                            <div class="chatroom-list" id="chatroom-list">
                            </div>
                            <div class="chatroom-speaking">
                                <div class="chatroom-text">
                                    <input id="chattext" type="text" placeholder="这里输入讨论内容，可按回车键发送" value="">
                                    <button id="chatbtn">发送</button>
                                </div>
                                <input type="hidden" id="tousers" value="">
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane active" id="usertab">
                        <div class="tabdiv">
                            <div class="chatroom-list" id="student-list">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 学生举手 -->
            <div class="handBtn align_item" style="display: none;">
                <span class="iconfont icon-jushou"></span>
            </div>
            
            <div class="fullBtn">全屏<br>显示</div>

        </div>
        <input type="hidden" id="_token" name="_token" value="{{csrf_token()}}" />
    </body>
</html>
<script src="/vendor/livetool/js/jquery.min.js"></script>
<script src="/vendor/livetool/font/iconfont.js"></script>
<script src="/vendor/livetool/layui/layui.js"></script>
<script src="/vendor/livetool/js/large/live.js"></script> 
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
<script src="https://resources-tiw.qcloudtrtc.com/board/2.4.0/TEduBoard.min.js"></script>
<!-- TIC SDK -->
<script src="https://resources-tiw.qcloudtrtc.com/tic/2.4.1/TIC.min.js"></script>
<!-- socket.io -->
<script src="https://lib.baomitu.com/socket.io/2.0.3/socket.io.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@9"></script>
<script src="https://lib.baomitu.com/jquery-toast-plugin/1.3.2/jquery.toast.min.js"></script>
<script src="/js/vconsole.min.js"></script>
<script>
    this.users = JSON.parse('{!!json_encode($info)!!}');
    this.room = JSON.parse('{!!json_encode($room)!!}');
    this.course = JSON.parse('{!!json_encode($course)!!}');
    this.socketurl = '{{config("livetool.socketurl")}}';
    this.isteacher = {{$isteacher}};
    this.role = JSON.parse('{!!json_encode($role)!!}');
    this.fileurl = '{{config("livetool.fileurl")}}';
    this.TRTC = TRTC;
    this.platform = {{$platform}}; // 来源 0pc 1移动端 2平板
</script>
<script src="/vendor/livetool/js/large/loadroom.js"></script>
<script src="/vendor/livetool/js/checkNetwork.js?t="+Math.random()></script>


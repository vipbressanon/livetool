<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>直击课堂</title>
		<link href="" id="css1" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/css/common.css" rel="stylesheet" type="text/css">
        <link href="" id="css2" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/font/iconfont.css" rel="stylesheet">
        <link href="/vendor/livetool/css/swiper.min.css" rel="stylesheet" type="text/css">
        <link href="https://cdn.bootcss.com/jquery-toast-plugin/1.3.2/jquery.toast.css" rel="stylesheet">   
    </head>
    <body style="visibility:hidden">
        <div class="fullScreen">
            <div class="mount">
                <div class="wrapper align_item">
                    <span>{{$course['title']}}</span>
                    <span>学员数量（<b class="stucount">0</b>人）</span>
                    <span>开课时间：<b class="roomtime">00:00</b></span>
                </div>
            </div>
            <div class="gatherContent swiper-container">
                <div class="gatherBox swiper-wrapper">

                </div>
            </div>
            <!-- 侧边栏 -->
            <div class="sideBar">
                <ul class="sideTab">
                    <li>
                        <div class="blackCircle switchbtn">
                            <label class="sidePic sideIcon4"></label>
                            <span class="sideName">设备选择</span>
                        </div>
                    </li>
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
                <div class="status">
                    <a class="tag start" href="javascript:;">请等待讲师开课</a>
                </div>
                @elseif($role[0] == 203)
                <div class="status">
                    <a id="courseword" class="tag start" href="javascript:;">{{$role[1]}}</a>
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
                            <div class="choose-state"><i class="roomicon ri-tools3"></i></div>
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
            <!-- 手机端竖屏 课程标题详情 -->
            <div class="PortCourse">
                <!-- 学生举手 -->
                <div class="handBtn align_item">
                    <span class="iconfont icon-jushou"></span>
                </div>
                <div class="desc">
                    <div class="row1">@if($course['status']==0)<span>未上课</span>@elseif($course['status']==1)<span>上课中</span>@elseif($course['status']==2)<span>已下课</span>@endif{{$course['title']}}</div>
                    <div class="row2 row">
                        <p><i class="iconfont icon-laoshirenshu"></i><span class="teacount">0</span>人</p>
                        <p><i class="iconfont icon-xueshengrenshu"></i><span class="stucount">0</span>人</p>
                    </div>
                    <span class="iconfont icon-zuidahua" id="enlarge"></span>
                </div>
            </div>
            <!-- 手机端竖屏 讨论区title -->
            <div class="PortDiscussTitle align_item">
                <i class="line"></i>
                <span>讨论</span>
            </div>
            <p id="qqq" style="width:100%;height:1px;background:#fff;"></p>								 
            <!-- 讨论区 start -->
            <div class="discussBtn align_item">
                <span class="iconfont icon-liaotian"></span>
                <i class="redDot" style="display:none;"></i>
            </div>
			<!-- 手机端 摄像头按钮 -->
            <div class="cameraBtn align_item">
                <span class="iconfont icon-shexiangtou"></span>
            </div>
            <!-- 手机端 摄像头关闭按钮 -->
            <div class="cameraClose iconfont icon-close"></div>

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
        </div>
        <input type="hidden" id="_token" name="_token" value="{{csrf_token()}}" />
    </body>
</html>
<script src="/vendor/livetool/js/jquery.min.js"></script>
<script src="/vendor/livetool/font/iconfont.js"></script>
<script src="/vendor/livetool/layui/layui.js"></script>
<script src="/vendor/livetool/js/swiper.min.js"></script>
<script id="js"></script>
<script src="/vendor/livetool/js/fit.js"></script>
<!-- axios SDK -->
<script src="https://tic-res-1259648581.file.myqcloud.com/thirdpart/axios/axios.min.js"></script>
<!-- WebRTC SDK -->				  
<script src="https://sqimg.qq.com/expert_qq/webrtc/3.4.2/WebRTCAPI.min.js"></script>
<!-- <script src="https://live.xueyoubangedu.com/js/WebRTCAPI.min.js"></script> -->
<!-- WebIM SDK -->
<script src="https://tic-res-1259648581.file.myqcloud.com/webim/webim.min.js"></script>
<!-- COS SDK -->
<script src="https://tic-res-1259648581.file.myqcloud.com/thirdpart/cos/5.1.0/cos.min.js"></script>
<!-- 白板SDK -->
<script src="https://tic-res-1259648581.file.myqcloud.com/board/2.3.2/TEduBoard.min.js"></script>
<!-- TIC SDK -->
<script src="https://tic-res-1259648581.file.myqcloud.com/tic/2.2.2/TIC.min.js"></script>
<!-- socket.io -->
<script src="https://cdn.bootcss.com/socket.io/2.0.3/socket.io.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@9"></script>
<script src="https://cdn.bootcss.com/jquery-toast-plugin/1.3.2/jquery.toast.min.js"></script>

<script>
    this.users = JSON.parse('{!!json_encode($info)!!}');
    this.room = JSON.parse('{!!json_encode($room)!!}');
    this.course = JSON.parse('{!!json_encode($course)!!}');
    this.socketurl = '{{config("livetool.socketurl")}}';
    this.isteacher = {{$isteacher}};
    this.role = JSON.parse('{!!json_encode($role)!!}');
</script>
<script src="/vendor/livetool/js/loadroom.js"></script>
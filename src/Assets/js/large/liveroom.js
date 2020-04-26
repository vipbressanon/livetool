// 直播间初始化管理
var liveroom = function () {
    
    var initData = function(){
        
        this.timeadd = null;
        this.starttime = null;
        this.roster = [];
        this.devices = {camera:[], mic:[]};
        this.cameraIndex = 0;
        this.micIndex = 0;
        this.enableCamera = true;
        this.enableMic = true;
        this.boardFileGroup = [];
        this.teduBoard = null;
        this.islogin = false;   //登录im状态
        this.isenter = false;   //进入课堂状态
        this.isstart = false;   //推流开始状态
        this.isspeak = false;   //是否在台上
        this.socket = null;
        this.loading = false;   //加载中
        this.fullscreen = false; //是否全屏
        this.remoteVideos = {}; //设备信息
        this.onlineindex = -1;
        this.isPushing = 0; // 是否推流 0否 1是
        this.playing = false;
        
        this.tic = new TIC({});
        this.tic.init(this.users.sdkappid, res => {
            login();
        });
    };
    
    var login = function(){
        this.tic.login({
            userId: this.users.hash_id,
            userSig: this.users.usersig
        }, (res) => {
            if (res.code) {
                this.bmsim.toast('登录失败');
                this.islogin = false;
            } else {
                this.islogin = true;
                // 加载socket
                websocket();
                roombtn();
                this.bmsim.init();
            }
        });
    };
    
    var websocket = function(){
        var _this = this;
        this.socket = io(this.socketurl);
        // 连接并触发登录事件
        this.socket.on('connect', function () {
            _this.socket.emit('login', {
                hash_id:_this.users.hash_id,
                room_id:_this.room.id,
                users_id:_this.users.id,
                isteacher:_this.isteacher,
                roomtype:_this.room.roomtype
            });
        });
        // 讲师创建房间后邀请所有人进入
        this.socket.on('create', function (arr) {
            _this.course.teacher_id = arr.teacher_id;
            _this.bmstic.enter();
        });
        // 在线人员名单列表
        this.socket.on('userslist', function (arr) {
            if (_this.onlineindex < arr.index) {
                _this.onlineindex = arr.index;
                if (arr.type == 'online') {
                    _this.bmsajax.online(arr.key, arr.value);
                } else if (arr.type == 'offline') {
                    _this.bmsajax.offline(arr.key);
                }
            }
        });
        // 房间开课计时
        this.socket.on('starttime', function (starttime) {
            _this.starttime = starttime;
            _this.bmsajax.livetime();
        });
        // 下课
        this.socket.on('over', function () {
            _this.bmstic.quit();
            _this.socket.close();
        });
        // 欠费终止上课
        this.socket.on('feeover', function () {
            _this.bmsim.toast('已欠费达上限终止上课', 'error');
            location.replace(location.href);
        });
        // 欠费的提醒
        this.socket.on('feeowe', function () {
            if (_this.isteacher) {
                _this.bmsim.toast("您已欠费，请及时充值！");
            }
        });
        // 上台人数名单
        this.socket.on('onplat', function (arr) {
            $.each(arr.key, function(i, v){
                _this.bmsim.speakstatus(v, '', '1', arr.value[i]);
            });
            _this.bmsajax.usersinfo(arr.key, 'onplat');
            _this.bmsrtc.initTRTCEvent();
            _this.bmsrtc.getRemoteVideoStats();
        });
    };
    
    // 点击按钮开始上课，结束上课，录制
    var roombtn = function(){
        var _this = this;
        $(document).on("click", "#startbtn", function(){
            swal.fire({   
                title: "提示",   
                text: "确定开始上课吗？\n开始上课前，请保证您使用的摄像头、麦克风等设备已插好",   
                icon: "warning",   
                confirmButtonText: "我已经准备好了",
                cancelButtonText: "取消",
                showCancelButton: true
            }).then((result) => {
                if (result.value) {
                    $(".status").hide();
                    $("#endbtn").removeClass("hide");
                    _this.bmsajax.roomstart();
                }
            });
        });
        $(document).on("click", "#endbtn", function(){
            // 已进入  或者课程已经开课欠费
        	if(_this.isenter || (_this.course.status == 1 && _this.role[0] == 204)){
                swal.fire({   
                    title: "提示",   
                    text: "确定要下课吗？一旦结束无法再开启，请谨慎操作！",   
                    icon: "warning",  
                    confirmButtonText: "我要下课",
                    cancelButtonText: "取消",
                    showCancelButton: true
                }).then((result) => {
                    if (result.value) {
                        _this.bmsajax.roomend();
                    }
                });
        	}
        });
        
        $(document).on("click",".uploadbtn",function(){
            $(".fullBtn").html('全屏<br>显示');
            if (_this.isenter) {
                if (_this.fileload) {
                    _this.bmsim.toast('文件正在加载，请稍后');
                    // $('.layui-progress').show();
                } else {
                    $('.coursefile_progress').hide();
                    $('#fileSelector').click();
                }
            } else {
                _this.bmsim.toast('点击开始上课后，才可上传课件', 'error');
            }
        });
        
        $(window).bind('beforeunload',function(){
            return '';
        });
    };
    
    //步骤-》1.登录-》2.点击开始直播创建课堂-》3.加入课堂-》4.邀请其他人进入房间-》5.点击下课直播结束
    var common = function(bmstic, bmsim, bmsboard, bmsrtc, bmsajax){
        
        this.bmsajax = bmsajax;
        this.bmstic = bmstic;
        this.bmsim = bmsim;
        this.bmsboard = bmsboard;
        this.bmsrtc = bmsrtc;
        this.tic = null;
        console.log("TRTC版本号："+this.TRTC.VERSION);
        checkChrome();
        if (this.platform == 0) {
            checkRTRC();
            network.start();
            $('.icon-zuidahua').css('pointer-events', 'none');
            // 全屏显示
            $(".fullBtn").click(function(){
                handleFullScreen();
            });
        } else {
            this.bmsim.toast('请使用电脑打开chrome浏览器', 'error');
        }
    };
    
    // 全屏显示
    var handleFullScreen = function() {
        let element = document.documentElement;
        // 判断是否已经是全屏
        if (this.fullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            $(".fullBtn").html('全屏<br>显示');
        } else {    // 否则，进入全屏
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                // IE11
                element.msRequestFullscreen();
            }
            $(".fullBtn").html('取消<br>全屏');
        }
        // 改变当前全屏状态
        this.fullscreen = !this.fullscreen;
    }

    // 检测浏览器是否兼容 TRTC Web SDK。若当前浏览器不兼容 TRTC Web SDK，建议引导用户去下载最新版本的 Chrome 浏览器。
    var checkRTRC = function () {
        console.log("检查TRTC");
        this.TRTC.checkSystemRequirements().then((result) => {
            if(!result) {
                showTRTCError();
            } else {
                if ((this.role[0] == 200 || this.role[0] == 202)) {
                    initData();
                } else if (this.course.status == 1 && this.role[0] == 204) { // 课程已经开课欠费  点击下课按钮
                    roombtn();
                }
            }
        }).catch((e) => {
            console.log("checkRTRC错误");
            console.log(e);
            showTRTCError();
        });
    }

    // 检测浏览器是否是谷歌
    var checkChrome  = function () {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
        var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
        var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
        if(userAgent.match(/(iPhone|Android|ios)/i)){
            console.log("当前设备：移动端");
        } else if (userAgent.match(/(iPod|iPad)/i)) {
            console.log("当前设备：平板");
        } else {
            if(isIE) {
                var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
                reIE.test(userAgent);
                var fIEVersion = parseFloat(RegExp["$1"]);
                if(fIEVersion < 10 && fIEVersion > 6 ) {
                    location = '/livetool/browser';
                    return 6;//IE版本<10
                }else if(fIEVersion ==  6){
                    location = '/livetool/browser';
                }
            } else if(isEdge) {
                return 'edge';//edge
            } else if(isIE11) {
                location = '/livetool/browser';
                return 11; //IE11
            }else{
                var ua = window.navigator.userAgent.toLowerCase();
                if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                    location = '/livetool/browser';
                }
                else {
                    console.log('chrome')
                }
                var is360 = is360ByUserActivationProperty();
                function is360ByUserActivationProperty(){
                    let navigator = window.navigator;
                    if(navigator.userActivation){
                        //chrome
                    }else{
                        location = '/livetool/browser';
                    }
                }
                let navigator = window.navigator;
                if(navigator.userActivation){
                    //chrome
                }else{
                    location = '/livetool/browser';
                }
            } //if
        }
    }
    // TRTC错误弹框
    var showTRTCError = function() {
        let text = '';
        if (this.platform == 0) {
            text = '<div style="padding:20px;line-height: 32px;color:#000;">当前浏览器不兼容TRTC,<br/>请下载最新浏览器！</div>';
        } else {
            text = '<div style="padding:20px;line-height: 32px;color:#000;">当前浏览器不兼容TRTC,<br/>请更换浏览器,<br/>(请使用微信或QQ内置浏览器或者chrome浏览器打开)</div>';
        }
        layer.open({
            type: 1
            ,offset: 'auto'
            ,title: false
            ,area: '60%'
            ,id: 'layerDemo'+'auto' //防止重复弹出
            ,content: text
            ,btn: ['确定']
            ,btnAlign: 'c' //按钮居中
            ,shade: 0 //不显示遮罩
            ,yes: function(){
                if (this.platform == 0) {
                    window.location.href="https://zjclass.xueyoubangedu.com/chrome/ChromeSetup.exe";
                } else {
                    layer.closeAll();
                }
            }
        });
    }

    return {
        init: function (bmstic, bmsim, bmsboard, bmsrtc, bmsajax) {
            common(bmstic, bmsim, bmsboard, bmsrtc, bmsajax);
        }
    };

}();
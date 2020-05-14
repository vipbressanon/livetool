// 直播间初始化管理
var liveroom = function () {
    
    var initData = function(){
        
        this.timeadd = null;
        this.starttime = null;
        this.roster = [];
        this.permission = [];
        this.boardFileGroup = [];
        this.teduBoard = null;
        this.islogin = false;   //登录im状态
        this.isenter = false;   //进入课堂状态
        this.isstart = false;   //推流开始状态
        this.isspeak = false;   //是否在台上
        this.isvoice = false;   //麦授权
        this.isboard = false;   //白板授权
        this.mic = true;           //教师麦
        this.camera = true;        //教师摄像头
        this.checkmic = 'default';   //麦克风默认值
        this.checkopenmic = 'default';  //扬声器默认值
        this.checkcamera = '';          //摄像头默认值
        this.socket = null;
        this.loading = false;   //加载中
        this.recordeloading = false;   //加载中
        this.fullscreen = false; //是否全屏
        this.remoteVideos = {}; //设备信息
        this.socketindex = -1;
        this.onoffindex = -1;
        this.onoff = [];
        this.isPushing = false; // 是否推流
        this.playing = false;
        this.ischat = false; // 新消息小红点
        this.boardscale = 100;
        this.socket_heart = null; // 上次心跳时间
        this.socket_retry = 3; // socket重连次数
        this.volume_interval_map = new Map(); //定时器 
        this.leftTime = null;
        this.rightTime = null;
        
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
                var _this = this;
                if (this.isteacher) {
                    var toastalert = Swal.mixin({
                        toast: true,
                        position: 'center',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true
                    });
                    toastalert.fire({
                        icon: 'info',
                        title: '正在进入课堂，请稍后'
                    }).then((result) => {
                        _this.islogin = true;
                        // 加载socket
                        websocket();
                        // 加载按钮点击事件
                        roombtn();
                        // 只加载讨论功能
                        this.bmsim.init();
                    });
                } else {
                    var toastalert = Swal.mixin({
                        position: 'center',
                        focusConfirm: true,
                        showConfirmButton: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                    toastalert.fire({
                        icon: 'info',
                        html: '为满足精品小班课互动<br/>教师需要获取您的视频画面与麦克风授权'
                    }).then((result) => {
                        _this.islogin = true;
                        // 加载socket
                        websocket();
                        // 加载按钮点击事件
                        roombtn();
                        // 只加载讨论功能
                        this.bmsim.init();
                    });
                }
                
            }
        });
    };
    
    var websocket = function(){
        try {
            console.log(this.users);
            var _this = this;
            this.socket = io(this.socketurl);
            console.log(_this.room.id);
            // 连接并触发登录事件
            this.socket.on('connect', function () {
                // 登录-》users和plat
                _this.socket.emit('login', {
                    hash_id:_this.users.hash_id,
                    room_id:_this.room.id,
                    isteacher:_this.isteacher,
                    platform:0,
                    up_top : _this.course.up_top
                });
                // if (heartCheck.timeoutObj) {
                //     clearInterval(heartCheck.timeoutObj);
                // }
                // heartCheck.start();
            });
           
            // 登录初始化布局
            this.socket.on('addusers', function (arr) {
                console.log('addusers', arr);
                if (_this.socketindex < arr.index) {
                    _this.socketindex = arr.index;
                    _this.permission = arr.users;
                    if (_this.users.hash_id == arr.hashid && this.id != arr.socketid) {
                        console.log("取消关闭网页监听")
                        // 取消关闭网页监听 跳转到登录页
                        window.onbeforeunload = () => null;
                        location.replace("/live/login/"+_this.course.hash_id);
                        return;
                    }
                    _this.onoff = arr.onoff;
                    console.log(_this.onoff);
                    _this.bmsajax.addusers();
                    if (_this.users.hash_id == arr.hashid) {
                        _this.bmsim.chatstatus();
                        _this.bmsim.handstatus();
                    }
                }
            });
            
            // 人员减少
            this.socket.on('cutusers', function (arr) {
                console.log("cutusers", arr);
                if (_this.socketindex < arr.index) {
                    _this.socketindex = arr.index;
                    _this.permission = arr.users;
                    _this.onoff = arr.onoff;
                    console.log(_this.onoff);
                    _this.bmsajax.cutusers();
                }
            });
            
            // 聊天列表消息提示
            this.socket.on('im', function (json) {
                console.log('im', json);
                switch (json.type) {
                    case 'TEXT':        // 文本消息
                        // TODO::指定用户发送 to_user参数处理
                        if (_this.course.teacher_id == json.hash_id) {
                            $('.discussList').append("<li class='yellow'><p><i>" + json.nickname +":" + "</i>" + json.text + "</p></li>");
                        } else {
                           $('.discussList').append("<li><p><i>" + json.nickname + ":" + "</i>" + json.text + "</p></li>"); 
                        }
                        $(".discussList").animate({scrollTop:$(".discussList").prop("scrollHeight")}, 400);
                        if (_this.ischat) {
                            $(".discussBtn .redDot").hide();
                        } else {
                            $(".discussBtn .redDot").show();  
                        }
                        break;
                    case 'ZAN':         // 点赞
                        $(".users"+json.hash_id+" td:eq(6) .zannum").html(json.text);
                        $("#users"+json.hash_id+" .zannum").html(json.text);
                        _this.bmsim.toast("讲师给了 "+json.nickname+" 一个奖励");
                        break;
                    case 'PLATZAN':         // 点赞
                        $.each(_this.permission, function(i, v){
                            if (v['isteacher'] == 0 && v['plat'] == 1) {
                                $(".users"+i+" td:eq(6) .zannum").html(parseInt($(".users"+i+" td:eq(6) .zannum").html()) + 1);
                                $("#users"+i+" .zannum").html(parseInt($("#users"+i+" .zannum").html()) + 1);
                            }
                        });
                        _this.bmsim.toast("讲师给了所有上台学员一个奖励");
                        break;
                    case 'KICK':        // 踢出
                        _this.bmsim.toast("讲师将 "+json.nickname+" 踢出了课堂");
                        if (json.hash_id == _this.users.hash_id) {
                            _this.bmstic.kick();
                        }
                        break;
                    case 'HAND':        //讲师收到学员举手
                        // 仅讲师做处理操作
                        if (_this.onoff['ishand'] == 1 && _this.isteacher) {
                            _this.bmsim.studenthand(json.hash_id, json.nickname, 1);
                            setTimeout(function() {
                                _this.bmsim.studenthand(json.hash_id, json.nickname, 0);
                            }, 5000);
                        }
                        break;
                    case 'MAX':        //放大，缩小
                        if (json.text == 1) {
                            _this.onoff['max'] = json.hash_id;
                            _this.bmsrtc.maxdiv(_this.onoff['max']);
                            if (json.nickname) {
                                _this.bmsim.toast("讲师放大了 "+json.nickname+" 的画面");
                            }
                        } else {
                            _this.onoff['max'] = '';
                            _this.bmsrtc.maxdiv(_this.onoff['max']);
                            if (json.nickname) {
                                _this.bmsim.toast("讲师缩小了 "+json.nickname+" 的画面");
                            }
                        }
                        break;
                    default:
                        break;
                }
            });
            
            // 监听权限变更（plat, board, voice）=>1,2,3
            // 返回 type, users, index, nickname
            this.socket.on('permission', function (data) {
                console.log('permission', data);
                var hash_id = Object.keys(data.users)[0];
                var status = Object.values(data.users)[0];
                _this.permission[hash_id] = status;
                console.log(_this.permission);
                if (data.type == 'plat') {
                    _this.bmsim.platstatus(hash_id, status, data.nickname);
                } else if (data.type == 'board') {
                    _this.bmsim.boardstatus(hash_id, status, data.nickname);
                } else if (data.type == 'voice') {
                    _this.bmsim.voicestatus(hash_id, status, data.nickname);
                }
            });
            
            this.socket.on('onoff', function (arr) {
                console.log('onoff', arr);
                if (_this.onoffindex < arr.index) {
                    _this.onoffindex = arr.index;
                    _this.onoff = arr.onoff;
                    if (arr.type == 'roomtype') {
                        if (arr.status == 1) {
                            if (_this.isteacher) {
                                _this.bmsrtc.maxdiv('');
                                _this.bmsrtc.pushScreen();
                            } else {
                                _this.bmsrtc.maxdiv(_this.onoff['max']);
                            }
                            _this.bmsim.toast("讲师切换为屏幕共享模式");
                        } else {
                            if (_this.isteacher) {
                                _this.bmsrtc.startRTC();
                            }
                            _this.bmsrtc.maxdiv(_this.onoff['max']);
                            _this.bmsim.toast("讲师切换为白板教学模式");
                        }
                        
                    } else if (arr.type == 'ischat') {
                        _this.bmsim.chatstatus();
                        if (arr.status == 1) {
                            _this.bmsim.toast('讲师允许全员发送消息');
                        } else {
                            _this.bmsim.toast('讲师禁止全员发送消息');
                        }
                    } else if (arr.type == 'ishand') {
                        _this.bmsim.handstatus();
                        if (arr.status == 1) {
                            _this.bmsim.toast('讲师允许学员举手');
                        } else {
                            _this.bmsim.toast('讲师禁止学员举手');
                        }
                    }
                }
            });
            
            this.socket.on('platbatch', function (arr) {
                console.log('platbatch', arr);
                if (_this.socketindex < arr.index) {
                    _this.socketindex = arr.index;
                    _this.permission = arr.users;
                    if (arr.type == 'board') {
                        $.each(_this.permission, function(i, v){
                            if (v['isteacher'] == 0 && v['plat'] == 1) {
                                _this.bmsim.boardstatus(i, v, '');
                            }
                        });
                        if (arr.status == 0) {
                            $(".teacherHead .icon02").attr("title", "台上授权").removeClass("current");
                            _this.bmsim.toast('所有上台学员已取消授权');
                        } else {
                            $(".teacherHead .icon02").attr("title", "取消台上授权").addClass("current");
                            _this.bmsim.toast('所有上台学员已授权');
                        }
                    } else if (arr.type == 'voice') {
                        $.each(_this.permission, function(i, v){
                            if (v['isteacher'] == 0 && v['plat'] == 1) {
                                _this.bmsim.voicestatus(i, v, '');
                            }
                        });
                        if (arr.status == 0) {
                            $(".teacherHead .icon01").attr("title", "台上连麦").removeClass("current");
                            _this.bmsim.toast('所有上台学员已静音');
                        } else {
                            $(".teacherHead .icon01").attr("title", "台上静音").addClass("current");
                            _this.bmsim.toast('所有上台学员已连麦');
                        }
                    }
                }
            });
            
            // 讲师创建房间后邀请所有人进入
            this.socket.on('create', function (arr) {
                console.log('create', arr);
                _this.course.status = 1;
                _this.course.starttime = arr.starttime;
                _this.course.expectendtime = arr.expectendtime;
                _this.bmsajax.livetime('create');
                _this.bmsim.toast('开始上课啦！');
                _this.course.teacher_hash_id = arr.teacher_hash_id;
                if (!_this.isteacher) {
                    _this.bmstic.enter();
                }
                $(".headTx .txImg").addClass('bgimg1').removeClass('bgimg2').removeClass('bgimg3');
            });
            // 下课
            this.socket.on('over', function () {
                console.log('over');
                _this.bmstic.quit();
                _this.socket.close();
                window.onbeforeunload = () => null;
                // 下课对应样式变更 
                $('.middle').prepend('<div class="status"><a class="tag end" href="javascript:;">已下课</a></div>');
                $('#startbtn').remove();
            });
            // 最后5分钟提醒
            this.socket.on('downtips', function () {
                // TODO::
                if (_this.isteacher) {
                    _this.bmsim.toast('拖堂剩余最后5分钟，即将关闭课堂', 'error');
                }
            });
            // 欠费终止上课
            this.socket.on('feeover', function () {
                console.log('feeover');
                _this.bmsim.toast('已欠费达上限终止上课', 'error');
                location.replace(location.href);
            });
            // 欠费的提醒
            this.socket.on('feeowe', function () {
                console.log('feeowe');
                if (_this.isteacher) {
                    _this.bmsim.toast("您已欠费，请及时充值！");
                }
            });
            // 心跳检测
            // this.socket.on('heart', function (time) {
            //     _this.socket_heart = time;
            //     console.log(time);
            // });
            // 重新连接监听
            this.socket.on('reconnect', () => {
                _this.bmsim.toast("重连成功！");
            });
            // 重新失败监听
            this.socket.on('reconnect_error', () => {
                _this.bmsim.toast("服务器连接失败，发起重连...", 'error');
            });
        } catch (err) {
            console.log("socket异常"+err);
            _this.socket_heart = null;
            websocket();
        }
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
                        window.onbeforeunload = () => null;
                        _this.bmsajax.roomend();
                    }
                });
        	}
        });
        $(document).on("click",".uploadbtn",function(){
            $(".fullBtn").html('全屏<br>显示');
            $(".fullBtn_a").html('最大化');
            if (_this.isenter) {
                // _this.teduBoard.addVideoFile('http://1257355334.vod2.myqcloud.com/ce9faee8vodcq1257355334/27033b935285890801964548705/f0.mp4');
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
        // 在线人数
        $(document).on("click", ".onlinePeopleBtn", function(){
            if ($('.dialog_online_people').is(':hidden')) {
                $('.dialog_online_people').show();
                // _this.ischat = true;
            } else {
                $('.dialog_online_people').hide();
                // _this.ischat = false;
            }
        });
        $(document).on("click", ".closebtn", function(){
            $('.dialog_online_people').hide();
        });
        if (this.isteacher) {
            this.bmsrtc.teacherbtn();
        } else {
            this.bmsrtc.studentbtn();
        }
        window.onbeforeunload = () => {
            return '';
        }
    };
    
    var roomtime = function(){
        if (this.course.status == 0) {
            $(".roomtime").html('');
        } else if (this.course.status == 1) {
            
        } else {
            $(".roomtime").html('');
        }
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
            this.bmsajax.livetime();
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
            $(".fullBtn_a").html('最大化');
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
            $(".fullBtn_a").html('还原');
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
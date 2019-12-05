// 直播流管理
var bmsrtc = function () {
    //
    var common = function() {
        this.TRTC.on('onLocalStreamAdd', (data) => {
            if (data && data.stream) {
                document.getElementById('localvideo').srcObject = data.stream;
                console.log('WebRTC接收到本地流');
            }
        });

        this.TRTC.on('onRemoteStreamUpdate', (data) => {
            document.getElementById(data.openId+'video').srcObject = data.stream;
            console.log('WebRTC接收到远端流');
        });

        this.TRTC.on('onRemoteStreamRemove', (data) => {
            console.log('WebRTC 远端流断开');
        });

        this.TRTC.on('onWebSocketClose', (data) => {
            console.log('WebRTC WebSocket 断开');
        });

        this.TRTC.on('onRelayTimeout', (data) => {
            console.log('WebRTC 超时');
        });

        this.TRTC.on('onKickout', (data) => {
            //alert('其他地方登录，被T了');
        });
        var _this = this;

        $(document).on("click", ".roomtype1", function(){
            if(_this.isenter){
                $('.roomtype1').addClass("active");
                $('.roomtype2').removeClass("active");
                _this.bmsajax.roomtype(1);
                pushScreen();
                _this.bmsim.sendcustom('', '{"nickname":"","type":"SHARE","text":""}');
            }
        });
        
        $(document).on("click", ".roomtype2", function(){
            if(_this.isenter){
                $('.roomtype1').removeClass("active");
                $('.roomtype2').addClass("active");
                _this.bmsajax.roomtype(2);
                startRTC();
                _this.bmsim.sendcustom('', '{"nickname":"","type":"BOARD","text":""}');
            }
        });
        
        $(document).on("click", ".teacherHead .icon01", function(){
            if ($(this).hasClass("current")) {
                $(this).removeClass("current").attr('title', '点击关闭摄像头');
            } else {
                $(this).addClass("current").attr('title', '点击开启摄像头');
            }
            toggleCamera();
        });
        $(document).on("click", ".teacherHead .icon02", function(){
            if ($(this).hasClass("current")) {
                $(this).removeClass("current").attr('title', '点击关闭麦克风');
            } else {
                $(this).addClass("current").attr('title', '点击开启麦克风');
            }
            toggleMic();
        });
        $(document).on("click", ".teacherHead .icon03", function(){
            if (_this.room.roomspeak == 1) {
                _this.bmsajax.roomspeak(0);
                $(this).addClass("current").attr('title', '点击全员上台');
                _this.bmsim.sendcustom('', '{"users_id":"","nickname":"","type":"ALLSPEAK","text":"0"}');
            } else {
                _this.bmsajax.roomspeak(1);
                $(this).removeClass("current").attr('title', '点击全员下台');
                _this.bmsim.sendcustom('', '{"users_id":"","nickname":"","type":"ALLSPEAK","text":"1"}');
            }
            
        });
        $(document).on("click", ".teacherHead .icon04", function(){
            if (_this.room.roomhand == 1) {
                _this.bmsajax.roomhand(0);
                $(this).addClass("current").attr('title', '点击允许举手');
                _this.bmsim.sendcustom('', '{"users_id":"","nickname":"","type":"ALLHAND","text":"0"}');
            } else {
                _this.bmsajax.roomhand(1);
                $(this).removeClass("current").attr('title', '点击禁止举手');
                _this.bmsim.sendcustom('', '{"users_id":"","nickname":"","type":"ALLHAND","text":"1"}');
            }
            
        });
        
        // 邀请上台
        $(document).on("click", ".studentHead .icon01", function(){
            var users_id = $(this).attr("data-id");
            var nickname = $("#users"+users_id+" .nickname").html();
            if ($(this).hasClass("current")) {
                _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"NOSPEAK","text":""}');
            } else {
                _this.bmsajax.operatetype(users_id, 'speak');
                _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"SPEAK","text":"1"}');
            }
        });
        // 点赞
        $(document).on("click", ".studentHead .icon02", function(){
            var users_id = $(this).attr("data-id");
            var nickname = $("#users"+users_id+" .nickname").html();
            var num = parseInt($("#users"+users_id+" .zannum").html())+1;
            _this.bmsajax.operatetype(users_id, 'zan');
            _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"ZAN","text":"'+num+'"}');
        });
        // 踢出
        $(document).on("click", ".studentHead .icon04", function(){
            var users_id = $(this).attr("data-id");
            var nickname = $("#users"+users_id+" .nickname").html();
            swal.fire({   
                title: "提示",   
                text: "确定要将 "+nickname+" 踢出课堂吗？",   
                icon: "warning", 
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                showCancelButton: true
            }).then((result) => {
                if (result.value) {
                    _this.bmsajax.kick(users_id);
                    _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"KICK","text":""}');
                }
            });
        });
        
        $(document).on("click", ".studentHead .hands", function(){
            var users_id = $(this).attr("data-id");
            var nickname = $("#users"+users_id+" .nickname").html();
            var that = $(this);
            swal.fire({   
                title: "提示",   
                text: "是否允许 "+nickname+" 上台吗？",   
                icon: "warning",
                confirmButtonText: "允许",
                cancelButtonText: "拒绝",
                showCancelButton: true
            }).then((result) => {
                if (result.value) {
                    _this.bmsajax.operatetype(users_id, 'speak');
                    _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"SPEAK","text":"2"}');
                }
                that.hide();
            });
        });
        
        
        // 举手次数
        $(document).on("click", ".handBtn", function(){
            if (_this.room.roomhand) {
                if (_this.isspeak) {
                    _this.bmsim.toast("已经在台上不用举手了", "error");
                } else {
                    _this.bmsim.toast("已向讲师举手，请稍候");
                    _this.bmsajax.operatetype(_this.users.id, 'hand');
                    _this.bmsim.sendcustom('', '{"users_id":"'+_this.users.id+'","nickname":"'+_this.users.nickname+'","type":"HAND","text":""}');
                }
                
            } else {
                _this.bmsim.toast("讲师已禁止举手", "error");
            }
        });
        
        // 录制
        $(document).on("click", ".recordbtn", function(){
            if ($(this).attr('data-record') == 0) {
                $(this).attr('data-record', 1);
                $(this).addClass('recording');
                $(this).find('label').removeClass('sideIcon5').addClass('sideIcon6');
                $(this).find('span').html('录制中');
                _this.bmsajax.roomrecord(1);
            } else if ($(this).attr('data-record') == 1) {
                $(this).attr('data-record', 2);
                $(this).removeClass('recording');
                $(this).find('label').removeClass('sideIcon6').addClass('sideIcon5');
                $(this).find('span').html('课程录制');
                _this.bmsajax.roomrecord(2);
            } else if ($(this).attr('data-record') == 2) {
                $(this).attr('data-record', 1);
                $(this).addClass('recording');
                $(this).find('label').removeClass('sideIcon5').addClass('sideIcon6');
                $(this).find('span').html('录制中');
                _this.bmsajax.roomrecord(1);
            }
        });
    };
    
    var start = function(){
        if (this.isteacher) {
            if (this.room.roomtype == 1) {
                $(".roomtype1").click();
            } else if (this.room.roomtype == 2) {
                $(".roomtype2").click();
            }
        } else {
            startRTC();
        }
    };

    // 启动推流(推摄像头)
    var startRTC = function() {
        // 获取webrtc实例
        this.TRTC.getLocalStream({
            audio: true,
            video: true,
            attributes: {
                width: 640,
                height: 480
            }
        }, (data) => {
            if (this.TRTC.global.localStream && this.TRTC.global.localStream.active) {
                this.TRTC.updateStream({
                    role: 'screen',
                    stream: data.stream
                }, () => {
                    if (!this.isteacher) {
                        this.TRTC.closeAudio();
                    }
                    this.bmsim.speakstatus('', this.room.roomspeak);
                    this.isstart = true;
                }, (error) => {
                    console.log('更新流失败');
                });
            } else {
                this.TRTC.startRTC({
                    stream: data.stream,
                    role: 'user'
                }, (data) => {
                    if (!this.isteacher) {
                        this.TRTC.closeAudio();
                    }
                    this.bmsim.speakstatus('', this.room.roomspeak);
                    this.isstart = true;
                }, (error) => {
                    this.bmsajax.errors(2, '推流失败');
                });
            }
        }, (error) => {
            this.bmsajax.errors(1, '获取本地流失败');
        });
    };

    // 推屏幕分享
    var pushScreen = function() {
        this.TRTC.getLocalStream({
            audio:true,
            video:true,
            screen: true,
            screenSources: 'screen',
            attributes: {
                width: 1920,
                height: 1080,
                frameRate: 10
            },
            audioDevice:{
                deviceId:"default"
            }
        }, (data) => {
            if (this.TRTC.global.localStream && this.TRTC.global.localStream.active) {
                this.TRTC.updateStream({
                    role: 'screen',
                    stream: data.stream
                }, () => {
                    // 成功
                    this.bmsim.speakstatus('', this.room.roomspeak);
                    this.isstart = true;
                }, (error) => {
                    console.log('更新流失败');
                });
            } else {
                this.TRTC.startRTC({
                    stream: data.stream,
                    role: 'user'
                }, (data) => {
                    // 成功
                    this.bmsim.speakstatus('', this.room.roomspeak);
                    this.isstart = true;
                }, (error) => {
                    console.log('推流失败');
                });
            }
        }, (error) => {
            console.log('获取本地流失败');
        });
    };

    // 摄像头开关
    var toggleCamera = function() {
        this.enableCamera = !this.enableCamera;
        this.enableCamera ? this.TRTC.openVideo() : this.TRTC.closeVideo();
    };

    // 麦克风开关
    var toggleMic = function() {
        this.enableMic = !this.enableMic;
        this.enableMic ? this.TRTC.openAudio() : this.TRTC.closeAudio();
    };

    // 枚举摄像头
    var getCameraDevices = function() {
        var that = this;
        this.TRTC.getVideoDevices(devices => {
            if(this.cameraIndex==-1){
                this.cameraIndex = devices.length - 1;
            }
            this.devices.camera = devices;
            var cameraoption = "";
            $.each(this.devices.camera, function(i,v){
                if(i==that.cameraIndex){
                    cameraoption += "<option value='"+i+"' selected>"+v.label+"</option>";
                }else{
                    cameraoption += "<option value='"+i+"'>"+v.label+"</option>";
                }
            });
            $(".cameradriver").html(cameraoption);
        });
    };

    // 切换摄像头
    var switchCamera = function() {
        if (this.cameraIndex < 0) {
          return;
        }
        this.TRTC.chooseVideoDevice(this.devices.camera[this.cameraIndex]);
    };

    // 枚举麦克风
    var getMicDevices = function() {
        var that = this;
        this.TRTC.getAudioDevices(devices => {
            if(this.micIndex==-1){
                this.micIndex = devices.length - 1;
            }
            this.devices.mic = devices;
            var micoption = "";
            $.each(this.devices.mic, function(i,v){
                if(i==that.micIndex){
                    micoption += "<option value='"+i+"' selected>"+v.label+"</option>";
                }else{
                    micoption += "<option value='"+i+"'>"+v.label+"</option>";
                }
            });
            $(".micdriver").html(micoption);
        });
    };

    // 切换麦克风
    var switchMic = function() {
        if (this.micIndex < 0) {
          return;
        }
        this.TRTC.chooseAudioDevice(this.devices.mic[this.micIndex]);
    };
    
    var switchrtc = function(camera, mic) {
        var camera = camera ? camera : 0;
        var mic = mic ? mic : 0;
        if (this.cameraIndex != camera) {
            this.cameraIndex = camera;
            switchCamera();
        }
        if (this.micIndex != mic) {
            this.micIndex = mic;
            switchMic();
        }
    };
    
    return {
        init: function () {
            common();
        }, start: function () {
            start();
        }, roomtype: function (){
            roomtype();
        }, switchrtc: function (camera, mic){
            switchrtc(camera, mic);
        }
    };

}();
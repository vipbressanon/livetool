// 直播流管理
var bmsrtc = function () {
    var common = function() {
        var _this = this;

        $(document).on("click", ".roomtype1", function(){
            if(_this.isenter){
                $('.roomtype1').addClass("active");
                $('.roomtype2').removeClass("active");
                _this.bmsim.sendcustom('', '{"nickname":"","type":"SHARE","text":""}');
                _this.bmsajax.roomtype(1);
                pushScreen(2);
                changetype();
            }
        });
        
        $(document).on("click", ".roomtype2", function(){
            if(_this.isenter){
                $('.roomtype1').removeClass("active");
                $('.roomtype2').addClass("active");
                _this.bmsim.sendcustom('', '{"nickname":"","type":"BOARD","text":""}');
                _this.bmsajax.roomtype(2);
                startRTC();
                changetype();
            }
        });
        
        $(document).on("click", ".teachervideo .icon01", function(){
            if ($(this).hasClass("current")) {
                $(this).removeClass("current").attr('title', '点击关闭摄像头');
            } else {
                $(this).addClass("current").attr('title', '点击开启摄像头');
            }
            toggleCamera();
        });
        $(document).on("click", ".teachervideo .icon02", function(){
            if ($(this).hasClass("current")) {
                $(this).removeClass("current").attr('title', '点击关闭麦克风');
            } else {
                $(this).addClass("current").attr('title', '点击开启麦克风');
            }
            toggleMic();
        });
        
        // 邀请上台
        $(document).on("click", "#student-list .speakbtn", function(){
            if (_this.loading) {
                _this.bmsim.toast("点击太快，请慢一点", "error");
            } else {
                var users_id = $(this).attr("data-id");
                var hash_id = $(this).attr("data-hashid");
                var nickname = $(".users"+users_id+" b").html();
                if ($("#live"+hash_id).length > 0) {
                    _this.bmsim.toast("该学员已在台上", "error");
                    return false;
                }
                var speakcount = $(".studentvideo>div").length;
                if (speakcount >=2) {
                    _this.bmsim.toast("最多只允许两名学员上台", "error");
                    return false;
                }
                _this.loading = true;
                _this.socket.emit('onplat', {
                    users_id: users_id,
                    hash_id: hash_id
                });
                _this.bmsajax.operatetype(users_id, 'speak');
                _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"SPEAK","text":"'+hash_id+'"}');
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
            }
        });
        
        // 点赞
        $(document).on("click", ".studentvideo .icon01", function(){
            if (_this.loading) {
                _this.bmsim.toast("点击太快，请慢一点", "error");
            } else {
                _this.loading = true;
                var users_id = $(this).parents('.livevideo').attr("data-id");
                var nickname = $("#users"+users_id+" .nickname").html();
                 var hash_id = $(".users"+users_id).find(".speakbtn").attr("data-hashid");
                var num = parseInt($("#users"+users_id+" .zannum").html())+1;
                _this.bmsajax.operatetype(users_id, 'zan');
                _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"ZAN","text":"'+num+'","hash_id":"'+hash_id+'"}');
                setTimeout(function() {
                    _this.loading = false;
                }, 1500);
            }
        });
        
        // 点击下台
        $(document).on("click", ".studentvideo .icon03", function(){
            if (_this.loading) {
                _this.bmsim.toast("点击太快，请慢一点", "error");
            } else {
                var users_id = $(this).parents(".livevideo").attr("data-id");
                var hash_id = $(".users"+users_id).find(".speakbtn").attr("data-hashid");
                if ($("#users"+users_id).length > 0) {
                    var nickname = $("#users"+users_id+" .nickname").html();
                    _this.loading = true;
                    _this.socket.emit('displat', {
                        users_id: users_id
                    });

                    _this.bmsim.sendcustom('', '{"users_id":"'+users_id+'","nickname":"'+nickname+'","type":"NOSPEAK","text":"'+hash_id+'"}');
                    setTimeout(function() {
                        _this.loading = false;
                    }, 1500); 
                }
            }
        });
        
        // 录制
        $(document).on("click", ".recordbtn", function(){
            if ($(this).attr('data-record') == 0 || $(this).attr('data-record') == 3) {
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
    
    
    var changetype = function(){
        //如果老师从白板关闭摄像头，在且回白板的收时候默认打开了语音但是图标不对
        $(".teachervideo .icon01").removeClass("current").attr('title', '点击关闭摄像头');
        $(".teachervideo .icon02").removeClass("current").attr('title', '点击关闭麦克风');
        this.enableCamera = true;
        this.enableMic = true;
    };
    
    var start = function(){
        if (this.isteacher) {
            if (this.room.roomtype == 1) {
                $('.roomtype1').addClass("active");
                $('.roomtype2').removeClass("active");
                this.bmsim.sendcustom('', '{"nickname":"","type":"SHARE","text":""}');
                this.bmsajax.roomtype(1);
                pushScreen(1);
                changetype();
            } else if (this.room.roomtype == 2) {
                $('.roomtype1').removeClass("active");
                $('.roomtype2').addClass("active");
                this.bmsim.sendcustom('', '{"nickname":"","type":"BOARD","text":""}');
                this.bmsajax.roomtype(2);
                startRTC();
                changetype();
            }
        } else {
            startRTC();
        }
    };

    // TRTC事件
    var initTRTCEvent = function() {
        this.trtcClient.on('stream-added', event => {
            if (this.platform != 0) {
                $('.discussList').append("<li><p>远端流添加</p></li>");
            }
            console.log("远端流------添加");
            const remoteStream = event.stream;
            const remoteUserId = remoteStream.getUserId();
            console.log('received a remoteStream ID: ' + remoteStream.getId() + ' from user: ' + remoteUserId);
            // 若需要观看该远端流，则需要订阅它，默认会自动订阅
            this.trtcClient.subscribe(remoteStream, { audio: true, video: true });
        });

        // 监听‘stream-removed’事件
        this.trtcClient.on('stream-removed', event => {
            console.log("远端流----断开");
            const remoteStream = event.stream;
            console.log('remoteStream ID: ' + remoteStream.getId() + ' has been removed');
            // 清除定时器
            var interva_name = "remoteInterval_"+remoteStream.getUserId(); 
            clearInterval(this.interva_name);
            this.interva_name = null;
            // 设置红色
            //this.bmsajax.setnetwork(remoteStream.getUserId(), 1, "#FF0000");
            
            if (this.platform != 0) {
                $('.discussList').append("<li><p>远端流断开("+remoteStream.getId()+")</p></li>");
            }
            
            // 停止播放并删除相应<video>标签
            remoteStream.stop();
        });

        // 监听‘stream-updated’事件
        this.trtcClient.on('stream-updated', event => {
            console.log("远端流----更新");
            const remoteStream = event.stream;
            console.log(remoteStream);
            console.log('remoteStream ID: ' + remoteStream.getId() + ' was updated hasAudio: ' +
              remoteStream.hasAudio() + ' hasVideo: ' + remoteStream.hasVideo());
            console.log("更新流--内容长度:"+$("#"+remoteStream.getUserId()+'video').children().length);
            console.log($('#'+remoteStream.getUserId()+'video').html());
            // alert($('#'+remoteStream.getUserId()+'video').html());
            // 网络断开时间短-没有走断流-直接走更新-重新设置流
            if (this.platform != 0) {
                $('.discussList').append("<li><p>远端流更新,长度："+$("#"+remoteStream.getUserId()+'video').children().length+"</p></li>");
            }
        });

        // 监听‘stream-subscribed’事件
        this.trtcClient.on('stream-subscribed', event => {
            // 远端流订阅成功
            const remoteStream = event.stream;
            var _this = this;
            console.log("设置远端流----开始");
            if (this.platform != 0) {
                $('.discussList').append("<li><p>远端流订阅</p></li>");
            }
            setRemoteStream(remoteStream);
        });

        this.trtcClient.on('connection-state-changed', event => {
            console.log('connection-state-changed:', event.state);
        });

        this.trtcClient.on('peer-join', event => {
            console.log('peer-join', event)
            const userId = event.userId;
        });

        this.trtcClient.on('peer-leave', event => {
            console.log('peer-leave', event)
            const userId = event.userId;
        });

        this.trtcClient.on('mute-audio', event => {
            console.log('mute-audio', event)
            const userId = event.userId;
            console.log(`${userId}关闭了麦克风`);
        });

        this.trtcClient.on('mute-video', event => {
            console.log('mute-video', event)
            const userId = event.userId;
            console.log(`${userId}关闭了摄像头`);
        });

        this.trtcClient.on('unmute-audio', event => {
            console.log('unmute-audio', event)
            const userId = event.userId;
            console.log(`${userId}打开了麦克风`);
        });

        this.trtcClient.on('unmute-video', event => {
            console.log('unmute-video', event)
            const userId = event.userId;
            console.log(`${userId}打开了摄像头`);
        });

        this.trtcClient.on('error', error => {
            console.error('client error observed: ' + error);
            const errorCode = error.getCode().toString(16);
            console.error(errorCode);
            var _this = this;
            var text = "trtc报错：";
            // 根据ErrorCode列表查看详细错误原因。
            if (errorCode == '1000') { 
                text += "无效参数";
            } else if (errorCode == '1001') {
                text += "非法操作";
            } else if (errorCode == '4001') {
                text += "信令通道建立失败";
            } else if (errorCode == '4002') {
                text += "信令通道错误";
            } else if (errorCode == '4003') {
                text += "ICE Transport 连接错误";
            } else if (errorCode == '4004') {
                text += "进房失败";
            } else if (errorCode == '4005') {
                text += "创建 sdp offer 失败";
            } else if (errorCode == '4040') {
                text += "用户被踢出房间";
            } else if (errorCode == '4041') {
                text += "媒体传输服务超时";
            } else if (errorCode == '4042') {
                text += "远端流订阅超时";
            } else if (errorCode == '4043') {
                text += "自动播放被禁止错误";
            } else if (errorCode == 'FFFF') {
                text += "未知错误";
            }
                text += "<br/>,请检查网络后刷新或联系管理员！";

            if (this.platform != 0) {
                $('.discussList').append("<li><p>trtc报错：("+text+")</p></li>");
                text = "所用浏览器不支持接收视频流，请切换浏览器！";
            }
            layer.open({
                type: 1
                ,offset: 'auto'
                ,title: false
                ,id: 'layerDemo'+'auto'
                ,content: '<div style="padding: 20px;color:#fff;">'+ text +'</div>'
                ,btn: '刷新'
                ,btnAlign: 'c' //按钮居中
                ,shade: false //不显示遮罩
                ,yes: function(){
                    _this.bmstic.quitOnError();
                    window.location.reload();
                    // location.replace(location.href);
                    layer.closeAll();
                }
            });
        });


    };
   
    var play = function(remoteStream) {
        $('.discussList').append("<li><p>监听weixinjs--开始</p></li>");
        document.removeEventListener("WeixinJSBridgeReady", play);
        $('.discussList').append("<li><p>"+remoteStream.getId()+"</p></li>");
        document.getElementById('video_'+remoteStream.getId()).play();
        document.getElementById('audio_'+remoteStream.getId()).play();
        $('.discussList').append("<li><p>监听weixinjs--结束</p></li>");
    };
    // 设置远端流
    var setRemoteStream = function (remoteStream) {
        var _this = this;
        if ($('#live'+remoteStream.getUserId()).length > 0) {
            
            remoteStream.on('player-state-changed', event => {
                console.log("远端流----播放状态改变:"+event.state);
                // $('.discussList').append("<li><p>播放状态改变:"+event.state+"</p></li>");
                if (event.state === 'PAUSED') {
                    
                }
            });
            
            // 设置远端流
            let remoteVideoWrapEl = document.getElementById('live'+remoteStream.getUserId());
            remoteStream.play(remoteVideoWrapEl).then(() => {
                console.log("设置远端流-----play成功");
                console.log("接收远端流id:"+remoteStream.getUserId());
                console.log("接收远端流,是否有视频流:"+remoteStream.hasVideo());
                if (this.platform == 0) {
                    // 设置声音
                    var interva_name = "remoteInterval_"+remoteStream.getUserId(); 
                    this.interva_name = setInterval(() => {
                        const level = remoteStream.getAudioLevel();
                        _this.bmsajax.setvolume(remoteStream.getUserId(), level);
                    }, 300);
                }
            }).catch((e) => {
                console.log(e);
                const errorCode = e.getCode();
                console.log("设置远端流--play失败："+ errorCode);
                if (errorCode === 0x4043) {
                    // 手动播放
                    remoteStream.resume();
                }
                if (this.platform != 0) {
                    $('.discussList').append("<li><p>远端流play失败("+errorCode+")</p></li>");
                }
            });
        }
    }
   
    // 摄像头推流1
    var startRTC = function() {
        var push_video = push_audio = false;
        // 1.先获取摄像头设备
        var devicesCameras_teamp = this.TRTC.getCameras();
        devicesCameras_teamp.then(function(result) {
            push_video = result.length == 0 ? false : true;
            console.log("是否具有摄像头:"+push_video);
            // 2.获取麦克风设备
            var devicesMicrophones_teamp = this.TRTC.getMicrophones();
            devicesMicrophones_teamp.then(function(result_mic) {
                push_audio = result_mic.length == 0 ? false : true;
                console.log("是否具有麦克风:"+push_audio);
                if (!push_video || !push_audio) {
                    if (!push_video) {
                        layer.msg("本地没有摄像头，请连接！");
                    }
                    if (!push_audio) {
                        layer.msg("本地没有麦克风，请连接！");
                    }
                    $(".gantanhao").show(); // 设备检测显示感叹号
                }
                if (push_video && push_audio) {
                    $(".gantanhao").hide();
                }
                if (!push_video && !push_audio) {
                    layer.msg("本地没有摄像头以及麦克风，请连接！");
                    this.isstart = true;
                } else {
                    pushRTC(push_video, push_audio);
                }
            });
        });
    }
    // 摄像头推流2
    var pushRTC = function (push_video, push_audio) {
        // 从麦克风和摄像头采集本地音视频流
        let cameraStream = this.TRTC.createStream({
            audio: push_audio,
            video: push_video
        });
        // 设置视频分辨率等参数
        cameraStream.setVideoProfile({ width: 480, height: 480, frameRate: 15, bitrate: 900 });

        if (this.localStream && this.isPushing) { // 如果正在推流, 先停止发布流
            stopPush(() => {
                publishLocalStream(cameraStream, 1);
            });
        } else {
            publishLocalStream(cameraStream, 1);
        }
    }
    // 屏幕分享
    var pushScreen = function() {
        // 是否支持屏幕分享
        let status = this.TRTC.isScreenShareSupported();
        if(status) {
            clearInterval(this.localLevel_time);
            // 从麦克风和摄像头采集本地音视频流
            let screenStream = this.TRTC.createStream({
                audio: true,
                screen: true
            });

            // 设置视频分辨率等参数
            screenStream.setScreenProfile({
                width: 1920,
                height: 1080,
                frameRate: 15,
                bitrate: 1600 /* kbps */
            });
            if (this.localStream && this.isPushing) { // 如果正在推流, 先停止发布流
                stopPush(() => {
                    publishLocalStream(screenStream, 2);
                });
            } else {
                //console.log("取消分享");
                publishLocalStream(screenStream, 2);
            }
            
        } else {
            layer.msg("当前浏览器不支持屏幕分享");
        }
    };

    //本地推流 
    var publishLocalStream = function(localStream, type) {
        var _this = this;
        window.localStream = localStream;
        localStream.initialize().catch(error => {
            console.log("获取本地流失败(1)");
            console.log(error);
            if (type == 1) { //白板教学
                if (error == "NotReadableError: Could not start source" || error == "DOMException: Could not start source") {
                    show_error("获取本地流失败(1),<br/>没有找到视频设备<br/>(关闭其他使用或重启电脑)！<br/>");
                } else {
                    show_error("获取本地流失败(1),<br/>请刷新页面或检查设备！<br/>"+error);
                }
            } else { // 屏幕分享DOMException: Permission denied
                if (error == "NotAllowedError: Permission denied" || error == "DOMException: Permission denied") {
                    layer.msg("用户取消了屏幕分享即将进行白板教学！");
                }
                // 跳转到白板教学
                $(".roomtype2").click();
            }
        }).then(() => {
            console.log("本地流-----开始");
            if (localStream.getMediaStream()) {
                // 发布本地流（远端可收到）
                this.trtcClient && this.trtcClient.publish(localStream).then(() => {
                    // 本地流发布成功
                    _this.isPushing = 1; // 正在推流
                    _this.localStream = localStream;
                    
                    // 设置本地流
                    // 必须的有play   不然下面的声音为0
                    // var localVideoWrapEl = $(".live"+localStream.getUserId()+" .videodiv")[0];
                    var localVideoWrapEl = document.getElementById("live"+_this.users.hash_id);
                    // 本地流播放
                    localStream.play(localVideoWrapEl, {
                      muted: true
                    }).then(() => {
                        console.log("设置本地流----play成功");
                        this.isstart = true;
                        // 设置声音
                        _this.localLevel_time = setInterval(() => {
                            const level = _this.localStream.getAudioLevel();
                            _this.bmsajax.setvolume(_this.users.hash_id, level);
                        }, 300);

                    }).catch((e) => {
                        const errorCode = e.getCode();
                        console.log("设置本地流----失败："+errorCode);
                        if (errorCode === 0x4043) {
                            // PLAY_NOT_ALLOWED,引导用户手势操作恢复音视频播放
                            localStream.resume()
                        }
                    });

                    localStream.on('player-state-changed', event => {
                        console.log("本地流----播放状态改变："+event.state);
                        if (event.state === 'PAUSED') {
                            localStream.resume();
                        }
                    });
                }).catch(error => {
                    console.log("发布本地流失败(2)");
                    console.log(error);
                    show_error("发布本地流失败(2),<br/>请刷新页面或检查设备！");
                });
            }
        }).catch(error => {
            show_error("获取本地流失败(3),<br/>请刷新页面或检查设备！"); 
            // console.log(`获取本地流失败, ${JSON.stringify(error)}`);
        });
    }

    /**
     * 结束推流
    */
    var stopPush = function(callback) {
        if (this.localStream && this.isPushing) {
            this.trtcClient.unpublish(this.localStream).then(() => {
                this.isPushing = 0;
                this.localStream.stop();
                this.localStream = null;
                if (Object.prototype.toString.call(callback) === '[object Function]') {
                    callback();
                }
            });
        }
    };

    /*
    * 计算远端流网络状态
    * packetsReceived  已接收包数
    * packetsLost 丢包数
    */ 
    var getRemoteVideoStats = function () {
        var _this = this; 
        var old_data = [];
        setInterval(() => {
            this.trtcClient.getRemoteVideoStats().then(stats => {
                // new - old = 差
                for (let userId in stats) {
                    var x_packetsReceived  = stats[userId].packetsReceived - (old_data[userId] ? old_data[userId].packetsReceived : 0);
                    var x_packetsLost = stats[userId].packetsLost - (old_data[userId] ? old_data[userId].packetsLost : 0);
                    // 丢包率
                    var num = x_packetsReceived==0 ? 0 : x_packetsLost/(x_packetsReceived+x_packetsLost)*100;
                    if (x_packetsReceived == 0) { //红色
                        _this.bmsajax.setnetwork(userId, 1);
                    } else {
                        if (num <= 1) { //3绿色
                            _this.bmsajax.setnetwork(userId, 3);
                        } else if (num > 1 && num <=10) { //2黄色
                            _this.bmsajax.setnetwork(userId, 2);
                        } else { //1红色
                            _this.bmsajax.setnetwork(userId, 1);
                        }
                    }
                }
                old_data = stats;
            });
        }, 1000);
    }

    // rtc 错误提示
    var show_error = function (text) {
        var _this = this;
        layer.open({
            type: 1
            ,offset: 'auto' 
            ,id: 'layerDemo'+'auto' //防止重复弹出
            ,content: '<div style="padding: 20px 100px;">'+ text +'</div>'
            ,btn: ['刷新', '设备检测']
            ,btnAlign: 'c' //按钮居中
            ,shade: 0 //不显示遮罩
            ,yes: function(){
                _this.bmstic.quitOnError();
                location.replace(location.href);
            }
            ,btn2: function(){
                layer.closeAll();
                $(".switchbtn").click();
            }
        });
    }
    // 摄像头开关
    var toggleCamera = function() {
        this.enableCamera = !this.enableCamera;
        if (this.localStream) {
            this.enableCamera ? this.localStream.unmuteVideo() : this.localStream.muteVideo();
        }
    }

    // 麦克风开关
    var toggleMic = function() {
        this.enableMic = !this.enableMic
        if (this.localStream) {
            this.enableMic ? this.localStream.unmuteAudio() : this.localStream.muteAudio();
        }
    };

    // 枚举摄像头
    var getCameraDevices = function() {
        var WebRTC = this.tic.getWebRTCInstance();
        WebRTC.getVideoDevices(devices => {
            this.devices.camera = devices;
        });
    };

    // 切换摄像头
    var switchCamera = function() {
        if (this.cameraIndex < 0) {
          return;
        }
        if (this.localStream) {
            this.localStream.switchDevice('video', this.devices.camera[this.cameraIndex]).then(() => {}); 
        }
    };

    // 枚举麦克风
    var getMicDevices = function() {
        var WebRTC = this.tic.getWebRTCInstance();
        WebRTC.getAudioDevices(devices => {
            this.devices.mic = devices;
        });
    };

    // 切换麦克风
    var switchMic = function() {
        if (this.micIndex < 0) {
          return;
        }
        if (this.localStream) {
            this.localStream.switchDevice('audio', this.devices.mic[this.micIndex]).then(() => {});  
        }
    };
    
    var switchrole = function(isspeak) {
        if (isspeak == '1') {
            this.trtcClient.switchRole('anchor').then(() => {
                startRTC();
            });
        } else if (isspeak == '0') {
            if (this.localStream && this.isPushing) {
                this.trtcClient.unpublish(this.localStream).then(() => {
                    clearInterval(this.localLevel_time);
                    this.isPushing = 0;
                    this.localStream.stop();
                    this.localStream = null;
                    this.trtcClient.switchRole('audience').then(() => {
                        
                    });
                });
            }
            
        }
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
        }, switchrole: function (isspeak){
            switchrole(isspeak);
        }, initTRTCEvent: function() {
            initTRTCEvent();
        }, getRemoteVideoStats: function() {
            getRemoteVideoStats();
        }, stop: function () {
            stopPush();
        }, switchrtc: function (camera, mic){
            switchrtc(camera, mic);
        }
    };

}();
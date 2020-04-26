// im即时聊天管理
var bmsim = function () {
    
    var common = function(){
        var _this = this;
        this.tic.addTICMessageListener({
        
            /**
            * 收到C2C文本消息
            * @param fromUserId		发送此消息的用户id
            * @param text				收到消息的内容
            * @param textLen			收到消息的长度
            */
            onTICRecvTextMessage: (fromUserId, text, textLen) => {
            },
            
            /**
            * 收到C2C自定义消息
            * @param fromUserId		发送此消息的用户id
            * @param data				收到消息的内容
            * @param dataLen			收到消息的长度
            */
            onTICRecvCustomMessage: (fromUserId, data, textLen) => {
            },
            
            /**
            * 收到群文本消息
            * @param fromUserId		发送此消息的用户id
            * @param text				收到消息的内容
            * @param textLen			收到消息的长度
            */
            onTICRecvGroupTextMessage: (fromUserId, text, textLen) => {
            },
            
            /**
            * 收到群自定义消息
            * @param fromUserId		发送此消息的用户id
            * @param data				收到消息的内容
            * @param dataLen			收到消息的长度
            */
            onTICRecvGroupCustomMessage: (fromUserId, data, textLen) => {
            },
            
            /**
            * 所有消息
            * @param msg	IM消息体
            * @note 所有收到的消息都会在此回调进行通知，包括前面已经封装的文本和自定义消息（白板信令消息除外）
            */
            onTICRecvMessage(msg) {
            }
        });
        
        this.tic.addTICEventListener({
            onTICMemberJoin: (members) => {
                // 进入课堂提醒，由于没有昵称等参数，弃用
            },

            onTICMemberQuit: (members) => {
                // 退出课堂提醒，由于没有昵称等参数，弃用
            },

            onTICClassroomDestroy: () => {
            },
            onTICTrtcClientCreated: () => {
                if (this.platform != 0) {
                    $('.discussList').append("<li><p>client创建成功</p></li>");
                }
                console.log("client创建成功------------");
            }
        });
        
        this.tic.addTICStatusListener({
            onTICForceOffline: () => {
                alert("当前账号已在其他地方登录！");
            }
        });
    };
    
    // 上下台状态，hash_id为哈希，status为人员权限，nickname为昵称
    var platstatus = function (hash_id, status, nickname) {
        if (hash_id == this.users.hash_id) {
            if (status['plat'] == 1) {   // 上台
                this.isspeak = true;
                if (this.isenter && !this.isPushing) {
                    this.bmsrtc.start();
                }
            } else {                // 下台
                this.isspeak = false;
                // 断流
                this.bmsrtc.stoppush();
            }
        }
        if (status['plat'] == 1) {
            // 更改样式
            if ($("#users"+hash_id).length == 0) {
                this.bmsajax.plathtml(hash_id, this.permission[hash_id]);
                this.bmsajax.usersinfo([hash_id]);
            }
            $(".users"+hash_id+" .plat").addClass("plat1").removeClass("plat2");
            $(".users"+hash_id+" .eye").addClass("eye1").removeClass("eye2");
            if (nickname) {
                showToast("讲师邀请 "+nickname+" 上台了");
            }
        } else {
            voicestatus(hash_id, status, '');
            boardstatus(hash_id, status, '');
            // 更改样式
            $(".users"+hash_id+" .plat").addClass("plat2").removeClass("plat1");
            $(".users"+hash_id+" .eye").addClass("eye2").removeClass("eye1");
            if (nickname) {
                showToast("讲师请 "+nickname+" 下台了");
            }
            // 删除布局
            $("#users"+hash_id).remove();
        }
    };
     
    // 授权白板、取消授权
    var boardstatus = function (hash_id, status, nickname) {
        if (hash_id == this.users.hash_id) {
            if (status['board'] == 1) {
                this.isboard = true;
                // 白板状态
                if (this.teduBoard) {
                    this.teduBoard.setDrawEnable(true);
                }
                // 白板工具框
                $("#edu-toolbar-fieldset").show();
                $("#edu-toolbar-box").show();
                $(".operate").show();
                $(".boardTab").show();
            } else {
                this.isboard = false;
                // 关闭白板
                if (this.teduBoard) {
                    this.teduBoard.setDrawEnable(false);
                }
                // 白板工具框
                $("#edu-toolbar-fieldset").hide();
                $("#edu-toolbar-box").hide();
                $(".operate").hide();
                $(".boardTab").hide();
            }
        }
        if (status['board'] == 1) {
            // 更改样式
            $(".users"+hash_id).find(".board").addClass("board1").removeClass("board2");
            $("#users"+hash_id).find(".authorize").removeClass("hide");
            $("#users"+hash_id).find(".icon02").addClass("current").attr("title", "取消授权");
            if (nickname) {
                showToast("讲师允许了 "+nickname+" 操作白板");
            }
        } else {
            // 更改样式
            $(".users"+hash_id).find(".board").addClass("board2").removeClass("board1");
            $("#users"+hash_id).find(".authorize").addClass("hide");
            $("#users"+hash_id).find(".icon02").removeClass("current").attr("title", "授权");
            if (nickname) {
                showToast("讲师禁止了 "+nickname+" 操作白板");
            }
        }
    };  
    
    // 禁麦、开麦
    var voicestatus = function (hash_id, status, nickname) {
        if (hash_id == this.users.hash_id) {
            if (status['voice'] == 1) {
                this.isvoice = true;
                this.mic = true;
                // 打开语音
                if (this.localStream && localStream.getMediaStream() && localStream.hasAudio()) {
                    this.localStream.unmuteAudio()
                }
            } else {
                this.isvoice = false;
                this.mic = false;
                // 静音
                if (this.localStream && localStream.getMediaStream() && localStream.hasAudio()) {
                    this.localStream.muteAudio()
                }
            }
        }
        if (status['voice'] == 1) {
            // 更改样式
            $(".users"+hash_id).find(".voice").addClass("voice1").removeClass("voice2");
            $("#users"+hash_id).find(".micicon").addClass("micicon1").removeClass("micicon2");
            $("#users"+hash_id).find(".icon01").addClass("current").attr("title", "静音");
            if (nickname) {
                showToast("讲师打开了 "+nickname+" 的麦克风");
            }
        } else {
            // 更改样式
            $(".users"+hash_id).find(".voice").addClass("voice2").removeClass("voice1");
            $("#users"+hash_id).find(".micicon").addClass("micicon2").removeClass("micicon1");
            $("#users"+hash_id).find(".icon01").removeClass("current").attr("title", "连麦");
            if (nickname) {
                showToast("讲师禁止了 "+nickname+" 的麦克风");
            }
        }
    }; 
     
    var chatstatus = function(){
        if (this.onoff && this.onoff['ischat'] == 1) {
            $('.discussList').append("<li class='yellow'><b>系统消息：允许全员发送讨论消息</b></li>");
            $(".banbtn").attr("title", "禁止全员发送消息");
        } else {
            $('.discussList').append("<li class='yellow'><b>系统消息：禁止全员发送讨论消息</b></li>");
            $(".banbtn").attr("title", "允许全员发送消息");
        }
        $(".discussList").animate({scrollTop:$(".discussList").prop("scrollHeight")}, 400);
    };
    
    var handstatus = function(){
        if (this.onoff && this.onoff['ishand'] == 1) {
            $(".handimg").addClass("handimg1").removeClass("handimg2");
        } else {
            $(".handimg").addClass("handimg2").removeClass("handimg1");
        }
    };
    
    var studenthand = function(hash_id, nickname, type){
        if (type == 1) {
            $("#users"+hash_id+" .hands").show();
            $(".handUpBtn").addClass("shan");
            $(".users"+hash_id).find(".hand").addClass("hand1").removeClass("hand2");
            if ($("#users"+hash_id).length==0) {
                $(".handUpList").append("<p class='hand"+hash_id+"'><b>"+nickname+"</b><i class='onplat' data-hash_id='"+hash_id+"'></i></p>");
            } else {
                $(".handUpList").append("<p class='hand"+hash_id+"'><b>"+nickname+"</b></p>");
            }
            
            $(".handcount").html(parseInt($(".handcount").html())+1);
        } else {
            $(".handUpList .hand"+hash_id).remove();
            if ($(".handUpList>p").length == 0) {
                $(".handUpBtn").removeClass("shan");
            }
            $("#users"+hash_id+" .hands").hide();
            $(".users"+hash_id).find(".hand").addClass("hand2").removeClass("hand1");
            var num = parseInt($(".handcount").html()) < 1 ? 0 : parseInt($(".handcount").html()) - 1;
            $(".handcount").html(num);
        }
    };
    
    // 发送普通文本消息
    var sendmsg = function(){
        var _this = this;
        var issend = true;
        $(document).on("click", "#chatbtn", function(){
            if(!_this.islogin){
                showToast('已退出课堂无法发送消息', 'error');
                return;
            }
            if(_this.onoff['ischat'] == 0 && !_this.isteacher){
                showToast('讲师已禁止全员讨论', 'error');
                return;
            }
            if(!issend){
                showToast('不可频繁发送消息', 'error');
                return;
            }
            var text = $('#chattext').val();
            var tousers = $('#tousers').val();
            if(text==''){
                showToast('请输入消息内容', 'error');
            }else{
                var data = '{"hash_id":"'+_this.users.id+'","nickname":"'+_this.users.nickname+'","type":"TEXT","text":"'+text+'"}';
                if (tousers) {
                    _this.socket.emit('im', {
                        type: "TEXT",
                        to_user: tousers,
                        hash_id: _this.users.id,
                        nickname: _this.users.nickname,
                        text: text
                    });
                    // _this.tic.sendCustomMessage(tousers, data, function (res) {
                    //     console.log('===sendTextMessage:', res);
                    // });
                } else { // 群组 文本
                    if(_this.course.status == 2){
                        showToast('已下课无法发送消息', 'error');
                        return;
                    }
                    _this.socket.emit('im', {
                        type: "TEXT",
                        hash_id: _this.users.id,
                        nickname: _this.users.nickname,
                        text: text
                    });
                    // _this.tic.sendGroupCustomMessage(data, function (res) {
                    //     console.log('===sendTextMessage:', res);
                    // });
                }
                $('#chattext').val('');
                issend = false;
                setTimeout(function() {  
                    issend = true;  
                }, 5000);
            }
        });
        $('#chattext').keydown(function(event){
            if (event.keyCode ==13) {
                $('#chatbtn').click();
                return false;
            }
        });
        $(document).on("click", ".discussBtn", function(){
            if (_this.isenter) {
               if ($('.dialog').is(':hidden')) {
                    $('.dialog').show();
                    _this.ischat = true;
                    $(".discussBtn .redDot").hide();
                } else {
                    $('.dialog').hide();
                    _this.ischat = false;
                } 
            }
        });
        
        $(document).on("click", ".closebtn", function(){
            $('.dialog').hide();
            _this.ischat = false;
        });
        
        $(document).on("click", ".banbtn", function(){
            if (_this.onoff['ischat'] == 1) {
                swal.fire({   
                    title: "提示",   
                    text: "确定要禁止全员发送消息吗？",   
                    icon: "warning",   
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    showCancelButton: true
                }).then((result) => {
                    if (result.value) {
                        _this.socket.emit('onoff', {
                            type: 'ischat',
                            status: 0
                        });
                        $(".banbtn").attr("title", "允许全员发送消息");
                    }
                });
            } else {
                swal.fire({   
                    title: "提示",   
                    text: "确定要允许全员发送消息吗？",   
                    icon: "warning",  
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    showCancelButton: true
                }).then((result) => {
                    if (result.value) {
                        _this.socket.emit('onoff', {
                            type: 'ischat',
                            status: 1
                        });
                        $(".banbtn").attr("title", "禁止全员发送消息");
                    }
                });
            }
        });
    };
    
    // 发送自定义消息，c2c或群组
    var sendcustommsg = function(touser, data){
        if (touser) { // C2C 自定义
            this.tic.sendCustomMessage(touser, data, function (res) {
            });
        } else { //群组 自定义
            this.tic.sendGroupCustomMessage(data, function (res) {
            });
        }
    };
    
    var showToast = function(text, icon = 'success', timer = 3000, position = 'top-right'){
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: timer,
            timerProgressBar: true,
            onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
        Toast.fire({
            icon: icon,
            title: text
        })
    };
    
    return {
        init: function () {
            //common();
            sendmsg();
        },sendcustom: function (touser, data) {
            sendcustommsg(touser, data);
        },toast: function (text, icon, position, loaderBg) {
            showToast(text, icon, position, loaderBg);
        },studentspeakbtn: function (type){
            studentspeakbtn(type);
        },roomchat: function () {
            roomchat();
        },platstatus: function (hash_id, status, nickname) {
            platstatus(hash_id, status, nickname);
        },voicestatus: function (hash_id, status, nickname) {
            voicestatus(hash_id, status, nickname);
        },boardstatus: function (hash_id, status, nickname) {
            boardstatus(hash_id, status, nickname)
        },chatstatus: function () {
            chatstatus()
        },handstatus: function () {
            handstatus()
        },studenthand: function (hash_id, nickname, type) {
            studenthand(hash_id, nickname, type);
        }
    };

}();
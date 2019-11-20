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
                var json = JSON.parse(data);
                if (json.type == 'SPEAK') {                  // 老师邀请上台，或允许上台
                    speakstatus(json.users_id, json.text);
                    if (json.text == '1') {
                        showToast("讲师邀请 "+json.nickname+" 上台");
                    } else {
                        showToast("讲师允许 "+json.nickname+" 上台");
                    }
                } else if (json.type == 'NOSPEAK') {                // 老师请学生下台
                    speakstatus(json.users_id, '0');
                    showToast("讲师请 "+json.nickname+" 下台了");
                } else if (json.type == 'HAND') {                   // 学生举手
                    if (this.isteacher) {
                        $("#users"+json.users_id+" .hands").show();
                        showToast(""+json.nickname+" 举手要求上台");
                    }
                } else if (json.type == 'TEXT') {
                    if (_this.course.teacher_id == json.users_id) {
                        $('.discussList').append("<li class='yellow'>" + json.nickname + "：" + json.text + "</li>");
                    } else {
                       $('.discussList').append("<li>" + json.nickname + "：" + json.text + "</li>"); 
                    }
                    if (_this.ischat) {
                        $(".discussBtn .redDot").hide();
                    } else {
                        $(".discussBtn .redDot").show();  
                    }
                } else if (json.type == 'BOARD') {  //白板模式
                    showToast('讲师切换为白板教学模式');
                } else if (json.type == 'SHARE') { //屏幕分享模式
                    showToast('讲师切换为屏幕共享模式');
                } else if (json.type == 'CHAT') {  //禁止，解除聊天
                    if (json.text == '1') {
                        $('.discussList').append("<li class='yellow'><b>系统消息：允许全员发送讨论消息</b></li>");
                    } else {
                        $('.discussList').append("<li class='yellow'><b>系统消息：禁止全员发送讨论消息</b></li>");
                    }
                } else if (json.type == 'ZAN') {  //点赞
                    $("#users"+json.users_id+" .zannum").html(json.text);
                    showToast("讲师给 "+json.nickname+" 点了个赞");
                } else if (json.type == 'KICK') {  //踢出
                    if (json.users_id == this.users.id) {
                        this.bmstic.kick();
                        $("#paint_box").remove();
                        $(".gatherBox").html("");
                    } else {
                        $("#users"+json.users_id).remove();
                        showToast("讲师将 "+json.nickname+" 踢出了课堂");
                    }
                } else if (json.type == 'ALLSPEAK') { //全员上台，下台
                    speakstatus('', json.text);
                    if (json.text == '1') {
                        showToast('讲师邀请全员上台');
                    } else {
                        showToast('讲师请全员下台了');
                    }
                } else if (json.type == 'ALLHAND') { //允许，禁止举手
                    if (json.text == '1') {
                        showToast('讲师允许学员举手');
                    } else {
                        showToast('讲师禁止学员举手');
                    }
                }
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
            }
        });
        
        this.tic.addTICStatusListener({
            onTICForceOffline: () => {
                alert("当前账号已在其他地方登录！");
            }
        });
    };
    
    // 上下台状态，users_id为空表示全员，有值指单人，isspeak为0是下台，为1是上台
    var speakstatus = function (users_id, isspeak) {
        if (users_id == this.users.id) {
            if (isspeak == '1') {
                this.isspeak = true;
                this.TRTC.openAudio();
                this.teduBoard.setDrawEnable(true);
                $("#edu-toolbar-box").show();
                $("#users"+users_id).addClass("speaking").show();
            } else {
                this.isspeak = false;
                this.TRTC.closeAudio();
                this.teduBoard.setDrawEnable(false);
                $("#edu-toolbar-box").hide();
                $("#users"+users_id).removeClass("speaking").show();
            }
        } else if (users_id == '') {
            if (isspeak == '1') {
                if (this.isteacher) {
                    $(".studentHead").addClass("speaking").show();
                    $(".studentHead .icon01").addClass("current").attr("title", "下台");
                } else {
                    this.isspeak = true;
                    this.TRTC.openAudio();
                    this.teduBoard.setDrawEnable(true);
                    $("#edu-toolbar-box").show();
                    $(".studentHead").addClass("speaking").show();
                }
            } else {
                if (this.isteacher) {
                    $(".studentHead").removeClass("speaking").show();
                    $(".studentHead .icon01").removeClass("current").attr("title", "上台");
                } else {
                    this.isspeak = false;
                    this.TRTC.closeAudio();
                    this.teduBoard.setDrawEnable(false);
                    $("#edu-toolbar-box").hide();
                    $(".studentHead").removeClass("speaking").hide();
                    $("#users"+this.users.id).show();
                }
            }
        } else {
            if (isspeak == '1') {
                $("#users"+users_id).addClass("speaking").show();
                if (this.isteacher) {
                    $("#users"+users_id+" .icon01").addClass("current").attr("title", "下台");
                }
            } else {
                if (this.isteacher) {
                    $("#users"+users_id).removeClass("speaking").show();
                    $("#users"+users_id+" .icon01").removeClass("current").attr("title", "上台");
                } else {
                    $("#users"+users_id).removeClass("speaking").hide();
                }
            }
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
            }console.log(_this.room.roomchat);
            if(!_this.room.roomchat){
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
                var data = '{"users_id":"'+_this.users.id+'","nickname":"'+_this.users.nickname+'","type":"TEXT","text":"'+text+'"}';
                if (tousers) {
                    _this.tic.sendCustomMessage(tousers, data, function (res) {
                        console.log('===sendTextMessage:', res);
                    });
                } else { // 群组 文本
                    if(!_this.isenter){
                        showToast('上课之前无法发送消息', 'error');
                        return;
                    }
                    _this.tic.sendGroupCustomMessage(data, function (res) {
                        console.log('===sendTextMessage:', res);
                    });
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
            if ($('.dialog').is(':hidden')) {
                $('.dialog').show();
                _this.ischat = true;
                $(".discussBtn .redDot").hide();
            } else {
                $('.dialog').hide();
                _this.ischat = false;
            }
        });
        
        $(document).on("click", ".closebtn", function(){
            $('.dialog').hide();
            _this.ischat = false;
        });
        
        $(document).on("click", ".banbtn", function(){
            if (_this.room.roomchat) {
                swal.fire({   
                    title: "提示",   
                    text: "确定要禁止全员讨论吗？",   
                    icon: "warning",   
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    showCancelButton: true
                }).then((result) => {
                    if (result.value) {
                        _this.room.roomchat = 0;
                        _this.bmsajax.roomchat();
                        sendcustommsg('', '{"nickname":"","type":"CHAT","text":"0"}');
                        $(".banbtn").attr("title", "解除全员讨论");
                    }
                });
            } else {
                swal.fire({   
                    title: "提示",   
                    text: "确定要解除禁止讨论吗？",   
                    icon: "warning",  
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    showCancelButton: true
                }).then((result) => {
                    if (result.value) {
                        _this.room.roomchat = 1;
                        _this.bmsajax.roomchat();
                        sendcustommsg('', '{"nickname":"","type":"CHAT","text":"1"}');
                        $(".banbtn").attr("title", "禁止全员讨论");
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
    
    var showToast = function(text, icon = 'success', position = 'top-right'){
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
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
            common();
            sendmsg();
        },sendcustom: function (touser, data) {
            sendcustommsg(touser, data);
        },toast: function (text, icon, position, loaderBg) {
            showToast(text, icon, position, loaderBg);
        },studentspeakbtn: function (type){
            studentspeakbtn(type);
        },roomchat: function () {
            roomchat();
        },speakstatus: function (users_id, isspeak) {
            speakstatus(users_id, isspeak);
        }
    };

}();
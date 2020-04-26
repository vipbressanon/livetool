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
                if (json.type == 'SPEAK') {                  // 老师邀请上台
                    speakstatus(json.users_id, json.nickname, '1', json.text);
                    this.bmsajax.usersinfo(json.users_id, 'onplat');
                    showToast("讲师邀请 "+json.nickname+" 上台");
                } else if (json.type == 'NOSPEAK') {                // 老师请学生下台
                    speakstatus(json.users_id, json.nickname, '0', json.text);
                    this.bmsajax.usersinfo(json.users_id, 'onplat');
                    showToast("讲师请 "+json.nickname+" 下台了");
                } else if (json.type == 'TEXT') {
                    if (this.course.teacher_id == json.users_id) {
                        $('#chatroom-list').append("<div class='yellow'><i>" + json.nickname +"</i>: " + json.text + "</div>");
                    } else {
                       $('#chatroom-list').append("<div><i>" + json.nickname + "</i>: " + json.text + "</div>"); 
                    }
                    $("#chatroom-list").animate({scrollTop:$("#chatroom-list").prop("scrollHeight")}, 400);
                } else if (json.type == 'BOARD') {  //白板模式
                    this.room.roomtype = 2;
                    if($('#zuida'+this.course.teacher_id).length > 0 && !this.isteacher) {
                        $('.teachervideo').prepend($('#zuida'+this.course.teacher_id).find('.videodiv'));
                        $("#layui-layer"+$('.teachervideo').attr('data-index')).remove();
                    }
                    showToast('讲师切换为白板教学模式');
                } else if (json.type == 'SHARE') { //屏幕分享模式
                    this.room.roomtype = 1;
                    if($('#zuida'+this.course.teacher_id).length == 0 && !this.isteacher) {
                        $('.teachervideo .icon-zuidahua').click();
                    }
                    showToast('讲师切换为屏幕共享模式');
                } else if (json.type == 'ZAN') {  //点赞
                    $("#users"+json.users_id+" .zannum").html(json.text);
                    showToast("讲师给 "+json.nickname+" 点了个赞");
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
            },
            onTICTrtcClientCreated: () => {
                console.log("client创建成功------------");
                window.trtcClient = this.trtcClient = this.tic.getTrtcClient();
            }
        });
        
        this.tic.addTICStatusListener({
            onTICForceOffline: () => {
                alert("当前账号已在其他地方登录！");
            }
        });
    };
    
    var speakhtml = function (users_id, hash_id, nickname) {
        var div = "";
        div += '<div id="users'+users_id+'" class="livevideo" data-id="'+users_id+'" data-index="">';
        div += '<div id="live'+hash_id+'" class="videodiv"></div>';
        div += '<div class="zanNum"><i class="roomicon5"></i><b class="zannum">0</b></div>';
        div += '<div class="volume">';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '<div></div>';
        div += '</div>';
        div += '<div class="studentTag align_item">';
        div += '<div class="name row">';
        div += '<div class="micicon"></div>';
        div += '<span class="nickname">'+nickname+'</span>';
        if (this.users.id != users_id) { //远端流 不是自己
            div += '<div class="network">';
            div += '<i></i>';
            div += '</div>';
        }
        div += '</div>';
        div += '<div class="row righticon">';
        div += '<div class="speakicon"></div>';
        div += '</div>';
        div += '</div>';
        div += '<div class="handle">';
        if (this.isteacher) {
            div += '<div class="icon01" title="点赞">';
            div += '<span class="iconfont icon-dianzan"></span>';
            div += '</div>';
            div += '<div class="icon02 teacher-zuidahua" title="点击最大化">';
            div += '<span class="iconfont icon-zuidahua"></span>';
            div += '</div>';
            div += '<div class="icon03" title="下台">';
            div += '<span class="iconfont icon-xueshengshangtai"></span>';
            div += '<i class="iconfont icon-xiantiao"></i>';
            div += '</div>';
        } else {
            div += '<div class="icon04 teacher-zuidahua" title="点击最大化">';
            div += '<span class="iconfont icon-zuidahua"></span>';
            div += '</div>';
        }
        div += '</div>';
        div += '</div>';
        $(".studentvideo").append(div);
    };
    
    // 上下台状态，isspeak为0是下台，为1是上台
    var speakstatus = function (users_id, nickname, isspeak, hash_id) {
        if (isspeak == '1') {
            speakhtml(users_id, hash_id, nickname);
            $(".room-right .tab-content .tabdiv").css('top', '500px');
            if (users_id == this.users.id) {
                this.isspeak = true;
                this.teduBoard.setDrawEnable(true);
                $("#edu-toolbar-box").show();
                this.bmsrtc.switchrole(isspeak);
            }
        } else {
            if (users_id == this.users.id) {
                this.bmsrtc.switchrole(isspeak);
                this.isspeak = false;
                this.teduBoard.setDrawEnable(false);
                $("#edu-toolbar-box").hide();
            }
            $("#users"+users_id).remove();
            if ($(".studentvideo>div").length == 0) {
                $(".room-right .tab-content .tabdiv").css('top', '325px');
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
            }
            if(_this.room.roomchat == 0){
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
                    if(_this.course.status == 2){
                        showToast('已下课无法发送消息', 'error');
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
        
        
        $(document).on("click", ".banbtn", function(){
            if (_this.room.roomchat != 0) {
                swal.fire({   
                    title: "提示",   
                    text: "确定要禁止全员讨论吗？",   
                    icon: "warning",   
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    showCancelButton: true
                }).then((result) => {
                    if (result.value) {
                        _this.bmsajax.roomchat(0);
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
                        _this.bmsajax.roomchat(1);
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
        },speakstatus: function (users_id, nickname, isspeak, hash_id) {
            speakstatus(users_id, nickname, isspeak, hash_id);
        }
    };

}();
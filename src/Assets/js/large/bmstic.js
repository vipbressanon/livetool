// 课堂管理
var bmstic = function () {
    
    // 创建课堂
    var createroom = function(){
        var _this = this;
        this.tic.createClassroom(
            {
                classId: this.room.hash_id,
                classScene: TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE // 1：直播模式 0: 实时模式
            }
            , (res) => {
            if (res.code) {
                this.bmsajax.errors(4, res.desc);
                // 10021 已被他人创建  10025 您已创建
                if ((res.code == 10021 || res.code == 10025) && this.isteacher) {
                    this.socket.emit('create', {
                        teacher_id: _this.users.id
                    });
                }
            } else {
                this.bmsim.toast('创建课堂成功');
                // 如果是老师
                if (this.isteacher) {
                    this.socket.emit('create', {
                        teacher_id: _this.users.id,
                        teacher_hash_id: _this.course.teacher_hash_id
                    });
                }
            }
        });
    };
    
    // 进入课堂
    var joinroom = function(){
        var roommode = TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE;
        var roomrole = TIC.CONSTANT.TICRoleType.TIC_ROLE_TYPE_AUDIENCE;
        if (this.isteacher) {
            roomrole = TIC.CONSTANT.TICRoleType.TIC_ROLE_TYPE_ANCHOR;
        }
        this.room.hash_id && this.tic.joinClassroom({
            classId: this.room.hash_id
        }, {
            mode: roommode,
            role: roomrole
            // mode: TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE //直播模式，支持1000人以上场景
            // mode: TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_VIDEO_CALL, // //实时通话模式，支持1000人以下场景，低延时
            // role: TIC.CONSTANT.TICRoleType.TIC_ROLE_TYPE_ANCHOR // 主播，只在TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE模式下有效
            // role: TIC.CONSTANT.TICRoleType.TIC_ROLE_TYPE_AUDIENCE // 观众（观众角色没有发布本地流的权限，只有收看远端流的权限。如果观众想要连麦跟主播互动， 请先通过 switchRole() 切换角色到主播 anchor 后再发布本地流），只在TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE模式下有效
        }, {
            id: 'paint_box',
            ratio: '4:3',
            drawEnable: true,
            smoothLevel: 0,
            boardContentFitMode: 1,
            toolType: 1
        }, res => {
            if (res.code) {
                this.bmsim.toast('加入课堂失败');
                this.bmsajax.errors(3, res.desc);
            } else {
                this.bmsajax.sendDing(3);
                this.bmsim.toast('加入课堂成功');
                // 更改课堂状态
                this.isenter = true;
                initroom();
                // 白板初始化
                this.teduBoard = this.tic.getBoardInstance();
                this.bmsboard.init();
                
                // 直播流初始化
                this.bmsrtc.init();
                //开始推流
                this.socket.emit('enter');
                if (this.isteacher) {
                    this.bmsrtc.start();
                }
            }
        });
    };
    
    // 进入房间初始化
    var initroom = function(){
        $('.icon-zuidahua').css('pointer-events', 'auto');
        $(".status").hide();
        // 屏幕分享模式
        if (this.room.roomtype == 1) {
            if (this.isteacher) {
                this.bmsim.sendcustom('', '{"nickname":"","type":"SHARE","text":""}');
            } else {
                $('.teacherHead .icon-zuidahua').click();
            }
        }
    };
    
    var enterroom = function(){
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
                joinroom();
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
                joinroom();
            });
        }
    };
    
    // 下课执行退出课堂
    var quitroom = function(){
        this.tic.quitClassroom(res => {
            if (res.code) {
                this.bmsim.toast('退出课堂失败');
                this.bmsajax.errors(5, res.desc);
            } else {
                this.islogin = false;
                this.isenter = false;
                this.isstart = false;
                this.bmsrtc.stop();
                $("#paint_box").hide();
                $(".sideBar").hide();
                $("#edu-toolbar-box").hide();
                $(".livevideo .videodiv").html("");
                $(".livevideo .handle").remove();
                $(".livevideo").removeClass("speaking");
                clearTimeout(this.timeadd);
                clearTimeout(this.interva_name);
                this.bmsajax.sendDing(4);
                this.bmsim.toast('退出课堂成功');
                this.tic.logout((res) => {
                    // 删除事件监听
                    this.tic.removeTICMessageListener();
                    this.tic.removeTICEventListener();
                    this.tic.removeTICStatusListener();
                    location.replace(location.href);
                });
            }
        });
    };

    //网络中断 退出房间
    var quitRoomOnLineError = function(){
        if(this.isenter){
            this.isenter = false;
            this.bmsajax.sendDing(4);
            this.tic.quitClassroom(function(res){
                console.log("退出房间");
                console.log(res);
            });
        }
    }

    
    // 被老师踢出退出课堂
    var kickroom = function(){
        this.tic.quitClassroom(res => {
            if (res.code) {
                this.bmsim.toast('退出课堂失败');
                this.bmsajax.errors(6, res.desc);
            } else {
                this.bmsim.toast('您已被讲师踢出课堂');
                this.tic.logout((res) => {
                    window.setTimeout(function() {
                        window.location.href= "/live/login/"+this.course.hash_id;
                    },1000);
                });
            }
        });
    };
    
    
    return {
        init: function () {
        },create: function () {
            createroom();
        },enter: function(){
            enterroom();
        },quit: function () {
            quitroom();
        },kick: function () {
            kickroom();
        },quitOnError: function () {
            quitRoomOnLineError();
        }
    };

}();
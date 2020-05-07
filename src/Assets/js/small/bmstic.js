// 课堂管理
var bmstic = function () {
    
    // 创建课堂
    var createroom = function(){
        console.log('createroom');
        var _this = this;
        this.tic.createClassroom(
            {
                classId: this.room.hash_id,
                classScene: TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_VIDEO_CALL // 1：直播模式 0: 实时模式
            }
            , (res) => {
            if (res.code) {
                // 10021 已被他人创建  10025 您已创建
                if ((res.code == 10021 || res.code == 10025) && this.isteacher) {
                    console.log('createroom', res.code);
                    joinroom();
                } else {
                    this.bmsajax.errors(4, res.desc);
                }
            } else {
                // this.bmsim.toast('创建课堂成功');
                // 如果是老师
                if (this.isteacher) {
                    joinroom();
                }
            }
        });
    };
    
    // 进入课堂
    var joinroom = function(){
        console.log('joinroom');
        var _this = this;
        var isdraw = this.isteacher ? true : false;
        this.room.hash_id && this.tic.joinClassroom({
            classId: this.room.hash_id
        }, {
             // mode: TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE //直播模式，支持1000人以上场景
            mode: TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_VIDEO_CALL, // //实时通话模式，支持1000人以下场景，低延时
            // role: TIC.CONSTANT.TICRoleType.TIC_ROLE_TYPE_ANCHOR // 主播，只在TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE模式下有效
            // role: TIC.CONSTANT.TICRoleType.TIC_ROLE_TYPE_AUDIENCE // 观众（观众角色没有发布本地流的权限，只有收看远端流的权限。如果观众想要连麦跟主播互动， 请先通过 switchRole() 切换角色到主播 anchor 后再发布本地流），只在TIC.CONSTANT.TICClassScene.TIC_CLASS_SCENE_LIVE模式下有效
        }, {
            id: 'paint_box',
            ratio: '16:9',
            drawEnable: isdraw,
            smoothLevel: 0,
            boardContentFitMode: 1,
            toolType: 1,
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
                // 记录进入房间的时间
                this.socket.emit('enter'); 
                
                window.trtcClient = this.trtcClient = this.tic.getTrtcClient();
                this.bmsrtc.initTRTCEvent();
                this.bmsrtc.getRemoteVideoStats();

                //台上有自己，开放白板，推流
                if ($("#users"+this.users.hash_id).length != 0) {
                    this.bmsrtc.start();
                }
            }
        });
    };
    
    // 进入房间初始化
    var initroom = function(){
        $(".status").hide();
        var _this = this;
    };
    
    var enterroom = function(){
        if (this.isteacher) {
            if (this.course.status == 0) {
                createroom();
            } else {
                joinroom();
            }
        } else {
            joinroom();
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
                this.bmsrtc.stoppush();
                $("#paint_box").hide();
                $(".sideBar").hide();
                $("#edu-toolbar-box").hide();
                $(".livevideo .videodiv").html("");
                $(".livevideo .handle").remove();
                $(".livevideo").removeClass("speaking");
                $(".livevideo .videobg").show();
                clearTimeout(this.timeadd);
                clearTimeout(this.interva_name);
                $(".roomtime").html("");
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
                window.onbeforeunload = () => null;
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
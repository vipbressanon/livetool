// 课堂管理
var bmstic = function () {
    
    // 创建课堂
    var createroom = function(){
        this.tic.createClassroom(this.room.hash_id, (res) => {
            if (res.code) {
                this.bmsim.toast('创建课堂失败');
                this.bmsajax.errors(4, res.desc);
                if (res.code == 10021 && this.isteacher) {    //课堂已存在，直接进入课堂
                    this.socket.emit('create');
                }
            } else {
                this.bmsim.toast('创建课堂成功');
                // 如果是老师
                if (this.isteacher) {
                    this.socket.emit('create');
                }
            }
        });
    };
    
    // 进入课堂
    var joinroom = function(){
        this.room.hash_id && this.tic.joinClassroom(this.room.hash_id, {}, {
            id: 'paint_box',
            ratio: '16:9',
            drawEnable: true,
            smoothLevel: 0,
            boardContentFitMode: 1
        }, res => {
            if (res.code) {
                this.bmsim.toast('加入课堂失败');
                this.bmsajax.errors(3, res.desc);
            } else {
                this.bmsim.toast('加入课堂成功');
                $(".status").hide();
                // 更改课堂状态
                this.isenter = true;
                // 白板初始化
                this.teduBoard = this.tic.getBoardInstance();
                this.teduBoard.setDrawEnable(false);
                this.bmsboard.init();
                // 直播流初始化
                this.TRTC = this.tic.getWebRTCInstance();
                this.bmsrtc.init();
                //开始推流
                this.bmsrtc.start();
                this.socket.emit('enter', {
                    course_id: this.course.id,
                    room_id: this.room.id,
                    users_id: this.users.id,
                    isteacher: this.isteacher
                });
            }
        });
    };
    
    // 下课执行退出课堂
    var quitroom = function(){
        this.tic.quitClassroom(res => {
            if (res.code) {
                this.bmsim.toast('退出课堂失败');
                this.bmsajax.errors(5, res.desc);
            } else {
                this.bmsim.toast('退出课堂成功');
                
                this.tic.logout((res) => {
                    console.log(res);
                });
                clearTimeout(this.timeadd);
                $(".online").html("0");
                $(".status").html('<a class="tag end" href="javascript:;">已下课</a>').show();
            }
        });
    };
    
    // 被老师踢出退出课堂
    var kickroom = function(){
        this.tic.quitClassroom(res => {
            if (res.code) {
                this.bmsim.toast('退出课堂失败');
                this.bmsajax.errors(6, res.desc);
            } else {
                this.bmsim.toast('您已被讲师踢出课堂');
                
                this.tic.logout((res) => {
                    console.log(res);
                });
                clearTimeout(this.timeadd);
                $(".online").html("0");
                $(".status").html('<a class="tag end" href="javascript:;">被讲师踢出</a>').show();
            }
        });
    };
    
    
    return {
        init: function () {
        },create: function () {
            createroom();
        },join: function () {
            joinroom();
        },quit: function () {
            quitroom();
        },kick: function () {
            kickroom();
        }
    };

}();
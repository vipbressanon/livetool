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
        this.TRTC = null;
        this.islogin = false;   //登录im状态
        this.isenter = false;   //进入课堂状态
        this.isstart = false;   //推流开始状态
        this.isspeak = false;   //是否在台上
        this.fileload = false;  //文件正在加载
        this.socket = null;
        // 课程未结束才进行登录
        if (this.course.status < 2) {
            this.tic = new TIC({});
            this.tic.init(this.users.sdkappid, res => {
                login();
            });
        }
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
                this.bmsim.toast('登录成功');
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
                room_id:_this.room.id,
                users_id:_this.users.id
            });
            // 课程已经开始，直接进入课堂
            if (_this.course.status == 1) {
                _this.bmstic.join();
            }
        });
        // 在线人数统计
        this.socket.on('online', function (arr) {console.log(arr);
            _this.bmsajax.online(arr);
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
    };
    
    // 点击按钮开始上课，结束上课
    var roombtn = function(){
        var _this = this;
        $(document).on("click", "#startbtn", function(){
            swal({   
                title: "提示",   
                text: "确定开始上课吗？\n开始上课前，请保证您使用的摄像头、麦克风等设备已插好",   
                icon: "warning",   
                buttons : {
                    button1 : {
                        text : "取消",
                        value : false,
                    },
                    button2 : {
                        text : "我已经准备好了",
                        value : true,
                    }
                }
            }).then(function(value){
                if (value) {
                    $(".status").css('display', 'none');
                    $("#endbtn").removeClass("hide");
                    _this.bmsajax.roomstart();
                }
            });
        });
        $(document).on("click", "#endbtn", function(){
        	if(_this.isenter){
                swal({   
                    title: "提示",   
                    text: "确定要下课吗？一旦结束无法再开启，请谨慎操作！",   
                    icon: "warning",   
                    buttons : {
                        button1 : {
                            text : "取消",
                            value : false,
                        },
                        button2 : {
                            text : "我要下课",
                            value : true,
                        }
                    }
                }).then(function(value){
                    if (value) {
                        _this.islogin = false;
                        _this.isenter = false;
                        _this.isstart = false;
                        _this.bmsajax.roomend();
                    }
                });
        	}
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

        initData();
    };
    
    return {
        init: function (bmstic, bmsim, bmsboard, bmsrtc, bmsajax) {
            common(bmstic, bmsim, bmsboard, bmsrtc, bmsajax);
        }
    };

}();
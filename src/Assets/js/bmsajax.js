// 后台数据交互管理
var bmsajax = function () {
    
    //上课
    var roomstart = function(){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/start",
            dataType: 'json',
            data: {
                course_id:_this.course.id,
                room_id:_this.room.id,
                _token:$("#_token").val()
            },
            success: function(json){
                if (json.error) {
                    _this.bmsim.toast(json.error, 'error');
                } else {
                    _this.bmstic.create();
                }
            }
        });
    };
    
    //下课
    var roomend = function(){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/end",
            dataType: 'json',
            data: {
                course_id:_this.course.id,
                room_id:_this.room.id,
                _token:$("#_token").val()
            },
            success: function(json){
                if (json.error) {
                    _this.bmsim.toast(json.error, 'error');
                } else {
                    _this.socket.emit('over');
                }
            }
        });
    };
    
    var onlineinfo = function(arr){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/online",
            dataType: 'json',
            data: {
                old: _this.roster,
                new: arr,
                room_id: _this.room.id,
                _token: $("#_token").val()
            },
            success: function(json){
                if (json.error) {
                    _this.bmsim.toast(json.error, 'error');
                } else {
                    var teacount = 0;
                    var stucount = 0;
                    $.each(json.add, function(i, v){
                        onlinehtml(v);
                        if (_this.course.teacher_id == v.id) {
                            teacount++;
                        } else {
                            stucount++; 
                        }
                    });
                    $.each(json.cut, function(i, v){
                        $("#users"+v).remove();
                    });
                    _this.roster = arr;
                    $(".teacount").html(teacount);
                    $(".stucount").html(stucount);
                    // 课程已经开始，直接进入课堂
                    if (_this.course.status == 1) {
                        _this.bmstic.join();
                    }
                }
            }
        });
        
    };
    
    var onlinehtml = function(users){
        var str = '';
        var local = '';
        var display = '';
        if (this.users.id == users.id) {
            local = 'id="localvideo" muted="true"';
            display = '';
        } else {
            local = 'id="'+users.hash_id+'video"';
            display = this.isteacher ? '' : 'style="display:none"';
        }
        if (this.course.teacher_id == users.id) {
            str += '<div id="users'+users.id+'" data-index="" class="headTx swiper-slide teacherHead">';
            str += '<div class="txImg">';
            str += '<video poster="'+users.imgurl+'" '+local+' data-teacher="1" autoplay></video>';
            str += '</div>';
            str += '<img class="teacherSign" src="/vendor/livetool/images/sanjiao.png">';
            str += '<div class="teacherTag align_item">';
            str += '<span class="nickname">讲师</span>';
            str += '</div>';
            str += '<div class="handle">';
            if (this.isteacher) {
                str += '<div class="icon01" title="点击关闭摄像头">';
                str += '<span class="iconfont icon-shexiangtou"></span>';
                str += '<p class="disable">';
                str += '<span class="iconfont icon-shexiangtou"></span>';
                str += '<i class="iconfont icon-xiantiao"></i>';
                str += '</p>';
                str += '</div>';
                str += '<div class="icon02" title="点击关闭麦克风">';
                str += '<span class="iconfont icon-maikefeng"></span>';
                str += '<p class="disable">';
                str += '<span class="iconfont icon-maikefeng"></span>';
                str += '<i class="iconfont icon-xiantiao"></i>';
                str += '</p>';
                str += '</div>';
                if (this.room.roomspeak == 1) {
                    str += '<div class="icon03" title="点击全员下台">';
                } else {
                    str += '<div class="icon03 current" title="点击全员上台">';
                }
                str += '<span class="iconfont icon-quanyuanshangtai"></span>';
                str += '<p class="disable">';
                str += '<span class="iconfont icon-quanyuanshangtai">';
                str += '<i class="iconfont icon-xiantiao"></i>';
                str += '</p>';
                str += '</div>';
                if (this.room.roomhand == 1) {
                    str += '<div class="icon04" title="点击禁止举手">';
                } else {
                    str += '<div class="icon04 current" title="点击允许举手">';
                }
                str += '<span class="iconfont icon-jushou"></span>';
                str += '<p class="disable">';
                str += '<span class="iconfont icon-jushou"></span>';
                str += '<i class="iconfont icon-xiantiao"></i>';
                str += '</p>';
                str += '</div>';
            }
            str += '<div class="teacher-zuidahua">';
            str += '<span class="iconfont icon-zuidahua" data-id="'+users.id+'" title="最大化"></span>';
            str += '</div>';
            str += '</div>';
            str += '</div>';
            $(".gatherBox").prepend(str);
        } else {
            str += '<div id="users'+users.id+'" data-index="" class="headTx swiper-slide studentHead" '+display+'>';
            str += '<div class="txImg">';
            str += '<video src="" poster="'+users.imgurl+'" '+local+' data-teacher="0" autoplay></video>';
            str += '</div>';
            str += '<div class="studentTag align_item between">';
            str += '<div class="name">';
            str += '<i class="iconfont icon-user"></i>';
            str += '<span class="nickname">'+users.nickname+'</span>';
            str += '<i class="iconfont icon-yinpin"></i>';
            str += '</div>';
            str += '<div class="zanNum">';
            str += '<img src="/vendor/livetool/images/zan.png"><b class="zannum">'+users.zan+'</b>';
            str += '</div>';
            str += '</div>';
            str += '<div class="handle">';
            if (this.isteacher) {
                str += '<div class="icon01" data-id="'+users.id+'" title="上台">';
                str += '<span class="iconfont icon-xueshengshangtai"></span>';
                str += '<p class="disable">';
                str += '<span class="iconfont icon-xueshengshangtai">';
                str += '<i class="iconfont icon-xiantiao"></i>';
                str += '</p>';
                str += '</div>';
                str += '<div class="icon02" data-id="'+users.id+'" title="点赞">';
                str += '<span class="iconfont icon-dianzan" data-id="'+users.id+'"></span>';
                str += '</div>';
                str += '<div class="icon03" data-id="'+users.id+'" title="最大化">';
                str += '<span class="iconfont icon-zuidahua" data-id="'+users.id+'"></span>';
                str += '</div>';
                str += '<div class="icon04" data-id="'+users.id+'" title="退出">';
                str += '<span class="iconfont icon-tuichu"></span>';
                str += '</div>';
            } else {
                str += '<div class="teacher-zuidahua">';
                str += '<span class="iconfont icon-zuidahua" data-id="'+users.id+'" title="最大化"></span>';
                str += '</div>';
            }
            str += '</div>';
            str += '<div class="hands align_item" data-id="'+users.id+'" style="display:none;">';
            str += '<span class="iconfont icon-jushou layui-anim layui-anim-fadein layui-anim-loop" title="举手"></span>';
            str += '</div>';
            str += '</div>';
            $(".gatherBox").append(str);
        }
    };
    
    //点赞，上台，举手记录次数
    var operatetype = function(users_id, type){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/operate",
            dataType: 'json',
            data: {
                room_id: _this.room.id,
                users_id: users_id,
                type: type,
                _token: $("#_token").val()
            },
            success: function(json){console.log(json);
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //踢出课堂
    var kick = function(users_id){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/kick",
            dataType: 'json',
            data: {
                course_id: _this.course.id,
                room_id: _this.room.id,
                users_id: users_id,
                _token: $("#_token").val()
            },
            success: function(json){
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //共享模式，白板模式
    var roomtype = function(type){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/type",
            dataType: 'json',
            data: {
                room_id: _this.room.id,
                roomtype: type,
                _token: $("#_token").val()
            },
            success: function(json){
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //全员禁止聊天，解除禁止聊天
    var roomchat = function(type){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/chat",
            dataType: 'json',
            data: {
                room_id: _this.room.id,
                roomchat: type,
                _token: $("#_token").val()
            },
            success: function(json){
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //全员上台，下台
    var roomspeak = function(type){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/speak",
            dataType: 'json',
            data: {
                room_id: _this.room.id,
                roomspeak: type,
                _token: $("#_token").val()
            },
            success: function(json){
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //允许，禁止举手
    var roomhand = function(type){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/hand",
            dataType: 'json',
            data: {
                room_id: _this.room.id,
                roomhand: type,
                _token: $("#_token").val()
            },
            success: function(json){
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //实时直播时间
    var livetime = function(){
        var str = "";
        var date = new Date();
        var now = date.getTime();
        var startDate = new Date(this.starttime);
        var start = startDate.getTime();
        //时间差
        var leftTime = now - start + 1000;
        var m, s;
        if (leftTime >= 0) {
            m = Math.floor(leftTime / 1000 / 60);
            s = Math.floor(leftTime / 1000 % 60);
            m = m < 10 ? ("0" + m) : m;
            s = s < 10 ? ("0" + s) : s;
            str = m + ":"+ s;
            $(".roomtime").html(str);
            this.timeadd = setTimeout(livetime, 1000);
        } else {
            clearTimeout(this.timeadd);
            $(".roomtime").html("00:00");
        }
    };
    
    //记录所有人错误的日志
    var errors = function(type, contents) {
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/errors",
            dataType: 'json',
            data: {
                course_id:_this.course.id,
                room_id:_this.room.id,
                users_id:_this.users.id,
                type:type,
                platform: 0,
                contents:contents,
                _token:$("#_token").val()
            },
            success: function(json){
            }
        });
    };
    
    //录播
    var roomrecord = function(status){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/record",
            dataType: 'json',
            data: {
                room_id:_this.room.id,
                status:status,
                _token:$("#_token").val()
            },
            success: function(json){
                if(json.error){
                    _this.bmsim.toast(json.error, 'error');
                } else {
                    if (status == 1) {
                        _this.bmsim.toast('开始录制');
                    } else if (status == 2) {
                        _this.bmsim.toast('结束录制');
                    }
                }
            }
        });
    }
    
    //课件上传至七牛
    var addfile = function(file){
        var _this = this;
        var formData = new FormData();
        formData.append("file", file);
        formData.append("hash_id", _this.course.hash_id);
        formData.append("top_usersid", _this.course.top_usersid);
        formData.append("_token", $("#_token").val());
        $.ajax({
            type: "post",
            url: _this.fileurl,
            dataType: 'json',
            processData : false,
            contentType : false,
            data: formData,
            success: function(json){
                if(json.error){
                    //_this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    //课件从七牛删除
    var delfile = function(name){
        var _this = this;
        $.ajax({
            type: "post",
            url: _this.fileurl,
            dataType: 'json',
            data: {
                filename: name,
                hash_id: _this.course.hash_id,
                _token: $("#_token").val()
            },
            success: function(json){
                if(json.error){
                    //_this.bmsim.toast(json.error, 'error');
                }
            }
        });
    };
    
    return {
        roomstart: function () {
            roomstart();
        },roomend: function () {
            roomend();
        },errors: function (type, contents) {
            errors(type, contents);
        },livetime: function() {
            livetime();
        },roomtype: function(type){
            roomtype(type);
        },roomchat: function(type){
            roomchat(type);
        },roomspeak: function(type){
            roomspeak(type);
        },roomhand: function(type){
            roomhand(type);
        },online: function(arr){
            onlineinfo(arr);
        },operatetype: function(users_id, type){
            operatetype(users_id, type);
        },kick: function(users_id){
            kick(users_id);
        },uploadstatus: function(file_id, status){
            uploadstatus(file_id, status);
        },roomrecord: function(status){
            roomrecord(status);
        },addfile: function(file){
            addfile(file);
        },delfile: function(name){
            delfile(name);
        }
    };

}();
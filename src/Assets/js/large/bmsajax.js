// 后台数据交互管理
var bmsajax = function () {

    var sendDing = function(t=1){
        var _this = this;
        $.ajax({
            type: "get",
            url: "/ding/send",
            dataType: 'json',
            data: {
                course_id:_this.course.id,
                room_id:_this.room.id,
                user_id : _this.users.id,
                isteacher : _this.isteacher,
                platform:_this.platform,
                type : t
            },
            success: function(json){
            }
        });
    }
    //上课
    var roomstart = function(){
        var _this = this;
        sendDing(1);
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
                    sendDing(2);
                    _this.socket.emit('over');
                }
            }
        });
    };
    
    var onlineinfo = function(key, value){
        var _this = this;
        var x_array = [];
        var teacount = 0;
        var stucount = 0;
        _this.roster = key;
        $.each(key, function(i, v){
            if (_this.course.teacher_id == v) {
                teacount++;
            } else {
                stucount++; 
            }
            if ($(".users"+v).length == 0) {
                x_array.push(v);
                pchtml(v, value[i]);
            }
        });
        if (teacount > 0) {
            $(".teachervideo").addClass('speaking');
        }
        // 计算数量
        $(".teacount").html(teacount);
        $(".stucount").html(stucount);
        // 课程已经开始，直接进入课堂
        // 显示按钮,点击上课
        if (!_this.isenter && _this.course.status == 1) {
            _this.bmstic.enter();
        }

        if (x_array.length > 0) { //增加
            usersinfo(x_array, 'online');
        }
    };
    
    var offlineinfo = function(key){
        var _this = this;
        var x_array = [];
        var teacount = 0;
        var stucount = 0;
        $.each(key, function(i, v){
            if (_this.course.teacher_id == v) {
                teacount++;
            } else {
                stucount++; 
            }
        });
        if (teacount == 0) {
            $(".teachervideo").removeClass('speaking');
        }
        // 计算数量
        $(".teacount").html(teacount);
        $(".stucount").html(stucount);
        
        var x_array = _this.roster.filter(function(v){ return key.indexOf(v) == -1 });
        _this.roster = key;
        $.each(x_array, function(i, v){
            $("#layui-layer"+$(".users"+v).attr('data-index')).remove();
            $('#zuida'+v).remove();
            $(".users"+v).remove();
            $("#users"+v).remove();
            if (_this.course.teacher_id == v) {
                $(".teachervideo .volume>div").css("background-color", "");
                $(".teachervideo .network>div").css("background-color", "");
            }
        });
        if ($(".studentvideo>div").length == 0) {
            $(".room-right .tab-content .tabdiv").css('top', '325px');
        }
    };
    
    
    var pchtml = function(id, hash_id){
        var div = "";
        // 老师的画面  当前人是老师还是学生
        if (this.course.teacher_id == id) {
        } else { //学生的画面  当前人是老师还是学生
            if (this.isteacher) {
                div = "<div class='users"+id+"'><img src='' /><b></b><a class='speakbtn' data-id='"+id+"' data-hashid='"+hash_id+"' href='javascript:;'>上 台</a><span></span></div>";
            } else { 
                div = "<div class='users"+id+"'><img src='' /><b></b><span></span></div>";
            }
        }
        $('#student-list').append(div);
        // nickname = nickname ? nickname : '用户';
        // imgurl = imgurl ? imgurl : 'http://liveqn.xueyoubangedu.com/novideo.jpg';
        // zan = zan ? zan : 0;
        // var str = '';
        // var local = '';
        // var display = '';
        // var imgurl_id = '';
        // if (this.users.id == id) {
        //     // local = 'id="localvideo" muted="true"';
        //     local = 'id="localvideo"';
        //     imgurl_id = "localvideo_img";
        //     display = '';
        // } else {
        //     local = 'id="'+hash_id+'video"';
        //     imgurl_id = hash_id+"video_img";
        //     display = this.isteacher ? '' : 'style="display:none"';
        // }
        // // 老师的画面  当前人是老师还是学生
        // if (this.course.teacher_id == id) {
        //     str += '<div id="users'+id+'" data-index="" class="headTx teacherHead">';
        //     str += '<div class="txImg">';
        //     // str += '<video poster="'+imgurl+'" '+local+' autoplay></video>';
        //     str += '<div '+local+' ></div>';
        //     str += '<img id="'+imgurl_id+'" src="'+imgurl+'"/>';
        //     str += '</div>';
        //     str += '<img class="teacherSign" src="/vendor/livetool/images/sanjiao.png">';
        //     str += '<div class="teacherTag align_item">';
        //     str += '<span class="nickname">讲师</span>';
        //     str += strvolume(hash_id);
        //     if (!this.isteacher) { //远端流 学生看到的老师的画面
        //         str += strnetwork(hash_id);
        //     }
            
        //     str += '</div>';
        //     str += '<div class="handle">';
        //     if (this.isteacher) {
        //         str += '<div class="icon01" title="点击关闭摄像头">';
        //         str += '<span class="iconfont icon-shexiangtou"></span>';
        //         str += '<p class="disable">';
        //         str += '<span class="iconfont icon-shexiangtou"></span>';
        //         str += '<i class="iconfont icon-xiantiao"></i>';
        //         str += '</p>';
        //         str += '</div>';
        //         str += '<div class="icon02" title="点击关闭麦克风">';
        //         str += '<span class="iconfont icon-maikefeng"></span>';
        //         str += '<p class="disable">';
        //         str += '<span class="iconfont icon-maikefeng"></span>';
        //         str += '<i class="iconfont icon-xiantiao"></i>';
        //         str += '</p>';
        //         str += '</div>';
        //         if (this.room.roomspeak == 1) {
        //             str += '<div class="icon03 current" title="点击全员下台">';
        //         } else {
        //             str += '<div class="icon03" title="点击全员上台">';
        //         }
        //         str += '<span class="iconfont icon-quanyuanshangtai"></span>';
        //         str += '<p class="disable">';
        //         str += '<span class="iconfont icon-quanyuanshangtai">';
        //         str += '<i class="iconfont icon-xiantiao"></i>';
        //         str += '</p>';
        //         str += '</div>';
        //         if (this.room.roomhand == 1) {
        //             str += '<div class="icon04" title="点击禁止举手">';
        //         } else {
        //             str += '<div class="icon04 current" title="点击允许举手">';
        //         }
        //         str += '<span class="iconfont icon-jushou"></span>';
        //         str += '<p class="disable">';
        //         str += '<span class="iconfont icon-jushou"></span>';
        //         str += '<i class="iconfont icon-xiantiao"></i>';
        //         str += '</p>';
        //         str += '</div>';
        //     }
        //     str += '<div class="teacher-zuidahua">';
        //     str += '<span class="iconfont icon-zuidahua" data-id="'+id+'" title="最大化"></span>';
        //     str += '</div>';
        //     str += '</div>';
        //     str += '</div>';
        //     $(".gatherBox").prepend(str);
        // } else { //学生的画面  当前人是老师还是学生
        //     str += '<div id="users'+id+'" data-index="" class="headTx studentHead" '+display+'>';
        //     str += '<div class="txImg">';
        //     // str += '<video src="" poster="'+imgurl+'" '+local+' autoplay></video>';
        //     str += '<div '+local+' ></div>';
        //     str += '<img id="'+imgurl_id+'" src="'+imgurl+'"/>';
        //     str += '</div>';
        //     str += '<div class="studentTag align_item between">';
        //     str += '<div class="name row">';
        //     str += '<i class="iconfont icon-user"></i>';
        //     str += '<span class="nickname">'+nickname+'</span>';
        //     // str += '<i class="iconfont icon-yinpin"></i>';
        //     str += strvolume(hash_id);
        //     if (this.users.id != id) { //远端流 不是自己
        //         str += strnetwork(hash_id);
        //     }
        //     str += '</div>';
        //     str += '<div class="zanNum row">';
        //     str += '<img src="/vendor/livetool/images/zan.png"><b class="zannum">'+zan+'</b>';
        //     str += '</div>';
        //     str += '</div>';
        //     str += '<div class="handle">';
        //     if (this.isteacher) {
        //         str += '<div class="icon01" data-id="'+id+'" data-platform="0" title="上台">';
        //         str += '<span class="iconfont icon-xueshengshangtai"></span>';
        //         str += '<p class="disable">';
        //         str += '<span class="iconfont icon-xueshengshangtai">';
        //         str += '<i class="iconfont icon-xiantiao"></i>';
        //         str += '</p>';
        //         str += '</div>';
        //         str += '<div class="icon02" data-id="'+id+'" title="点赞">';
        //         str += '<span class="iconfont icon-dianzan" data-id="'+id+'"></span>';
        //         str += '</div>';
        //         str += '<div class="icon03" data-id="'+id+'" title="最大化">';
        //         str += '<span class="iconfont icon-zuidahua" data-id="'+id+'"></span>';
        //         str += '</div>';
        //         str += '<div class="icon04" data-id="'+id+'" title="退出">';
        //         str += '<span class="iconfont icon-tuichu"></span>';
        //         str += '</div>';
        //     } else {
        //         str += '<div class="teacher-zuidahua">';
        //         str += '<span class="iconfont icon-zuidahua" data-id="'+id+'" title="最大化"></span>';
        //         str += '</div>';
        //     }
        //     str += '</div>';
        //     str += '<div class="hands align_item" data-id="'+id+'" style="display:none;">';
        //     str += '<span class="iconfont icon-jushou layui-anim layui-anim-fadein layui-anim-loop" title="举手"></span>';
        //     str += '</div>';
        //     str += '</div>';
        //     $(".gatherBox").append(str);
        // }
    };

    
    // 设置声音的显示
    var setvolume = function (users_id, count) {
        users_id = users_id?users_id:this.users.hash_id;
        var tmpElement = $("#live"+users_id).parents('.livevideo').find(".volume");
        if (tmpElement.length > 0) {
            for(var i=0;i<12;i++){
                tmpElement.find('div:eq('+(11-i)+')').css('background-color', '');
                var temp_count = Math.ceil(count*20);
                if (temp_count > 12) {
                    temp_count = 12;
                }
                if(i<=temp_count-1){
                    tmpElement.find('div:eq('+(11-i)+')').css('background-color', '#00C609');
                }
            }
        }
    }
    
    // 设置网络的显示
    var setnetwork = function (users_id, num) {
        users_id = users_id?users_id:this.users.hash_id;
        var tmpElement = $("#live"+users_id).parents('.livevideo').find(".network");
        if (tmpElement.length > 0) {
            tmpElement.find('i').attr('class', 'network'+num);
        }
    }
    
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
            success: function(json){
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
            url: _this.fileurl_delete,
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

    var usersinfo = function (arr, type) {
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/online",
            dataType: 'json',
            data: {
                add: arr,
                room_id: _this.room.id,
                _token: $("#_token").val()
            },
            success: function(json){
                if (json.error) {
                    _this.bmsim.toast(json.error, 'error');
                } else {
                    if (type == 'online') {
                        $.each(json.info, function(i, v){
                            $(".users"+v.id+" b").html(v.nickname);
                            if (v.imgurl) {
                                $(".users"+v.id+" img").attr('src', v.imgurl+'-80.80');
                            }
                        });
                    } else if (type == 'onplat') {
                        $.each(json.info, function(i, v){
                            $("#users"+v.id+" .nickname").html(v.nickname);
                            $("#users"+v.id+" .zannum").html(v.zan);
                        });
                    }
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
        },online: function(key, value){
            onlineinfo(key, value);
        },offline: function(key){
            offlineinfo(key);
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
        },setvolume: function (users_id, num){
            setvolume(users_id, num);
        },setnetwork: function (users_id, num){
            setnetwork(users_id, num);
        },sendDing:function(t){
            sendDing(t);
        },usersinfo: function (arr, type) {
            usersinfo(arr, type);
        }
    };

}();
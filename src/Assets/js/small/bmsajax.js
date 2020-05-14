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
                    sendjob(_this.course.id, 'start');
                    _this.socket.emit('create');
                }
            }
        });
    };

    //开启直播间队列
    var sendjob = function(id, type){
        var _this = this;
        $.ajax({
            type: "get",
            url: "/course/startjob/" + id + "/" + type,
            dataType: 'json',
            success: function(json){
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
    
    
    var plathtml = function(hash_id, arr){
        var str = '';
        var local = '';
        if (this.users.hash_id == hash_id) {
            local = 'id="localvideo"';
        } else {
            local = 'id="'+hash_id+'video"';
        }
        // 老师的画面  当前人是老师还是学生
        if (this.course.teacher_hash_id == hash_id) {
            str += '<div id="users'+hash_id+'" data-hash_id="'+hash_id+'" class="headTx teacherHead">';
            if (this.course.status == 1) {
                str += '<div class="txImg bgimg1">';
            } else {
                str += '<div class="txImg bgimg3">';
            }
            str += '<div '+local+' ></div>';
            str += '</div>';
            str += '<div id="volume'+hash_id+'" class="volume">';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '</div>';
            str += '<div class="teacherSign"></div>';
            str += '<div class="teacherTag align_item">';
            str += '<div class="micicon '+(arr['voice'] == 1 ? "micicon1" : "micicon2")+'"></div>';
            str += '<span class="nickname">用户</span>';
            if (!this.isteacher) { //远端流 学生看到的老师的画面
                str += '<div id="network'+hash_id+'" class="network">';
                str += '<i></i>';
                str += '</div>';
            }
            str += '</div>';
            if (this.isteacher) {
                str += '<div class="handle">';
                str += '<div title="台上连麦" class="icon01"></div>';
                str += '<div title="台上授权" class="icon02"></div>';
                str += '<div title="台上奖励" class="icon03"></div>';
                str += '<div title="允许全员发言" class="icon04"></div>';
                str += '<div title="放大窗口" class="zuidahua"></div>';
                str += '</div>';
            }
            str += '</div>';
            $(".gatherBox").prepend(str);
        } else { //学生的画面  当前人是老师还是学生
            str += '<div id="users'+hash_id+'" data-hash_id="'+hash_id+'" class="headTx studentHead">';
            if (this.course.status == 1) {
                str += '<div class="txImg bgimg1">';
            } else {
                str += '<div class="txImg bgimg2">';
            }
            str += '<div '+local+' ></div>';
            str += '</div>';
            str += '<div id="volume'+hash_id+'" class="volume">';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '<div></div>';
            str += '</div>';
            str += '<div class="studentTag align_item between">';
            str += '<div class="name row">';
            str += '<div class="micicon '+(arr['voice'] == 1 ? "micicon1" : "micicon2")+'"></div>';
            str += '<span class="nickname">用户</span>';
            // str += '<i class="iconfont icon-yinpin"></i>';
            if (this.users.hash_id != hash_id) { //远端流 不是自己
                str += '<div id="network'+hash_id+'" class="network">';
                str += '<i class=""></i>';
                str += '</div>';
            }
            str += '</div>';
            str += '<div class="zanNum"><i></i><b class="zannum">0</b></div>';
            str += '</div>';
            if (arr['board'] == 1) {
                str += '<div class="authorize" title="已授权"></div>';
            } else {
                str += '<div class="authorize hide" title="已授权"></div>';
            }
            if (this.isteacher) {
                str += '<div class="handle">';
                if (arr['voice'] == 1) {
                    str += '<div title="静音" class="icon01 current"></div>';
                } else {
                    str += '<div title="连麦" class="icon01"></div>';
                }
                if (arr['board'] == 1) {
                    str += '<div title="取消授权" class="icon02 current"></div>';
                } else {
                    str += '<div title="授权" class="icon02"></div>';
                }
                if (arr['plat'] == 1) {
                    str += '<div title="下台" class="icon03 current"></div>';
                } else {
                    str += '<div title="上台" class="icon03"></div>';
                }
                str += '<div title="奖励" class="icon04"></div>';
                str += '<div title="放大窗口" class="zuidahua"></div>';
                str += '</div>';
            }
            str += '<div class="hands align_item" data-id="'+hash_id+'" style="display:none;">';
            str += '<span class="iconfont icon-jushou layui-anim layui-anim-fadein layui-anim-loop" title="举手"></span>';
            str += '</div>';
            str += '</div>';
            $(".gatherBox").append(str);
        }
    };
    
    var addusers = function(){
        var _this = this;
        var hash_id = [];
        var x_array = [];
        var teacount = 0;
        var stucount = 0;
        var users = _this.permission;
        
        $.each(users, function(i, v){
            if (_this.course.teacher_hash_id == i) {
                teacount++;
            } else {
                stucount++;
                // 花名册渲染
                if ($(".users"+i).length == 0) {
                    x_array.push(i);
                    onlinehtml(i, v);
                }
            }
            // 台上渲染
            if ($("#users"+i).length == 0 && v['plat'] == 1) {
                x_array.push(i);
                plathtml(i, v);
            }
            hash_id.push(i);
        });
        // 当前房间人员hashid数组
        _this.roster = hash_id;

        // $(".teacount").html(teacount);
        $(".stucount").html(stucount);
        $(".stucount2").html(stucount);

        if (x_array.length > 0) { //增加
            usersinfo(x_array);
        }
        // 课程已经开始，直接进入课堂  老师可以直接进入
        if (!this.isenter && (this.course.status == 1 || this.isteacher)) {
            this.bmstic.enter();
        }
    };
    
    var cutusers = function(){
        var _this = this;
        var hash_id = [];
        var x_array = [];
        var teacount = 0;
        var stucount = 0;
        var users = _this.permission;
        
        $.each(users, function(i, v){
            if (_this.course.teacher_hash_id == i) {
                teacount++;
            } else {
                stucount++; 
            }
            hash_id.push(i);
        });

        // $(".teacount").html(teacount);
        $(".stucount").html(stucount);
        $(".stucount2").html(stucount);
        
        var x_array = _this.roster.filter(function(v){ return hash_id.indexOf(v) == -1 });
        _this.roster = hash_id;
        
        $.each(x_array, function(i, v){
            $(".users"+v).remove();
            $("#users"+v).remove();
        });
        
        if ($("#maxdiv").length > 0 && _this.onoff['max'] == '') {
            $(".layui-layer").remove();
            $(".layui-layer-move").remove();
            layer.close(layer.index);
        };
    };
    
    // 花名册布局
    var onlinehtml = function(hash_id, arr) {
        var str = "";
        str += "<tr class='users"+hash_id+"' data-hash_id='"+hash_id+"'>";
        str += "<td width='130'>用户</td>";
        str += "<td><div class='plat "+(arr['plat'] == 1 ? "plat1" : "plat2")+"'></div></td>";
        str += "<td><div class='board "+(arr['board'] == 1 ? "board1" : "board2")+"'></div></td>";
        str += "<td><div class='voice "+(arr['voice'] == 1 ? "voice1" : "voice2")+"'></div></td>";
        str += "<td><div class='eye "+(arr['camera'] == 1 ? "eye1" : "eye2")+"'></div></td>";
        // 0是pc端，1是h5手机端，2是h5平板端 3是android 4是android平板 5是ios 6是ios的平板
        if (arr['platform'] == 0) {
            str += "<td><div class='platform platform1'></div></td>";
        } else if (arr['platform'] == 3 || arr['platform'] == 4) {
            str += "<td><div class='platform platform2'></div></td>";
        } else if (arr['platform'] == 5 || arr['platform'] == 6) {
            str += "<td><div class='platform platform3'></div></td>";
        }
        str += "<td><div class='zan'></div> x <span class='zannum'>0</span></td>";
        str += "<td width='80'><div class='hand hand2'></div></td>";
        str += "<td><div class='kick'></div></td>";
        str += "</tr>";
        $('#student-list tbody').append(str);
    };
    

    // 设置声音的显示
    var setvolume = function (hash_id, count) {
        hash_id = hash_id?hash_id:this.users.hash_id;
        var tmpElement = $("#volume"+hash_id);
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
    var setnetwork = function (hash_id, num) {
        hash_id = hash_id?hash_id:this.users.hash_id;
        var tmpElement = $("#network"+hash_id);
        if (tmpElement.length > 0) {
            tmpElement.find('i').attr('class', 'network'+num);
        }
    }

    var usersinfo = function (arr) {
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
                    console.log("异步获取数据",json.info);
                    $.each(json.info, function(i, v){
                        $(".users"+v.hash_id+" td:eq(0)").html(v.nickname);
                        $("#users"+v.hash_id+" .nickname").html(v.nickname);
                        $(".users"+v.hash_id+" td:eq(6) .zannum").html(v.zan);
                        $("#users"+v.hash_id+" .zannum").html(v.zan);
                    });
                    // if (type == 'online') {
                    //     $.each(json.info, function(i, v){
                    //         $(".users"+v.hash_id+" td:eq(0)").html(v.nickname);
                    //         $(".users"+v.hash_id+" span").html(v.zan);
                    //         if (v.platform == 0) {
                    //             $(".users"+v.hash_id+" .platform").addClass("platform1");
                    //         }
                            
                    //     });
                    // } else if (type == 'onplat') {
                    //     // $.each(json.info, function(i, v){
                    //     //     if (v.platform == 1 || v.platform == 2) {
                    //     //         $("#users"+v.hash_id+" .txImg img").attr('src', 'http://liveqn.xueyoubangedu.com/phoneface.png');
                    //     //     }
                    //     //     $("#users"+v.hash_id+" .icon01").attr('data-platform', v.platform);
                    //     //     $("#users"+v.hash_id+" .studentTag .nickname").html(v.nickname);
                    //     //     $("#users"+v.hash_id+" .zannum").html(v.zan);
                    //     // });
                    // }
                }
            }
        });
    };

    //点赞，上台，举手记录次数
    var operatetype = function(hash_id, type){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/operate",
            dataType: 'json',
            data: {
                room_id: _this.room.id,
                hash_id: hash_id,
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
    var kick = function(hash_id){
        var _this = this;
        $.ajax({
            type: "post",
            url: "/livetool/room/kick",
            dataType: 'json',
            data: {
                course_id: _this.course.id,
                room_id: _this.room.id,
                hash_id: hash_id,
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
    var livetime = function(type = ''){
        var start = '';
        var str = "";
        var date = null;
        if (type == 'create') {
            this.leftTime == null;
            clearTimeout(this.timeadd);
            $(".roomtime").html("开课时间：<b>00:00</b>");
        }
        if (this.course.status == 0) {
            this.leftTime = new Date(this.course.expectstart).getTime() - new Date().getTime();
            if (this.leftTime > 0 && this.leftTime <= 300000) {
                $(".roomtime").addClass("span_red");
                $(".roomtime").next(".span_red").show();
            } else if (this.leftTime <= 0) {
                this.leftTime == null;
                clearTimeout(this.timeadd);
                $(".roomtime").html("距开课：<b>00:00</b>");
                $(".roomtime").addClass("span_red");
                $(".roomtime").next(".span_red").hide();
                return;
            }
            str += "距开课：";
        } else if (this.course.status == 1) {
            if (this.course.expectendtime == undefined || this.course.expectendtime == null) {
                this.course.expectendtime = new Date(this.course.expectend).getTime() + new Date(this.course.starttime).getTime() - new Date(this.course.expectstart).getTime();
            }
            this.rightTime = new Date(this.course.expectendtime).getTime() - new Date().getTime();
            if (this.rightTime > 600000) {
                this.leftTime = new Date().getTime() - new Date(this.course.starttime).getTime();
                str += "开课时间：";
                $(".roomtime").removeClass("span_red");
                $(".roomtime").next(".span_red").hide();
            } else if (this.rightTime > 0 && this.rightTime <= 600000) {
                this.leftTime = this.rightTime;
                str += "剩余时间：";
                $(".roomtime").addClass("span_orange");
            } else if (this.rightTime <= 0) {
                this.leftTime = new Date().getTime() - new Date(this.course.expectendtime).getTime() + 1000;
                str += "拖堂时间：";
                $(".roomtime").removeClass("span_orange").addClass("span_red");
                $(".roomtime").next(".span_red").html("（拖堂20分钟自动下课）").show();
            }
        } else if (this.course.status == 2) {
            clearTimeout(this.timeadd);
            $(".roomtime").html("");
            return;
        }
        m = Math.floor(this.leftTime / 1000 / 60);
        s = Math.floor(this.leftTime / 1000 % 60);
        m = m < 10 ? ("0" + m) : m;
        s = s < 10 ? ("0" + s) : s;
        str = str + m + ":"+ s;
        $(".roomtime").html(str);
        this.timeadd = setTimeout(livetime, 1000);
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
    
    return {
        roomstart: function () {
            roomstart();
        },roomend: function () {
            roomend();
        },errors: function (type, contents) {
            errors(type, contents);
        },livetime: function(type) {
            livetime(type);
        },roomtype: function(type){
            roomtype(type);
        },roomchat: function(type){
            roomchat(type);
        }
        ,roomhand: function(type){
            roomhand(type);
        },addusers: function(){
            addusers();
        },cutusers: function(){
            cutusers();
        },operatetype: function(hash_id, type){
            operatetype(hash_id, type);
        },kick: function(hash_id){
            kick(hash_id);
        },uploadstatus: function(file_id, status){
            uploadstatus(file_id, status);
        },roomrecord: function(status){
            roomrecord(status);
        },addfile: function(file){
            addfile(file);
        },delfile: function(name){
            delfile(name);
        },setvolume: function (hash_id, num){
            setvolume(hash_id, num);
        },setnetwork: function (hash_id, num){
            setnetwork(hash_id, num);
        },onlineplat:function(key, nickname){
            onlineplat(key, nickname);
        },offlineplat:function(key, nickname) {
            offlineplat(key, nickname);
        },plathtml:function(hash_id, arr) {
            plathtml(hash_id, arr);
        },usersinfo:function(arr) {
            usersinfo(arr);
        },sendDing:function(type){
            sendDing(type)
        }
    };

}();
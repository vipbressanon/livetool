// 直播流管理
var bmsrtc = function () {
    var common = function() {
    };
    
    var studentbtn = function() {
        var _this = this;
        $(document).on("click", ".handUpBtn", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("举手太频繁，请稍后再举", "error");
            } else {
                if (_this.onoff['ishand'] == 1) {
                    _this.loading = true;
                    setTimeout(function() {
                        _this.loading = false;
                    }, 5000);
                    _this.bmsajax.operatetype(_this.users.hash_id, 'hand');
                    _this.socket.emit('im', {
                        type: "HAND",
                        hash_id: _this.users.hash_id,
                        nickname:_this.users.nickname
                    });
                    _this.bmsim.toast("已向讲师举手");
                } else {
                    _this.bmsim.toast("讲师已禁止举手", "error");
                }
            }
        });
    };
    
    var teacherbtn = function() {
        var _this = this;
        // 屏幕共享模式
        $(document).on("click", ".roomtype1", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            $('.roomtype1').addClass("active");
            $('.roomtype2').removeClass("active");
            _this.socket.emit('onoff', {
                type: "roomtype",
                status: 1
            });
        });
        // 白板模式
        $(document).on("click", ".roomtype2", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            $('.roomtype1').removeClass("active");
            $('.roomtype2').addClass("active");
            _this.socket.emit('onoff', {
                type: "roomtype",
                status: 2
            });
        });
        
        $(document).on("click", ".handUpList .onplat", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            var hash_id = $(this).attr("data-hash_id");
            var nickname = $(this).prev("b").html();
            var platcount = $(".studentHead").length;
            if (platcount >=_this.course.up_top) {
                _this.bmsim.toast("最多只允许"+_this.course.up_top+"名学员上台", "error");
                return false;
            }
            _this.socket.emit('permission', {
                hash_id: hash_id,
                type: 'plat',
                status: 1,
                up_top: _this.course.up_top,
                nickname: nickname
            });
            _this.bmsajax.operatetype(hash_id, 'speak');
            _this.bmsim.studenthand(hash_id, nickname, 0);
            return false;
        });

        $(document).on("click", ".handUpBtn", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                if ($(".handUpBtn").hasClass("shan")) {
                    _this.bmsim.toast("有学员举手时，不能变更状态", "error");
                } else {
                    _this.loading = true;
                    setTimeout(function() {
                        _this.loading = false;
                    }, 1500);
                    if (_this.onoff['ishand'] == 1) {
                        _this.socket.emit('onoff', {
                            type: 'ishand',
                            status: 0
                        });
                    } else {
                        _this.socket.emit('onoff', {
                            type: 'ishand',
                            status: 1
                        });
                    }
                    // _this.socket.emit('im', {
                    //     type: "HAND",
                    //     hash_id: _this.users.hash_id,
                    //     nickname: _this.users.nickname
                    // });
                }
            }
        });
        
        // 上下台
        $(document).on("click", "#student-list .plat", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var hash_id = $(this).parents("tr").attr("data-hash_id");
                var nickname = $(".users"+hash_id+" td:eq(0)").html();
                var status = _this.permission[hash_id]['plat'] ? 0 : 1;
                if (status) {
                    if ($("#users"+hash_id).length > 0) {
                        _this.bmsim.toast("该学员已在台上", "error");
                        return false;
                    }
                    var platcount = $(".studentHead").length;
                    if (platcount >=_this.course.up_top) {
                        _this.bmsim.toast("最多只允许"+_this.course.up_top+"名学员上台", "error");
                        return false;
                    }
                    
                    _this.socket.emit('permission', {
                        hash_id: hash_id,
                        type: 'plat',
                        status: status,
                        up_top: _this.course.up_top,
                        nickname: nickname
                    });
                    _this.bmsajax.operatetype(hash_id, 'speak');
                } else {
                    var hashid = $(".layui-layer-wrap").attr("data-hash_id");
                    if ($("#maxdiv").length > 0 && hash_id == hashid) {
                        _this.socket.emit('im', {
                            type: "MAX",
                            hash_id: hashid,
                            text: 0
                        });
                    }
                    _this.socket.emit('permission', {
                        hash_id: hash_id,
                        type: 'plat',
                        status: status,
                        nickname: nickname
                    });
                }
            }
        });
        
        // 花名册点击事件授权白板、取消授权
        $(document).on("click", "#student-list .board", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var tr = $(this).parents("tr");
                var hash_id = tr.attr("data-hash_id");
                var nickname = tr.find("td:eq(0)").html();
                var status = _this.permission[hash_id]['board'] ? 0 : 1;
                
                if (_this.permission[hash_id]['plat'] == 0) {
                    _this.bmsim.toast("无法授权台下学员操作白板，请先上台", "error");
                    return false;
                }
                
                _this.socket.emit('permission', {
                    hash_id: hash_id,
                    type: "board",
                    status: status,
                    nickname: nickname
                });
            }
        }); 
        
        // 禁麦/开麦
        $(document).on("click", "#student-list .voice", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500);
                
                var tr = $(this).parents("tr");
                var hash_id = tr.attr("data-hash_id");
                var nickname = tr.find("td:eq(0)").html();
                var status = _this.permission[hash_id]['voice'] ? 0 : 1;
                
                if (_this.permission[hash_id]['plat'] == 0) {
                    _this.bmsim.toast("无法操作台下学员打开麦克风，请先上台", "error");
                    return false;
                }
                
                _this.socket.emit('permission', {
                    hash_id: hash_id,
                    type: "voice",
                    status: status,
                    nickname: nickname
                });
            }
        });
        
        // 点赞1
        // $(document).on("click", "#student-list .zan", function(){
        //     if (_this.loading) {
        //         _this.bmsim.toast("操作太频繁，请稍后再试", "error");
        //     } else {
        //         _this.loading = true;
        //         setTimeout(function() {
        //             _this.loading = false;
        //         }, 1500); 
        //         var tr = $(this).parents("tr");
        //         var hash_id = tr.attr("data-hash_id");
        //         var nickname = tr.find("td:eq(0)").html();
        //         var num = parseInt(tr.find(".zannum").html())+1;
        //         _this.bmsajax.operatetype(hash_id, 'zan');
        //         _this.socket.emit('im', {
        //             type: "ZAN",
        //             hash_id: hash_id,
        //             nickname: nickname,
        //             text: num
        //         });
        //         // _this.bmsim.sendcustom('', '{"hash_id":"'+hash_id+'","nickname":"'+nickname+'","type":"ZAN","text":"'+num+'"}');
        //     }
        // });
        
        // 踢出
        $(document).on("click", "#student-list .kick", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            var tr = $(this).parents("tr");
            var hash_id = tr.attr("data-hash_id");
            var nickname = tr.find("td:eq(0)").html();
            swal.fire({   
                title: "提示",   
                text: "确定要将 "+nickname+" 踢出课堂吗？",   
                icon: "warning", 
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                showCancelButton: true
            }).then((result) => {
                if (result.value) {
                    _this.bmsajax.kick(hash_id);
                    _this.socket.emit('im', {
                        type: "KICK",
                        hash_id: hash_id,
                        nickname: nickname
                    });
                    // _this.bmsim.sendcustom('', '{"hash_id":"'+hash_id+'","nickname":"'+nickname+'","type":"KICK","text":""}');
                }
            });
        });
        
        // 台上连麦，静音
        $(document).on("click", ".teacherHead .icon01", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500);
                var status = $(this).hasClass("current") ? 0 : 1;
                _this.socket.emit('platbatch', {
                    type: "voice",
                    status: status
                });
            }
        });
        
        // 台上授权，取消授权白板
        $(document).on("click", ".teacherHead .icon02", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var status = $(this).hasClass("current") ? 0 : 1;
                _this.socket.emit('platbatch', {
                    type: "board",
                    status: status
                });
            }
        });
        
        // 台上奖励
        $(document).on("click", ".teacherHead .icon03", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500);
                var hash_id = [];
                $.each(_this.permission, function(i, v){
                    if (v['isteacher'] == 0 && v['plat'] == 1) {
                        hash_id.push(i);
                    }
                });
                _this.bmsajax.operatetype(hash_id, 'zan');
                _this.socket.emit('im', {
                    type: "PLATZAN",
                    hash_id: hash_id
                });
                
            }
        });
        
        // 禁止，允许发言
        $(document).on("click", ".teacherHead .icon04", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var status = $(this).hasClass("current") ? 0 : 1;
                _this.socket.emit('onoff', {
                    type: 'ischat',
                    status: status
                });
            }
        });
        
        
        // 禁麦/开麦
        $(document).on("click", ".studentHead .icon01", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var div = $(this).parents(".studentHead");
                var hash_id = div.attr("data-hash_id");
                var nickname = div.find(".nickname").html();
                var status = _this.permission[hash_id]['voice'] ? 0 : 1;
                
                _this.socket.emit('permission', {
                    hash_id: hash_id,
                    type: "voice",
                    status: status,
                    nickname: nickname
                });
            }
        });
        
        // 授权白板、取消授权
        $(document).on("click", ".studentHead .icon02", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var div = $(this).parents(".studentHead");
                var hash_id = div.attr("data-hash_id");
                var nickname = div.find(".nickname").html();
                var status = _this.permission[hash_id]['board'] ? 0 : 1;
                
                _this.socket.emit('permission', {
                    hash_id: hash_id,
                    type: "board",
                    status: status,
                    nickname: nickname
                });
            }
        });
        
        // 下台
        $(document).on("click", ".studentHead .icon03", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var div = $(this).parents(".studentHead");
                var hash_id = div.attr("data-hash_id");
                var nickname = div.find(".nickname").html();
                var hashid = $(".layui-layer-wrap").attr("data-hash_id");
                if ($("#maxdiv").length > 0 && hash_id == hashid) {
                    _this.socket.emit('im', {
                        type: "MAX",
                        hash_id: hashid,
                        text: 0
                    });
                }
                _this.socket.emit('permission', {
                    hash_id: hash_id,
                    type: 'plat',
                    status: 0,
                    nickname: nickname
                });
            }
        });
        
        // 点赞2
        $(document).on("click", ".studentHead .icon04", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500); 
                var div = $(this).parents(".studentHead");
                var hash_id = div.attr("data-hash_id");
                var nickname = div.find(".nickname").html();
                var num = parseInt($("#users"+hash_id+" .zannum").html())+1;
                _this.bmsajax.operatetype(hash_id, 'zan');
                _this.socket.emit('im', {
                    type: "ZAN",
                    hash_id: hash_id,
                    nickname: nickname,
                    text: num
                });
            }
        });
                
        // 最大化
        $(document).on("click", ".headTx .zuidahua", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.loading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else if (_this.onoff['roomtype'] == 1) {
                _this.bmsim.toast("屏幕共享模式下无法放大画面，请换回白板教学", "error");
            } else {
                _this.loading = true;
                setTimeout(function() {
                    _this.loading = false;
                }, 1500);
                var div = $(this).parents(".headTx");
                var hash_id = div.attr("data-hash_id");
                var nickname = div.find(".nickname").html();
                
                if ($("#users"+hash_id).find('.txImg').length > 0) {
                    _this.socket.emit('im', {
                        type: "MAX",
                        hash_id: hash_id,
                        nickname: nickname,
                        text: 1
                    });
                }
            }
        });
        
        // 录制 先弹出提示框
        $(document).on("click", ".recordbtn", function(){
            if (_this.course.status == 0) {
                _this.bmsim.toast("暂未开课，不可操作！", "error");
                return false;
            }
            if (_this.recordeloading) {
                _this.bmsim.toast("操作太频繁，请稍后再试", "error");
            } else {
                _this.recordeloading = true;
                setTimeout(function() {
                    _this.recordeloading = false;
                }, 8000);

                if ($(this).attr('data-record') == 0 || $(this).attr('data-record') == 3) { 
                    $('.recordBtnBox').show()
                } else if ($(this).attr('data-record') == 1) {
                    $(this).removeClass('recording');
                    $(this).find('span').html('课程录制');
                    $(this).find('label').removeClass('sideIcon6').addClass('sideIcon5');

                    $(this).attr('data-record', 3);
                    _this.bmsajax.roomrecord(3); 
                    $('.recordBtnBox').hide()
                } else if ($(this).attr('data-record') == 3) {
                    $('.recordBtnBox').show()
                }
            }
        })
        // 关闭录制
        $(document).on("click", ".closebtn1", function(){
            $('.recordBtnBox').hide()
        })
        $(document).on("click", ".a_start", function(){
                
                $('.recordbtn').addClass('recording');
                $('.recordbtn').find('label').removeClass('sideIcon5').addClass('sideIcon6');
                $('.recordbtn').find('span').html('录制中');
                setTimeout(function(){ 
                    $('.recordbtn').attr('data-record', 1);  
                }, 500);
                _this.bmsajax.roomrecord(1);
                $('.recordBtnBox').hide()           
        });
        
    };
    
    var maxdiv = function(hash_id){
        var _this = this;
        
        if (hash_id == '') {    // 缩小
            if ($("#maxdiv").length > 0) {
                var temp_hash_id = $(".layui-layer-wrap").attr("data-hash_id");
                $("#users"+temp_hash_id).prepend($('#zuida'+temp_hash_id).find('.txImg'));
                $(".layui-layer").remove();
                $(".layui-layer-move").remove();
                layer.close(layer.index);
            }
        } else {                // 放大
            var div = $("#users"+hash_id);
            var nickname = div.find(".nickname").html();
            var oDiv = div.find('.txImg');
            
            if ($("#maxdiv").length == 0) {
                var div = $("<div>");
                div.attr('id','zuida'+hash_id);
                div.attr('data-hash_id', hash_id);
                $("body").append(div);
                div.append(oDiv);
                
                var areaWidth = $('.middle').width()+'px';
                var areaHeight = $('.middle').height()+'px';
                var middleTop = $('.middle').offset().top;
                var middleLeft = $('.middle').offset().left;
                var closebtn = _this.isteacher ? 1 : 0;
                
                var layindex = layer.open({
                    id: 'maxdiv',
                    closeBtn: closebtn,
                    zIndex: 95,
                    type: 1,
                    move: false,
                    title: nickname,
                    area: [areaWidth, areaHeight],
                    shade: 0,
                    offset: [middleTop, middleLeft],
                    content: $('#zuida'+hash_id),
                    cancel: function(){
                        var temp_hash_id = $(".layui-layer-wrap").attr("data-hash_id");
                        var temp_nickname = $(".layui-layer-title").html();
                        $("#users"+temp_hash_id).prepend($('#zuida'+temp_hash_id).find('.txImg'));
                        _this.socket.emit('im', {
                            type: "MAX",
                            hash_id: temp_hash_id,
                            nickname: temp_nickname,
                            text: 0
                        });
                        
                        $(".layui-layer").remove();
                        $(".layui-layer-move").remove();
                    }
                });
            } else {
                if ($("#maxdiv").length > 0) {
                   var old_hash_id = $(".layui-layer-wrap").attr("data-hash_id");
                   $("#users"+old_hash_id).prepend($('#zuida'+old_hash_id).find('.txImg'));
                    $(".layui-layer-wrap").remove();
                }
                var div = $("<div>");
                div.attr('id','zuida'+hash_id);
                div.attr('data-hash_id', hash_id);
                div.attr('class', 'layui-layer-wrap');
                div.append(oDiv);
                $(".layui-layer-content").append(div);
                $(".layui-layer-title").html(nickname);
            }
        }
    };
    
    
    var start = function(){
        var _this = this;
        if (this.isteacher) {
            if (this.onoff && this.onoff['roomtype'] == 1) {
                $('.roomtype1').addClass("active");
                $('.roomtype2').removeClass("active");
                pushScreen();
            } else if (this.onoff && this.onoff['roomtype'] == 2) {
                console.log("推流----------0000000000000");
                $('.roomtype1').removeClass("active");
                $('.roomtype2').addClass("active");
                startRTC();
            }
        } else {
            startRTC();
        }
    };

    // TRTC事件
    var initTRTCEvent = function() {
        this.trtcClient.on('stream-added', event => {
            console.log("远端流------添加");
            const remoteStream = event.stream;
            const remoteUserId = remoteStream.getUserId();
            console.log('received a remoteStream ID: ' + remoteStream.getId() + ' from user: ' + remoteUserId);
            // 若需要观看该远端流，则需要订阅它，默认会自动订阅
            this.trtcClient.subscribe(remoteStream, { audio: true, video: true });
        });

        // 监听‘stream-removed’事件
        this.trtcClient.on('stream-removed', event => {
            console.log("远端流----断开");
            const remoteStream = event.stream;
            console.log('remoteStream ID: ' + remoteStream.getId() + ' has been removed');
            // 清除定时器
            var interva_name = this.volume_interval_map.get(remoteStream.getUserId()); 
            clearInterval(interva_name);
            interva_name = null;
            this.volume_interval_map.delete(remoteStream.getUserId())
            
            // 停止播放并删除相应<video>标签
            remoteStream.stop();
        });

        // 监听‘stream-updated’事件
        this.trtcClient.on('stream-updated', event => {
            console.log("远端流----更新");
            const remoteStream = event.stream;
            // console.log(remoteStream);
            // console.log('remoteStream ID: ' + remoteStream.getId() + ' was updated hasAudio: ' +
            //   remoteStream.hasAudio() + ' hasVideo: ' + remoteStream.hasVideo());
            // console.log("更新流--内容长度:"+$("#"+remoteStream.getUserId()+'video').children().length);
            // console.log($('#'+remoteStream.getUserId()+'video').html());
            // alert($('#'+remoteStream.getUserId()+'video').html());
        });

        // 监听‘stream-subscribed’事件
        this.trtcClient.on('stream-subscribed', event => {
            // 远端流订阅成功
            const remoteStream = event.stream;
            var _this = this;
            console.log("设置远端流----开始");
            setRemoteStream(remoteStream);
        });

        this.trtcClient.on('connection-state-changed', event => {
            console.log('connection-state-changed:', event.state);
        });

        this.trtcClient.on('peer-join', event => {
            console.log('peer-join', event)
            const userId = event.userId;
        });

        this.trtcClient.on('peer-leave', event => {
            console.log('peer-leave', event)
            const userId = event.userId;
        });

        this.trtcClient.on('mute-audio', event => {
            console.log('mute-audio', event)
            const userId = event.userId;
            console.log(`${userId}关闭了麦克风`);
        });

        this.trtcClient.on('mute-video', event => {
            console.log('mute-video', event)
            const userId = event.userId;
            $('#'+userId+'video').hide();
            console.log(`${userId}关闭了摄像头`);
        });

        this.trtcClient.on('unmute-audio', event => {
            console.log('unmute-audio', event)
            const userId = event.userId;
            console.log(`${userId}打开了麦克风`);
        });

        this.trtcClient.on('unmute-video', event => {
            console.log('unmute-video', event)
            const userId = event.userId;
            $('#'+userId+'video').show();
            console.log(`${userId}打开了摄像头`);
        });

        this.trtcClient.on('error', error => {
            console.error('client error observed: ' + error);
            const errorCode = error.getCode().toString(16);
            console.error(errorCode);
            var _this = this;
            var text = "trtc报错：";
            // 根据ErrorCode列表查看详细错误原因。
            if (errorCode == '1000') { 
                text += "无效参数";
            } else if (errorCode == '1001') {
                text += "非法操作";
            } else if (errorCode == '4001') {
                text += "信令通道建立失败";
            } else if (errorCode == '4002') {
                text += "信令通道错误";
            } else if (errorCode == '4003') {
                text += "ICE Transport 连接错误";
            } else if (errorCode == '4004') {
                text += "进房失败";
            } else if (errorCode == '4005') {
                text += "创建 sdp offer 失败";
            } else if (errorCode == '4040') {
                text += "用户被踢出房间";
            } else if (errorCode == '4041') {
                text += "媒体传输服务超时";
            } else if (errorCode == '4042') {
                text += "远端流订阅超时";
            } else if (errorCode == '4043') {
                text += "自动播放被禁止错误";
            } else if (errorCode == 'FFFF') {
                text += "未知错误";
            }
                text += "<br/>,请检查网络后刷新或联系管理员！";

            if (this.platform != 0) {
                $('.discussList').append("<li><p>trtc报错：("+text+")</p></li>");
                text = "所用浏览器不支持接收视频流，请切换浏览器！";
            }
            layer.open({
                type: 1
                ,offset: 'auto'
                ,title: false
                ,id: 'layerDemo'+'auto'
                ,content: '<div style="padding: 20px;color:#fff;">'+ text +'</div>'
                ,btn: '刷新'
                ,btnAlign: 'c' //按钮居中
                ,shade: false //不显示遮罩
                ,yes: function(){
                    _this.bmstic.quitOnError();
                    window.location.reload();
                    // location.replace(location.href);
                    layer.closeAll();
                }
            });
        });


    };
   
    // 设置远端流
    var setRemoteStream = function (remoteStream) {
        var _this = this;
            
        remoteStream.on('player-state-changed', event => {
            console.log("远端流----播放状态改变:"+event.state);
            // $('.discussList').append("<li><p>播放状态改变:"+event.state+"</p></li>");
            if (event.state === 'PAUSED') {
            } else if (event.state === 'PLAYING') {
                
            }
        });
        var hash_id = remoteStream.getUserId();
        
        // 如果没有布局远端流
        if ($("#users"+hash_id).length == 0) {
            _this.bmsajax.plathtml(hash_id, _this.permission[hash_id]);
            _this.bmsajax.usersinfo([hash_id]);
        }
        
        if ($("#maxdiv").length == 0 && _this.onoff['max'] == hash_id) {
            maxdiv(hash_id);
        }
        // 远端流播放
        remoteplay(remoteStream);
    }
    
    var remoteplay = function(remoteStream){
        var _this = this;
        var hash_id = remoteStream.getUserId();
        // 设置远端流
        let remoteVideoWrapEl = document.getElementById(remoteStream.getUserId()+'video');
        remoteStream.play(remoteVideoWrapEl).then(() => {
            // 设置声音
            var interva_name = setInterval(() => {
                const level = remoteStream.getAudioLevel();
                _this.bmsajax.setvolume(hash_id, level);
            }, 300);
            _this.volume_interval_map.set(hash_id, interva_name);
        }).catch((e) => {
            console.log(e);
            const errorCode = e.getCode();
            console.log("设置远端流--play失败："+ errorCode);
            if (errorCode === 0x4043) {
                // 手动播放
                remoteStream.resume();
            }
        });
    };
   
    // 摄像头推流1
    var startRTC = function() {
        var push_video = push_audio = false;
        // 1.先获取摄像头设备
        var devicesCameras_teamp = this.TRTC.getCameras();
        devicesCameras_teamp.then(function(result) {
            push_video = result.length == 0 ? false : true;
            console.log("是否具有摄像头:"+push_video);
            // 2.获取麦克风设备
            var devicesMicrophones_teamp = this.TRTC.getMicrophones();
            devicesMicrophones_teamp.then(function(result_mic) {
                push_audio = result_mic.length == 0 ? false : true;
                console.log("是否具有麦克风:"+push_audio);
                if (!push_video || !push_audio) {
                    if (!push_video) {
                        layer.msg("本地没有摄像头，请连接！");
                    }
                    if (!push_audio) {
                        layer.msg("本地没有麦克风，请连接！");
                    }
                    $(".gantanhao").show(); // 设备检测显示感叹号
                } else if (push_video && push_audio) {
                    $(".gantanhao").hide();
                }
                if (!push_video && !push_audio) {
                    layer.msg("本地没有摄像头以及麦克风，请连接！");
                    this.isstart = true;
                } else {
                    pushRTC(push_video, push_audio);
                }
            });
        });
    }
    // 摄像头推流2
    var pushRTC = function (push_video, push_audio) {
        // 从麦克风和摄像头采集本地音视频流
        let cameraStream = this.TRTC.createStream({
            audio: push_audio,
            video: push_video
        });
        // 设置视频分辨率等参数
        cameraStream.setVideoProfile({ width: 480, height: 480, frameRate: 15, bitrate: 900 });

        if (this.localStream && this.isPushing) { // 如果正在推流, 先停止发布流
            stoppush(() => {
                publishLocalStream(cameraStream, 1);
            });
        } else {
            publishLocalStream(cameraStream, 1);
        }
    }
    // 屏幕共享
    var pushScreen = function() {
        // 是否支持屏幕共享
        let status = this.TRTC.isScreenShareSupported();
        if(status) {
            clearInterval(this.localLevel_time);
            // 从麦克风和摄像头采集本地音视频流
            let screenStream = this.TRTC.createStream({
                audio: true,
                screen: true
            });

            // 设置视频分辨率等参数
            screenStream.setScreenProfile({
                width: 1920,
                height: 1080,
                frameRate: 15,
                bitrate: 1600 /* kbps */
            });
            if (this.localStream && this.isPushing) { // 如果正在推流, 先停止发布流
                stoppush(() => {
                    publishLocalStream(screenStream, 2);
                });
            } else {
                //console.log("取消分享");
                publishLocalStream(screenStream, 2);
            }
            
        } else {
            layer.msg("当前浏览器不支持屏幕共享");
        }
    };

    //本地推流 
    var publishLocalStream = function(localStream, type) {
        var _this = this;
        window.localStream = localStream;
        localStream.initialize().catch(error => {
            console.log("获取本地流失败(1)");
            console.log(error);
            if (type == 1) { //白板教学
                if (error == "NotReadableError: Could not start source" || error == "DOMException: Could not start source") {
                    show_error("获取本地流失败(1),<br/>没有找到视频设备<br/>(关闭其他使用或重启电脑)！<br/>");
                } else {
                    show_error("获取本地流失败(1),<br/>请刷新页面或检查设备！<br/>"+error);
                }
            } else { // 屏幕共享DOMException: Permission denied
                if (error == "NotAllowedError: Permission denied" || error == "DOMException: Permission denied") {
                    layer.msg("用户取消了屏幕共享即将进行白板教学！");
                }
                // 跳转到白板教学
                $(".roomtype2").click();
            }
        }).then(() => {
            console.log("本地流-----开始");
            if (localStream.getMediaStream()) {
                // 发布本地流（远端可收到）
                this.trtcClient && this.trtcClient.publish(localStream).then(() => {
                    // 本地流发布成功
                    _this.isPushing = true; // 正在推流
                    _this.localStream = localStream;
                    // 如果没有布局本地流
                    if ($("#users"+this.users.hash_id).length == 0) {
                        _this.bmsajax.plathtml(this.users.hash_id, _this.permission[this.users.hash_id]);
                        _this.bmsajax.usersinfo([this.users.hash_id]);
                    }
                    // 设置本地流
                    // 必须的有play   不然下面的声音为0
                    let localVideoWrapEl = document.getElementById('localvideo');
                    // 本地流播放
                    localStream.play(localVideoWrapEl, {
                      muted: true
                    }).then(() => {
                        console.log("设置本地流----play成功");
                        this.isstart = true;
                        // var hash_id = _this.localStream.getUserId();
                        // 设置声音
                        if (_this.localStream) {
                            var interva_name = setInterval(() => {
                                const level = _this.localStream.getAudioLevel();
                                _this.bmsajax.setvolume(_this.users.hash_id, level);
                            }, 300);
                            _this.volume_interval_map.set(_this.users.hash_id, interva_name);
                        }

                        if (_this.permission[this.users.hash_id]['voice'] == 0) {
                            localStream.muteAudio();
                        }
                        console.log("this.camera"+_this.camera);
                        console.log("type"+type);
                        if (!_this.camera && type == 1) {
                            // 禁用摄像头且为白板模式
                            localStream.muteVideo();
                        }
                    }).catch((e) => {
                        const errorCode = e.getCode();
                        console.log("设置本地流----失败："+errorCode);
                        if (errorCode === 0x4043) {
                            // PLAY_NOT_ALLOWED,引导用户手势操作恢复音视频播放
                            localStream.resume()
                        }
                    });
                    
                    localStream.on('player-state-changed', event => {
                        console.log("本地流----播放状态改变："+event.state);
                        // if (event.state === 'PAUSED') {
                        //     localStream.resume();
                        // }
                    });
                }).catch(error => {
                    console.log("发布本地流失败(2)");
                    console.log(error);
                    show_error("发布本地流失败(2),<br/>请刷新页面或检查设备！");
                });
            }
        }).catch(error => {
            show_error("获取本地流失败(3),<br/>请刷新页面或检查设备！"); 
            // console.log(`获取本地流失败, ${JSON.stringify(error)}`);
        });
    }

    /**
     * 结束推流
    */
    var stoppush = function(callback) {
        if (this.localStream && this.isPushing) {
            this.trtcClient.unpublish(this.localStream).then(() => {
                this.isPushing = false;
                clearInterval(this.localLevel_time);
                this.localStream.stop();
                this.localStream = null;
                if (Object.prototype.toString.call(callback) === '[object Function]') {
                    callback();
                }
            });
        }
    };

    /*
    * 计算远端流网络状态
    * packetsReceived  已接收包数
    * packetsLost 丢包数
    */ 
    var getRemoteVideoStats = function () {
        var _this = this; 
        var old_data = [];
        setInterval(() => {
            this.trtcClient.getRemoteVideoStats().then(stats => {
                // new - old = 差
                for (let hash_id in stats) {
                    var x_packetsReceived  = stats[hash_id].packetsReceived - (old_data[hash_id] ? old_data[hash_id].packetsReceived : 0);
                    var x_packetsLost = stats[hash_id].packetsLost - (old_data[hash_id] ? old_data[hash_id].packetsLost : 0);
                    // 丢包率
                    var num = x_packetsReceived==0 ? 0 : x_packetsLost/(x_packetsReceived+x_packetsLost)*100;
                    if (x_packetsReceived == 0) { //红色
                        _this.bmsajax.setnetwork(hash_id, 1);
                    } else {
                        if (num <= 1) { //3绿色
                            _this.bmsajax.setnetwork(hash_id, 3);
                        } else if (num > 1 && num <=10) { //2黄色
                            _this.bmsajax.setnetwork(hash_id, 2);
                        } else { //1红色
                            _this.bmsajax.setnetwork(hash_id, 1);
                        }
                    }
                }
                old_data = stats;
            });
        }, 1000);
    }

    // rtc 错误提示
    var show_error = function (text) {
        var _this = this;
        layer.open({
            type: 1
            ,offset: 'auto' 
            ,id: 'layerDemo'+'auto' //防止重复弹出
            ,content: '<div style="padding: 20px 100px;">'+ text +'</div>'
            ,btn: ['刷新', '设备检测']
            ,btnAlign: 'c' //按钮居中
            ,shade: 0 //不显示遮罩
            ,yes: function(){
                _this.bmstic.quitOnError();
                location.replace(location.href);
            }
            ,btn2: function(){
                layer.closeAll();
                $(".switchbtn").click();
            }
        });
    }
    
    var switchrtc = function(camera, mic) {console.log(camera, mic);
        if (camera == 'no' && mic == 'no') {    // 禁麦禁摄像头
            this.localStream.muteVideo();
            this.localStream.muteAudio();
            // 教师隐藏流数据 显示禁摄像头背景图
            $('#localvideo').hide();
        } else if (camera != 'no' && mic == 'no') { // 禁麦开摄像头
            this.localStream.unmuteVideo();
            this.localStream.switchDevice('video', camera).then(() => {
                this.localStream.muteAudio();
                // 教师打开流数据 隐藏禁摄像头背景图
                $('#localvideo').show();
            });
        } else if (camera == 'no' && mic != 'no') { // 开麦禁摄像头
            this.localStream.unmuteAudio();
            this.localStream.switchDevice('audio', mic).then(() => {
                this.localStream.muteVideo();
                $('#localvideo').hide();
            });  
        } else {                                    // 开麦开摄像头
            if (this.isteacher) {                   // 教师直接操作
                this.localStream.unmuteVideo();
                this.localStream.unmuteAudio();
                $('#localvideo').show();
                this.localStream.switchDevice('video', camera).then(() => {});
                this.localStream.switchDevice('audio', mic).then(() => {});
            } else {                                // 学生先判断本地是否有权限再决定是否开麦或开摄像头
                this.isspeak?this.localStream.unmuteVideo():this.localStream.muteVideo();
                this.isvoice?this.localStream.unmuteAudio():this.localStream.muteAudio();
                this.localStream.switchDevice('video', camera).then(() => {
                    this.isspeak?this.localStream.unmuteVideo():this.localStream.muteVideo();
                });
                this.localStream.switchDevice('audio', mic).then(() => {
                    this.isvoice?this.localStream.unmuteAudio():this.localStream.muteAudio();
                });
            }
        }
        this.checkmic = mic;
        this.checkopenmic = mic;
        this.checkcamera = camera;
        this.camera = camera != 'no' ? true : false;
        var _this = this;
        if (this.isteacher) {
            if (mic == 'no' && this.mic) {
                // 通知关麦操作
                _this.socket.emit('permission', {
                    hash_id: _this.users.hash_id,
                    type: "voice",
                    status: 0,
                    nickname: "自己"
                });
            } else if (this.mic == false && mic != 'no') {
                // 通知开麦操作
                _this.socket.emit('permission', {
                    hash_id: _this.users.hash_id,
                    type: "voice",
                    status: 1,
                    nickname: "自己"
                });
            }
        }
    };
    
    return {
        init: function () {
            common();
        }, start: function () {
            start();
        }, roomtype: function (){
            roomtype();
        }, switchrtc: function (camera, mic){
            switchrtc(camera, mic);
        }, initTRTCEvent: function() {
            initTRTCEvent();
        }, getRemoteVideoStats: function() {
            getRemoteVideoStats();
        }, stoppush: function () {
            stoppush();
        }, teacherbtn: function () {
            teacherbtn();
        }, studentbtn: function () {
            studentbtn();
        }, pushScreen: function () {
            pushScreen();
        }, startRTC: function () {
            startRTC();
        }, maxdiv: function (hash_id) {
            maxdiv(hash_id);
        }
    };

}();
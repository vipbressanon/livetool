(function(){
    var network = function(){
        var me = this;
        /**
         * @param {Funcation} speedInterval
         */
        var speedInterval = null;
        /**
         * @param {Function} networkInterval
         */
        var networkInterval = null;
        /**
         * @param {Function} reNetworkInterval
         */
        var reNetworkInterval = null;
        var time = 3000;
        //是否在线 初始时在线
        var onLineStatus = 1;
        var isBad = false;
        /**
         * 加载图片数据
         */
        var imgArr = [
            {
                "url" : "https://res.wx.qq.com/a/wx_fed/weixin_portal/res/static/img/dNEBuK6.png",//微信
                "size" : 2724,
                "speed" : {
                    //修改其中的值 定义网速快慢
                    "bad" : 500,
                    "medium" : 200
                }
            },
            {
                "url" : "https://img.alicdn.com/tfs/TB11ojWRXXXXXafaFXXXXXXXXXX-190-27.png", //天猫
                "size" : 2222,
                "speed" : {
                    "bad" : 500,
                    "medium" : 200
                }
            },
            {
                "url" : "https://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo.png", //新浪
                "size" : 2498,
                "speed" : {
                    "bad" : 500,
                    "medium" : 200
                }
            },
            {
                "url" : "https://www.baidu.com/img/baidu_jgylogo3.gif",  //百度logo
                "size" : 705,
                "speed" : {
                    "bad" : 400,
                    "medium" : 200
                }
            } 
        ];
        /**
         * 获取网络连接状态
         */
        var getConnectState = function(){
            return navigator.onLine ? 1 : 0;
        }; 

        var requestOnline= function(imgUrl){
            var  onlineInterVal = null
            var run = function(){
                var req = new XMLHttpRequest();
                req.timeout = 5000;
                req.open('GET', '/ding/send?type=7&online='+onLineStatus+'&imgUrl='+imgUrl, true);
                req.onload = function () {
                    if (req.status != 200) {
                        console.log("状态："+req.status); 
                        disconnect();
                    } else {
                        startSpeed();
                    }
                    if(onlineInterVal!=null){
                        window.clearInterval(onlineInterVal);
                    }
                };
                req.onerror = function() {
                    disconnect();
                    if(onlineInterVal!=null){
                        window.clearInterval(onlineInterVal);
                    }
                }
                req.send();
            }
            // if(onLineStatus == 1){
            //     onLineStatus = 0;
            // }
            onlineInterVal = setInterval(run, 5000);
        };
        /**
         * 网络中断
         */
        var disconnect = function(){
            // TODO ... 
            if (onLineStatus == 1) {
                //layer.msg("网络已中断");
                layer.open({
                    type: 1
                    ,title: "网络状态提示"
                    ,closeBtn: 0
                    ,offset: 'auto' 
                    ,id: 'disConnectLayer' //防止重复弹出
                    ,content: '<div style="padding: 20px 100px;color:#fff;">网络已中断</div>'
                });
                onLineStatus = 0;
            }
            $('.netStatus').text("中断").css({color:"#f00"});
            $('.netSpeed').text("0K/S");
            window.clearInterval(reNetworkInterval);
            reNetworkInterval = null;
            endSpeed();
            endNetwork();
            window.setTimeout(function(){
                reNetworkInterval = window.setInterval(function(){
                    //if (getConnectState() == 1) {
                    window.clearInterval(reNetworkInterval);
                    reNetworkInterval = null;
                    startSpeed();
                    //startNetwork();
                    // } else {
                    //     window.clearInterval(reNetworkInterval);
                    //     reNetworkInterval = null;
                    //     disconnect();
                    // }
                }, Math.ceil(time*1.5));
            }, time);
        };
        /**
         * 网络速度
         */
        var speed = {
           /**
            * 网速过慢
            */
            bad : function(){
                // TODO ... 
                // console.log("网速慢");
                if(onLineStatus == 0) {
                    bmstic.quitOnError();
                    layer.closeAll();
                    onLineStatus = 1;
                    layer.msg("网络已恢复,页面即将刷新");
                    setTimeout(function(){
                        location.replace(location.href);
                    },1000);
                } else {
                    if (!isBad) {
                        // hs
                        // layer.msg("当前网络状态不佳",{
                        //     time : 2500
                        // });
                    }
                }
                isBad = true;
                $('.netStatus').text("差").css({color:"#ea7913"});
                layer.msg("<b style='color:red'>当前网络较差</b>", {
                    time : 2000,
                    offset:'t'
                });
                // window.setTimeout(function(){
                //     if(getConnectState() == 1) {
                //         window.clearInterval(networkInterval);
                //         networkInterval = null;
                //         startSpeed();
                //     } else {
                //         disconnect();
                //     }
                // }, time);
            },
            /**
            * 网速中等
            */
            medium : function(){
                isBad = false;
                if(onLineStatus == 0) {
                    bmstic.quitOnError();
                    layer.closeAll();
                    onLineStatus = 1;
                    layer.msg("网络已恢复,页面即将刷新");
                    setTimeout(function(){
                        //window.location.reload()
                        location.replace(location.href);
                    },1000);
                }
                // TODO ... 
                // console.log("网速中等");
                $('.netStatus').text("中等").css({color:"#e48b19"});
            },
            /**
            * 网速极佳
            */
            great : function(){
                // TODO ... 
                // console.log("网速良好");
                isBad = false;
                if(onLineStatus == 0) {
                    bmstic.quitOnError();
                    layer.closeAll();
                    onLineStatus = 1;
                    layer.msg("网络已恢复,页面即将刷新");
                    setTimeout(function(){
                        //window.location.reload()
                        location.replace(location.href);
                    },1000);
                }
                $('.netStatus').text("良好").css({color:"#60ff00"});
            }
        };
        /**
         * 开启速度监测
         * @private
         */
        var startSpeed = function(){
            window.clearInterval(speedInterval);
            speedInterval = null;
            //if (getConnectState() == 1) {
            speedInterval = window.setInterval(function(){
                var start = new Date().getTime();
                //if (getConnectState() == 1) {
                var img = document.getElementById("networkSpeedImage");
                if (!!!img) {
                    img = document.createElement("IMG");
                    img.id = "networkSpeedImage";
                    img.style.display = "none";
                    document.body.appendChild(img);
                }
                var randIndex = Math.floor(Math.random() * imgArr.length);
                try {
                    img.src = imgArr[randIndex].url+"?_t=" + new Date().getTime();
                    img.onload = function(){
                        var end = new Date().getTime();
                        var delta = end - start;
                        if (delta > imgArr[randIndex].speed.bad) {
                            speed.bad();
                        } else if (delta > imgArr[randIndex].speed.medium) {
                            speed.medium();
                        } else {
                            speed.great();
                        }
                        delta = delta>0 ? delta : 1;//防止除0的情况
                        //console.log(imgArr[randIndex].url+"加载时间"+delta);
                        var netSpeed = (imgArr[randIndex].size/(delta/1000)/1024);
                        var netSpeedStr = '';
                        if(netSpeed>1024){
                            netSpeedStr = (netSpeed/1024).toFixed(2)+"M/S";
                        } else {
                            netSpeedStr = netSpeed.toFixed(2)+"K/S"; 
                        }
                        $('.netSpeed').text(netSpeedStr);
                    };
                    img.onerror = function(){
                        console.log("加载图片： "+img.src+" 错误");
                        requestOnline(img.src);
                    };
                } catch(e) {
                    speed.bad();
                }
                // } else {
                //     // TODO 网络断开
                //     disconnect();
                // }
            }, time);
            // } else {
            //     // TODO 网络断开
            //     disconnect();
            // }
        };
        /**
         * 停止速度监测
         * @private
         */
        var endSpeed = function(){
            window.clearInterval(speedInterval);
            speedInterval = null;
        };
        /**
         * 开启网络连接监测
         * @private
         */
        var startNetwork = function(){
            if (getConnectState() == 1) {
                networkInterval = window.setInterval(function(){
                    if (getConnectState() == 0) {
                        disconnect();
                    }
                }, time);
            } else{
                disconnect();
            }
        };
        /**
         * 结束网络连接监测
         * @private 
         */
        var endNetwork = function(){
            window.clearInterval(networkInterval);
            networkInterval = null;
        };
        /**
         * 网络监控开始
         */
        this.start = function(){
            //startNetwork();
            startSpeed();
        };
        /**
         * 停止网络监控
         */
        this.stop = function(){
            endSpeed();
            endNetwork();
        };
    };
    window.network = new network();
}).call(this);
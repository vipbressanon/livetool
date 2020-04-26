
  // 前端进行50ms发送信息的子进程()
  // 发送信息 1.开始计时 2.停止计时
  
this.addEventListener('message', function (e) {
    var interval = setInterval(function () {
        if (e.data === "end") {
            this.postMessage(2);
            clearInterval(interval);
            return
        }
        this.postMessage(1);
    }.bind(this), 50);
}, false);
function fit(){
    (function (win) {
        resizeRoot();
        function resizeRoot() {
            var wWidth = document.documentElement.clientWidth;
            console.log('wWidth-----------'+wWidth)
            if (wWidth > 2408) wWidth = 2408;
            else if (wWidth <320) wWidth = 320;
            document.documentElement.style.fontSize = wWidth / 7.5 + 'px';
        }
        window.onresize = resizeRoot;
    })(window);
}

var swiper = new Swiper('.swiper-container', {
    direction: 'horizontal',
    slidesPerView: 7,
    spaceBetween: 5,
    freeMode: true,
});

function browserRedirect() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){
        console.log('pc')
        $('.headTx').css('height',$('.headTx').width()*0.957);
        document.getElementById("css1").href = '/vendor/livetool/layui/css/layui.css';
        document.getElementById("css2").href = '/vendor/livetool/css/live.css';
        document.getElementById("js").src = '/vendor/livetool/js/live.js';
    } else {
        console.log('手机平板')
        document.getElementById("js").src = '/vendor/livetool/js/live_phone.js';
        fit();  //rem适配
        function rotate() {
            if (window.orientation == 180 || window.orientation == 0) {
                console.log('竖屏')
                document.getElementById("css2").href = '/vendor/livetool/css/liveFit_portrait.css';
                $('.PortCourse').append($('.handBtn'))
                // 摄像头横屏滚动
                swiper.changeDirection('horizontal');
                swiper.update()
            }
            if (window.orientation == 90 || window.orientation == -90) {
                console.log('横屏')
                document.getElementById("css2").href = '/vendor/livetool/css/liveFit_landscape.css';
                // 摄像头竖屏滚动
                swiper.changeDirection('vertical');
                swiper.update()
            }
            window.addEventListener("load", rotate, false);
            window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", rotate, false);
        }
        window.addEventListener("load", rotate, false);
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", rotate, false);
    }
}
browserRedirect();
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link href="/vendor/livetool/layui/css/layui.css" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/css/common.css" rel="stylesheet" type="text/css">
        <link href="/vendor/livetool/css/browser.css" rel="stylesheet" type="text/css">
        
    </head>
    <body class="browserBg">
        <div class="browserBox">
            <div class="chrome">
                <div class="logo">
                    <img src="/vendor/livetool/images/logo.png">
                </div>
                <div class="content">
                    <img class="browserPic" src="/vendor/livetool/images/browserPic.png">
                    <p class="desc">您当前的浏览器暂不支持直播，仅支持谷歌浏览器观看直播</p>
                    <a class="download" target="_blank" href="https://www.google.cn/intl/zh-CN/chrome/">
                        <img src="/vendor/livetool/images/chromeIcon.png">
                        <span>下载谷歌浏览器</span>
                    </a>
                </div>
            </div>
        </div>
    </body>
</html>
<script src="/vendor/livetool/js/jquery.min.js"></script>
<script>
    //浏览器高度
    $('.browserBox').css('height',$(window).height())
</script>
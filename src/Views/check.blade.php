<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>直击课堂</title>
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
    <meta content="" name="description" />
    <meta content="" name="author" />
    <link href="/vendor/livetool/layui/css/layui.css" rel="stylesheet" type="text/css">
    <style>
        .between{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        .testBox{
            width: 560px;
            background: #fff;
            margin: 0 auto;
        }
        .testBox .title{
            padding: 0 32px 0 27px;
            height: 70px;
            line-height: 70px;
            border-bottom: 1px solid #DEDEDE;
        }
        .testBox .title h4{
            font-size: 20px;
            color: #333;
        }
        .testBox .title .icon-close{
            font-size: 26px;
            color: #666;
        }
        .testContent{
            padding: 24px 115px 0;
        }
        .videoBox{
            width: 330px;
            height: 170px;
            background: url('/images/videoBg.png');
            margin-bottom: 23px;
        }
        .videoBox #video{
            display: block;
            width: 100%;
            height: 100%;
        }
        .selectBox{
            margin-bottom: 15px;
            align-items: center;
        }
        .selectBox .layui-form-select{
            width: 265px;
        }
        #volume{
            width: 100%;
            height: 18px;
        }
        .testBtns{
            height: 55px;
            padding: 12px 39px 13px;
            border-top: 1px solid #DEDEDE;
            margin-top: 20px;
        }
        .testBtns .keepBtn{
            float: right;
            width: 83px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            background: #00B1F6;
            color: #fff;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="testBox">
        <div class="testContent layui-form">
            @if($type==1)
            <div class="videoBox">
                <video id="video" playsinline autoplay></video>
            </div>
            <div class="selectBox between">
                <label for="audioSource">麦克风：</label>
                <select id="audioSource" lay-filter="audioSource">
                </select>
            </div>
            <div class="selectBox between">
                <label for="audioOutput">扬声器：</label>
                <select id="audioOutput" lay-filter="audioOutput"></select>
            </div>
            <div class="selectBox between">
                <label for="videoSource">视频：</label>
                <select id="videoSource" lay-filter="videoSource">
                </select>
            </div>
            @else
            <div class="selectBox between">
                <label for="audioSource">麦克风：</label>
                <select id="audioSource" lay-filter="audioSource">
                    <option value="no">禁用</option>
                </select>
            </div>
            <div class="selectBox between">
                <label for="audioOutput">扬声器：</label>
                <select id="audioOutput" lay-filter="audioOutput"></select>
            </div>
            <div class="selectBox between">
                <label for="videoSource">视频：</label>
                <select id="videoSource" lay-filter="videoSource">
                    <option value="no">禁用</option>
                </select>
            </div>
            @endif
            <div>
                <meter id="volume" high="0.25" max="1" value="0.00"></meter>
                <p style="display:none;">
                    <span id="volume_str"></span>
                    <span id="status"></span>
                </p>
            </div>
        </div>
        <div class="testBtns clearfix">
            <a class="keepBtn" href="javascript:;">确 定</a>
        </div>
    </div>
    <input type="hidden" id="isteacher" value="{{$tea}}" />
</body>
</html>
<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.0/jquery.min.js"></script>
<script src="/vendor/livetool/js/check111.js"></script>
<script src="/vendor/livetool/js/adapter-latest.js"></script>
<script src="https://sqimg.qq.com/expert_qq/webrtc/3.4.2/WebRTCAPI.min.js"></script>
<script src="/vendor/livetool/layui/layui.js"></script>
<script type="text/javascript">
layui.use(['layer','jquery','form'], function(){
    var layer = layui.layer,
        $ = layui.jquery,
        form = layui.form;
    form.render();
    $('.keepBtn').on('click', function(){
        if (parent.localStream) {
            parent.bmsrtc.switchrtc($("#videoSource").val(), $("#audioSource").val());
        }
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    });
});
</script>

<script>check.init();</script>
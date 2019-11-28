//延迟1s显示
setTimeout(function(){
    $("body").css('visibility','visible')
},2000)
//手机横屏点击
layui.use('layer', function(){
    var layer = layui.layer;
    $('#enlarge').on('click' , function(){
        layer.msg('请在手机设置里开启允许横屏模式')
    })
});
//点击显示摄像头
$(document).on("click", ".cameraBtn", function(){
    $('.gatherContent,.cameraClose').show();
});
$(document).on("click", ".cameraClose", function(){
    $('.gatherContent,.cameraClose').hide();
});
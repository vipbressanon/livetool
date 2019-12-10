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


//点击显示隐藏摄像头
$('.cameraBtn').click(function(){
	$('.gatherContent,.cameraClose').show();
})
$('.cameraClose').click(function(){
	$('.gatherContent,.cameraClose').hide();
})
//点击显示隐藏讨论区
$('.discussBtn').click(function(){
	$('.dialog').show();
})
$('.dialogClose').click(function(){
	$('.dialog').hide();
})

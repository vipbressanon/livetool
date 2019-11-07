$(function(){
    var isChrome;
    if(isChrome == window.google && window.chrome){
        console.log('谷歌');
    }
    else{
        console.log('非谷歌');
    }
    //计算高度
    $('.fullScreen').css('height',document.documentElement.clientHeight);
    $('.headTx').css('height',$('.headTx').width()*0.957);
    $('.middle').css('height',$('.middle').width()*0.5625);
    $('#paint_box').css('height',$('.middle').width()*0.5625);
    $('.dialog').css('height',$('.dialog').width()*1.519);
    $('.maxWindow').css('height',$('.maxWindow').width()*0.9589);
})
//按钮关闭与开启
$('.teacherHead .handle>div').click(function(){
    if($(this).hasClass('current')){
        $(this).removeClass('current')
    }else{
        $(this).addClass('current')
    }
})

//举手
function hansUp(){
    setTimeout(function(){
        $('.hands').show()
    },5000)
}

var  arr = [];
//摄像头弹框
layui.use(['laypage', 'layer'], function(){
    var $ = layui.jquery, 
    layer = layui.layer,
    laypage = layui.laypage;
    $('.icon-zuidahua').on('click', function() {
        //获取父级索引
        var Index = $(this).parents('.headTx').index()
        var active = 'active_' + Index
        var length = arr.length
        //设置最大化弹框的尺寸
        var areaWidth = $('.middle').width()/3
        var areaHeight = areaWidth*0.75
        //设置弹框的坐标
        var middleTop = $('.middle').offset().top;
        var middleLeft = $('.middle').offset().left;
        var offsetTop;
        var offsetLeft;
        if(length <= 2){
            offsetTop = middleTop
            offsetLeft = middleLeft+length*areaWidth
        }else if(length >= 3 && length <= 5){
            offsetTop = middleTop + $('.middle').height()/6
            offsetLeft = middleLeft+(length-3)*areaWidth
        }else if(length >= 6 && length <= 8){
            offsetTop = middleTop + ($('.middle').height()/6)*2
            offsetLeft = middleLeft+(length-6)*areaWidth
        }else if(length >= 9 && length <= 12){
            offsetTop = middleTop + ($('.middle').height()/6)*3
            offsetLeft = middleLeft+(length-9)*areaWidth
        }

        if(arr.includes(active)){
            layer.msg('摄像头已经最大化了哦');
        }else{
            arr.push(active)
            var video = document.getElementById('teachervideo').srcObject;
            layer.open({
                type: 1,
                area: [areaWidth+'px', areaHeight+'px'],
                shade: 0,   
                offset: [offsetTop,offsetLeft],
                content: '<video style="width:100%;" muted src="'+video+'" autoplay></video>',
                cancel: function(){
                    layer.close()
                    arr.splice($.inArray(active,arr),1);
                }
            });
        }
    });
    // laypage.render({
    //     elem: 'page',
    //     count: 200,
    //     layout: ['prev', 'next'],
    //     prev:'上',
    //     next:'下',
    //     jump: function(obj, first){
    //       if(!first){
    //         layer.msg('第 '+ obj.curr +' 页');
    //       }
    //     }
    // });
})

//设备检测
layui.use('form', function(){
    var layer = layui.layer,
    $ = layui.jquery,
    form = layui.form;
    form.render();
    layer.open({
        type: 2,
        title: false,
        closeBtn: 1, //不显示关闭按钮
        shade: [0],
        area: ['560px', '540px'],
        offset: '50px',
        //time: 2000, //2秒后自动关闭
        anim: 2,
        content: ['/livetool/check?type=1', 'no'], //iframe的url，no代表不显示滚动条
    });
    
    $(document).on("click", ".switchbtn", function(){
        layer.open({
            type: 2,
            title: false,
            closeBtn: 1, //不显示关闭按钮
            shade: [0],
            area: ['560px', '345px'],
            offset: '50px',
            //time: 2000, //2秒后自动关闭
            anim: 2,
            content: ['/livetool/check?type=2', 'no'], //iframe的url，no代表不显示滚动条
        });
    }); 
    
    $(document).on("click", ".shareBtn", function(){
    }); 
});
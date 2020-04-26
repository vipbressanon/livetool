$(function(){
    //计算高度
    // $('.fullScreen').css('height',document.documentElement.clientHeight);
    // $('.middle').css('height',$('.middle').width()*0.5625);
    // $('#paint_box').css('height',$('.middle').width()*0.5625);
    // $('.dialog').css('height',$('.dialog').width()*1.519);

    // $('.fullScreen').css('height',document.documentElement.clientHeight);
    // $('.headTx').css('height',$('.headTx').width()*0.957);
    // console.log(document.documentElement.clientHeight);
    // console.log($(window).width());
    // $('.middle').css('height',document.documentElement.clientHeight-$(window).width()*.077-38);
    // $('.middle').css('width',$('.fullScreen').width()-176);
    // $('#paint_box').css('height',$('.middle').width()*0.5625);
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


//摄像头弹框
layui.use(['laypage', 'layer'], function(){
    var $ = layui.jquery, 
    layer = layui.layer,
    laypage = layui.laypage;
    var arr = [];
    $(document).on('click', '.icon-zuidahua', function() {
        var id = $(this).attr('data-id');
        //获取到当前点击的摄像头
        var $this = $(this);
        var oDiv = $(this).parents('.headTx').find('.txImg');
        if ($('#zuida'+id).length == 0) {
            var div = $("<div>");
            div.attr('id','zuida'+id);
            $("body").append(div);
            div.append(oDiv);
        }
        // 背景头像
        var headImg = oDiv.find('video').attr('poster');
        console.log("头像1"+headImg);
        headImg = headImg ? headImg : 'http://liveqn.xueyoubangedu.com/novideo.jpg';
        console.log("头像2" + headImg);
        $(this).parents('.headTx').css("background-image","url("+headImg+")");
        // 获取点击的nickname
        var oTitle = $(this).parents('.headTx').find('.nickname').text();
        console.log(oTitle)
        //获取父级索引
        var Index = $(this).parents('.headTx').index()
        var active = 'active_' + Index
        var length = arr.length
        //设置最大化弹框的尺寸
        var areaWidth = $(window).width()
        var areaHeight = $(window).height()
        //设置弹框的坐标
        var middleTop = $('.middle').offset().top;
        var middleLeft = $('.middle').offset().left;
        if(arr.includes(active)){
            arr.splice($.inArray(active,arr),1);
            $(this).parents('.headTx').prepend($('#zuida'+id).find('.txImg'));
            layer.close(
                $(this).parents('.headTx').attr('data-index')
            );
            $('#zuida'+id).parents('.layui-layer').remove();
            $(this).parents('.headTx').css("background","#000")
            $("#layui-layer"+$this.parents('.headTx').attr('data-index')).remove();
        }else{
            arr.push(active);
            // var video = document.getElementById('teachervideo').srcObject;
            var layindex = layer.open({
                type: 1,
                title: oTitle,
                area: [areaWidth+'px', areaHeight+'px'],
                shade: 0,
                offset: [0,0],
                content: $('#zuida'+id),
                cancel: function(){
                    arr.splice($.inArray(active,arr),1);
                    $this.parents('.headTx').prepend($('#zuida'+id).find('.txImg'));
                    layer.close($this.parents('.headTx').attr('data-index'));
                    $this.parents('.headTx').css("background","#000")
                    $('#zuida'+id).parents('.layui-layer').remove();
                    $("#layui-layer"+$this.parents('.headTx').attr('data-index')).remove();
                }
            });
            $(this).parents('.headTx').attr('data-index', layindex);
        }
        return false;
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
    var _this = this;
    if ($("#status").val() == 0) {
        layer.open({
            type: 2,
            title: '设备检测',
            closeBtn: 1, //不显示关闭按钮
            shade: [0],
            area: ['560px', '540px'],
            offset: '50px',
            //time: 2000, //2秒后自动关闭
            anim: 2,
            content: ['/livetool/check?type=1&tea='+window.isteacher, 'no'], //iframe的url，no代表不显示滚动条
        });
    }
    
    $(document).on("click", ".switchbtn", function(){
        layer.open({
            type: 2,
            title: '设备检测',
            closeBtn: 1, //不显示关闭按钮
            shade: [0],
            area: ['560px', '540px'],
            offset: '50px',
            //time: 2000, //2秒后自动关闭
            anim: 2,
            content: ['/livetool/check?type=1&tea='+window.isteacher, 'no'], //iframe的url，no代表不显示滚动条
        });
    }); 
    
});


// 举手按钮显示与否
$('.handUpBtn').mouseenter(function(){
    $('.handUpList').show();
});
$('.handUpList').mouseleave(function(){
    $('.handUpList').hide();
});
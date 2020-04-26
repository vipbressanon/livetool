$(function(){
    //计算高度
    // $('.fullScreen').css('height',document.documentElement.clientHeight);
    // $('.middle').css('height',$('.middle').width()*0.5625);
    // $('#paint_box').css('height',$('.middle').width()*0.5625);

    // $('.fullScreen').css('height',document.documentElement.clientHeight);
    // $('.livevideo').css('height',$('.livevideo').width()*0.957);
    // console.log(document.documentElement.clientHeight);
    // console.log($(window).width());
    // $('.middle').css('height',document.documentElement.clientHeight-$(window).width()*.077-38);
    // $('.middle').css('width',$('.fullScreen').height()*1.9);
    // $('#paint_box').css('height',$('.middle').width()*0.5625);
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
    $(document).on('click', '.icon-zuidahua', function() {
        var id = $(this).parents('.livevideo').attr('data-id');
        //获取到当前点击的摄像头
        var $this = $(this);
        var oDiv = $(this).parents('.livevideo').find('.videodiv');
        var roomtype = $("#roomtype").val();
        if ($('#zuida'+id).length == 0) {
            var div = $("<div>");
            div.attr('id','zuida'+id);
            $("body").append(div);
            div.append(oDiv);
        }
        // 获取点击的nickname
        var oTitle = $(this).parents('.livevideo').find('.nickname').text();
        //设置最大化弹框的尺寸
        var areaWidth = $(window).width()
        var areaHeight = $(window).height()
        // var video = document.getElementById('teachervideo').srcObject;
        var layindex = layer.open({
            type: 1,
            title: oTitle,
            area: [areaWidth+'px', areaHeight+'px'],
            shade: 0,
            offset: 'rt',
            content: $('#zuida'+id),
            cancel: function(){
                $this.parents('.livevideo').prepend($('#zuida'+id).find('.videodiv'));
                $("#layui-layer"+$this.parents('.livevideo').attr('data-index')).remove();
            }
        });
        $(this).parents('.livevideo').attr('data-index', layindex);
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
            content: ['/livetool/check?type=1', 'no'], //iframe的url，no代表不显示滚动条
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
            content: ['/livetool/check?type=1', 'no'], //iframe的url，no代表不显示滚动条
        });
    });
    
    $(document).on("click",".toggleside",function(){
        if ($(this).html()=='&gt;&gt;') {
            $(".sideBar").animate({left: "0px"}, function(){
                $('.toggleside').html('&lt;&lt;');
            });
        } else {
            $(".sideBar").animate({left: "-88px"}, function(){
                $('.toggleside').html('&gt;&gt;');
            });
        }
    });
    
    $(document).on("click", ".nav-link", function(){
        var index = $(".nav-link").index(this);
        if (!$(this).hasClass("active")) {
            $(".nav-link").removeClass("active");
            $(this).addClass("active");
            $(".tab-content .tab-pane").hide();
            $(".tab-content .tab-pane:eq("+index+")").show();
        }
    }); 
});


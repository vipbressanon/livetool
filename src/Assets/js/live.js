//延迟1s显示
setTimeout(function(){
    $("body").css('visibility','visible')
},1000)
$(function(){
    //计算高度
    $('.fullScreen').css('height',document.documentElement.clientHeight);
    $('.gatherBox').css('height',$('.gatherBox').width()*0.0729*0.957)
    $('.headTx').css('height',$('.headTx').width()*0.957);
    $('.middle').css('height',$('.middle').width()*0.5625);
    $('#paint_box').css('height',$('.middle').width()*0.5625);
    $('.dialog').css('height',$('.dialog').width()*1.519);
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

var arr = [];
//摄像头弹框
layui.use(['laypage', 'layer'], function(){
    var $ = layui.jquery, 
    layer = layui.layer,
    laypage = layui.laypage;
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
        var headImg = oDiv.find('video').attr('poster')
        $(this).parents('.headTx').css("background-image","url("+headImg+")");
        // 获取点击的nickname
        var oTitle = $(this).parents('.headTx').find('.nickname').text();
        console.log(oTitle)
        //获取父级索引
        var Index = $(this).parents('.headTx').index()
        var active = 'active_' + Index
        var length = arr.length
        //设置最大化弹框的尺寸
        var areaWidth = $('.middle').width()
        var areaHeight = $('.middle').height()
        //设置弹框的坐标
        var middleTop = $('.middle').offset().top;
        var middleLeft = $('.middle').offset().left;
        var offsetTop;
        var offsetLeft;
        if(length <= 2){
            offsetTop = middleTop - 42
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
            arr.splice($.inArray(active,arr),1);
            $(this).parents('.headTx').prepend($('#zuida'+id).find('.txImg'));
            layer.close($(this).parents('.headTx').attr('data-index'));
            $('#zuida'+id).remove();
            $("#layui-layer"+$this.parents('.headTx').attr('data-index')).remove();
        }else{
            arr.push(active);
            // var video = document.getElementById('teachervideo').srcObject;
            var layindex = layer.open({
                type: 1,
                title: oTitle,
                area: [areaWidth+'px', areaHeight+'px'],
                shade: 0,
                offset: [offsetTop,offsetLeft],
                content: $('#zuida'+id),
                cancel: function(){
                    arr.splice($.inArray(active,arr),1);
                    $this.parents('.headTx').prepend($('#zuida'+id).find('.txImg'));
                    layer.close($this.parents('.headTx').attr('data-index'));
                    $('#zuida'+id).remove();
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
            title: '媒体设置',
            closeBtn: 1, //不显示关闭按钮
            area: ['560px', '330px'],
            offset: '150px',
            //time: 2000, //2秒后自动关闭
            anim: 2,
            content: ['/livetool/check?type=2', 'no'], //iframe的url，no代表不显示滚动条
        });
    }); 
    
    $(document).on("click", ".shareBtn", function(){
        $('.shareBg').show();
    }); 
    $(document).on("click", ".shareBox .icon-close", function(){
        $('.shareBg').hide();
    }); 
    $(document).on("click", ".copy_link", function(){
        var copyText = $('.copy_link').siblings('input');
        copyText.select();//选择
        document.execCommand("Copy");//执行复制
        layer.msg("复制成功！");
    }); 
    $(document).on("click", ".copy_student", function(){
        var copyText = $('.copy_student').siblings('input');
        copyText.select();//选择
        document.execCommand("Copy");//执行复制
        layer.msg("复制成功！");
    }); 
    $(document).on("click", "#download_code_img", function(){
        var _this = $(this);
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = function () {
          var canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          var context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, image.width, image.height);
          var url = canvas.toDataURL('image/png'); // 得到图片的base64编码数据
          var a = document.createElement('a'); // 生成一个a元素
          var event = new MouseEvent('click'); // 创建一个单击事件
          a.download = _this.attr('title'); // 设置图片名称
          a.href = url; // 将生成的URL设置为a.href属性
          a.dispatchEvent(event); // 触发a的单击事件
        }
        image.src = $(this).attr('data-url');
    }); 
});

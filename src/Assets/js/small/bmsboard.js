// 白板管理
var bmsboard = function () {

    var currentPage = 1;
    var allPage = 1;
     // 监听白板事件（按需监听）
    var initBoardEvent = function() {
        var teduBoard = this.teduBoard;
        var _this = this;
        // 撤销状态改变
        teduBoard.on(TEduBoard.EVENT.TEB_OPERATE_CANUNDO_STATUS_CHANGED, (enable) => {
            // this.canUndo = enable ? 1 : 0;
            //console.log('======================:  ', 'TEB_OPERATE_CANUNDO_STATUS_CHANGED', enable ? '可撤销' : '不可撤销');
        });

        // 重做状态改变
        teduBoard.on(TEduBoard.EVENT.TEB_OPERATE_CANREDO_STATUS_CHANGED, (enable) => {
            // this.canRedo = enable ? 1 : 0;
            //console.log('======================:  ', 'TEB_OPERATE_CANREDO_STATUS_CHANGED', enable ? '可恢复' : '不可恢复');
        });

        // 新增白板
        teduBoard.on(TEduBoard.EVENT.TEB_ADDBOARD, (boardIds, fid) => {
            //console.log('======================:  ', 'TEB_ADDBOARD', ' boardIds:', boardIds, ' fid:', fid);
            proBoardData();
        });

        // 白板同步数据回调(收到该回调时需要将回调数据通过信令通道发送给房间内其他人，接受者收到后调用AddSyncData接口将数据添加到白板以实现数据同步)
        // TIC已经处理好了，可忽略该事件
        teduBoard.on(TEduBoard.EVENT.TEB_SYNCDATA, (data) => {
            //console.log('======================:  ', 'TEB_SYNCDATA');
        });

        // 收到白板初始化完成事件后，表示白板已处于正常工作状态（此时白板为空白白板，历史数据尚未拉取完成）
        teduBoard.on(TEduBoard.EVENT.TEB_INIT, () => {
            console.log('======================:  ', 'TEB_INIT');
            console.log('TIC', "onTEBInit finished");
        });

        teduBoard.on(TEduBoard.EVENT.TEB_HISTROYDATA_SYNCCOMPLETED, () => {
            //console.log('======================:  ', 'TEB_HISTROYDATA_SYNCCOMPLETED');
            //console.log('TIC', "onTEBHistory Sync Completed finished");

            // setTimeout(() => {
            //   teduBoard.addImage('https://main.qcloudimg.com/raw/5c11f1a14f74b00988c5c43dddff2d41.png');
            //   // teduBoard.addImage('https://main.qcloudimg.com/raw/ea3692fd322dbcc7d86c3fc3cc6d3c59.jpg');
            // }, 2000);
        });

        // 白板错误回调
        teduBoard.on(TEduBoard.EVENT.TEB_ERROR, (code, msg) => {
            //console.error('======================:  ', 'TEB_ERROR', ' code:', code, ' msg:', msg);
            //console.log('TIC', "onTEBError code=" + code + " msg:" + msg);
        });

        // 白板警告回调
        teduBoard.on(TEduBoard.EVENT.TEB_WARNING, (code, msg) => {
            //console.error('======================:  ', 'TEB_WARNING', ' code:', code, ' msg:', msg);
            //console.log('TIC', "onTEBWarning code=" + code + " msg:" + msg);
        });

        // 图片状态加载回调
        teduBoard.on(TEduBoard.EVENT.TEB_IMAGE_STATUS_CHANGED, (status, data) => {
            //console.log('======================:  ', 'TEB_IMAGE_STATUS_CHANGED', ' status:', status, ' data:', data);
        });

        // 删除白板页回调
        teduBoard.on(TEduBoard.EVENT.TEB_DELETEBOARD, (boardIds, fid) => {
            //console.log('======================:  ', 'TEB_DELETEBOARD', ' boardIds:', boardIds, ' fid:', fid);
            proBoardData();
        });

        // 跳转白板页回调
        teduBoard.on(TEduBoard.EVENT.TEB_GOTOBOARD, (boardId, fid) => {
            //console.log('======================:  ', 'TEB_GOTOBOARD', ' boardId:', boardId, ' fid:', fid);
            proBoardData();
        });

        // ppt动画步数改变回调
        teduBoard.on(TEduBoard.EVENT.TEB_GOTOSTEP, (step, count) => {
            //console.log('======================:  ', 'TEB_GOTOSTEP', ' step:', step, ' count:', count);
        });

        // 增加H5动画PPT文件回调
        teduBoard.on(TEduBoard.EVENT.TEB_ADDH5PPTFILE, (fid) => {
            //console.log('======================:  ', 'TEB_ADDH5PPTFILE', ' fid:', fid);
            proBoardData();
        });

        // 增加文件回调
        teduBoard.on(TEduBoard.EVENT.TEB_ADDFILE, (fid) => {
            //console.log('======================:  ', 'TEB_ADDFILE', ' fid:', fid);
            proBoardData();
        });

        // 增加转码文件回调
        teduBoard.on(TEduBoard.EVENT.TEB_ADDTRANSCODEFILE, (fid) => {
            //console.log('======================:  ', 'TEB_ADDTRANSCODEFILE', ' fid:', fid);
            proBoardData();
        });

        // 删除文件回调
        teduBoard.on(TEduBoard.EVENT.TEB_DELETEFILE, (fid) => {
            //console.log('======================:  ', 'TEB_DELETEFILE', ' fid:', fid);
            proBoardData();
            // 清空file里面的删除文件的值，便于下次上传
            var obj = document.getElementById("fileSelector") ; 
            obj.outerHTML=obj.outerHTML; 
        });

        // 文件上传状态
        teduBoard.on(TEduBoard.EVENT.TEB_FILEUPLOADSTATUS, (status, data) => {
            //console.log('======================:  ', 'TEB_FILEUPLOADSTATUS', status, data);
            // if (status === 1) {
            //   this.showTip('上传成功');
            // } else {
            //   this.showTip('上传失败');
            // }
            // document.getElementById('file_input').value = '';
        });

        // 切换文件回调
        teduBoard.on(TEduBoard.EVENT.TEB_SWITCHFILE, (fid) => {
            //console.log('======================:  ', 'TEB_SWITCHFILE', ' fid:', fid);
            // if (fid === '#1573462129974') {
            //   teduBoard.gotoBoard('web_tic_10_1573462130_8_#1573462129974')
            // } else if (fid === '#1573218991727') {
            //   teduBoard.gotoBoard('miniprogram_miniprogram_tic_201_1573218991_3_#1573218991727')
            // }
            proBoardData();
        });

        // 上传背景图片的回调
        teduBoard.on(TEduBoard.EVENT.TEB_SETBACKGROUNDIMAGE, (fileName, fileUrl, userData) => {
            //console.log('======================:  ', 'TEB_SETBACKGROUNDIMAGE', '  fileName:', fileName, '  fileUrl:', fileUrl, ' userData:', userData);
        });

        // 文件上传进度
        teduBoard.on(TEduBoard.EVENT.TEB_FILEUPLOADPROGRESS, (data) => {
            //console.log('======================:  ', 'TEB_FILEUPLOADPROGRESS:: ', data);
            // this.showTip('上传进度:' + parseInt(data.percent * 100) + '%');
        });

        // H5背景加载状态
        teduBoard.on(TEduBoard.EVENT.TEB_H5BACKGROUND_STATUS_CHANGED, (status, data) => {
            //console.log('======================:  ', 'TEB_H5BACKGROUND_STATUS_CHANGED:: status:', status, '  data:', data);
        });

        // 转码进度
        teduBoard.on(TEduBoard.EVENT.TEB_TRANSCODEPROGRESS, res => {
            //console.log('=======  TEB_TRANSCODEPROGRESS 转码进度：', JSON.stringify(res));
            layui.use('element', function(){
                element = layui.element;

                if (res.code) {
                    $('.coursefile_progress').hide();
                    var obj = document.getElementById("fileSelector") ; 
                    obj.outerHTML=obj.outerHTML; 
                    _this.fileload = false;
                    let msg = '转码失败,文件不能包含视音频';
                    _this.bmsim.toast(msg, 'error');
                    console.log('转码失败code:' + res.code + ' message:' + res.message);
                } else {
                    let status = res.status;
                    if (status === 'ERROR') {
                        console.log('转码失败');
                        $('.coursefile_progress').hide();
                        var obj = document.getElementById("fileSelector") ; 
                        obj.outerHTML=obj.outerHTML; 
                        _this.fileload = false;
                        _this.bmsim.toast('转码失败', 'error');
                    } else if (status === 'UPLOADING') {
                        $('.coursefile_progress').show();
                        console.log('上传中，当前进度:' + parseInt(res.progress) + '%');
                        element.progress('addProgress', '0%');
                    } else if (status === 'CREATED') {
                        console.log('创建转码任务');
                    } else if (status === 'QUEUED') {
                        console.log('正在排队等待转码');
                    } else if (status === 'PROCESSING') {
                        console.log('转码中，当前进度:' + res.progress + '%');
                        element.progress('addProgress', res.progress + '%');
                    } else if (status === 'FINISHED') {
                        _this.fileload = false;
                        _this.bmsim.toast('文件上传完成');
                        $('.coursefile_progress').hide();
                        _this.teduBoard.addTranscodeFile({
                          url: res.resultUrl,
                          title: res.title,
                          pages: res.pages,
                          resolution: res.resolution
                        });
                    }
                }
            })
            
        });
    };
    var common = function(){
        initBoardEvent();
    };
    // 放大白板
    var slider = function(){
        var _this = this;
        layui.use('slider', function(){
            var $ = layui.$
           ,slider = layui.slider;
            //默认滑块
            slider.render({
                elem: '#slideTest1'
                ,min: 100 //最小值
                ,max: 200 //最大值
                ,step: 10 //步长
                ,tips: false //关闭默认提示层
                ,theme: "#3C9CFE"
                ,change: function(value){
                    _this.boardscale = value;
                    $('#percentShow').html(_this.boardscale - 100);
                    _this.teduBoard.setBoardScale(_this.boardscale);
                }
            });
        });
    };
    
    // 设置全局背景色
    var setGlobalColor = function(color) {
        this.teduBoard.setGlobalBackgroundColor(color);
    };

    // 设置当前页背景色
    var setBgColor = function(color) {
      this.teduBoard.setBackgroundColor(color);
    };

    // 设置涂鸦颜色
    var setColor = function(color) {
      this.teduBoard.setBrushColor(color);
    };

    // 设置涂鸦类型
    var setType = function(type) {
      this.teduBoard.setToolType(type);
    };

    // 设置涂鸦粗细
    var setThin = function(num) {
      this.teduBoard.setBrushThin(num);
    };

    // 清空当前页涂鸦(保留背景色/图片)
    var clearDraws = function() {
      this.teduBoard.clear();
    };

    // 清空当前页涂鸦 + 背景色/图片
    var clear = function() {
      this.teduBoard.clear(true);
    };

    // 清除全局背景色
    var clearGlobal = function() {
      this.teduBoard.clearGlobalBgColor();
    };

    // 回退
    var revert = function() {
      this.teduBoard.undo();
    };

    // 恢复
    var process = function() {
      this.teduBoard.redo();
    };

    // 动画上一步
    var prevStep = function() {
      this.teduBoard.prevStep();
    };

    // 动画下一步
    var nextStep = function() {
      this.teduBoard.nextStep();
    };

    /**
     * 上一页
     */
    var prevBoard = function() {
      this.teduBoard.prevBoard();
    };

    /**
     * 下一页
     */
    var nextBoard = function() {
      this.teduBoard.nextBoard();
    };

    /**
     * 新增一页
     */
    var addBoard = function() {
      this.teduBoard.addBoard();
    };

    /**
     * 删除当前页
     */
    var deleteBoard = function() {
      this.teduBoard.deleteBoard();
    };
    /**
     * 重新设置规格
     */
    var resetScale = function(){
        this.teduBoard.setBoardScale(this.boardscale);
        $('#percentShow').html(this.boardscale - 100);
        // $('#slideTest1').find('.layui-slider-bar').css({width:"0%"});
        // $('#slideTest1').find('.layui-slider-wrap').css({left:"0%"});
    };

    var liveboard = function(){
        var _this = this;
        
        $(document).on("click",".showoption",function(){
            if($(this).next('.choose-drop-down').css('display')=='none'){
                $('.choose-drop-down').css('display', 'none');
                $(this).next('.choose-drop-down').css('display', 'block');
            }else{
                $('.choose-drop-down').css('display', 'none');
            }
        });
        
        $(document).on("click",".prevBoard",function(){
            if(_this.currentPage>1){
                prevBoard();
                resetScale();
            }
        });
        
        $(document).on("click",".nextBoard",function(){
            if(_this.currentPage < _this.allPage){
                nextBoard();
                resetScale();
            }

        });
        
        $(document).on("click",".addBoard",function(){
            addBoard();
        });
        
        $(document).on("click",".deleteBoard",function(){
            deleteBoard();
        });
        
        $(document).on("click",".tool-bgcolor li",function(){
            var color = $(this).find('span').attr('class');
            $('.tool-bgcolor .choose-state span').attr('class', color);
            setColor($(this).attr('data-type'));
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".paint-brush li",function(){
            setType('line');
            setThin($(this).attr('data-type'));
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".graphical-size li",function(){
            setThin($(this).attr('data-type'));
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".graphicalul li",function(){
            if ($(this).index()==0) {
                setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_RECT);
            } else if ($(this).index()==1) {
                setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_RECT_SOLID);
            } else if ($(this).index()==2) {
                setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_OVAL);
            } else if ($(this).index()==3) {
                setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_OVAL_SOLID);
            }
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".eraser",function(){
            setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_ERASER);
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".recselect",function(){
            setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_RECT_SELECT);
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".pointselect",function(){
            setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_POINT_SELECT);
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".draw_line",function(){
            if($(this).next('.choose-drop-down').css('display')=='none'){
                $('.choose-drop-down').css('display', 'none');
                $(this).next('.choose-drop-down').css('display', 'block');
            }else{
                $('.choose-drop-down').css('display', 'none');
            }
        });

        $(document).on("click",".draw_line_type li",function(){
            setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_LINE);
            //直线类型
            _this.teduBoard.setLineStyle({
                "lineType" : $(this).data('type')
            });
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".cleardraw",function(){
            clearDraws();
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".boardtext",function(){
            setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_TEXT);
            _this.teduBoard.setTextSize(600);
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".clears",function(){
            clear();
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".revert",function(){
            revert();
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".process",function(){
            process();
            $('.choose-drop-down').css('display', 'none');
        });

        $(document).on("click",".remove_baiban",function(){
            setType(TEduBoard.TOOL_TYPE.TEDU_BOARD_TOOL_TYPE_ZOOM_DRAG);
            $('.choose-drop-down').css('display', 'none');
        });
        
        $(document).on("click",".filebtn",function(){
            var id = $(this).attr("data-id");
            $("#file"+id).show();
            $(".boardTab li:eq("+id+")").click();
        });
        
        $(document).on("click",".delbtn",function(){
            var fid = $(this).attr("data-fid");
            var name = $(this).attr("data-name");
            deleteFile(fid);
            _this.bmsajax.delfile(name);
        });
        
        $(document).on("change","#fileSelector",function(){
            var id = $(this).attr('data-id');
            if ($(this).val() != '') {
                _this.fileload = true;
                var file = document.getElementById('fileSelector').files[0];
                uploadFile(file);
                _this.bmsajax.addfile(file);
            }
        });
        
        $(document).on("click",".boardTab li",function(){
            var fid = $(this).attr('data-id');
            switchFile(fid);
        });
        
        $(document).on("click",".boardTab i",function(){
            $(this).parent('li').hide();
            $(".boardTab li:eq(0)").click();
            return false;
        });
    };

    /**
     * 上传文件
     */
    var uploadFile = function(file) {
        // if (/\.(bmp|jpg|jpeg|png|gif|webp|svg|psd|ai)/i.test(file.name)) {
        //     this.teduBoard.setBackgroundImage({
        //       data: file,
        //       userData: 'image'
        //     });
        // } else 
        if (/\.(ppt|pptx|doc|docx|pdf)/i.test(file.name)) {
            this.teduBoard.applyFileTranscode({
              data: file,
              userData: 'hello'
            }, {
              minResolution: '1280x720',
              isStaticPPT: false,
              thumbnailResolution: '480x320'
            });
        } else {
            this.bmsim.toast("上传的文件不支持！");
            var obj = document.getElementById("fileSelector") ; 
            obj.outerHTML=obj.outerHTML; 
            this.fileload = false;
        }
    };
    
    // 白板事件回调处理
    var proBoardData = function() {
        this.fileInfoList = this.teduBoard.getFileInfoList();
        this.currentFileId = this.teduBoard.getCurrentFile();
        this.thumbUrls = this.teduBoard.getThumbnailImages(this.currentFileId);
        var fileInfo = this.teduBoard.getFileInfo(this.currentFileId);
        if (fileInfo) {
            $(".allPage").html((fileInfo.currentPageIndex + 1) + " / " + fileInfo.pageCount);
            this.currentPage = fileInfo.currentPageIndex + 1;
            this.allPage = fileInfo.pageCount;
        }
        boardtab();
    };
    
    // 切换文件
    var switchFile = function(fid) {
        this.teduBoard.switchFile(fid);
    };

    // 删除文件
    var deleteFile = function(fid) {
        this.teduBoard.deleteFile(fid);
    };
    // 重绘
    var resize = function(){
        this.teduBoard.resize();
    }
    // 缩放
    var onSetScale = function(scale) {
      this.teduBoard.setBoardScale(scale);
    };
    
    var retitle = function(title) {
        var point = title.lastIndexOf(".");  
        var d_title = title.substr(0, point);
        var type = title.substr(point);
        type = type.toLowerCase();
        var temp_title = "";
        if (title.length <= 8) {
            temp_title = d_title;
        } else {
            temp_title = d_title.substr(0, 4) + "···";
        }

        // d_title 用于白板
        var array_data = [];
        array_data['temp_title'] = temp_title;
        array_data['type'] = type;
        return array_data;
    }
    var boardtab = function () {
        var str1 = "";
        var str2 = "";
        var _this = this;
        $.each(this.fileInfoList, function(i, v){
            var title = "";
            var display = "";
            var temp_title = retitle(v.title);
            title = v.title == '#DEFAULT' ? '默认页' : temp_title['temp_title']+'<i class="layui-icon">&#x1007;</i>';
            str1 += '<li id="file'+i+'" data-id="'+v.fid+'"';
            if (_this.currentFileId == v.fid) {
                str1 += 'class="active"';
            }
            if ($("#file"+i).length) {
                display = $("#file"+i).css("display");
            } else {
                display = "block";
            }
            str1 += ' style="display:'+display+'">'+title+'</li>';
        });
        $(".boardTab").html(str1);
        $.each(this.fileInfoList, function(i, v){
            if (v.title != '#DEFAULT') {
                var point = v.title.lastIndexOf(".");  
                var type = v.title.substr(point);
                type = type.toLowerCase();
                var title = "";
                str2 += '<div class="between">';
                str2 += '<div>';
                if (type == '.ppt' || type == '.pptx') {
                    str2 += '<label class="ppt">P</label>';
                } else if (type == '.pdf' || type == '.pdfx') {
                    str2 += '<label class="pdf">F</label>';
                } else if (type == '.doc' || type == '.docx') {
                    str2 += '<label class="word">W</label>';
                } else if (type == '.xls' || type == '.xlsx') {
                    str2 += '<label class="excel">E</label>';
                } else {
                    str2 += '<label class="word">W</label>';
                }

                var temp_title = retitle(v.title);
                str2 += '<span>'+temp_title['temp_title']+temp_title['type']+'</span>';
                str2 += '</div>';
                str2 += '<p class="column"><a class="Btn cancel filebtn" data-id="'+i+'" href="javascript:;">打开</a>';
                str2 += '<a class="delbtn" data-fid="'+v.fid+'" data-name="'+v.title+'" href="javascript:;">删除</a></p>';
                str2 += '</div>';
            }
        });
        $(".uploadlist").html(str2);
        resetScale();
    };
    
    return {
        init: function () {
            common();
            liveboard();
            slider();
        },
        resize: function () {
            resize();
        },
        onSetScale: function (value) {
            onSetScale(value);
        }
    };

}();

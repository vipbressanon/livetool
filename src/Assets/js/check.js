var check = function () {
    var videoElement = document.querySelector('#video');
    var audioInputSelect = document.querySelector('select#audioSource');
    var audioOutputSelect = document.querySelector('select#audioOutput');
    var videoSelect = document.querySelector('select#videoSource');
    var selectors = [audioInputSelect, audioOutputSelect, videoSelect];

    audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

    var gotDevices = function(deviceInfos){
      audioOutputSelect.innerHTML = '';
      videoSelect.innerHTML = '';
      videoSelect.innerHTML = '';
      console.log("gotDevices");
      // Handles being called several times to update labels. Preserve values.
      // const values = selectors.map(select => select.value);
      // selectors.forEach(select => {
      //   while (select.firstChild) {
      //     select.removeChild(select.firstChild);
      //   }
      // });
      console.log(deviceInfos.length);
      for (let i = 0; i !== deviceInfos.length; ++i) {
        let deviceInfo = deviceInfos[i];
        let option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
          console.log('audioinput');
          option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
          audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audiooutput') {
          option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
          audioOutputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
          option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
          videoSelect.appendChild(option);
        } else {
          console.log('Some other kind of source/device: ', deviceInfo);
        }
      }
        // selectors.forEach((select, selectorIndex) => {
        //   if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
        //     select.value = values[selectorIndex];
        //   }
        // });
        // 设备检测显示感叹号   
        if (audioOutputSelect.children.length == 0 || videoSelect.children.length == 0 || audioInputSelect.children.length == 0) {
            $(window.parent.document).find('.blackCircle .gantanhao').show();
        } else {
            $(window.parent.document).find('.blackCircle .gantanhao').hide();
        }
        if ($("#isteacher").val()=="1") {
            var option1 = document.createElement('option');
            option1.value = "no";
            option1.text = "禁用";
            audioInputSelect.appendChild(option1);
            var option2 = document.createElement('option');
            option2.value = "no";
            option2.text = "禁用";
            videoSelect.appendChild(option2);
        }
        console.log(audioInputSelect);
        $(audioInputSelect).find("option[value='"+parent.checkmic+"']").attr("selected",true);
        $(videoSelect).find("option[value='"+parent.checkcamera+"']").attr("selected",true);
    };
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

    var attachSinkId = function(element, sinkId){
        if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
          .then(() => {
            console.log(`Success, audio output device attached: ${sinkId}`);
          })
          .catch(error => {
            let errorMessage = error;
            if (error.name === 'SecurityError') {
              errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
            }
            console.error(errorMessage);
            // Jump back to first output device in the list as it's the default.
            audioOutputSelect.selectedIndex = 0;
          });
      } else {
        console.warn('Browser does not support output device selection.');
      }
    };

    var changeAudioDestination = function(){
        let audioDestination = audioOutputSelect.value;
        attachSinkId(videoElement, audioDestination);
        console.log(videoElement)
    };

    var gotStream = function(stream){
        soundMeter(stream);
        window.stream = stream; // make stream available to console
        videoElement.srcObject = stream;
        // Refresh button list in case labels have become available
        return navigator.mediaDevices.enumerateDevices();
    };

    var handleError = function(error){
        // 设备检测显示感叹号
        $(window.parent.document).find('.blackCircle .gantanhao').show();
        // console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    };

    var start = function (){
      console.log('start');
        if (window.stream) {
            window.stream.getTracks().forEach(track => {
              track.stop();
            });
        }
        var audioSource = audioInputSelect.value;
        var videoSource = videoSelect.value;
        var constraints = {
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
    };

    var soundMeter = function( info, type){
        // 分析音频流
        var meter = WebRTCAPI.SoundMeter({
            stream: info,
            onprocess: function( data ){
                if (type == 'input') {
                    $("#input_volume").val( data.volume);
                    $("#input_volume_str").text( "volume: "+ data.volume);
                    $("#input_status").text( data.status );
                } else if(type == 'output'){
                    $("#output_volume").val( data.volume);
                    $("#output_volume_str").text( "volume: "+ data.volume);
                    $("#output_status").text( data.status );
                } else {
                    $("#volume").val( data.volume);
                    $("#volume_str").text( "volume: "+ data.volume);
                    $("#status").text( data.status );
                }
            }
        })
    };


    audioInputSelect.onchange = start;
    audioOutputSelect.onchange = changeAudioDestination;

    videoSelect.onchange = start;


    return {
        init: function (isteacher) {
            start();
        }
    };
}();
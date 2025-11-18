const VOICE_MIN_DECIBELS      = -65;
const DELAY_BETWEEN_DIALOGS   = 400;
const DIALOG_MAX_LENGTH       = 60*1000;
let MEDIA_RECORDER          = null;
let IS_RECORDING            = false;

//startRecording:
function startRecording(){
    IS_RECORDING = true;
    record();
}

//stopRecording:
function stopRecording(){
    IS_RECORDING = false;
    if(MEDIA_RECORDER !== null)
        MEDIA_RECORDER.stop();
}

//record:
function record(){
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        //start recording:
        MEDIA_RECORDER = new MediaRecorder(stream);
        MEDIA_RECORDER.start();
        
        //save audio chunks:
        const audioChunks = [];
        MEDIA_RECORDER.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });
        
        //analysis:
        const audioContext      = new AudioContext();
        const audioStreamSource = audioContext.createMediaStreamSource(stream);
        const analyser          = audioContext.createAnalyser();
        analyser.minDecibels    = VOICE_MIN_DECIBELS;
        audioStreamSource.connect(analyser);
        const bufferLength      = analyser.frequencyBinCount;
        const domainData        = new Uint8Array(bufferLength);
        
        //loop:
        let time              = new Date();
        let startTime,
            lastDetectedTime    = time.getTime();
        let anySoundDetected    = false;
        const detectSound       = () => {
            
            //recording stoped by user:
            if(!IS_RECORDING)
                return;

            time = new Date();
            let currentTime = time.getTime();
            
            //time out:
            // if(currentTime > startTime + DIALOG_MAX_LENGTH){
            //     MEDIA_RECORDER.stop();
            //     return;
            // }

            //a dialog detected:
            if( anySoundDetected === true &&
                currentTime > lastDetectedTime + DELAY_BETWEEN_DIALOGS
                ){
                MEDIA_RECORDER.stop();
                return;
            }
            
            //check for detection:
            analyser.getByteFrequencyData(domainData);
            for(let i = 0; i < bufferLength; i++)
                if(domainData[i] > 0){
                    anySoundDetected = true;
                    time = new Date();
                    lastDetectedTime = time.getTime();
                }
            
            //continue the loop:
            window.requestAnimationFrame(detectSound);
        };
        window.requestAnimationFrame(detectSound);

        //stop event:
        MEDIA_RECORDER.addEventListener('stop', () => {
            
            //stop all the tracks:
            stream.getTracks().forEach(track => track.stop());
            if(!anySoundDetected) return;
            
            //send to server:
            const audioBlob = new Blob(audioChunks, {'type': 'audio/mp3'});
            doWhateverWithAudio(audioBlob);
            
            //start recording again:
            record();

        });

    });
}

//doWhateverWithAudio:
function doWhateverWithAudio(audioBlob){
  const audio = document.createElement("audio");
  const audioURL = window.URL.createObjectURL(audioBlob);
  audio.src = audioURL;
  audio.setAttribute("controls", "");
  const soundClips = document.querySelector(".sound-clips");
  soundClips.appendChild(audio)

    //.... send to server, downlod, etc.

}

const recordBtn = document.getElementById('record')
const stopBtn = document.getElementById('stop')

recordBtn.addEventListener('click',startRecording)
stopBtn.addEventListener('click',stopRecording)
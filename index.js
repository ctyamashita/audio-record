button.addEventListener('pointerup', function(event) {
  // Call navigator.bluetooth.requestDevice
  navigator.bluetooth.requestDevice({
  filters: [{
    name: "Celso's MacBook Pro (2)",
    optionalServices: ['generic_access']
  }]
  })
  .then(device => { 
    console.log('Connected to device:', device.name);
    console.log(device)
    })
});

const record = document.getElementById('record')
const snapshot = document.getElementById('snapshot')
const stop = document.getElementById('stop')
const soundClips = document.querySelector(".sound-clips");
let counter = 0;
let isRecording = false;
let mediaRecorder

// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
// https://stackoverflow.com/questions/71103807/detect-silence-in-audio-recording

record.addEventListener('click', () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      isRecording = true
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";
      record.style.color = "black";
      record.setAttribute('disabled', '')
      // let loopSection
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = (e) => {
        const mimeType = mediaRecorder.mimeType;
        // console.log("recorder stopped");

        const clipContainer = document.createElement("article");
        const clipLabel = document.createElement("p");
        const audio = document.createElement("audio");
        const deleteButton = document.createElement("button");

        clipContainer.classList.add("clip");
        audio.setAttribute("controls", "");
        deleteButton.textContent = "Delete";
        counter++
        clipLabel.textContent = `record ${counter}`;

        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);

        const blob = new Blob(chunks, { type: mimeType });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;

        deleteButton.onclick = (e) => {
          let evtTgt = e.target;
          evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };
      };
  }).catch((err) => {
    console.error(`The following getUserMedia error occurred: ${err}`);
  });
} else {
  console.log("getUserMedia not supported on your browser!");
}
})

snapshot.addEventListener('click', ()=>{
  mediaRecorder.stop()
  mediaRecorder.start()
})

stop.addEventListener('click', () => {
  isRecording = false
  mediaRecorder.stop();
  // clearInterval(loopSection)
  console.log(mediaRecorder.state);
  console.log("recorder stopped");
  record.style.background = "";
  record.style.color = "";
  record.removeAttribute('disabled')
})
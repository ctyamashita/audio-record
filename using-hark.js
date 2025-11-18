const record = document.getElementById('record')
const stop = document.getElementById('stop')
const soundClips = document.querySelector(".sound-clips");
let counter = 0;
const MIN_DECIBELS = -35;
let isRecording = false;
let soundDetected = false;
let speaking = false

// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
// https://stackoverflow.com/questions/71103807/detect-silence-in-audio-recording

function detectSoundHandler(stream) {
  const audioContext = new AudioContext();
  const audioStreamSource = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.minDecibels = -90; // Set the minimum decibel value for analysis
  analyser.maxDecibels = -10; // Set the maximum decibel value
  audioStreamSource.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const domainData = new Uint8Array(bufferLength);

  const detectSound = () => {
    if (soundDetected) {
      return
    }

    analyser.getByteFrequencyData(domainData);

    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      const value = domainData[i];
      sum += domainData[i]

      if (domainData[i] > 0) {
        console.log('soundDetected')
        soundDetected = true
      }
    }

    const averageAmplitude = sum / bufferLength;

    const db = 20 * Math.log10(averageAmplitude / 255);

    console.log(db)

    window.requestAnimationFrame(detectSound);
  };

  window.requestAnimationFrame(detectSound);
}


if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");
  navigator.mediaDevices.getUserMedia(
    // constraints - only audio needed for this app
    {
      audio: true,
    },
  ).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      let loopSection

      record.addEventListener('click', () => {
        isRecording = true
        // mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("recorder started");
        record.style.background = "red";
        record.style.color = "black";
        record.setAttribute('disabled', '')

        var options = {};
        var speechEvents = hark(stream, options);

        speechEvents.on('speaking', function() {
          console.log('speaking');
          speaking = true;
        });

        speechEvents.on('stopped_speaking', function() {
          console.log('stopped_speaking');
          speaking = false;
        });

        setInterval(() => {
          console.log(speaking)
          if (speaking && mediaRecorder.state == 'recording') {
            mediaRecorder.stop()
          } else if (mediaRecorder.state == 'inactive') {
            mediaRecorder.start()
          }
        }, 5000);
      })

      stop.addEventListener('click', () => {
        isRecording = false
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("recorder stopped");
        record.style.background = "";
        record.style.color = "";
        record.removeAttribute('disabled')
      })

      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = (e) => {
        // console.log("recorder stopped");
        console.log({ soundDetected });

        // const clipName = prompt("Enter a name for your sound clip");

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

        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;

        deleteButton.onclick = (e) => {
          let evtTgt = e.target;
          evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };
      };

      // detectSoundHandler(stream)
    })

    // Error callback
    .catch((err) => {
      console.error(`The following getUserMedia error occurred: ${err}`);
    });
} else {
  console.log("getUserMedia not supported on your browser!");
}
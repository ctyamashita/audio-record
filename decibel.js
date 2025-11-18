import DecibelMeter from 'decibel-meter'

const dbMeterDisplay = document.querySelector('#db-meter')
const dbMeterText = document.querySelector('#db-text')
const silenceTimerEl = document.querySelector('#silence-timer')

const dbMeter = new DecibelMeter
let dbMeterData
let prevDb = -100
let isTalking = false
const startTimer = new Date()
let silenceTimer = startTimer.getTime()
let soundHistory = []

dbMeter.listenTo(0, (dB, percent, value) => {
  dbMeterData = {
    dB: dB,
    percent: percent,
    value: value
  }
  soundHistory.push(Math.abs(Math.round(dB)))
})

dbMeter.on('connect', ()=>{
  setInterval(() => {
    const { dB, percent, value } = dbMeterData
    const dbChange = dB - prevDb
    
    if (dbChange >= 15) {
      dbMeterText.innerHTML = 'silence'
      const time = new Date();
      const currentTime = time.getTime();
      const timeInSilence = currentTime - silenceTimer
      silenceTimerEl.innerHTML = `${timeInSilence / 1000} seconds`
      // console.log(timeInSilence)
      silenceTimer = currentTime
      isTalking = false
    } else {
      dbMeterText.innerHTML = 'talking'
    }
    dbMeterDisplay.innerHTML = `
      <p>dB: ${dB}</p>
      <p>percent: ${percent}</p>
      <p>value: ${value}</p>
    `
    prevDb = dB
    const pastFiveSec = soundHistory.slice(-50)
    const soundDetected = pastFiveSec.reduce((a,b)=>a+b) / 50
    console.log(soundDetected)
  }, 1000);
})

// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//   navigator.mediaDevices.getUserMedia({ audio: true })
//     .then((stream) => {
//       const audioContext = new AudioContext();
//       const audioStreamSource = audioContext.createMediaStreamSource(stream);
//       const analyser = audioContext.createAnalyser();
//       analyser.minDecibels = -90; // Set the minimum decibel value for analysis
//       analyser.maxDecibels = -10; // Set the maximum decibel value
//       analyser.fftSize = 256; // Define the size of the FFT for frequency analysis
//       audioStreamSource.connect(analyser);

//       const bufferLength = analyser.frequencyBinCount;
//       const domainData = new Uint8Array(bufferLength);

//       const detectSound = () => {
//         analyser.getByteFrequencyData(domainData);

//         let sum = 0
//         for (let i = 0; i < bufferLength; i++) {
//           sum += domainData[i]
//         }

//         const averageAmplitude = sum / bufferLength;

//         const db = (20 * Math.log10(averageAmplitude / 255)).toFixed(2);

//         dbMeter.innerHTML = db

//         window.requestAnimationFrame(detectSound);
//       };

//       window.requestAnimationFrame(detectSound);
//     })
// }
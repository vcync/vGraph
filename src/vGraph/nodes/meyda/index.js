import Meyda from "meyda";

let meyda;
(async () => {
  const isSafari = navigator.vendor === "Apple Computer, Inc.";
  console.log(isSafari);

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  let mediaStream;

  if (!isSafari) {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: { exact: false }
      }
    });
  } else {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
  }

  // Create new Audio Context
  let audioContext;
  if (!isSafari) {
    audioContext = new AudioContext({
      latencyHint: "playback"
    });
  } else {
    audioContext = new AudioContext();
  }

  // Create new Audio Analyser
  const analyserNode = audioContext.createAnalyser();

  // Create a gain node
  const gainNode = audioContext.createGain();

  // Mute the node
  gainNode.gain.value = 0;

  // Create the audio input stream (audio)
  const audioStream = audioContext.createMediaStreamSource(mediaStream);

  // Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
  audioStream.connect(analyserNode);

  // Connect the audio stream to the gain node (audio->(analyser)->gain)
  audioStream.connect(gainNode);

  // Connect the gain node to the output (audio->(analyser)->gain->destination)
  gainNode.connect(audioContext.destination);

  // Set up Meyda
  // eslint-disable-next-line
  meyda = new Meyda.createMeydaAnalyzer({
    audioContext,
    source: audioStream,
    bufferSize: 512,
    windowingFunction: "rect",
    featureExtractors: ["rms", "energy", "zcr"]
  });
})();

let lastFrameId = 0;
let features = {};

function getFeatures(delta) {
  if (delta !== lastFrameId) {
    features = meyda.get();
  }
  lastFrameId = delta;
}

export default [
  {
    name: "meyda/energy",
    group: "audio/meyda",
    description: "The Energy of the audio stream",
    outputs: {
      energy: {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs, delta }) {
      getFeatures(delta);
      outputs["energy"].value = features.energy;
    }
  },

  {
    name: "meyda/rms",
    group: "audio/meyda",
    description: "The RMS of the audio stream",
    outputs: {
      rms: {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs, delta }) {
      getFeatures(delta);
      outputs["rms"].value = features.rms;
    }
  },

  {
    name: "meyda/zcr",
    group: "audio/meyda",
    description: "The ZCR of the audio stream",
    outputs: {
      zcr: {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs, delta }) {
      getFeatures(delta);
      outputs["zcr"].value = features.zcr;
    }
  }
];

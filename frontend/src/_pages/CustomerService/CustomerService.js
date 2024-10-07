import React, { useState, useEffect } from 'react';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  let ws = null;
  let audioContext = null;
  let mediaStreamSource = null;
  let scriptProcessor = null;

  const connectWebSocket = (uri) => {
    ws = new WebSocket(uri);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (message) => {
      console.log("Message from WebSocket server:", message.data);
      setTranscription(message.data);
    };
  };

  const startRecording = () => {
    if (isRecording) {
      return; // Already recording
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // Create an AudioContext with a sample rate of 16kHz
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

        // Create a MediaStreamAudioSourceNode from the input stream
        mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // Create a ScriptProcessorNode for processing the audio data
        scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

        // Connect the source to the processor and then to the destination (output)
        mediaStreamSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        // Process audio in 4096 sample chunks and send to WebSocket
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const audioData = audioProcessingEvent.inputBuffer.getChannelData(0); // Get data for the first channel
          
          // Convert Float32Array to Int16Array for PCM format
          const pcmData = convertFloat32ToInt16(audioData);
          
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(pcmData.buffer); // Send raw PCM data as ArrayBuffer
            console.log("Sent audio data to WebSocket.");
          }
        };

        console.log("Recording started...");
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (scriptProcessor) {
      scriptProcessor.disconnect(); // Disconnect the processor
    }
    if (mediaStreamSource) {
      mediaStreamSource.disconnect(); // Disconnect the media stream source
    }
    if (audioContext) {
      audioContext.close(); // Close the audio context
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("submit_response"); // Send stop signal to WebSocket server
      console.log("Stopped recording and submitted response.");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      connectWebSocket('ws://localhost:8000/TranscribeStreaming');
      startRecording();
      setIsRecording(true);
    }
  };

  const convertFloat32ToInt16 = (float32Array) => {
    let int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767; // Convert to 16-bit PCM
    }
    return int16Array;
  };

  return (
    <div className="App">
      <h1>WebSocket Audio Streaming</h1>
      <button onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h2>Transcription:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default App;

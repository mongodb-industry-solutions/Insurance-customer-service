import React, { useState, useEffect } from 'react';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  let ws = null; // WebSocket instance
  let audioContext = null; // AudioContext instance
  let mediaStreamSource = null; // MediaStreamSource instance
  let scriptProcessor = null; // ScriptProcessorNode instance
  let mediaRecorder = null; // MediaRecorder instance

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
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

        mediaStreamSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        // Handle audio data from the microphone
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const audioData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmData = convertFloat32ToInt16(audioData);

          // Send audio data to WebSocket
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(pcmData.buffer);
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
    // Stop MediaRecorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop(); // Stop the MediaRecorder
      console.log("MediaRecorder stopped.");
    }

    // Disconnect and close audio context
    if (scriptProcessor) {
      scriptProcessor.disconnect(); // Disconnect script processor
      console.log("Script processor disconnected.");
    }
    if (mediaStreamSource) {
      mediaStreamSource.disconnect(); // Disconnect media stream source
      console.log("Media stream source disconnected.");
    }
    if (audioContext) {
      audioContext.close().then(() => {
        console.log("Audio context closed.");
      }).catch((err) => {
        console.error("Error closing AudioContext:", err);
      });
    }

    // Close WebSocket connection
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("submit_response"); // Send stop signal to WebSocket server
      ws.close(); // Close WebSocket connection
      console.log("WebSocket connection closed.");
    }

    // Update the recording state
    setIsRecording(false);
    console.log("Recording stopped and state updated.");
  };

  const toggleRecording = () => {
    // Print when the button is clicked
    console.log("Recording button clicked. Current recording state:", isRecording);

    if (isRecording) {
      console.log("Stopping the recording...");
      stopRecording(); // Stop recording when already recording
    } else {
      console.log("Starting the recording...");
      connectWebSocket('ws://localhost:8000/TranscribeStreaming'); // Start WebSocket connection
      startRecording(); // Start audio recording
    }

    // Toggle the recording state
    setIsRecording(!isRecording);
    console.log("Recording state toggled. New state:", !isRecording);
  };

  // Utility function to convert Float32Array to Int16Array (required for WebSocket)
  const convertFloat32ToInt16 = (float32Array) => {
    let int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767; // Convert to 16-bit PCM
    }
    return int16Array;
  };

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

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

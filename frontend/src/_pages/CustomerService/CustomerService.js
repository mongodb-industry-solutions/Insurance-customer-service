import React, { useState, useEffect } from 'react';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [apiResult, setApiResult] = useState(''); // New state for API response

  let ws = null; // WebSocket instance
  let audioContext = null; // AudioContext instance
  let mediaStreamSource = null; // MediaStreamSource instance
  let scriptProcessor = null; // ScriptProcessorNode instance
  let mediaRecorder = null; // MediaRecorder instance

  const connectWebSocket = (uri) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already open.");
      return;  // Do not reinitialize the WebSocket if already open
    }
  
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
  
    // Step 1: Establish WebSocket connection first
    connectWebSocket('ws://localhost:8000/TranscribeStreaming'); 
  
    ws.onopen = () => {
      console.log("WebSocket connection established.");
  
      // Step 2: Only start recording once WebSocket connection is open
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
            } else {
              console.log("WebSocket is not open. Audio not sent.");
            }
          };
  
          console.log("Recording started...");
          setIsRecording(true);  // Set the recording state only if recording starts
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    };
  
    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const stopRecording = async () => {
    try {
      console.log("Attempting to stop recording...");
  
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("submit_response");  // Send stop signal only if WebSocket is open
        console.log("Sent 'submit_response' to WebSocket.");
      } else {
        console.log("WebSocket is not open or already closed, state:", ws ? ws.readyState : "undefined");
      }
  
      // Stop audio processing
      if (scriptProcessor) {
        scriptProcessor.disconnect();
        console.log("Script processor disconnected.");
      }
      if (mediaStreamSource) {
        mediaStreamSource.disconnect();
        console.log("Media stream source disconnected.");
      }
      if (audioContext && audioContext.state !== "closed") {
        await audioContext.close();
        console.log("Audio context closed.");
      }
  
      // Update the recording state
      setIsRecording(false);
      console.log("Recording stopped and state updated.");
  
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();  // Stop recording
    } else {
      connectWebSocket('ws://localhost:8000/TranscribeStreaming');  // Connect WebSocket once
      startRecording();  // Start audio recording
    }
  
    setIsRecording(!isRecording);  // Toggle the recording state
  };

  // Utility function to convert Float32Array to Int16Array (required for WebSocket)
  const convertFloat32ToInt16 = (float32Array) => {
    let int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767; // Convert to 16-bit PCM
    }
    return int16Array;
  };

  // UseEffect to log transcription updates and make API call
  useEffect(() => {
    if (transcription) {
      console.log("Current transcription:", transcription);

      // Send the transcription to the textSearch API
      fetch("http://localhost:8000/textSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: transcription }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Response from testSearch API:", data);
          setApiResult(data.message); // Set the API result to state
        })
        .catch((error) => {
          console.error("Error sending transcription to testSearch:", error);
        });
    }
  }, [transcription]);

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
      <h1>Audio Streaming</h1>
      <button onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h2>Transcription:</h2>
        <p>{transcription}</p>
      </div>
      <div>
        <h2>API Response:</h2>
        <p>{apiResult}</p> {/* Display the API result */}
      </div>
    </div>
  );
};

export default App;

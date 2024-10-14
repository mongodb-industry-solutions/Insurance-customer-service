import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Importing CSS for styling

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [apiResult, setApiResult] = useState(''); // New state for API response

  let ws = useRef(null); // WebSocket instance
  let audioContext = useRef(null); // AudioContext instance
  let mediaStreamSource = useRef(null); // MediaStreamSource instance
  let scriptProcessor = useRef(null); // ScriptProcessorNode instance

  const connectWebSocket = (uri) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already open.");
      return;  // Do not reinitialize the WebSocket if already open
    }
  
    ws.current = new WebSocket(uri);
  
    ws.current.onopen = () => {
      console.log("WebSocket connection established.");
    };
  
    ws.current.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  
    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  
    ws.current.onmessage = (message) => {
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
  
    ws.current.onopen = () => {
      console.log("WebSocket connection established.");
  
      // Step 2: Only start recording once WebSocket connection is open
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          audioContext.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  
          mediaStreamSource.current = audioContext.current.createMediaStreamSource(stream);
          scriptProcessor.current = audioContext.current.createScriptProcessor(4096, 1, 1);
  
          mediaStreamSource.current.connect(scriptProcessor.current);
          scriptProcessor.current.connect(audioContext.current.destination);
  
          // Handle audio data from the microphone
          scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
            const audioData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmData = convertFloat32ToInt16(audioData);
  
            // Send audio data to WebSocket
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              ws.current.send(pcmData.buffer);
              console.log("Sent audio data to WebSocket.");
            } else {
              console.log("WebSocket is not open. Audio not sent.");
            }
          };
  
          console.log("Recording started....");
          setIsRecording(true);  // Set the recording state only if recording starts
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    };
  
  };

  const stopRecording = async () => {
    // Step 1: Disconnect the media stream source and script processor
    if (mediaStreamSource.current && scriptProcessor.current) {
      mediaStreamSource.current.disconnect(scriptProcessor.current);
      scriptProcessor.current.disconnect(audioContext.current.destination);
      scriptProcessor.current.onaudioprocess = null; // Clear event handler
      console.log("Media stream source and script processor disconnected.");
    }

    // Step 2: Stop the audio context to release microphone access
    if (audioContext.current) {
      audioContext.current.close().then(() => {
        console.log("Audio context closed.");
      });
    }

    // Step 3: Stop the media stream (important for releasing the microphone)
    if (mediaStreamSource.current && mediaStreamSource.current.mediaStream) {
      mediaStreamSource.current.mediaStream.getTracks().forEach((track) => track.stop());
    }

    // Step 4: Close the WebSocket connection
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      ws.current.onclose = () => {
        console.log("WebSocket connection closed.");
      };
      ws.current.close();  // Only close the WebSocket if it's open or connecting
    } else {
      console.log("WebSocket is already closed or not initialized.");
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
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <div className="left-panel">
        <h2>Suggested questions</h2>
        <p>How can I add a policy to my insurance?</p>
        <p>How can I file a claim?</p>
        <p>How do I make a payment on my policy?</p>
      </div>

      <div className="separator"></div> {/* Add the separator here */}

      <div className="right-panel">
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
    </div>
  );
};

export default App;
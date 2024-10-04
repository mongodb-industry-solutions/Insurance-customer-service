import React, { useState, useEffect } from 'react';


const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false); // To track recording state
  const [socket, setSocket] = useState(null); // WebSocket connection state
  const [audioContext, setAudioContext] = useState(null); // AudioContext state
  const [mediaStream, setMediaStream] = useState(null); // Media stream for microphone input
  const [audioNode, setAudioNode] = useState(null); // AudioWorkletNode state

  // WebSocket connection handler
  useEffect(() => {
    if (!isRecording) return;

    const ws = new WebSocket('ws://localhost:8000/TranscribeStreaming');

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log('Received transcription: ', event.data);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isRecording]);

  // Handle audio recording
  const startRecording = async () => {
    setIsRecording(true);
  
    try {
      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          sampleSize: 16,
        },
      });
  
      // Proceed if stream is successfully obtained
      const context = new AudioContext();
      await context.audioWorklet.addModule('audioProcessor.js'); // Load the custom audio processor
      const source = context.createMediaStreamSource(stream);
      const audioWorkletNode = new AudioWorkletNode(context, 'audio-processor');
  
      // Listen for messages (audio data) from the AudioWorkletProcessor
      audioWorkletNode.port.onmessage = (event) => {
        const audioBuffer = event.data; // Get the audio buffer from the processor
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(audioBuffer); // Send audio data to the server
        }
      };
  
      // Connect the audio source to the worklet processor
      source.connect(audioWorkletNode);
      audioWorkletNode.connect(context.destination);
  
      setAudioContext(context);
      setMediaStream(stream);
      setAudioNode(audioWorkletNode);
  
      // Automatically stop the recording after 5 minutes
      setTimeout(() => stopRecording(), 1000 * 300); // 5 minutes in milliseconds
  
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.error('Microphone access denied by the user.');
      } else if (err.name === 'NotFoundError') {
        console.error('No microphone found on this device.');
      } else {
        console.error('Error accessing the microphone:', err);
      }
      setIsRecording(false); // Ensure recording state is updated if an error occurs
    }
  };
  

  const stopRecording = () => {
    setIsRecording(false);

    // Stop sending audio to WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("submit_response"); // Notify the server that recording is done
      socket.close(); // Close WebSocket connection
    }

    // Stop the media stream and audio context
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    if (audioContext) {
      audioContext.close();
    }

    if (audioNode) {
      audioNode.port.close(); // Close the port between the main thread and the worklet
    }
  };

  return (
    <div>
      <h1>Streaming Audio Recorder</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default AudioRecorder;

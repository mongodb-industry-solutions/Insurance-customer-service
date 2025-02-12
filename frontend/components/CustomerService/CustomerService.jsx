"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./CustomerService.module.css";

const CustomerService = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [apiResult, setApiResult] = useState(""); // New state for API response

  const [showPanels, setShowPanels] = useState(false); // Control visibility of panels
  const [timer, setTimer] = useState(0); // Timer state
  const intervalRef = useRef(null); // Reference to store timer interval

  let ws = useRef(null); // WebSocket instance
  let audioContext = useRef(null); // AudioContext instance
  let mediaStreamSource = useRef(null); // MediaStreamSource instance
  let scriptProcessor = useRef(null); // ScriptProcessorNode instance

  // Start timer function
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
    }, 1000);
  };

  // Stop timer function
  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  const acceptCall = () => {
    setShowPanels(true);
    startTimer(); // Start the timer when call is accepted
  };

  const declineCall = () => {
    stopTimer();
    setShowPanels(false); // Reset to initial state
    setTimer(0); // Reset timer
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const connectWebSocket = (uri) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already open.");
      return; // Do not reinitialize the WebSocket if already open
    }

    // Create a new WebSocket if it's not open
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
      setTranscription(message.data); // Set transcription from WebSocket
    };
  };

  const startRecording = () => {
    if (isRecording) return; // Already recording

    // Establish WebSocket connection first
    connectWebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log("WebSocket connection established.");

      // Start recording after WebSocket connection is open
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          audioContext.current = new (window.AudioContext ||
            window.webkitAudioContext)({ sampleRate: 16000 });

          mediaStreamSource.current =
            audioContext.current.createMediaStreamSource(stream);
          scriptProcessor.current = audioContext.current.createScriptProcessor(
            4096,
            1,
            1
          );

          mediaStreamSource.current.connect(scriptProcessor.current);
          scriptProcessor.current.connect(audioContext.current.destination);

          // Process microphone audio data
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

          console.log("Recording started...");
          setIsRecording(true); // Set the recording state after it starts
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    };
  };

  const stopRecording = async () => {
    // Disconnect media stream and script processor
    if (mediaStreamSource.current && scriptProcessor.current) {
      mediaStreamSource.current.disconnect(scriptProcessor.current);
      scriptProcessor.current.disconnect(audioContext.current.destination);
      scriptProcessor.current.onaudioprocess = null;
      console.log("Media stream source and script processor disconnected.");
    }

    // Stop the audio context
    if (audioContext.current) {
      audioContext.current.close().then(() => {
        console.log("Audio context closed.");
      });
    }

    // Stop the media stream tracks to release the microphone
    if (mediaStreamSource.current && mediaStreamSource.current.mediaStream) {
      mediaStreamSource.current.mediaStream.getTracks().forEach((track) =>
        track.stop()
      );
    }

    // Close the WebSocket connection only if it’s still open
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
      console.log("WebSocket connection closed.");
    } else {
      console.log("WebSocket is already closed or not initialized.");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording(); // Stop recording
    } else {
      connectWebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL); // Ensure WebSocket is connected
      startRecording(); // Start audio recording
    }

    setIsRecording(!isRecording); // Toggle the recording state
  };

  // Convert Float32Array to Int16Array (WebSocket required format)
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

      // Send transcription to textSearch API
      fetch(process.env.NEXT_PUBLIC_TEXT_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: transcription }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Response from textSearch API:", data);
          setApiResult(data.message); // Set API result to state
        })
        .catch((error) => {
          console.error("Error sending transcription to textSearch:", error);
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
    <div className={styles.content}>
      {/* Call Card - Show this only when panels are not shown */}
      {!showPanels && (
        <div className={styles.callCard}>
          <p className={styles.name}>Jane Morris</p>
          <p className={styles.calling}>is now calling...</p>
          <button className={styles.acceptBtn} onClick={acceptCall}>
            Accept
          </button>
          <button className={styles.declineBtn} onClick={declineCall}>
            Decline
          </button>
        </div>
      )}

      {showPanels && (
        <>
          <div className={styles.leftPanel}>
            <h2>Call in Progress {formatTime(timer)}</h2>

            <button
              className={`${styles.recordButton} ${isRecording ? styles.pulsing : ""
                }`}
              onClick={toggleRecording}
            >
              {isRecording ? (
                <img
                  src="/mic-stop.svg"
                  alt="Stop Button"
                  width="30"
                  height="30"
                />
              ) : (
                <img
                  src="/mic-start.svg"
                  alt="Start Button"
                  width="30"
                  height="30"
                />
              )}
            </button>

            <div className={styles.suggestionSection}>
              <h3>Try asking ...</h3>

              <div className={styles.suggestionContainer}>
                <p className={styles.suggestion}>
                  How can I add a driver to my insurance?
                </p>
                <p className={styles.suggestion}>How can I file a claim?</p>
                <p className={styles.suggestion}>
                  How do I make a payment on my policy?
                </p>
              </div>
            </div>

            <div>
              <div className={styles.badgeContainer}>
                <div className={styles.badge}>Live Transcription</div>
              </div>

              <p>{transcription}</p>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <h2 id="header">AI Assistant</h2>

            <div className={styles.customerInfo}>
              <div className={styles.customerPhotos}>
                <div className={styles.customerPhoto}>
                  <img
                    src="./jane.png"
                    alt="Customer Photo"
                    className={styles.customerPhotoImage}
                  />
                  <p className={styles.fieldContent}>Jane Morris</p>

                  <div className={styles.customerLocation}>
                    <img
                      src="./fi_map-pin.svg"
                      alt="Customer Photo 2"
                      className={styles.customerIcon}
                    />
                    <p className={styles.fieldContentLocation}>Boise, Idaho</p>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.row}>
                  <div className={styles.fieldWrapper}>
                    <p className={styles.fieldTitle}>DoB</p>
                    <p className={styles.fieldContent}>05/02/1985</p>
                  </div>

                  <div className={styles.fieldWrapper}>
                    <p className={styles.fieldTitle}>Customer Since</p>
                    <p className={styles.fieldContent}>01/01/2020</p>
                  </div>

                  <div className={styles.fieldWrapper}>
                    <p className={styles.fieldTitle}>Customer Sentiment</p>
                    <p className={styles.fieldContentSentiment}>Positive</p>
                  </div>
                </div>

                <hr className={styles.line} />

                <div className={styles.row}>
                  <div className={styles.fieldWrapper}>
                    <p className={styles.fieldTitle}>Active Policies</p>
                    <p className={styles.fieldContent}>Car Insurance</p>
                  </div>

                  <div className={styles.fieldWrapper}>
                    <p className={styles.fieldTitle}>Current Premium</p>
                    <p className={styles.fieldContent}>$230/month</p>
                  </div>

                  <div className={styles.fieldWrapper}>
                    <p className={styles.fieldTitle}>Active Claims</p>
                    <p className={styles.fieldContentClaim}>Claim XDS</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3>Suggested Answer</h3>
              <p className={styles.answer}>{apiResult}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerService;
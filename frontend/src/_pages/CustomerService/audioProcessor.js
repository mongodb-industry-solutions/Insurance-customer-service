// audioProcessor.js
class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input.length > 0) {
        const audioData = input[0]; // Get audio data from the first input
        const int16Array = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          int16Array[i] = audioData[i] * 32767; // Convert float audio data to int16
        }
  
        // Send the audio data to the main thread via a message port
        this.port.postMessage(int16Array.buffer);
      }
      return true; // Continue processing
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  
// audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.port.onmessage = this.handleMessage.bind(this);
    }
  
    handleMessage(event) {
      // Handle any messages from the main thread here if needed
    }
  
    process(inputs) {
      const input = inputs[0]; // Audio input (mono channel)
      if (input.length > 0) {
        const audioData = input[0];
        // Send PCM data to the main thread
        this.port.postMessage(audioData);
      }
      return true;
    }
  }
  
  // Register the processor
  registerProcessor('audio-processor', AudioProcessor);
  
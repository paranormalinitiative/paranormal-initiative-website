class OpenVoiceChangerCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.chunkSize = options.processorOptions?.chunkSize || 1024;
    this.buffer = new Float32Array(this.chunkSize);
    this.index = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    for (const sample of input) {
      this.buffer[this.index++] = sample;
      if (this.index === this.chunkSize) {
        this.port.postMessage(this.buffer.slice(0));
        this.index = 0;
      }
    }
    return true;
  }
}

class OpenVoiceChangerPlaybackProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.prebufferFrames = 2;
    this.maxFrames = 8;
    this.frames = [];
    this.currentFrame = null;
    this.currentIndex = 0;
    this.expectedSequence = null;
    this.started = false;
    this.gain = 0;
    this.targetGain = 0;
    this.rampSamples = 64;
    this.port.onmessage = (event) => {
      const message = event.data;
      const isFrame = message && message.type === "frame";
      const sequence = isFrame && Number.isInteger(message.sequence) ? message.sequence : null;
      const samples = isFrame
        ? (message.samples instanceof Float32Array ? message.samples : new Float32Array(message.samples))
        : (message instanceof Float32Array ? message : new Float32Array(message));
      if (!samples.length) return;
      if (sequence !== null) {
        if (this.expectedSequence !== null && sequence < this.expectedSequence) return;
        if (this.expectedSequence !== null && sequence > this.expectedSequence) {
          this.port.postMessage({ type: "sequence-gap", expected: this.expectedSequence, received: sequence });
        }
        this.expectedSequence = sequence + 1;
      }
      if (this.frames.length >= this.maxFrames) this.frames.shift();
      this.frames.push(samples);
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0]?.[0];
    if (!output) return true;
    for (let i = 0; i < output.length; i += 1) {
      if (!this.started && this.frames.length >= this.prebufferFrames) {
        this.started = true;
        this.targetGain = 1;
      }
      if (!this.currentFrame || this.currentIndex >= this.currentFrame.length) {
        this.currentFrame = this.frames.shift() || null;
        this.currentIndex = 0;
      }
      if (this.started && !this.currentFrame && !this.frames.length) {
        this.started = false;
        this.targetGain = 0;
      }
      const sample = this.currentFrame ? this.currentFrame[this.currentIndex++] : 0;
      this.gain += (this.targetGain - this.gain) / this.rampSamples;
      output[i] = sample * this.gain;
    }
    return true;
  }
}

registerProcessor("openvoicechanger-capture", OpenVoiceChangerCaptureProcessor);
registerProcessor("openvoicechanger-playback", OpenVoiceChangerPlaybackProcessor);

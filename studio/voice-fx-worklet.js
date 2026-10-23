class StudioFlowVoiceFxProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.settings = {
      effect: "natural",
      mode: "custom",
      enabled: false,
      pitchSemitones: 0,
      resonance: 0,
      clarity: 0,
      outputGain: 1,
      gateEnabled: false,
      gateThreshold: 0.012,
      echoDelay: 0.24,
      echoFeedback: 0.28,
      reverbMix: 0.32
    };
    this.phase = 0;
    this.echoBuffer = new Float32Array(Math.max(1, sampleRate * 2));
    this.reverbBuffers = [
      new Float32Array(Math.max(1, Math.floor(sampleRate * 0.11))),
      new Float32Array(Math.max(1, Math.floor(sampleRate * 0.19))),
      new Float32Array(Math.max(1, Math.floor(sampleRate * 0.31)))
    ];
    this.echoIndex = 0;
    this.reverbIndex = 0;
    this.lowState = [0, 0];
    this.highState = [0, 0];
    this.gateGain = 1;
    this.pitchBufferSize = Math.max(4096, Math.floor(sampleRate * 2));
    this.pitchGrainSize = Math.max(512, Math.floor(sampleRate * 0.045));
    this.pitchHop = Math.floor(this.pitchGrainSize / 2);
    this.pitchBuffers = [new Float32Array(this.pitchBufferSize), new Float32Array(this.pitchBufferSize)];
    this.pitchWrite = 0;
    this.pitchGrains = [
      { start: 0, age: 0 },
      { start: 0, age: this.pitchHop }
    ];
    this.port.onmessage = (event) => {
      if (event.data?.type === "settings") this.settings = { ...this.settings, ...event.data.settings };
      if (event.data?.type === "reset") this.resetBuffers();
    };
    this.port.postMessage({ type: "ready" });
  }

  resetBuffers() {
    this.echoBuffer.fill(0);
    this.reverbBuffers.forEach((buffer) => buffer.fill(0));
    this.echoIndex = 0;
    this.reverbIndex = 0;
    this.phase = 0;
    this.lowState = [0, 0];
    this.highState = [0, 0];
    this.gateGain = 1;
    this.pitchBuffers.forEach((buffer) => buffer.fill(0));
    this.pitchWrite = 0;
    this.pitchGrains = [
      { start: 0, age: 0 },
      { start: 0, age: this.pitchHop }
    ];
  }

  readPitchSample(channel, start, age, ratio) {
    const buffer = this.pitchBuffers[channel] || this.pitchBuffers[0];
    const position = (start + age * ratio + this.pitchBufferSize) % this.pitchBufferSize;
    const lower = Math.floor(position);
    const upper = (lower + 1) % this.pitchBufferSize;
    const fraction = position - lower;
    return buffer[lower] * (1 - fraction) + buffer[upper] * fraction;
  }

  pitchShift(input, channel) {
    const semitones = Math.max(-12, Math.min(12, Number(this.settings.pitchSemitones) || 0));
    if (Math.abs(semitones) < 0.01) return input;
    const ratio = Math.pow(2, semitones / 12);
    let weighted = 0;
    let weight = 0;
    this.pitchGrains.forEach((grain) => {
      const age = Math.max(0, Math.min(this.pitchGrainSize - 1, grain.age));
      const envelope = 0.5 - 0.5 * Math.cos((2 * Math.PI * age) / (this.pitchGrainSize - 1));
      weighted += this.readPitchSample(channel, grain.start, age, ratio) * envelope;
      weight += envelope;
      grain.age += 1;
      if (grain.age >= this.pitchGrainSize) {
        grain.age = 0;
        grain.start = (this.pitchWrite - this.pitchGrainSize + this.pitchBufferSize) % this.pitchBufferSize;
      }
    });
    return weight > 0.001 ? weighted / weight : input;
  }

  filterSample(input, channel, effect) {
    const lowCut = effect === "telephone" || effect === "megaphone" ? 0.12 : 0.04;
    const highCut = effect === "telephone" ? 0.21 : effect === "megaphone" ? 0.32 : 0.08;
    const resonance = Math.max(-1, Math.min(1, Number(this.settings.resonance) || 0));
    this.lowState[channel] += Math.max(0.01, lowCut - resonance * 0.018) * (input - this.lowState[channel]);
    const high = input - this.lowState[channel];
    this.highState[channel] += highCut * (high - this.highState[channel]);
    return this.highState[channel] + this.lowState[channel] * resonance * 0.55;
  }

  processEffect(input, channel, effect) {
    if (effect === "telephone") return this.filterSample(input, channel, effect) * 2.3;
    if (effect === "megaphone") return Math.tanh(this.filterSample(input, channel, effect) * 4.2) * 1.35;
    if (effect === "deep") return this.filterSample(input, channel, effect) * 1.65 + input * 0.25;
    if (effect === "robot") {
      this.phase += (2 * Math.PI * 31) / sampleRate;
      if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;
      return input * (0.28 + 0.72 * (0.5 + 0.5 * Math.sin(this.phase)));
    }
    if (effect === "ghost") {
      this.phase += (2 * Math.PI * 4.2) / sampleRate;
      if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;
      return input * (0.62 + 0.38 * Math.sin(this.phase));
    }
    return input;
  }

  processReverb(input) {
    let wet = 0;
    this.reverbBuffers.forEach((buffer, index) => {
      const cursor = (this.reverbIndex + buffer.length - 1) % buffer.length;
      wet += buffer[cursor] * [0.48, 0.32, 0.2][index];
      buffer[this.reverbIndex % buffer.length] = input + buffer[cursor] * 0.25;
    });
    this.reverbIndex = (this.reverbIndex + 1) % this.reverbBuffers[0].length;
    return input * (1 - this.settings.reverbMix) + wet * this.settings.reverbMix;
  }

  processEcho(input) {
    const delay = Math.max(1, Math.min(this.echoBuffer.length - 1, Math.floor(this.settings.echoDelay * sampleRate)));
    const readIndex = (this.echoIndex + this.echoBuffer.length - delay) % this.echoBuffer.length;
    const delayed = this.echoBuffer[readIndex];
    this.echoBuffer[this.echoIndex] = input + delayed * Math.max(0, Math.min(0.85, this.settings.echoFeedback));
    this.echoIndex = (this.echoIndex + 1) % this.echoBuffer.length;
    return input * 0.78 + delayed * 0.42;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || input.length === 0) return true;
    const frameCount = output[0]?.length || 0;
    for (let index = 0; index < frameCount; index += 1) {
      for (let channel = 0; channel < this.pitchBuffers.length; channel += 1) {
        const inputChannel = input[channel] || input[0];
        this.pitchBuffers[channel][this.pitchWrite] = inputChannel?.[index] || 0;
      }
      let pitchedSample = null;
      for (let channel = 0; channel < output.length; channel += 1) {
        const inputChannel = input[channel] || input[0];
        const outputChannel = output[channel];
        let sample = inputChannel?.[index] || 0;
        if (this.settings.enabled) {
          if (channel === 0) pitchedSample = this.pitchShift(sample, 0);
          sample = pitchedSample ?? sample;
        }
        // The gate must never hard-cut individual samples. That caused both
        // the silent processed meter and the recurring clicks reported during
        // Natural monitoring. Natural/bypassed audio also must not be gated.
        const gateThreshold = Math.max(0, Number(this.settings.gateThreshold) || 0);
        const gateEnabled = Boolean(this.settings.enabled) && Boolean(this.settings.gateEnabled) && gateThreshold > 0;
        const gateTarget = !gateEnabled || Math.abs(sample) >= gateThreshold ? 1 : 0;
        const gateRate = gateTarget > this.gateGain ? 0.04 : 0.0018;
        this.gateGain += (gateTarget - this.gateGain) * gateRate;
        const gate = this.gateGain;
        if (this.settings.enabled && (this.settings.effect !== "natural" || Math.abs(this.settings.pitchSemitones || 0) > 0.01 || Math.abs(this.settings.resonance || 0) > 0.01 || Math.abs(this.settings.clarity || 0) > 0.01)) {
          sample = this.processEffect(sample, channel, this.settings.effect);
          const clarity = Math.max(0, Math.min(1, Number(this.settings.clarity) || 0));
          if (clarity > 0) sample = sample * (1 + clarity * 0.35) - this.lowState[channel] * clarity * 0.22;
          if (this.settings.effect === "echo") sample = this.processEcho(sample);
          if (this.settings.effect === "reverb" || this.settings.effect === "ghost") sample = this.processReverb(sample);
        }
        sample *= gate * Math.max(0, Math.min(2, this.settings.outputGain));
        outputChannel[index] = Math.tanh(sample);
      }
      this.pitchWrite = (this.pitchWrite + 1) % this.pitchBufferSize;
    }
    return true;
  }
}

registerProcessor("studioflow-voice-fx", StudioFlowVoiceFxProcessor);

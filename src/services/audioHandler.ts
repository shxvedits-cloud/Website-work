/**
 * Utility for handling PCM audio processing for the Gemini Live API.
 */

export class AudioHandler {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioQueue: Int16Array[] = [];
  private isPlaying = false;
  private nextStartTime = 0;

  private activeSources: AudioBufferSourceNode[] = [];

  constructor(private sampleRate: number = 16000) {}

  async startInput(onAudioData: (base64Data: string) => void) {
    try {
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Using ScriptProcessorNode for simplicity in this environment, 
      // though AudioWorklet is preferred in modern apps.
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Safer base64 encoding for large buffers
        const bytes = new Uint8Array(pcmData.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        onAudioData(base64Data);
      };

      this.source.connect(this.processor);
      
      // Connect to a silent gain node to ensure the processor runs
      const silentGain = this.audioContext.createGain();
      silentGain.gain.value = 0;
      this.processor.connect(silentGain);
      silentGain.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error starting audio input:', error);
      throw error;
    }
  }

  stopInput() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach(track => track.stop());
    this.audioContext?.close();
    this.processor = null;
    this.source = null;
    this.stream = null;
    this.audioContext = null;
    this.nextStartTime = 0; // Reset timing for next session
  }

  async playAudioChunk(base64Data: string) {
    try {
      if (!this.audioContext || this.audioContext.state === 'closed') {
        // Use a standard sample rate for the context, or let it default
        this.audioContext = new AudioContext();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const pcmData = new Int16Array(bytes.buffer);
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 0x7FFF;
      }

      // The Gemini output is 24kHz
      const outputSampleRate = 24000;
      const buffer = this.audioContext.createBuffer(1, floatData.length, outputSampleRate);
      buffer.getChannelData(0).set(floatData);

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      this.activeSources.push(source);
      source.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== source);
      };

      const currentTime = this.audioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }
      
      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
    } catch (error) {
      console.error('Error playing audio chunk:', error);
    }
  }

  clearQueue() {
    this.nextStartTime = 0;
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources = [];
  }
}

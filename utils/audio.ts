export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static bgmNode: AudioBufferSourceNode | null = null;
  private static analyser: AnalyserNode | null = null;
  private static micStream: MediaStream | null = null;

  static async init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  static async startMicrophoneDetection(onBlowDetected: () => void) {
    if (!this.ctx) await this.init();
    
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.ctx!.createMediaStreamSource(this.micStream);
      this.analyser = this.ctx!.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        // Focus on lower frequencies for "blowing" sound
        for (let i = 0; i < bufferLength / 2; i++) {
          sum += dataArray[i];
        }
        const average = sum / (bufferLength / 2);

        // Threshold for "blowing"
        if (average > 80) { // Adjustable threshold
           onBlowDetected();
           this.stopMicrophone();
        } else {
          requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
    } catch (e) {
      console.warn("Microphone access denied or error", e);
    }
  }

  static stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
  }

  static playSound(type: 'bgm' | 'firework' | 'pop') {
    // In a real app, we would load buffers. 
    // For this demo, we assume silence or placehoder logic.
    // Placeholder for "Happy Birthday" BGM start.
    console.log(`Playing sound: ${type}`);
  }

  static fadeOutBgm() {
    console.log("Fading out BGM");
  }
}
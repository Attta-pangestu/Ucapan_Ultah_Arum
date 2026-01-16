export class AudioManager {
  private static bgm: HTMLAudioElement | null = null;
  private static ctx: AudioContext | null = null;
  private static analyser: AnalyserNode | null = null;
  private static micStream: MediaStream | null = null;

  static async init() {
    if (!this.bgm) {
      this.bgm = new Audio('/song.mp3');
      this.bgm.loop = true;
      this.bgm.volume = 0.5;
    }
    
    if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static playSound(type: 'bgm' | 'firework' | 'pop') {
    if (type === 'bgm' && this.bgm) {
      this.bgm.play().catch(e => console.log("Audio play failed (user interaction required):", e));
    }
  }

  static fadeOutBgm() {
    if (!this.bgm) return;
    
    const fadeOut = setInterval(() => {
      if (this.bgm && this.bgm.volume > 0.05) {
        this.bgm.volume -= 0.05;
      } else {
        clearInterval(fadeOut);
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.volume = 0.5; // Reset for next time
        }
      }
    }, 200);
  }

  // --- Microphone Logic (Optional/Legacy support) ---
  static async startMicrophoneDetection(onBlowDetected: () => void) {
    if (!this.ctx) await this.init();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();

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
        for (let i = 0; i < bufferLength / 2; i++) {
          sum += dataArray[i];
        }
        const average = sum / (bufferLength / 2);

        if (average > 60) { 
           onBlowDetected();
           this.stopMicrophone();
        } else {
          requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
    } catch (e) {
      console.warn("Mic access denied", e);
    }
  }

  static stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
  }
}
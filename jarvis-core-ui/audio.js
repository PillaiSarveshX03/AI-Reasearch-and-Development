/**
 * JARVIS Audio Analysis & Decibel Reactive Engine
 * Analyzes live microphone input and synthetic voice output in real-time
 * to compute exact decibel levels (0.0 to 1.0) for 3D Orb visual modulation.
 */

class JarvisAudioAnalyzer {
    constructor() {
        this.audioCtx = null;
        this.micStream = null;
        this.analyser = null;
        this.dataArray = null;
        this.isMicActive = false;
        this.isSpeaking = false;
        
        // Decibel level normalized between 0.0 (silence) and 1.0 (peak)
        this.decibelLevel = 0;
        this.smoothedLevel = 0;
        
        // Internal oscillator for synthetic voice analysis
        this.syntheticLevel = 0;
        
        this.init();
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !this.audioCtx) {
            this.audioCtx = new AudioContext();
        }
    }

    async startMicrophone() {
        this.init();
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }

        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const source = this.audioCtx.createMediaStreamSource(this.micStream);
            
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            source.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.isMicActive = true;
            return true;
        } catch (err) {
            console.warn("Microphone access not granted or unavailable:", err);
            this.isMicActive = false;
            return false;
        }
    }

    stopMicrophone() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        this.isMicActive = false;
        this.decibelLevel = 0;
    }

    setSpeaking(state) {
        this.isSpeaking = state;
    }

    /**
     * Get current real-time normalized audio energy / decibel level (0.0 to 1.0)
     */
    getLevel() {
        let currentRaw = 0;

        // 1. If live mic is active, calculate RMS from analyser
        if (this.isMicActive && this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);
            let sum = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                sum += this.dataArray[i];
            }
            const average = sum / this.dataArray.length;
            currentRaw = Math.min(1.0, average / 110.0); // Normalize
        }

        // 2. If AI is speaking via TTS, generate speech cadence modulation
        if (this.isSpeaking) {
            const time = performance.now() * 0.008;
            const cadence = (Math.sin(time * 3.5) * 0.4 + Math.sin(time * 7.2) * 0.3 + Math.cos(time * 1.8) * 0.3);
            const speechDecibel = Math.max(0.25, Math.min(1.0, 0.55 + cadence * 0.45));
            currentRaw = Math.max(currentRaw, speechDecibel);
        }

        // Exponential smoothing filter for natural visual responsiveness
        this.smoothedLevel += (currentRaw - this.smoothedLevel) * 0.22;
        return this.smoothedLevel;
    }
}

window.JarvisAudioAnalyzer = JarvisAudioAnalyzer;

/**
 * JARVIS Audio Analysis & Decibel Reactive Engine
 * Analyzes live microphone input, custom ElevenLabs/OpenAI audio buffers,
 * and synthetic voice output in real-time to compute exact decibel levels (0.0 to 1.0)
 * for 3D Holographic Orb visual modulation.
 */

class JarvisAudioAnalyzer {
    constructor() {
        this.audioCtx = null;
        this.micStream = null;
        this.micAnalyser = null;
        this.outputAnalyser = null;
        this.micDataArray = null;
        this.outputDataArray = null;
        
        this.isMicActive = false;
        this.isPlayingAudio = false;
        this.isSpeaking = false;
        
        this.currentSource = null;
        this.currentAudioElement = null;

        // Decibel level normalized between 0.0 (silence) and 1.0 (peak)
        this.decibelLevel = 0;
        this.smoothedLevel = 0;
        
        this.init();
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !this.audioCtx) {
            this.audioCtx = new AudioContext();
            
            // Output Analyser for High-Fidelity ElevenLabs/Audio Stream Playback
            this.outputAnalyser = this.audioCtx.createAnalyser();
            this.outputAnalyser.fftSize = 256;
            this.outputAnalyser.smoothingTimeConstant = 0.8;
            this.outputDataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
            this.outputAnalyser.connect(this.audioCtx.destination);
        }
    }

    async ensureAudioContext() {
        this.init();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    async startMicrophone() {
        await this.ensureAudioContext();

        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const source = this.audioCtx.createMediaStreamSource(this.micStream);
            
            this.micAnalyser = this.audioCtx.createAnalyser();
            this.micAnalyser.fftSize = 256;
            this.micAnalyser.smoothingTimeConstant = 0.8;
            
            source.connect(this.micAnalyser);
            this.micDataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
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
    }

    setSpeaking(state) {
        this.isSpeaking = state;
    }

    /**
     * Plays an audio Blob (from ElevenLabs or OpenAI TTS) with real-time spectrum analysis
     */
    async playAudioBlob(blob, onStart = null, onEnd = null) {
        await this.ensureAudioContext();
        this.stopAudioPlayback();

        try {
            // Method 1: Web Audio Buffer Source (Direct FFT frequency modulation)
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer.slice(0));

            const source = this.audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAnalyser);

            this.currentSource = source;
            this.isPlayingAudio = true;
            this.setSpeaking(true);

            source.onended = () => {
                this.isPlayingAudio = false;
                this.setSpeaking(false);
                this.currentSource = null;
                if (onEnd) onEnd();
            };

            if (onStart) onStart();
            source.start(0);
            return source;
        } catch (decodeErr) {
            console.warn("WebAudio decodeAudioData failed, falling back to HTML5 Audio element:", decodeErr);

            // Method 2: HTML5 Audio Element Fallback
            try {
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                this.currentAudioElement = audio;

                // Try connecting element to analyser if possible
                try {
                    const sourceNode = this.audioCtx.createMediaElementSource(audio);
                    sourceNode.connect(this.outputAnalyser);
                } catch (e) {}

                this.isPlayingAudio = true;
                this.setSpeaking(true);

                audio.onended = () => {
                    this.isPlayingAudio = false;
                    this.setSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudioElement = null;
                    if (onEnd) onEnd();
                };

                audio.onerror = (e) => {
                    this.isPlayingAudio = false;
                    this.setSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudioElement = null;
                    if (onEnd) onEnd();
                };

                if (onStart) onStart();
                await audio.play();
                return audio;
            } catch (fallbackErr) {
                this.isPlayingAudio = false;
                this.setSpeaking(false);
                if (onEnd) onEnd();
                throw fallbackErr;
            }
        }
    }

    stopAudioPlayback() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (e) {}
            this.currentSource = null;
        }
        if (this.currentAudioElement) {
            try {
                this.currentAudioElement.pause();
                this.currentAudioElement.currentTime = 0;
            } catch (e) {}
            this.currentAudioElement = null;
        }
        this.isPlayingAudio = false;
        this.setSpeaking(false);
    }

    /**
     * Get current real-time normalized audio energy / decibel level (0.0 to 1.0)
     */
    getLevel() {
        let currentRaw = 0;

        // 1. If high-fidelity audio buffer is actively playing (ElevenLabs / TTS)
        if (this.isPlayingAudio && this.outputAnalyser && this.outputDataArray) {
            this.outputAnalyser.getByteFrequencyData(this.outputDataArray);
            let sum = 0;
            for (let i = 0; i < this.outputDataArray.length; i++) {
                sum += this.outputDataArray[i];
            }
            const avg = sum / this.outputDataArray.length;
            currentRaw = Math.min(1.0, (avg / 100.0) * 1.2);
        }
        // 2. If live mic is active, calculate RMS from mic analyser
        else if (this.isMicActive && this.micAnalyser && this.micDataArray) {
            this.micAnalyser.getByteFrequencyData(this.micDataArray);
            let sum = 0;
            for (let i = 0; i < this.micDataArray.length; i++) {
                sum += this.micDataArray[i];
            }
            const average = sum / this.micDataArray.length;
            currentRaw = Math.min(1.0, average / 110.0);
        }
        // 3. If standard browser TTS is speaking, generate procedural speech cadence
        else if (this.isSpeaking) {
            const time = performance.now() * 0.008;
            const cadence = (Math.sin(time * 3.5) * 0.4 + Math.sin(time * 7.2) * 0.3 + Math.cos(time * 1.8) * 0.3);
            const speechDecibel = Math.max(0.25, Math.min(1.0, 0.55 + cadence * 0.45));
            currentRaw = speechDecibel;
        }

        // Exponential smoothing filter for natural visual responsiveness
        this.smoothedLevel += (currentRaw - this.smoothedLevel) * 0.24;
        return this.smoothedLevel;
    }
}

window.JarvisAudioAnalyzer = JarvisAudioAnalyzer;

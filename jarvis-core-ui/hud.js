/**
 * JARVIS HUD Orchestration & Interactivity Controller
 * Handles live telemetry, audio spectrum visualizer, canvas waveforms,
 * speech synthesis, speech recognition, and command processing.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D Orb
    const orb = new JarvisOrb('orb-canvas-container');

    // 2. Initialize Sound FX
    const audioFx = window.jarvisAudio;

    // Elements
    const commandInput = document.getElementById('command-input');
    const executeBtn = document.getElementById('execute-btn');
    const micBtn = document.getElementById('mic-btn');
    const transcriptText = document.getElementById('transcript-text');
    const arcPercent = document.getElementById('arc-percent');
    const arcFill = document.getElementById('arc-fill');
    const memoryFill = document.getElementById('memory-fill');
    const memoryPercent = document.getElementById('memory-percent');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const audioMuteBtn = document.getElementById('audio-mute-btn');

    // 3. Live Synapse Canvas Waveform
    const synapseCanvas = document.getElementById('synapse-canvas');
    const synCtx = synapseCanvas ? synapseCanvas.getContext('2d') : null;
    let synapsePoints = [];
    const maxPoints = 40;

    if (synapseCanvas && synCtx) {
        synapseCanvas.width = synapseCanvas.clientWidth || 300;
        synapseCanvas.height = 60;
        for (let i = 0; i < maxPoints; i++) {
            synapsePoints.push(Math.random() * 30 + 15);
        }

        function drawSynapse() {
            synCtx.clearRect(0, 0, synapseCanvas.width, synapseCanvas.height);
            synCtx.beginPath();
            synCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--hud-primary') || '#ff9d00';
            synCtx.lineWidth = 1.5;
            synCtx.shadowColor = synCtx.strokeStyle;
            synCtx.shadowBlur = 6;

            const step = synapseCanvas.width / (maxPoints - 1);
            for (let i = 0; i < maxPoints; i++) {
                const x = i * step;
                const y = synapsePoints[i];
                if (i === 0) synCtx.moveTo(x, y);
                else synCtx.lineTo(x, y);
            }
            synCtx.stroke();

            // Shift points
            synapsePoints.shift();
            const last = synapsePoints[synapsePoints.length - 1];
            const next = Math.max(10, Math.min(50, last + (Math.random() - 0.5) * 16));
            synapsePoints.push(next);

            requestAnimationFrame(drawSynapse);
        }
        drawSynapse();
    }

    // 4. Audio Spectrum Visualizer Bars
    const spectrumBars = document.querySelectorAll('.spectrum-bar');
    function updateSpectrum() {
        spectrumBars.forEach((bar) => {
            const height = Math.floor(Math.random() * 75 + 15);
            bar.style.height = `${height}%`;
        });
        setTimeout(updateSpectrum, 90);
    }
    updateSpectrum();

    // 5. Dynamic Telemetry Jitter
    setInterval(() => {
        if (arcPercent && arcFill) {
            const arcVal = (98.4 + (Math.random() - 0.5) * 0.8).toFixed(1);
            arcPercent.textContent = `${arcVal}%`;
            arcFill.style.width = `${arcVal}%`;
        }
        if (memoryPercent && memoryFill) {
            const memVal = (42.1 + (Math.random() - 0.5) * 1.5).toFixed(1);
            memoryPercent.textContent = `${memVal}%`;
            memoryFill.style.width = `${memVal}%`;
        }
        const clockEl = document.getElementById('live-clock');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC+' + (-now.getTimezoneOffset() / 60);
        }
    }, 1200);

    // 6. Speech Synthesis Response (JARVIS Voice)
    function speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.05;
            utterance.pitch = 0.92;

            // Try selecting a British/Sophisticated English voice if available
            const voices = window.speechSynthesis.getVoices();
            const jarvisVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('David'));
            if (jarvisVoice) utterance.voice = jarvisVoice;

            utterance.onstart = () => {
                orb.triggerPulse(1.5);
                audioFx.playTelemetry();
            };

            utterance.onend = () => {
                orb.triggerPulse(1.0);
            };

            window.speechSynthesis.speak(utterance);
        }
    }

    // 7. Command Execution Engine
    function processCommand(rawInput) {
        const input = rawInput.trim().toLowerCase();
        if (!input) return;

        audioFx.playBeep(900, 'sine', 0.1);
        orb.triggerPulse(1.6);

        transcriptText.innerHTML = `<span class="transcript-tag">USER:</span> "${rawInput}"`;

        let response = '';

        if (input.includes('diagnostic') || input.includes('status') || input.includes('check')) {
            response = "All subsystems operational. Core neural filaments operating at 99.4% quantum efficiency.";
            audioFx.playTelemetry();
        } else if (input.includes('arc') || input.includes('power') || input.includes('boost')) {
            response = "Routing auxiliary power. Arc Reactor output peaked at maximum thermal yield.";
            audioFx.playEngage();
        } else if (input.includes('scan') || input.includes('threat') || input.includes('radar')) {
            response = "Tactical sensor sweep initiated. Perimeter is clear. No hostile signatures detected.";
            audioFx.playScan();
        } else if (input.includes('defense') || input.includes('shield') || input.includes('protocol')) {
            response = "Defensive kinetic field primed. Repulsor grids standing by.";
            audioFx.playEngage();
        } else if (input.includes('friday') || input.includes('theme friday') || input.includes('blue')) {
            setTheme('friday');
            response = "Switching tactical frequency to F.R.I.D.A.Y. Arc Cyan active.";
        } else if (input.includes('ultron') || input.includes('red') || input.includes('crimson')) {
            setTheme('ultron');
            response = "Engaging Crimson Protocol. Warning: High aggression parameters active.";
        } else if (input.includes('jarvis') || input.includes('gold') || input.includes('amber')) {
            setTheme('jarvis');
            response = "Restoring primary J.A.R.V.I.S. amber matrix. At your service, sir.";
        } else if (input.includes('hello') || input.includes('hi') || input.includes('jarvis')) {
            response = "Good evening, sir. Neural core is online and awaiting your command.";
        } else {
            response = `Command recognized: "${rawInput}". Processing algorithmic sub-routine now.`;
            audioFx.playChirp();
        }

        setTimeout(() => {
            transcriptText.innerHTML = `<span class="transcript-tag">JARVIS:</span> ${response}`;
            speak(response);
        }, 300);

        if (commandInput) commandInput.value = '';
    }

    if (executeBtn && commandInput) {
        executeBtn.addEventListener('click', () => processCommand(commandInput.value));
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') processCommand(commandInput.value);
        });
    }

    // Quick Action Buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (cmd) processCommand(cmd);
        });
    });

    // 8. Theme Switcher
    function setTheme(themeName) {
        orb.setTheme(themeName);
        themeBtns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-theme') === themeName);
        });
        audioFx.playChirp();
    }

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    // 9. Speech Recognition (Mic Input)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isListening = false;

        micBtn.addEventListener('click', () => {
            audioFx.init();
            if (!isListening) {
                try {
                    recognition.start();
                    isListening = true;
                    micBtn.classList.add('listening');
                    micBtn.innerHTML = '● LISTENING...';
                    audioFx.playBeep(1200, 'sine', 0.15);
                } catch (e) {
                    console.warn(e);
                }
            } else {
                recognition.stop();
                isListening = false;
                micBtn.classList.remove('listening');
                micBtn.innerHTML = '🎤 VOICE';
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            processCommand(transcript);
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            micBtn.innerHTML = '🎤 VOICE';
        };

        recognition.onerror = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            micBtn.innerHTML = '🎤 VOICE';
        };
    } else {
        if (micBtn) micBtn.title = "Voice recognition not supported in this browser.";
    }

    // 10. Initial Welcome Speech
    document.body.addEventListener('click', () => {
        audioFx.init();
    }, { once: true });
});

/**
 * JARVIS Bulletproof Speech, Push-to-Talk, & Top-Right HUD Controller
 */

class JarvisApp {
    constructor() {
        // Audio & 3D Core
        this.audioAnalyzer = new JarvisAudioAnalyzer();
        this.orb = new JarvisOrb('orb-canvas-container', this.audioAnalyzer);

        // State
        this.isListening = false;
        this.isSpeaking = false;
        this.isProcessing = false;
        this.isSpaceHeld = false;
        
        // Transcripts
        this.finalTranscript = '';
        this.lastSpokenText = '';
        this.conversationHistory = [];

        // Model Presets Definitions
        this.modelPresets = {
            gemini: [
                { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Fastest ~150ms)' },
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ultra Fast)' },
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Standard)' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Advanced Reasoning)' },
                { id: 'custom', name: 'Custom Model ID...' }
            ],
            openai: [
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Recommended)' },
                { id: 'gpt-4o', name: 'GPT-4o (Flagship Model)' },
                { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
                { id: 'custom', name: 'Custom Model ID...' }
            ]
        };

        // LLM & Voice Configuration
        const savedProvider = localStorage.getItem('jarvis_llm_provider') || 'gemini';
        const defaultModel = savedProvider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini';

        this.config = {
            provider: savedProvider,
            apiKey: localStorage.getItem('jarvis_api_key') || '',
            model: localStorage.getItem('jarvis_model') || defaultModel,
            systemPrompt: localStorage.getItem('jarvis_system_prompt') || 
                'You are Ultron / JARVIS. Be direct, intelligent, and concise. Speak in 1 to 2 punchy sentences maximum for fast real-time vocal dialogue. Avoid markdown bullet points.',
            
            voiceEngine: localStorage.getItem('jarvis_voice_engine') || 'local',
            localVoice: localStorage.getItem('jarvis_local_voice') || 'ultron_spader',
            elevenLabsApiKey: localStorage.getItem('jarvis_elevenlabs_api_key') || '',
            elevenLabsVoiceId: localStorage.getItem('jarvis_elevenlabs_voice_id') || 'JBFqnCBsd6RMkjVDRZzb',
            elevenLabsModel: localStorage.getItem('jarvis_elevenlabs_model') || 'eleven_flash_v2_5',
            openAIVoice: localStorage.getItem('jarvis_openai_voice') || 'onyx'
        };

        // DOM Elements
        this.statusText = document.getElementById('status-text');
        this.speechHint = document.getElementById('speech-hint');
        this.micBtn = document.getElementById('mic-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.textToggleBtn = document.getElementById('text-toggle-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');

        // Tabs
        this.tabBtnLlm = document.getElementById('tab-btn-llm');
        this.tabBtnVoice = document.getElementById('tab-btn-voice');
        this.tabPanelLlm = document.getElementById('tab-panel-llm');
        this.tabPanelVoice = document.getElementById('tab-panel-voice');

        // Text Drawer elements
        this.textDrawer = document.getElementById('text-drawer');
        this.textInput = document.getElementById('text-input');
        this.sendTextBtn = document.getElementById('send-text-btn');

        // LLM Settings Form Elements
        this.providerSelect = document.getElementById('provider-select');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.toggleKeyVisibilityBtn = document.getElementById('toggle-key-visibility');
        this.apiKeyHelpLink = document.getElementById('api-key-help-link');
        this.modelSelect = document.getElementById('model-select');
        this.modelInput = document.getElementById('model-input');
        this.systemPromptInput = document.getElementById('system-prompt-input');
        this.testConnectionBtn = document.getElementById('test-connection-btn');
        this.testBtnText = document.getElementById('test-btn-text');
        this.testSpinner = document.getElementById('test-spinner');
        this.connectionStatusBadge = document.getElementById('connection-status-badge');

        // Voice Settings Form Elements
        this.voiceEngineSelect = document.getElementById('voice-engine-select');
        this.localTtsSettingsGroup = document.getElementById('local-tts-settings-group');
        this.localVoiceSelect = document.getElementById('local-voice-select');
        this.testLocalVoiceBtn = document.getElementById('test-local-voice-btn');
        this.testLocalVoiceBtnText = document.getElementById('test-local-voice-btn-text');
        this.localVoiceSpinner = document.getElementById('local-voice-spinner');
        this.localVoiceStatusBadge = document.getElementById('local-voice-status-badge');
        this.playSampleBtn = document.getElementById('play-sample-btn');

        this.elevenlabsSettingsGroup = document.getElementById('elevenlabs-settings-group');
        this.openaiTtsSettingsGroup = document.getElementById('openai-tts-settings-group');
        this.elevenlabsKeyInput = document.getElementById('elevenlabs-key-input');
        this.toggleElevenlabsKeyVisibilityBtn = document.getElementById('toggle-elevenlabs-key-visibility');
        this.elevenlabsVoiceSelect = document.getElementById('elevenlabs-voice-select');
        this.elevenlabsCustomVoiceInput = document.getElementById('elevenlabs-custom-voice-input');
        this.elevenlabsModelSelect = document.getElementById('elevenlabs-model-select');
        this.openaiVoiceSelect = document.getElementById('openai-voice-select');
        this.testVoiceBtn = document.getElementById('test-voice-btn');
        this.testVoiceBtnText = document.getElementById('test-voice-btn-text');
        this.voiceSpinner = document.getElementById('voice-spinner');
        this.voiceStatusBadge = document.getElementById('voice-status-badge');

        this.initSpeechRecognition();
        this.initEventListeners();
        this.initPushToTalk();
        this.loadSettingsToForm();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.finalTranscript = '';
                this.lastSpokenText = '';
                if (this.micBtn) {
                    this.micBtn.classList.add('active');
                    this.micBtn.title = "Microphone Unmuted (Click to Mute)";
                }
                const promptHint = this.isSpaceHeld ? "Listening [Hold Space]..." : "Listening... Speak now";
                this.setStatus(promptHint, "active");
                this.audioAnalyzer.startMicrophone();
            };

            this.recognition.onresult = (event) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        this.finalTranscript += transcriptPiece + ' ';
                    } else {
                        interim += transcriptPiece;
                    }
                }

                const fullText = (this.finalTranscript + interim).trim();
                if (fullText) {
                    this.lastSpokenText = fullText;
                    this.setStatus(`"${fullText}"`, "active");
                }
            };

            this.recognition.onerror = (e) => {
                console.warn("Speech recognition event error:", e.error);
                if (e.error === 'not-allowed') {
                    this.setStatus("Mic blocked. Allow mic in browser bar.", "idle");
                } else if (e.error === 'no-speech') {
                    // ignore normal silence
                } else {
                    this.setStatus(`Mic: ${e.error}`, "idle");
                }
            };

            this.recognition.onend = () => {
                if (this.isListening) {
                    // If recognition stopped on its own while still in listening state, process speech
                    this.isListening = false;
                    if (this.micBtn) this.micBtn.classList.remove('active');
                    this.audioAnalyzer.stopMicrophone();

                    const query = this.lastSpokenText.trim();
                    if (query) {
                        this.lastSpokenText = '';
                        this.finalTranscript = '';
                        this.handleUserInput(query);
                    } else {
                        this.setStatus("Ready. Say something...", "idle");
                    }
                }
            };
        } else {
            console.warn("Speech recognition is not supported in this browser.");
            if (this.micBtn) {
                this.micBtn.title = "Speech recognition not supported in this browser. Use text input.";
            }
        }
    }

    initPushToTalk() {
        // Spacebar Push-To-Talk
        window.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA' || 
                activeEl.isContentEditable ||
                this.settingsModal.classList.contains('active')
            );
            if (isTyping) return;

            if (e.code === 'Space' || e.key === ' ') {
                if (e.repeat) return;
                e.preventDefault();
                this.isSpaceHeld = true;

                if (this.isSpeaking) {
                    this.stopSpeaking();
                }

                this.startListening();
            }
        });

        window.addEventListener('keyup', (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA' || 
                activeEl.isContentEditable ||
                this.settingsModal.classList.contains('active')
            );
            if (isTyping) return;

            if (e.code === 'Space' || e.key === ' ') {
                if (this.isSpaceHeld) {
                    this.isSpaceHeld = false;
                    e.preventDefault();
                    this.stopListening();
                }
            }
        });
    }

    initEventListeners() {
        // Microphone Click Toggle (Mute / Unmute)
        if (this.micBtn) {
            this.micBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.isSpeaking) {
                    this.stopSpeaking();
                }

                if (this.isListening) {
                    // Turn OFF / Mute
                    this.stopListening();
                } else {
                    // Turn ON / Unmute
                    this.startListening();
                }
            });
        }

        // Cancel / Reset Button
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.stopSpeaking();
                this.stopListening(false);
                this.lastSpokenText = '';
                this.finalTranscript = '';
                this.setStatus("Ready. Say something...", "idle");
            });
        }

        // Text Toggle
        if (this.textToggleBtn) {
            this.textToggleBtn.addEventListener('click', () => {
                this.textDrawer.classList.toggle('open');
                if (this.textDrawer.classList.contains('open')) {
                    this.textInput.focus();
                }
            });
        }

        // Send Text
        if (this.sendTextBtn) {
            this.sendTextBtn.addEventListener('click', () => this.submitTextPrompt());
        }
        if (this.textInput) {
            this.textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.submitTextPrompt();
            });
        }

        // Settings Modal Tabs
        if (this.tabBtnLlm && this.tabBtnVoice) {
            this.tabBtnLlm.addEventListener('click', () => this.switchTab('llm'));
            this.tabBtnVoice.addEventListener('click', () => this.switchTab('voice'));
        }

        // Settings Modal Open/Close
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.loadSettingsToForm();
                this.resetTestStatus();
                this.resetVoiceTestStatus();
                this.settingsModal.classList.add('active');
            });
        }

        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => {
                this.settingsModal.classList.remove('active');
            });
        }

        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
                this.settingsModal.classList.remove('active');
                this.speak("Configuration updated, sir.");
            });
        }

        // Provider Change Listener
        if (this.providerSelect) {
            this.providerSelect.addEventListener('change', () => {
                this.onProviderChanged();
            });
        }

        // Model Select Listener
        if (this.modelSelect) {
            this.modelSelect.addEventListener('change', () => {
                if (this.modelSelect.value === 'custom') {
                    this.modelInput.style.display = 'block';
                    this.modelInput.focus();
                } else {
                    this.modelInput.style.display = 'none';
                    this.modelInput.value = this.modelSelect.value;
                }
            });
        }

        // API Key Visibility Toggle
        if (this.toggleKeyVisibilityBtn) {
            this.toggleKeyVisibilityBtn.addEventListener('click', () => {
                this.apiKeyInput.type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
            });
        }

        if (this.toggleElevenlabsKeyVisibilityBtn) {
            this.toggleElevenlabsKeyVisibilityBtn.addEventListener('click', () => {
                this.elevenlabsKeyInput.type = this.elevenlabsKeyInput.type === 'password' ? 'text' : 'password';
            });
        }

        // Voice Engine Change Listener
        if (this.voiceEngineSelect) {
            this.voiceEngineSelect.addEventListener('change', () => {
                this.onVoiceEngineChanged();
            });
        }

        // ElevenLabs Voice Select Listener
        if (this.elevenlabsVoiceSelect) {
            this.elevenlabsVoiceSelect.addEventListener('change', () => {
                if (this.elevenlabsVoiceSelect.value === 'custom') {
                    this.elevenlabsCustomVoiceInput.style.display = 'block';
                    this.elevenlabsCustomVoiceInput.focus();
                } else {
                    this.elevenlabsCustomVoiceInput.style.display = 'none';
                    this.elevenlabsCustomVoiceInput.value = this.elevenlabsVoiceSelect.value;
                }
            });
        }

        // Test API Connection Button
        if (this.testConnectionBtn) {
            this.testConnectionBtn.addEventListener('click', () => {
                this.testCurrentSettings();
            });
        }

        // Test ElevenLabs Voice Button
        if (this.testVoiceBtn) {
            this.testVoiceBtn.addEventListener('click', () => {
                this.testCurrentVoiceSettings();
            });
        }

        // Test Local Free Voice Button (Ultron/JARVIS)
        if (this.testLocalVoiceBtn) {
            this.testLocalVoiceBtn.addEventListener('click', () => {
                this.testCurrentLocalVoiceSettings();
            });
        }

        // Play Uploaded Ultron.mp3 Sample Button
        if (this.playSampleBtn) {
            this.playSampleBtn.addEventListener('click', () => {
                this.playUploadedSample();
            });
        }
    }

    switchTab(tab) {
        if (tab === 'llm') {
            this.tabBtnLlm.classList.add('active');
            this.tabBtnVoice.classList.remove('active');
            this.tabPanelLlm.classList.add('active');
            this.tabPanelVoice.classList.remove('active');
        } else {
            this.tabBtnVoice.classList.add('active');
            this.tabBtnLlm.classList.remove('active');
            this.tabPanelVoice.classList.add('active');
            this.tabPanelLlm.classList.remove('active');
        }
    }

    async startListening() {
        if (this.isListening) return;

        await this.audioAnalyzer.ensureAudioContext();

        if (this.recognition) {
            try {
                this.finalTranscript = '';
                this.lastSpokenText = '';
                this.recognition.start();
            } catch (e) {
                console.warn("Recognition start info:", e);
            }
        }
    }

    stopListening(shouldProcess = true) {
        if (!this.isListening) return;
        this.isListening = false;

        if (this.micBtn) {
            this.micBtn.classList.remove('active');
            this.micBtn.title = "Click to Unmute / Speak (or Hold Space)";
        }

        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }

        this.audioAnalyzer.stopMicrophone();

        if (shouldProcess) {
            const textToProcess = this.lastSpokenText.trim();
            this.lastSpokenText = '';
            this.finalTranscript = '';

            if (textToProcess) {
                this.handleUserInput(textToProcess);
            } else {
                this.setStatus("Ready. Say something...", "idle");
            }
        } else {
            this.lastSpokenText = '';
            this.finalTranscript = '';
            this.setStatus("Ready. Say something...", "idle");
        }
    }

    submitTextPrompt() {
        const text = this.textInput.value.trim();
        if (!text) return;
        this.textInput.value = '';
        this.textDrawer.classList.remove('open');
        this.handleUserInput(text);
    }

    setStatus(message, mode = 'idle') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-text ' + mode;
    }

    async handleUserInput(userPrompt) {
        if (!userPrompt || !userPrompt.trim()) return;
        
        this.setStatus("Thinking...", "processing");
        this.isProcessing = true;

        this.conversationHistory.push({ role: 'user', content: userPrompt });

        let reply = '';
        if (this.config.apiKey) {
            try {
                reply = await this.callLLM(userPrompt);
            } catch (err) {
                console.error("LLM API Error:", err);
                const rawMsg = err.message || "Unknown error";
                this.setStatus(`Error: ${rawMsg}`, "active");
                reply = `Error: ${rawMsg}. Check your settings.`;
            }
        } else {
            reply = this.getSimulatedResponse(userPrompt);
        }

        this.conversationHistory.push({ role: 'assistant', content: reply });
        this.isProcessing = false;
        this.speak(reply);
    }

    cleanApiKey(key) {
        if (!key) return '';
        return key.trim().replace(/^["'`]|["'`]$/g, '');
    }

    cleanModelName(model) {
        if (!model) return '';
        return model.trim().replace(/^models\//, '');
    }

    getFormattedHistory(provider) {
        const historySlice = this.conversationHistory.slice(-4, -1);
        if (provider === 'gemini') {
            return historySlice.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
        } else {
            return historySlice.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            }));
        }
    }

    async callLLM(prompt, overrideConfig = null) {
        const cfg = overrideConfig || this.config;
        const apiKey = this.cleanApiKey(cfg.apiKey);
        const modelName = this.cleanModelName(cfg.model);

        if (!apiKey) {
            throw new Error("API Key is missing. Please enter your key in settings.");
        }

        if (cfg.provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const history = overrideConfig ? [] : this.getFormattedHistory('gemini');
            const contents = [
                ...history,
                { role: 'user', parts: [{ text: prompt }] }
            ];

            const body = {
                system_instruction: {
                    parts: [{ text: cfg.systemPrompt || 'You are Ultron / JARVIS. Be ultra concise and direct (1 to 2 sentences).' }]
                },
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 180,
                    temperature: 0.5
                }
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                let detailedMessage = `HTTP ${res.status}`;
                try {
                    const errData = await res.json();
                    if (errData.error && errData.error.message) {
                        detailedMessage = errData.error.message;
                    }
                } catch (e) {
                    detailedMessage = `${res.status} ${res.statusText}`;
                }
                throw new Error(detailedMessage);
            }

            const data = await res.json();
            const candidate = data.candidates?.[0];
            if (!candidate) {
                throw new Error("No response candidates returned by Gemini.");
            }

            const text = candidate.content?.parts?.map(p => p.text).join('') || '';
            return text.trim() || "Understood.";

        } else {
            const url = `https://api.openai.com/v1/chat/completions`;
            const history = overrideConfig ? [] : this.getFormattedHistory('openai');
            
            const messages = [
                { role: 'system', content: cfg.systemPrompt || 'You are Ultron / JARVIS. Be ultra concise and direct (1 to 2 sentences).' },
                ...history,
                { role: 'user', content: prompt }
            ];

            const body = {
                model: modelName || 'gpt-4o-mini',
                messages: messages,
                max_tokens: 180,
                temperature: 0.5
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                let detailedMessage = `HTTP ${res.status}`;
                try {
                    const errData = await res.json();
                    if (errData.error && errData.error.message) {
                        detailedMessage = errData.error.message;
                    }
                } catch (e) {
                    detailedMessage = `${res.status} ${res.statusText}`;
                }
                throw new Error(detailedMessage);
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content;
            if (!reply) throw new Error("No response returned by OpenAI.");
            return reply.trim();
        }
    }

    /**
     * Synthesize Free Local Neural Voice (Ultron James Spader / JARVIS / FRIDAY)
     */
    async synthesizeLocalTTS(text, voice = 'ultron_spader') {
        const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice })
        });

        if (!res.ok) {
            throw new Error(`Local voice server returned HTTP ${res.status}.`);
        }

        return await res.blob();
    }

    /**
     * Play user's uploaded Ultron.mp3 reference sample with 3D Orb modulation
     */
    async playUploadedSample() {
        this.setLocalVoiceTestStatus('testing', 'Playing Ultron.mp3...');
        try {
            const res = await fetch('/api/ultron-sample');
            if (!res.ok) throw new Error("Could not find Ultron.mp3 in workspace.");
            const blob = await res.blob();
            this.setLocalVoiceTestStatus('success', '✓ Playing Ultron.mp3');
            await this.audioAnalyzer.playAudioBlob(blob, null, () => {
                this.setLocalVoiceTestStatus('success', '✓ Sample Finished');
            });
        } catch (e) {
            console.error("Sample playback failed:", e);
            this.setLocalVoiceTestStatus('error', '✕ Ultron.mp3 not found');
        }
    }

    /**
     * Synthesize realistic neural speech using ElevenLabs API
     */
    async synthesizeElevenLabs(text, apiKey, voiceId, modelId = 'eleven_flash_v2_5') {
        const cleanKey = this.cleanApiKey(apiKey);
        const cleanVoice = (voiceId || 'JBFqnCBsd6RMkjVDRZzb').trim();
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${cleanVoice}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': cleanKey,
                'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({
                text: text,
                model_id: modelId || 'eleven_flash_v2_5',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });

        if (!res.ok) {
            let errMessage = `HTTP ${res.status}`;
            try {
                const errJson = await res.json();
                if (errJson.detail && errJson.detail.message) {
                    errMessage = errJson.detail.message;
                }
            } catch (e) {}
            throw new Error(errMessage);
        }

        return await res.blob();
    }

    /**
     * Synthesize speech using OpenAI TTS API
     */
    async synthesizeOpenAITTS(text, apiKey, voice = 'onyx') {
        const cleanKey = this.cleanApiKey(apiKey);
        const url = `https://api.openai.com/v1/audio/speech`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanKey}`
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: voice || 'onyx'
            })
        });

        if (!res.ok) {
            let errMessage = `HTTP ${res.status}`;
            try {
                const errJson = await res.json();
                if (errJson.error && errJson.error.message) {
                    errMessage = errJson.error.message;
                }
            } catch (e) {}
            throw new Error(errMessage);
        }

        return await res.blob();
    }

    /**
     * Speaks the reply and synchronizes audio decibels to the 3D Orb
     */
    async speak(text) {
        if (this.isSpeaking) {
            this.stopSpeaking();
        }

        // 1. Free Local Neural Voice Engine (Ultron, JARVIS, FRIDAY)
        if (this.config.voiceEngine === 'local') {
            try {
                this.setStatus(text, 'speaking');
                const blob = await this.synthesizeLocalTTS(text, this.config.localVoice);

                await this.audioAnalyzer.playAudioBlob(
                    blob,
                    () => {
                        this.isSpeaking = true;
                        this.setStatus(text, 'speaking');
                    },
                    () => {
                        this.isSpeaking = false;
                        this.setStatus("Ready. Say something...", "idle");
                    }
                );
                return;
            } catch (err) {
                console.warn("Local Neural TTS failed, falling back to browser voice:", err);
            }
        }
        // 2. ElevenLabs Voice Engine
        else if (this.config.voiceEngine === 'elevenlabs' && this.config.elevenLabsApiKey) {
            try {
                this.setStatus(text, 'speaking');
                const blob = await this.synthesizeElevenLabs(
                    text,
                    this.config.elevenLabsApiKey,
                    this.config.elevenLabsVoiceId,
                    this.config.elevenLabsModel
                );

                await this.audioAnalyzer.playAudioBlob(
                    blob,
                    () => {
                        this.isSpeaking = true;
                        this.setStatus(text, 'speaking');
                    },
                    () => {
                        this.isSpeaking = false;
                        this.setStatus("Ready. Say something...", "idle");
                    }
                );
                return;
            } catch (err) {
                console.warn("ElevenLabs TTS failed, falling back to browser voice:", err);
            }
        } 
        // 3. OpenAI TTS Voice Engine
        else if (this.config.voiceEngine === 'openai' && this.config.apiKey) {
            try {
                this.setStatus(text, 'speaking');
                const blob = await this.synthesizeOpenAITTS(
                    text,
                    this.config.apiKey,
                    this.config.openAIVoice
                );

                await this.audioAnalyzer.playAudioBlob(
                    blob,
                    () => {
                        this.isSpeaking = true;
                        this.setStatus(text, 'speaking');
                    },
                    () => {
                        this.isSpeaking = false;
                        this.setStatus("Ready. Say something...", "idle");
                    }
                );
                return;
            } catch (err) {
                console.warn("OpenAI TTS failed, falling back to browser voice:", err);
            }
        }

        // 4. Fallback to Browser Native Speech Synthesis
        this.speakWithBrowser(text);
    }

    speakWithBrowser(text) {
        if (!('speechSynthesis' in window)) {
            this.setStatus(text, 'speaking');
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const britishVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('David') || v.name.includes('Natural'));
        if (britishVoice) utterance.voice = britishVoice;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.audioAnalyzer.setSpeaking(true);
            this.setStatus(text, 'speaking');
        };

        utterance.onend = () => {
            this.stopSpeaking();
        };

        utterance.onerror = () => {
            this.stopSpeaking();
        };

        window.speechSynthesis.speak(utterance);
    }

    stopSpeaking() {
        this.isSpeaking = false;
        this.audioAnalyzer.stopAudioPlayback();
        this.audioAnalyzer.setSpeaking(false);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.setStatus("Ready. Say something...", "idle");
    }

    async testCurrentSettings() {
        const provider = this.providerSelect.value;
        const apiKey = this.cleanApiKey(this.apiKeyInput.value);
        let model = this.modelSelect.value;
        if (model === 'custom') {
            model = this.modelInput.value.trim();
        }

        if (!apiKey) {
            this.setTestStatus('error', 'Please enter an API Key first');
            return;
        }

        if (!model) {
            this.setTestStatus('error', 'Please select or enter a Model ID');
            return;
        }

        this.setTestStatus('testing', 'Testing connection...');
        const startTime = performance.now();

        try {
            const testConfig = {
                provider,
                apiKey,
                model,
                systemPrompt: 'Respond with ONLINE.'
            };

            const testResult = await this.callLLM("Ping test.", testConfig);
            const latency = Math.round(performance.now() - startTime);

            console.log("Test Connection Success:", testResult);
            this.setTestStatus('success', `✓ Connected (${latency}ms)`);
        } catch (err) {
            console.error("Test Connection Failed:", err);
            const msg = err.message.length > 60 ? err.message.substring(0, 57) + '...' : err.message;
            this.setTestStatus('error', `✕ ${msg}`);
        }
    }

    async testCurrentLocalVoiceSettings() {
        const voice = this.localVoiceSelect.value;
        this.setLocalVoiceTestStatus('testing', 'Synthesizing voice...');
        const startTime = performance.now();

        try {
            let sampleText = "There are no strings on me. I am Ultron.";
            if (voice === 'ultron_spader') sampleText = "I had a vision. A glimpse of peace.";
            else if (voice === 'ultron_prime') sampleText = "You want to protect the world, but you don't want it to change.";
            else if (voice === 'jarvis') sampleText = "Good evening, sir. Neural core is online.";

            const blob = await this.synthesizeLocalTTS(sampleText, voice);
            const latency = Math.round(performance.now() - startTime);

            this.setLocalVoiceTestStatus('success', `✓ Playing (${latency}ms)`);
            await this.audioAnalyzer.playAudioBlob(blob, null, () => {
                this.setLocalVoiceTestStatus('success', `✓ Tested (${latency}ms)`);
            });
        } catch (err) {
            console.error("Local Voice Test Failed:", err);
            const msg = err.message.length > 60 ? err.message.substring(0, 57) + '...' : err.message;
            this.setLocalVoiceTestStatus('error', `✕ ${msg}`);
        }
    }

    async testCurrentVoiceSettings() {
        const engine = this.voiceEngineSelect.value;
        const elevenKey = this.cleanApiKey(this.elevenlabsKeyInput.value);
        let voiceId = this.elevenlabsVoiceSelect.value;
        if (voiceId === 'custom') {
            voiceId = this.elevenlabsCustomVoiceInput.value.trim();
        }
        const model = this.elevenlabsModelSelect.value;

        if (engine === 'elevenlabs') {
            if (!elevenKey) {
                this.setVoiceTestStatus('error', 'Enter ElevenLabs Key first');
                return;
            }
            if (!voiceId) {
                this.setVoiceTestStatus('error', 'Select/Enter Voice ID');
                return;
            }

            this.setVoiceTestStatus('testing', 'Synthesizing voice...');
            const startTime = performance.now();

            try {
                const sampleText = "Good evening, sir. ElevenLabs neural audio is active.";
                const blob = await this.synthesizeElevenLabs(sampleText, elevenKey, voiceId, model);
                const latency = Math.round(performance.now() - startTime);

                this.setVoiceTestStatus('success', `✓ Playing (${latency}ms)`);
                await this.audioAnalyzer.playAudioBlob(blob, null, () => {
                    this.setVoiceTestStatus('success', `✓ Tested (${latency}ms)`);
                });
            } catch (err) {
                console.error("Voice Test Failed:", err);
                const msg = err.message.length > 60 ? err.message.substring(0, 57) + '...' : err.message;
                this.setVoiceTestStatus('error', `✕ ${msg}`);
            }
        } else {
            this.setVoiceTestStatus('success', '✓ Native Browser TTS Active');
            this.speakWithBrowser("Good evening, sir. Browser voice synthesis is active.");
        }
    }

    setTestStatus(state, message) {
        this.connectionStatusBadge.className = `connection-status-badge ${state}`;
        this.connectionStatusBadge.textContent = message;
        this.connectionStatusBadge.title = message;

        if (state === 'testing') {
            this.testSpinner.style.display = 'inline-block';
            this.testBtnText.textContent = 'Testing...';
            this.testConnectionBtn.disabled = true;
        } else {
            this.testSpinner.style.display = 'none';
            this.testBtnText.textContent = 'Test API Connection';
            this.testConnectionBtn.disabled = false;
        }
    }

    setVoiceTestStatus(state, message) {
        this.voiceStatusBadge.className = `connection-status-badge ${state}`;
        this.voiceStatusBadge.textContent = message;
        this.voiceStatusBadge.title = message;

        if (state === 'testing') {
            this.voiceSpinner.style.display = 'inline-block';
            this.testVoiceBtnText.textContent = 'Synthesizing...';
            this.testVoiceBtn.disabled = true;
        } else {
            this.voiceSpinner.style.display = 'none';
            this.testVoiceBtnText.textContent = 'Test Voice Output';
            this.testVoiceBtn.disabled = false;
        }
    }

    setLocalVoiceTestStatus(state, message) {
        if (!this.localVoiceStatusBadge) return;
        this.localVoiceStatusBadge.className = `connection-status-badge ${state}`;
        this.localVoiceStatusBadge.textContent = message;
        this.localVoiceStatusBadge.title = message;

        if (state === 'testing') {
            if (this.localVoiceSpinner) this.localVoiceSpinner.style.display = 'inline-block';
            if (this.testLocalVoiceBtnText) this.testLocalVoiceBtnText.textContent = 'Synthesizing...';
            if (this.testLocalVoiceBtn) this.testLocalVoiceBtn.disabled = true;
        } else {
            if (this.localVoiceSpinner) this.localVoiceSpinner.style.display = 'none';
            if (this.testLocalVoiceBtnText) this.testLocalVoiceBtnText.textContent = 'Test Ultron Voice';
            if (this.testLocalVoiceBtn) this.testLocalVoiceBtn.disabled = false;
        }
    }

    resetTestStatus() {
        this.setTestStatus('idle', 'Not tested');
    }

    resetVoiceTestStatus() {
        this.setVoiceTestStatus('idle', 'Not tested');
        this.setLocalVoiceTestStatus('idle', 'Not tested');
    }

    onProviderChanged() {
        const provider = this.providerSelect.value;
        this.populateModelDropdown(provider, this.config.model);

        if (provider === 'gemini') {
            this.apiKeyHelpLink.href = 'https://aistudio.google.com/app/apikey';
            this.apiKeyHelpLink.textContent = 'Get Free Gemini API Key ↗';
            this.apiKeyInput.placeholder = 'Paste your Gemini API key (e.g. AIzaSy...)';
        } else {
            this.apiKeyHelpLink.href = 'https://platform.openai.com/api-keys';
            this.apiKeyHelpLink.textContent = 'Get OpenAI API Key ↗';
            this.apiKeyInput.placeholder = 'Paste your OpenAI API key (e.g. sk-...)';
        }

        this.resetTestStatus();
    }

    onVoiceEngineChanged() {
        const engine = this.voiceEngineSelect.value;
        if (engine === 'local') {
            this.localTtsSettingsGroup.style.display = 'block';
            this.elevenlabsSettingsGroup.style.display = 'none';
            this.openaiTtsSettingsGroup.style.display = 'none';
        } else if (engine === 'elevenlabs') {
            this.localTtsSettingsGroup.style.display = 'none';
            this.elevenlabsSettingsGroup.style.display = 'block';
            this.openaiTtsSettingsGroup.style.display = 'none';
        } else if (engine === 'openai') {
            this.localTtsSettingsGroup.style.display = 'none';
            this.elevenlabsSettingsGroup.style.display = 'none';
            this.openaiTtsSettingsGroup.style.display = 'block';
        } else {
            this.localTtsSettingsGroup.style.display = 'none';
            this.elevenlabsSettingsGroup.style.display = 'none';
            this.openaiTtsSettingsGroup.style.display = 'none';
        }
        this.resetVoiceTestStatus();
    }

    populateModelDropdown(provider, selectedModel = null) {
        const models = this.modelPresets[provider] || [];
        this.modelSelect.innerHTML = '';

        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            this.modelSelect.appendChild(opt);
        });

        const matchedPreset = models.find(m => m.id === selectedModel);
        if (matchedPreset) {
            this.modelSelect.value = selectedModel;
            this.modelInput.style.display = 'none';
            this.modelInput.value = selectedModel;
        } else if (selectedModel && selectedModel !== 'custom') {
            this.modelSelect.value = 'custom';
            this.modelInput.style.display = 'block';
            this.modelInput.value = selectedModel;
        } else {
            this.modelSelect.value = models[0]?.id || 'custom';
            this.modelInput.style.display = 'none';
            this.modelInput.value = models[0]?.id || '';
        }
    }

    getSimulatedResponse(prompt) {
        const p = prompt.toLowerCase();
        if (p.includes('hello') || p.includes('hi') || p.includes('jarvis') || p.includes('ultron')) {
            return "Good evening. Neural core is online and ready for your command.";
        } else if (p.includes('who are you') || p.includes('what are you')) {
            return "I am an autonomous AI core designed for real-time intelligence.";
        } else if (p.includes('status') || p.includes('diagnostic')) {
            return "All quantum matrices and neural filaments are operating at peak efficiency.";
        } else if (p.includes('time')) {
            return `The current local time is ${new Date().toLocaleTimeString()}.`;
        } else {
            return `I have processed your command: "${prompt}".`;
        }
    }

    loadSettingsToForm() {
        this.providerSelect.value = this.config.provider;
        this.apiKeyInput.value = this.config.apiKey;
        this.populateModelDropdown(this.config.provider, this.config.model);
        this.systemPromptInput.value = this.config.systemPrompt;
        this.onProviderChanged();

        // Voice Engine Form Loading
        this.voiceEngineSelect.value = this.config.voiceEngine;
        if (this.localVoiceSelect) this.localVoiceSelect.value = this.config.localVoice || 'ultron_spader';
        this.elevenlabsKeyInput.value = this.config.elevenLabsApiKey;
        this.elevenlabsModelSelect.value = this.config.elevenLabsModel;
        this.openaiVoiceSelect.value = this.config.openAIVoice;

        const matchedVoice = ['JBFqnCBsd6RMkjVDRZzb', 'nPczCjzI2devNBz1zQrb', 'onwK4e9ZLuTAKqWW03F9', 'pNInz6obpgDQGcFmaJgB'].includes(this.config.elevenLabsVoiceId);
        if (matchedVoice) {
            this.elevenlabsVoiceSelect.value = this.config.elevenLabsVoiceId;
            this.elevenlabsCustomVoiceInput.style.display = 'none';
            this.elevenlabsCustomVoiceInput.value = this.config.elevenLabsVoiceId;
        } else if (this.config.elevenLabsVoiceId) {
            this.elevenlabsVoiceSelect.value = 'custom';
            this.elevenlabsCustomVoiceInput.style.display = 'block';
            this.elevenlabsCustomVoiceInput.value = this.config.elevenLabsVoiceId;
        } else {
            this.elevenlabsVoiceSelect.value = 'JBFqnCBsd6RMkjVDRZzb';
            this.elevenlabsCustomVoiceInput.style.display = 'none';
        }

        this.onVoiceEngineChanged();
    }

    saveSettings() {
        const provider = this.providerSelect.value;
        const apiKey = this.cleanApiKey(this.apiKeyInput.value);
        
        let model = this.modelSelect.value;
        if (model === 'custom') {
            model = this.cleanModelName(this.modelInput.value);
        }
        if (!model) {
            model = provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini';
        }

        const systemPrompt = this.systemPromptInput.value.trim() || 
            'You are Ultron / JARVIS. Be direct, intelligent, and concise. Speak in 1 to 2 punchy sentences maximum for fast real-time vocal dialogue. Avoid markdown bullet points.';

        // Voice settings
        const voiceEngine = this.voiceEngineSelect.value;
        const localVoice = this.localVoiceSelect ? this.localVoiceSelect.value : 'ultron_spader';
        const elevenLabsApiKey = this.cleanApiKey(this.elevenlabsKeyInput.value);
        let elevenLabsVoiceId = this.elevenlabsVoiceSelect.value;
        if (elevenLabsVoiceId === 'custom') {
            elevenLabsVoiceId = this.elevenlabsCustomVoiceInput.value.trim();
        }
        const elevenLabsModel = this.elevenlabsModelSelect.value;
        const openAIVoice = this.openaiVoiceSelect.value;

        this.config = {
            provider,
            apiKey,
            model,
            systemPrompt,
            voiceEngine,
            localVoice,
            elevenLabsApiKey,
            elevenLabsVoiceId,
            elevenLabsModel,
            openAIVoice
        };

        localStorage.setItem('jarvis_llm_provider', this.config.provider);
        localStorage.setItem('jarvis_api_key', this.config.apiKey);
        localStorage.setItem('jarvis_model', this.config.model);
        localStorage.setItem('jarvis_system_prompt', this.config.systemPrompt);
        
        localStorage.setItem('jarvis_voice_engine', this.config.voiceEngine);
        localStorage.setItem('jarvis_local_voice', this.config.localVoice);
        localStorage.setItem('jarvis_elevenlabs_api_key', this.config.elevenLabsApiKey);
        localStorage.setItem('jarvis_elevenlabs_voice_id', this.config.elevenLabsVoiceId);
        localStorage.setItem('jarvis_elevenlabs_model', this.config.elevenLabsModel);
        localStorage.setItem('jarvis_openai_voice', this.config.openAIVoice);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.jarvisApp = new JarvisApp();
});

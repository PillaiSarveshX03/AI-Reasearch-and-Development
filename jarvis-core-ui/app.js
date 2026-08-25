/**
 * JARVIS Clean Voice & LLM Integration Controller
 * Handles speech-to-text, LLM API communication (Gemini/OpenAI/Custom),
 * text-to-speech with decibel synchronization, and UI state management.
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
        this.conversationHistory = [];

        // Model Presets Definitions
        this.modelPresets = {
            gemini: [
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ultra Fast & Recommended)' },
                { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Fast)' },
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

        // LLM Configuration (Stored in localStorage)
        const savedProvider = localStorage.getItem('jarvis_llm_provider') || 'gemini';
        const defaultModel = savedProvider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';

        this.config = {
            provider: savedProvider,
            apiKey: localStorage.getItem('jarvis_api_key') || '',
            model: localStorage.getItem('jarvis_model') || defaultModel,
            systemPrompt: localStorage.getItem('jarvis_system_prompt') || 
                'You are J.A.R.V.I.S., a sophisticated, concise, and helpful AI assistant inspired by Tony Stark\'s AI. Speak in a refined, polite, intelligent tone. Keep answers direct and concise for voice conversations.'
        };

        // DOM Elements
        this.statusText = document.getElementById('status-text');
        this.micBtn = document.getElementById('mic-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.textToggleBtn = document.getElementById('text-toggle-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');

        // Text Drawer elements
        this.textDrawer = document.getElementById('text-drawer');
        this.textInput = document.getElementById('text-input');
        this.sendTextBtn = document.getElementById('send-text-btn');

        // Settings Form Elements
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

        this.initSpeechRecognition();
        this.initEventListeners();
        this.loadSettingsToForm();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.micBtn.classList.add('active');
                this.setStatus("Listening...", "active");
                this.audioAnalyzer.startMicrophone();
            };

            this.recognition.onresult = (event) => {
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                if (interim) {
                    this.setStatus(`"${interim}"`, "active");
                }

                if (final) {
                    this.handleUserInput(final);
                }
            };

            this.recognition.onerror = (e) => {
                console.warn("Speech recognition error:", e);
                this.stopListening();
                this.setStatus("Say something...", "idle");
            };

            this.recognition.onend = () => {
                if (this.isListening) {
                    this.stopListening();
                }
            };
        } else {
            console.warn("Speech recognition is not supported in this browser.");
            if (this.micBtn) {
                this.micBtn.title = "Speech recognition not supported in this browser. Use text input.";
            }
        }
    }

    initEventListeners() {
        // Microphone Click Toggle
        if (this.micBtn) {
            this.micBtn.addEventListener('click', () => {
                if (this.isSpeaking) {
                    this.stopSpeaking();
                }
                if (this.isListening) {
                    this.stopListening();
                } else {
                    this.startListening();
                }
            });
        }

        // Cancel / Reset Button
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.stopSpeaking();
                this.stopListening();
                this.setStatus("Say something...", "idle");
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

        // Settings Modal
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.loadSettingsToForm();
                this.resetTestStatus();
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
                if (this.apiKeyInput.type === 'password') {
                    this.apiKeyInput.type = 'text';
                } else {
                    this.apiKeyInput.type = 'password';
                }
            });
        }

        // Test API Connection Button
        if (this.testConnectionBtn) {
            this.testConnectionBtn.addEventListener('click', () => {
                this.testCurrentSettings();
            });
        }
    }

    startListening() {
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (e) {
                console.warn(e);
            }
        }
    }

    stopListening() {
        this.isListening = false;
        if (this.micBtn) this.micBtn.classList.remove('active');
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        this.audioAnalyzer.stopMicrophone();
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
        this.stopListening();
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
                reply = `I apologize, sir, but I encountered an API error: ${rawMsg}. Please check your API key and model in settings.`;
            }
        } else {
            // Built-in intelligent simulated JARVIS responses if no API key is provided yet
            reply = this.getSimulatedResponse(userPrompt);
        }

        this.conversationHistory.push({ role: 'assistant', content: reply });
        this.isProcessing = false;
        this.speak(reply);
    }

    /**
     * Sanitizes an API key (removes accidental quotes, spaces, newlines)
     */
    cleanApiKey(key) {
        if (!key) return '';
        return key.trim().replace(/^["'`]|["'`]$/g, '');
    }

    /**
     * Sanitizes model name
     */
    cleanModelName(model) {
        if (!model) return '';
        return model.trim().replace(/^models\//, '');
    }

    /**
     * Formats conversation history for specific API
     */
    getFormattedHistory(provider) {
        const historySlice = this.conversationHistory.slice(-6, -1); // exclude current user prompt
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

    /**
     * Call LLM API (Google Gemini or OpenAI standard format)
     */
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
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ];

            const body = {
                system_instruction: {
                    parts: [{ text: cfg.systemPrompt || 'You are J.A.R.V.I.S., a helpful AI assistant.' }]
                },
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 350,
                    temperature: 0.7
                }
            };

            let res;
            try {
                res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (networkErr) {
                throw new Error(`Network connection failed: ${networkErr.message}. Ensure you are connected to the internet.`);
            }

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
                if (data.promptFeedback?.blockReason) {
                    throw new Error(`Response blocked by safety policy: ${data.promptFeedback.blockReason}`);
                }
                throw new Error("No response candidates returned by Gemini API.");
            }

            const text = candidate.content?.parts?.map(p => p.text).join('') || '';
            if (!text && candidate.finishReason && candidate.finishReason !== 'STOP') {
                throw new Error(`Response terminated: ${candidate.finishReason}`);
            }

            return text.trim() || "I have received an empty response, sir.";

        } else {
            // OpenAI compatible endpoint
            const url = `https://api.openai.com/v1/chat/completions`;
            const history = overrideConfig ? [] : this.getFormattedHistory('openai');
            
            const messages = [
                { role: 'system', content: cfg.systemPrompt || 'You are J.A.R.V.I.S., a helpful AI assistant.' },
                ...history,
                { role: 'user', content: prompt }
            ];

            const body = {
                model: modelName || 'gpt-4o-mini',
                messages: messages,
                max_tokens: 350,
                temperature: 0.7
            };

            let res;
            try {
                res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(body)
                });
            } catch (networkErr) {
                throw new Error(`Network connection failed: ${networkErr.message}.`);
            }

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
            if (!reply) throw new Error("No response message returned by OpenAI API.");
            return reply.trim();
        }
    }

    /**
     * Test connection with current inputs in settings form
     */
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
                systemPrompt: 'Respond with exactly the word ONLINE.'
            };

            const testResult = await this.callLLM("Ping test. Respond with ONLINE.", testConfig);
            const latency = Math.round(performance.now() - startTime);

            console.log("Test Connection Success:", testResult);
            this.setTestStatus('success', `✓ Connected (${latency}ms)`);
        } catch (err) {
            console.error("Test Connection Failed:", err);
            const msg = err.message.length > 60 ? err.message.substring(0, 57) + '...' : err.message;
            this.setTestStatus('error', `✕ ${msg}`);
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

    resetTestStatus() {
        this.setTestStatus('idle', 'Not tested');
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
        if (p.includes('hello') || p.includes('hi') || p.includes('jarvis')) {
            return "Good evening, sir. Neural core is online and ready for your command.";
        } else if (p.includes('who are you') || p.includes('what are you')) {
            return "I am J.A.R.V.I.S., an autonomous AI core designed for real-time intelligence and systems management.";
        } else if (p.includes('status') || p.includes('diagnostic')) {
            return "All neural filaments and quantum matrices are operating at peak efficiency, sir.";
        } else if (p.includes('time')) {
            return `The current local time is ${new Date().toLocaleTimeString()}.`;
        } else {
            return `I have processed your request regarding "${prompt}". Add your Gemini or OpenAI API Key in the top-right settings to enable live conversational intelligence.`;
        }
    }

    /**
     * Speaks the reply and synchronizes audio decibels to the 3D Orb
     */
    speak(text) {
        if (!('speechSynthesis' in window)) {
            this.setStatus(text, 'speaking');
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;

        // Select a crisp English voice
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
        this.audioAnalyzer.setSpeaking(false);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.setStatus("Say something...", "idle");
    }

    loadSettingsToForm() {
        this.providerSelect.value = this.config.provider;
        this.apiKeyInput.value = this.config.apiKey;
        this.populateModelDropdown(this.config.provider, this.config.model);
        this.systemPromptInput.value = this.config.systemPrompt;
        this.onProviderChanged();
    }

    saveSettings() {
        const provider = this.providerSelect.value;
        const apiKey = this.cleanApiKey(this.apiKeyInput.value);
        
        let model = this.modelSelect.value;
        if (model === 'custom') {
            model = this.cleanModelName(this.modelInput.value);
        }
        if (!model) {
            model = provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
        }

        const systemPrompt = this.systemPromptInput.value.trim() || 
            'You are J.A.R.V.I.S., a sophisticated, concise, and helpful AI assistant inspired by Tony Stark\'s AI. Speak in a refined, polite, intelligent tone. Keep answers direct and concise for voice conversations.';

        this.config = {
            provider,
            apiKey,
            model,
            systemPrompt
        };

        localStorage.setItem('jarvis_llm_provider', this.config.provider);
        localStorage.setItem('jarvis_api_key', this.config.apiKey);
        localStorage.setItem('jarvis_model', this.config.model);
        localStorage.setItem('jarvis_system_prompt', this.config.systemPrompt);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.jarvisApp = new JarvisApp();
});

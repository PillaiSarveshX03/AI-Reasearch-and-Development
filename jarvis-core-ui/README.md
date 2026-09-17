# 🤖 J.A.R.V.I.S. Core UI & Neural Voice Assistant

A state-of-the-art, real-time AI Voice Assistant featuring a **3D Holographic Particle Orb** modulated by Web Audio frequencies, **Zero-Latency Push-to-Talk**, **Free Neural Voice Cloning** (James Spader's Ultron, J.A.R.V.I.S., F.R.I.D.A.Y.), and integration with **Google Gemini & OpenAI GPT-4o**.

---

## ✨ Features

- **🌐 3D Holographic Particle Core**: Procedural WebGL/Three.js quantum sphere with noise turbulence and direct decibel frequency synchronization.
- **🎙️ Zero-Latency Push-to-Talk & Mic Toggle**:
  - **Hold `[Space]`**: Speak naturally, release to immediately execute commands without waiting for silence timeouts.
  - **Top-Right Mic Button**: Toggle between unmuted active listening and muted mode.
- **🔊 Free Local Neural Voice Engine**:
  - 100% Free, unlimited AI neural speech powered by `edge-tts` & FastAPI (`server.py`).
  - **Ultron (James Spader)**: Custom acoustic profile tuned to deep baritone metallic timbre matching `Ultron.mp3`.
  - **J.A.R.V.I.S.** (Paul Bettany style British AI).
  - **F.R.I.D.A.Y.** (Irish AI persona).
  - **Tony Stark** (Charismatic engineer persona).
- **⚡ Ultra-Low Latency Response**: Instant HTML5 Audio streaming connected to the 3D visualizer without blocking CPU array decoding.
- **🧠 Multi-Model LLM Brain**:
  - Google Gemini (`gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-1.5-pro`).
  - OpenAI (`gpt-4o-mini`, `gpt-4o`).
- **🎧 ElevenLabs & OpenAI TTS Integration**: Direct API support for custom voice cloning IDs with model selection (`eleven_flash_v2_5`).
- **🖥️ Top-Right HUD**: Futuristic cyber-glass control cluster with real-time live speech transcript display and keyboard prompt drawer.

---

## 📁 Project Architecture & File Structure

```text
jarvis-core-ui/
├── index.html          # Main Holographic HUD & interface structure
├── styles.css          # Cyberpunk glassmorphism styling & animations
├── app.js              # Core controller (Voice input, LLM streaming, settings)
├── audio.js            # Web Audio API analyzer & decibel FFT modulation
├── orb.js              # Three.js 3D Holographic Particle Orb simulation
├── server.py           # FastAPI local neural voice server & static file host
├── start.bat           # 1-click startup batch script for Windows
├── Ultron.mp3          # Reference voice sample for Ultron Spader profile
├── package.json        # Node metadata & scripts
└── README.md           # Documentation & setup guide
```

---

## 🚀 Quick Start Guide

### 1. Requirements
- **Python 3.10+** (Python 3.14 compatible)
- Modern Web Browser (Google Chrome, Microsoft Edge, Brave)

### 2. Install Python Dependencies
```bash
pip install fastapi uvicorn edge-tts
```

### 3. Launch the Assistant
Double-click **`start.bat`** or run:
```bash
py server.py
```
Open your browser at: **[http://localhost:8000](http://localhost:8000)**

---

## ⌨️ Controls & Shortcuts

| Action | Control | Description |
| :--- | :--- | :--- |
| **Push to Talk** | **Hold `[Space]`** | Hold spacebar to speak. Releasing submits speech instantly. |
| **Toggle Microphone** | **Click `🎙️` (Top Right)** | Unmutes for hands-free listening or mutes when finished. |
| **Cancel / Reset** | **Click `✕` (Top Right)** | Stops active audio playback and clears current query. |
| **Keyboard Input** | **Click `⌨️` (Top Right)** | Opens floating drawer to type commands manually. |
| **Settings Panel** | **Click `⚙️` (Top Right)** | Configure LLM API Keys, Voices, and Models. |

---

## ⚙️ Configuration & Custom Voices

1. Click the **Settings Icon (`⚙️`)** in the top-right corner.
2. **LLM Tab**:
   - Select **Google Gemini** or **OpenAI**.
   - Enter your API Key (e.g. from Google AI Studio).
   - Click **"Test API Connection"** to verify latency.
3. **Voice Engine Tab**:
   - **Local Neural (100% Free)**: Choose *Ultron (James Spader)*, *J.A.R.V.I.S.*, or *F.R.I.D.A.Y.*
   - **Sample Player**: Click **"Play Ultron.mp3"** to test your uploaded reference audio with live 3D Orb reaction.
   - **ElevenLabs**: Paste your key and custom voice ID to use cloud cloned models.

---

## 🛡️ License
MIT License. Built for advanced AI research, voice synthesis, and interactive holographic interfaces.

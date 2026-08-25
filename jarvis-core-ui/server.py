"""
JARVIS Core Server & Free Local Neural Voice Engine (Ultra Fast Streaming)
Runs on http://localhost:8000 with edge-tts streaming and static file hosting.
"""

import os
import io
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import uvicorn

app = FastAPI(title="JARVIS AI Core & Fast Neural Voice Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preset mapping tuned for James Spader's Ultron, JARVIS, FRIDAY, etc.
VOICE_MAP = {
    "ultron": {"voice": "en-US-ChristopherNeural", "pitch": "-24Hz", "rate": "+4%", "volume": "+15%"},
    "ultron_spader": {"voice": "en-US-ChristopherNeural", "pitch": "-24Hz", "rate": "+4%", "volume": "+15%"},
    "ultron_prime": {"voice": "en-US-EricNeural", "pitch": "-26Hz", "rate": "+0%", "volume": "+20%"},
    "jarvis": {"voice": "en-GB-RyanNeural", "pitch": "-6Hz", "rate": "+5%", "volume": "+0%"},
    "friday": {"voice": "en-IE-EmilyNeural", "pitch": "+0Hz", "rate": "+6%", "volume": "+0%"},
    "tony":   {"voice": "en-US-GuyNeural", "pitch": "-4Hz", "rate": "+3%", "volume": "+0%"},
    "deep_villain": {"voice": "en-US-EricNeural", "pitch": "-28Hz", "rate": "-2%", "volume": "+20%"}
}

static_dir = os.path.dirname(os.path.abspath(__file__))

@app.post("/api/tts")
async def generate_tts(request: Request):
    data = await request.json()
    text = data.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    voice_key = data.get("voice", "ultron_spader")
    pitch = data.get("pitch")
    rate = data.get("rate")
    volume = data.get("volume", "+0%")

    if voice_key in VOICE_MAP:
        preset = VOICE_MAP[voice_key]
        voice_name = preset["voice"]
        if not pitch:
            pitch = preset["pitch"]
        if not rate:
            rate = preset["rate"]
        if not volume or volume == "+0%":
            volume = preset.get("volume", "+0%")
    else:
        voice_name = voice_key or "en-US-ChristopherNeural"
        if not pitch:
            pitch = "-24Hz"
        if not rate:
            rate = "+4%"

    communicate = edge_tts.Communicate(text, voice_name, pitch=pitch, rate=rate, volume=volume)

    async def audio_stream():
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")

@app.get("/api/ultron-sample")
async def get_ultron_sample():
    sample_file = os.path.join(static_dir, "Ultron.mp3")
    if os.path.exists(sample_file):
        return FileResponse(sample_file, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Ultron.mp3 sample not found in workspace")

# Serve static frontend files
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/{filename:path}")
async def serve_files(filename: str):
    file_path = os.path.join(static_dir, filename)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    print("=" * 60)
    print(">> J.A.R.V.I.S. Neural Core and Fast Voice Engine Running")
    print(">> Open http://localhost:8000 in your browser")
    print(">> Top-Right HUD & James Spader Ultron Cloned Active")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")

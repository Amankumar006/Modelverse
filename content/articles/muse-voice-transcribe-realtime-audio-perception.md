---
slug: "muse-voice-transcribe-realtime-audio-perception"
title: "Muse Voice Transcribe: Meta's Real-Time Autoregressive Audio Perception Model"
category: "Architecture"
summary: "Meta releases Muse Voice Transcribe, an autoregressive streaming audio model executing real-time ASR, 20+ speaker diarization, and endpointing at 80ms chunk latency with native code-switching."
author:
  name: "Modelverse Research"
  role: "AI Systems Engineer"
source_name: "Meta AI Research"
source_url: "https://research.meta.ai/blog/introducing-muse-voice-transcribe"
cover_image: "/images/articles/universal-cover.svg"
tags:
  - "Meta"
  - "Audio AI"
  - "Speech Recognition"
  - "Diarization"
  - "Multimodal"
published_at: "2026-09-02T20:55:00+05:30"
is_published: true
reading_time: 7
---

# Muse Voice Transcribe: Meta's Real-Time Autoregressive Audio Perception Model

On September 1, 2026, Meta AI Research and Meta Superintelligence Labs unveiled **Muse Voice Transcribe**, their flagship real-time audio perception model from the Muse Spark family. 

Departing from conventional multi-stage cascaded speech pipelines—which process audio in disjointed steps for voice activity detection (VAD), acoustic feature extraction, offline clustering, and language modeling—Muse Voice Transcribe unifies streaming automatic speech recognition (ASR), 20+ speaker diarization, and real-time conversation endpointing into a single end-to-end autoregressive transformer. By operating over micro-chunks of 80 milliseconds (12.5 Hz) and applying reinforcement learning to balance recognition accuracy against emission latency, the model achieves the speed-accuracy Pareto frontier, ranking first on the Artificial Analysis streaming speech-to-text benchmark and public diarization suites.

---

## Key Breakthroughs

### 1. Autoregressive Streaming Audio Perception & Adaptive Delay
Unlike batch transcription systems that require seconds of surrounding silence before producing text, Muse Voice Transcribe treats continuous audio as an interactive streaming sequence:

* **80ms Soft Token Encoding**: Continuous acoustic waveforms are sliced into 80ms chunks (12.5 Hz sampling rate), each transformed into a single dense continuous soft token fed into the transformer backbone.
* **Autoregressive Emission Control**: At every chunk step, the model decides whether to emit a transcription token or continue listening. When additional acoustic context is required, the model emits a special `<|next_audio|>` token, which the inference engine immediately replaces with the incoming audio chunk. When the audio stream concludes, an `<|empty_audio|>` token prompts the model to exhaust its remaining phonetic buffer.
* **Reinforcement-Learned Adaptive Delay**: Through multi-objective reinforcement learning combining a Word Error Rate (WER) reward and a latency penalty multiplicatively, the model dynamically adapts its delay on a word-by-word basis—holding emission briefly on acoustically ambiguous phonemes while emitting clear speech instantaneously.

---

### 2. Native Multi-Speaker Diarization and Streaming Endpointing
Traditional diarization requires computationally heavy post-processing, such as speaker embedding extraction followed by spectral or agglomerative clustering. Muse Voice Transcribe handles diarization and endpointing natively in-stream via specialized vocabulary tokens:

* **Real-Time Speaker Identification**: The model introduces `<|start_of_turn|>` tokens to designate acoustic speaker transitions and appends `<|speaker_{A-Z}|>` tags at chunk boundaries. It reliably separates and tracks over 20 concurrent conversational participants in crowded, overlapping environments without post-hoc clustering.
* **Integrated Endpointing**: By predicting `<|speech_onset|>` and `<|speech_endpoint|>` tokens directly from acoustic trajectory dynamics, the model identifies conversational turn completion without separate Voice Activity Detection (VAD) models, eliminating latency in conversational agent loops.

---

### 3. Multilingual Generalization and Arbitrary Code-Switching
Human conversations in global environments frequently interleave multiple dialects and technical terms within single utterances:

* **70+ Language Pretraining**: Trained across more than 70 languages, with 25 extensively verified languages covering major global language families.
* **Seamless Code-Switching**: Transcribes intra-sentence and inter-sentence language shifts natively (e.g., fluid transitions between Mandarin and English technical jargon) without explicit language configuration switches.
* **Dynamic Context Biasing**: Supports lexical biasing injection, enabling developers to feed custom dictionaries of proper nouns, contact names, and specialized domain terminology (such as hardware models, command names, and geographical landmarks) to drive WER down on out-of-vocabulary entities.

---

## Technical Specifications & Benchmark Overview

| Metric / Dimension | Specification |
| :--- | :--- |
| **Developing Lab** | Meta AI Research / Meta Superintelligence Labs |
| **Release Date** | September 1, 2026 |
| **Temporal Chunk Size** | 80 milliseconds (12.5 Hz frame rate) |
| **Speaker Tracking** | 20+ simultaneous speakers tracked via streaming tokens |
| **Audio Context Limit** | Exceeds 1 hour continuously without performance degradation |
| **Language Coverage** | 70+ languages trained, 25 validated with native code-switching |
| **Public Benchmarks** | #1 on Artificial Analysis Streaming STT; #1 on AMI-IHM & AMI-SDM Diarization |
| **Deployment Platforms** | Meta Model API, Meta AI for Mac, Muse Code |

---

## Verified Integration & API Usage

Developers can interface with Muse Voice Transcribe using the Meta Model API via WebSocket or HTTP streaming:

```python
import os
import requests

api_key = os.environ.get("META_API_KEY")
url = "https://api.meta.ai/v1/asr/transcribe"

headers = {
    "Authorization": f"Bearer {api_key}",
}

data = {
    "model": "muse-voice-transcribe",
    "stream": True,
    "enable_diarization": True,
    "context_biasing": ["Meta", "Muse", "Menlo Park", "Ollama", "RTX 3090"],
}

with open("conference_audio.wav", "rb") as audio_file:
    files = {"file": audio_file}
    response = requests.post(url, headers=headers, data=data, files=files, stream=True)
    for chunk in response.iter_lines():
        if chunk:
            print(chunk.decode("utf-8"))
```

# Whisper-1: OpenAI's Speech Recognition API Model

## Model Overview
**whisper-1** is the version of OpenAI's Whisper model available via the OpenAI API for transcription and translation tasks. Released as an API endpoint in March 2023, it provides access to a highly capable multilingual speech recognition system for automatic transcription, speech-to-text, and audio translation (to English). The API wraps Whisper's large model for easy integration without the need to self-host. It accepts audio files up to 25MB in formats including MP3, MP4, MPEG, MPGA, M4A, WAV, and WEBM.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Multilingual Transcription** | Transcribes audio in 100+ languages automatically |
| **Speech Translation** | Translates speech from any supported language directly to English |
| **Multiple Audio Formats** | Accepts MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM |
| **Timestamps** | Returns word-level and segment-level timestamps |
| **Prompt-Guided** | Accepts optional prompt text to improve accuracy for domain-specific terms |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **API Docs** | [platform.openai.com/docs/guides/speech-to-text](https://platform.openai.com/docs/guides/speech-to-text) |
| **Open Source** | [openai/whisper](https://github.com/openai/whisper) |

---

## 📜 License & Access

**Proprietary API** — Available via OpenAI API. The underlying Whisper model weights are open-source (MIT).

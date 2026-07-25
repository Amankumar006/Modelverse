# Whisper Large v3: OpenAI's Multilingual Speech Recognition Model

## Model Overview
**Whisper Large v3** is OpenAI's latest and most capable automatic speech recognition (ASR) model, released in November 2023. Trained on 5 million hours of labeled audio data spanning 100+ languages, Whisper Large v3 achieves state-of-the-art word error rates across a broad range of languages and accents. It supports multilingual speech recognition, speech translation (to English), language identification, and voice activity detection.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Multilingual ASR** | Transcription in 100+ languages with state-of-the-art accuracy |
| **Speech Translation** | Direct translation of speech from any supported language to English |
| **5M Hours Training** | Trained on the largest labeled audio dataset used for ASR |
| **Long-Form Audio** | Handles audio files of arbitrary length via sliding window chunking |
| **Open Weights** | Released as open-source on HuggingFace (Apache 2.0) |

---

## 📊 Benchmarks (Word Error Rate — lower is better)

| Language | WER |
|:---|:---:|
| English | ~2.7% |
| Spanish | ~3.0% |
| French | ~4.2% |
| German | ~3.8% |
| Chinese | ~7.5% |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **HuggingFace** | [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3) |
| **GitHub** | [openai/whisper](https://github.com/openai/whisper) |
| **Paper** | [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356) |

---

## 📜 License

**MIT License** — Fully open-source, free for commercial and non-commercial use.

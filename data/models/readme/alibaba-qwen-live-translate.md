# Qwen Live Translate: Real-Time Multimodal Speech Translation

## Model Overview
**Qwen Live Translate** (`Qwen3.5-LiveTranslate-Flash`) is Alibaba's real-time multimodal simultaneous speech-to-speech and speech-to-text translation model family built on the **Qwen-Omni** architecture by the **Qwen Team (Alibaba Tongyi Lab)**.

It fuses audio, text, and visual input (such as speaker lip movements and facial context) to provide low-latency simultaneous interpretation, cross-lingual voice cloning, and domain-specific terminology control for live streaming and international conferences.

---

## Key Features
- **Multimodal Audio-Visual Understanding:** Integrates audio, text, and visual cues (lip movements, on-screen text) to resolve translation ambiguities in noisy environments.
- **Ultra-Low Latency Streaming:** Utilizes "Readable Unit" chunk-based streaming to achieve average end-to-end speech-to-speech latency as low as 2.8 seconds.
- **Multilingual Support:** Supports 60 languages for audio input and text translation, and 29 languages for speech audio synthesis.
- **Cross-Lingual Zero-Shot Voice Cloning:** Automatically replicates the speaker's vocal characteristics (timbre and voice identity) in real-time.
- **Hotword Customization:** Configures custom hotwords and domain terms to guarantee high accuracy in technical contexts.

---

## Verified Project Links
- **Project Portal:** [https://qwenlm.github.io/](https://qwenlm.github.io/)
- **arXiv Paper:** [https://arxiv.org/abs/2604.15804](https://arxiv.org/abs/2604.15804)
- **GitHub Repository:** [https://github.com/QwenLM](https://github.com/QwenLM)
- **Hugging Face Hub:** [https://huggingface.co/Qwen](https://huggingface.co/Qwen)

---

## Performance & Benchmarks
- **FLEURS & CoVoST 2:** Achieves state-of-the-art BLEU/COMET scores across major speech translation directions.
- **End-to-End Latency:** 2.8 seconds average end-to-end latency.

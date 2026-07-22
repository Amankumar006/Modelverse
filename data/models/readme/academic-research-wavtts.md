# WavTTS: Raw Waveform Text-to-Speech

## Model Overview
**WavTTS** is an end-to-end zero-shot Text-to-Speech (TTS) synthesis framework developed by researchers at **Shanghai Jiao Tong University (SJTU)** and **ByteDance Seed** (Wenxi Chen, Dongya Jia, et al.). It generates speech directly in raw waveform space using flow matching and Diffusion Transformers (DiT), bypassing intermediate mel-spectrogram or neural codec token representations.

---

## Key Features
- **Direct Raw Waveform Generation:** Models continuous time-domain raw audio waveforms directly using Flow Matching and Diffusion Transformers (DiT).
- **Non-Overlapping Patchification:** Employs a temporal patchification strategy to efficiently process high-dimensional raw audio signals.
- **Multi-Scale Mel Supervision:** Integrates multi-scale mel-spectrogram loss during training to provide perceptual guidance without restricting generation at inference.
- **Zero-Shot Voice Cloning:** Synthesizes natural, high-fidelity speech matching a target speaker's voice using only a short reference audio prompt.
- **Built on F5-TTS Framework:** Extends the F5-TTS flow-matching framework for robust zero-shot audio synthesis.

---

## Verified Project Links
- **Project Website:** [https://wavtts.github.io/](https://wavtts.github.io/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.03455](https://arxiv.org/abs/2606.03455)
- **GitHub Repository:** [https://github.com/cwx-worst-one/WavTTS](https://github.com/cwx-worst-one/WavTTS)
- **Hugging Face Model:** [https://huggingface.co/worstchan/WavTTS](https://huggingface.co/worstchan/WavTTS)

---

## Performance & Benchmarks
- **LibriSpeech-PC Word Error Rate (WER):** 1.50% – 2.02%
- **UTMOS (Speech Naturalness):** 4.36 (outperforms direct raw waveform baselines and matches top latent-space TTS models).

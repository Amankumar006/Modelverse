# StreamChar: Long-Horizon Streaming Character Audio-Video Generation

## Model Overview
**StreamChar** is a real-time, long-horizon streaming framework for generating synchronized audio and video of talking characters from text transcripts. Developed by researchers at **Alibaba Group (Tongyi Lab / HumanAIGC Team)** (Linrui Tian, Qi Wang, Bang Zhang), it addresses continuous character animation challenges like visual quality drift and audio-transcript misalignment by decoupling long-horizon orchestration from short-window audio-video denoising.

---

## Key Features
- **Decoupled Orchestration Architecture:** Separates global long-horizon semantic planning (LLM orchestrator) from local short-window bidirectional audio-video generation (Joint Audio-Video DiT).
- **Progress-Aware Pointer:** Maps transcript text directly to continuous audio and video generation, preventing cumulative speech and text misalignment over long horizons.
- **Sink-Chunk Memory Mechanism:** Employs persistent visual anchors ("sink chunks") to eliminate visual identity and quality drift during extended generation.
- **Two-Stage Decoupled Distillation:** Combines step-compression distribution matching distillation (DMD) with online chunk rollout fine-tuning for fast inference.
- **Real-Time Single-GPU Streaming:** Achieves continuous streaming inference on a single NVIDIA H100 GPU with per-chunk latency (1.34s) within real-time playback budgets.

---

## Verified Project Links
- **Project Website:** [https://humanaigc.github.io/StreamChar_page/](https://humanaigc.github.io/StreamChar_page/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.25659](https://arxiv.org/abs/2605.25659)
- **GitHub Repository:** [https://github.com/HumanAIGC/StreamChar](https://github.com/HumanAIGC/StreamChar)
- **Hugging Face:** [https://huggingface.co/papers/2605.25659](https://huggingface.co/papers/2605.25659)

---

## Benchmarks & Results
- **FID (Fréchet Inception Distance):** 17.99 (lowest among joint audio-video baselines).
- **Word Error Rate (WER):** 3.54% (Base) / 3.65% (Distilled).
- **VBench Dynamic Score:** 1.0 (maximum motion stability).
- **Streaming Latency:** 1.34 seconds per 33-frame chunk at 24 FPS on NVIDIA H100.

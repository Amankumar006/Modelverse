# MegaASR: Robust In-the-Wild Speech Recognition Foundation Model

**MegaASR** (MEGA-ASR) is a 1.7-billion parameter foundational Automatic Speech Recognition (ASR) framework developed by researchers from **Tsinghua University** in collaboration with **Nanyang Technological University (NTU)**, **National University of Singapore (NUS)**, and **Shanghai AI Lab**.

Designed to conquer the "acoustic robustness bottleneck" in speech recognition, MegaASR excels under extreme, compositional real-world audio distortions—such as severe background noise, heavy reverberation, far-field recording, transmission dropouts, and electronic clipping.

---

## 🔬 Key Features & Architecture

- **Qwen3-ASR-1.7B Foundation Backbone:** Built on top of Qwen3-ASR with specialized LoRA acoustic adaptation modules and an intelligent Audio Quality Router.
- **Voices-in-the-Wild-2M Dataset:** Pretrained and fine-tuned on a massive synthetic dataset of **2.6 million samples**, systematically modeling 7 atomic acoustic phenomena and 54 physically plausible compound environmental scenarios.
- **Acoustic-to-Semantic Progressive SFT (A2S-SFT):** Progressive multi-stage supervised fine-tuning that teaches the model to extract and reconstruct semantic information despite severe acoustic perturbations.
- **Dual-Granularity WER-Gated Policy Optimization (DG-WGPO):** A novel reinforcement learning alignment method combining token- and sentence-level rewards, dynamically gated by Word Error Rate (WER) to prevent hallucination and improve fine details.

```
Audio Input ──► Audio Quality Router ──┬──► Clean Speech Path (Base Qwen3-ASR) ─────► Text Transcript
                                        └──► Degraded Speech Path (MegaASR LoRA) ──► Robust Text Transcript
```

---

## 📊 Benchmarks & Performance

MegaASR achieves up to **30% relative Word Error Rate (WER) reduction** over standard open-source and proprietary ASR baselines in complex in-the-wild audio conditions.

| Benchmark Dataset | Evaluation | Performance | Status |
| :--- | :--- | :--- | :--- |
| **Voices-in-the-Wild-Bench** | Relative WER Reduction vs SOTA | **~30% WER Reduction** | Verified |
| **VOiCES R4-B-F** | Far-Field & Reverberation | **State-of-the-Art** | Verified |
| **NOIZEUS Sta-0** | Severe Noise Conditions | **State-of-the-Art** | Verified |

---

## 🚀 Quickstart & Usage

```bash
git clone https://github.com/xzf-thu/Mega-ASR.git
cd Mega-ASR
conda create -n mega-asr python=3.10 -y
conda activate mega-asr
pip install -r requirements.txt
python infer.py --audio /path/to/degraded_speech.wav
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://xzf-thu.github.io/Mega-ASR/)
- [arXiv Paper (arXiv:2605.19833)](https://arxiv.org/abs/2605.19833)
- [Paper PDF Download](https://arxiv.org/pdf/2605.19833.pdf)
- [GitHub Code Repository](https://github.com/xzf-thu/Mega-ASR)
- [GitHub Benchmark Repository](https://github.com/xzf-thu/Voices-in-the-Wild-Bench)
- [Hugging Face Model Checkpoint](https://huggingface.co/zhifeixie/Mega-ASR)
- [Hugging Face Dataset](https://huggingface.co/datasets/zhifeixie/Voices-in-the-Wild-2M)

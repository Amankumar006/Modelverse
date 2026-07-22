# StreamForce: Streaming Video Generation with Streaming Force Control

## Model Overview
**StreamForce** (Streaming Video Generation with Streaming Force Control) is a causal framework for real-time streaming video generation developed by researchers at **Northeastern University (NEU-VI Lab)** (Hanhui Wang, Yiming Xie, Huaizu Jiang, et al.).

It enables physically grounded interactive control over video rollouts via continuous, time-varying force inputs. StreamForce responds instantaneously to both local forces (e.g. localized pushes on objects) and global forces (e.g. wind vectors), running at up to 16.6 FPS on a single GPU.

---

## Key Features
- **Physically Grounded Streaming Control:** Accepts continuous time-varying force vectors to dynamically manipulate video streams as they evolve.
- **Causal Autoregressive Architecture:** Built on a streaming autoregressive backbone for low-latency interactive steerability.
- **Real-Time Speed (16.6 FPS):** Leverages an efficient force-controllable distillation pipeline for single-GPU streaming generation.
- **Unified Force Signal Representation:** Combines local impulses and global forces into a unified control signal space.
- **Physical Realism:** Preserves object persistence and motion plausibility under interactive force interventions.

---

## Verified Project Links
- **Project Website:** [https://neu-vi.github.io/StreamForce/](https://neu-vi.github.io/StreamForce/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.07508](https://arxiv.org/abs/2606.07508)
- **GitHub Repository:** [https://github.com/neu-vi/StreamForce](https://github.com/neu-vi/StreamForce)
- **Hugging Face:** [https://huggingface.co/papers/2606.07508](https://huggingface.co/papers/2606.07508)

---

## Benchmarks & Evaluation
- Evaluated on **Physics-IQ Benchmark** for physical world model understanding and force adherence.
- Achieves **16.6 FPS** real-time streaming generation latency on a single GPU.

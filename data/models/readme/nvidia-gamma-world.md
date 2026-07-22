# Gamma World: Generative Multi-Agent Real-Time World Model

## Model Overview
**Gamma-World** ($\gamma$-World) is a generative multi-agent world model developed by **NVIDIA Spatial Intelligence Lab (SIL)** and **NVIDIA Toronto AI Lab** (Fangfu Liu, Kai He, Sanja Fidler, et al.).

Unlike traditional single-agent world models, Gamma-World simulates complex multi-agent environments where multiple independently controlled agents act simultaneously and interact within a shared, spatio-temporally consistent visual space. It supports real-time video rollouts at 24 FPS and generalizes zero-shot from 2-player training to 4+ players.

---

## Key Features
- **Simplex Rotary Agent Encoding (SRAE):** Maps agents to regular simplex vertices in RoPE angle space, ensuring permutation-equivalent identities without learned embeddings.
- **Sparse Hub Attention:** Routes cross-agent communication through learnable hub tokens, reducing attention complexity from $O(N^2)$ to $O(N)$.
- **Teacher-Student Distillation & KV-Caching:** Enables 24 FPS real-time interactive rollouts with low action latency.
- **Zero-Shot Multi-Agent Generalization:** Scales zero-shot from 2-player training dynamics to 4+ player simulations.
- **Action Controllability & Cross-View Consistency:** Preserves temporal continuity and inter-agent visual consistency across long rollout horizons.

---

## Verified Project Links
- **Project Website:** [https://research.nvidia.com/labs/sil/projects/gamma-world/](https://research.nvidia.com/labs/sil/projects/gamma-world/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.28816](https://arxiv.org/abs/2605.28816)
- **GitHub Repository:** [https://github.com/nv-tlabs/Gamma-World](https://github.com/nv-tlabs/Gamma-World)
- **Hugging Face Model:** [https://huggingface.co/chijw/Gamma-World](https://huggingface.co/chijw/Gamma-World)

---

## Performance Benchmarks
- **FVD (Memory Protocol):** 184.1 (vs. 333.8 for Solaris baseline).
- **FID (Memory Protocol):** 24.8 (vs. 51.7 for Solaris baseline).
- **Real-Time Speed:** 24 FPS interactive streaming frame rate.

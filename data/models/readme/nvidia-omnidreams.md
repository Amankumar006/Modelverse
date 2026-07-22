# OmniDreams: Action-Conditioned Closed-Loop World Model

## Model Overview
**OmniDreams** (NVIDIA Cosmos-Dreams) is an action-conditioned real-time generative world model developed by **NVIDIA Spatial Intelligence Lab (SIL)** (Sanja Fidler, Amlan Kar, et al.).

It autoregressively synthesizes photorealistic multi-camera video sensor observations in real time based on simulator states and driving actions (steering, throttle, braking). Mid-trained and post-trained from NVIDIA Cosmos diffusion models on 21,000+ hours of driving data, OmniDreams enables testing autonomous vehicle policies in rare, safety-critical edge cases.

---

## Key Features
- **Real-Time Action-Conditioned Generation:** Autoregressively generates multi-camera video observations conditioned on ego-vehicle driving actions.
- **Closed-Loop Interactive Simulation:** Functions as a reactive digital twin environment for testing autonomous vehicle policies.
- **Cosmos Foundation Architecture:** Mid-trained and post-trained from NVIDIA Cosmos diffusion models on 21,000+ hours of driving data.
- **Long-Tail & Edge Case Synthesis:** Simulates extreme weather, night scenes, low visibility, and unexpected pedestrian behaviors.
- **High Evaluation Fidelity & Efficiency:** Serves as a faithful proxy that matches high-fidelity simulators (NuRec) with 1/5th the parameters of previous policy models.

---

## Verified Project Links
- **Project Website:** [https://research.nvidia.com/labs/sil/omnidreams/](https://research.nvidia.com/labs/sil/omnidreams/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.03159](https://arxiv.org/abs/2606.03159)
- **GitHub Repository:** [https://github.com/nv-tlabs/omni-dreams](https://github.com/nv-tlabs/omni-dreams)
- **Hugging Face Model:** [https://huggingface.co/nvidia/omni-dreams-models](https://huggingface.co/nvidia/omni-dreams-models)

---

## Performance & Benchmarks
- **NuRec Policy Evaluation:** Outperformed Alpamayo 1.5 using 1/5th total parameters.
- **MinMax Harmonic Mean (MMHM):** Evaluates image quality, text/action alignment, and temporal consistency in closed-loop settings.

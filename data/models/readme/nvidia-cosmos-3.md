# NVIDIA Cosmos 3: Physical AI World & Action Model Platform

## Model Overview
**NVIDIA Cosmos 3** is an open-source frontier foundation model platform specifically engineered for Physical AI—enabling machines, robots, and autonomous systems to perceive, reason about, simulate, and act in the physical world.

Built on a Mixture-of-Transformers (MoT) architecture with a "two-tower, one-sequence" design, Cosmos 3 unifies an autoregressive Reasoner (for spatial-temporal understanding and task planning) with a diffusion-based Generator (for physics-grounded video and audio synthesis).

---

## Key Features
- **Unified Omnimodal & MoT Architecture:** Integrates an autoregressive Reasoner and a diffusion-based Generator, seamlessly handling text, image, video, audio, and physical action tokens.
- **First-Class Action Generation:** Outputs numerical robot control tokens (joint trajectories, end-effector poses) directly for manipulation and navigation.
- **Scalable Deployment Tiering:** Ranging from edge-optimized models (Cosmos 3 Edge 4B/8B Nano for Jetson) to datacenter foundation models (Cosmos 3 Super 32B/64B).
- **Synthetic Data Generation (SDG):** Includes physics-aware simulation tools (SDG-PhyxSim, SDG-RobotSim) to create photorealistic rollouts for policy learning.
- **Open Enterprise Ecosystem:** Released under OpenMDW-1.1 license with PyTorch code, Diffusers/Transformers integrations, NIM microservices, and serving engines.

---

## Verified Project Links
- **Official Developer Blog:** [https://developer.nvidia.com/blog/develop-physical-ai-reasoning-world-and-action-models-with-nvidia-cosmos-3/](https://developer.nvidia.com/blog/develop-physical-ai-reasoning-world-and-action-models-with-nvidia-cosmos-3/)
- **Technical Report (arXiv):** [https://arxiv.org/abs/2606.02800](https://arxiv.org/abs/2606.02800)
- **GitHub Organization:** [https://github.com/nvidia-cosmos](https://github.com/nvidia-cosmos)
- **Hugging Face Models:** [https://huggingface.co/collections/nvidia/cosmos3](https://huggingface.co/collections/nvidia/cosmos3)

---

## Performance & Benchmarks
- **RoboArena:** 1881 Elo (#1 open policy model for robotic manipulation at release).
- **VANTAGE-Bench:** 63.01% Visual Analytics Accuracy (#1 open vision-language model).

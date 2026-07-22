# CHORD: Contact Wrench Guidance from Human Demonstration

## Model Overview
**CHORD** (**Contact Wrench Guidance from Human Demonstration**) is a framework developed by the **NVIDIA Isaac team** and **NVIDIA GEAR Lab** (Xinghao Zhu, Linxi "Jim" Fan, Yuke Zhu, Danfei Xu, et al.).

It enables robots to learn long-horizon, dexterous, bimanual, and whole-body manipulation skills from human video demonstrations. Instead of directly mimicking human joint kinematics, CHORD introduces an **object-centric contact wrench space representation** (measuring forces and torques induced on objects) as a dense reward signal in reinforcement learning within **NVIDIA Isaac Lab**.

---

## Key Features
- **Object-Centric Contact Wrench Representation:** Maps human/robot interactions to induced forces and torques, enabling morphology-invariant policy transfer.
- **Video-to-Data Ingestion Pipeline:** Reconstructs 3D scene meshes, 6-DoF object poses, and contact dynamics directly from RGB human videos.
- **Dense Reinforcement Learning Guidance:** Uses contact wrench matching as a dense reward signal to accelerate RL training.
- **Large-Scale Simulation Benchmark:** Accompanied by a benchmark suite of 4,739 bimanual dexterous manipulation tasks in NVIDIA Isaac Lab.
- **Cross-Embodiment Generalization:** Transfers policies from hand-only demonstrations to humanoid whole-body systems (Sharpa, Unitree G1).

---

## Verified Project Links
- **Project Website:** [https://nvidia-isaac.github.io/video_to_data/chord/](https://nvidia-isaac.github.io/video_to_data/chord/)
- **arXiv Paper:** [https://arxiv.org/abs/2607.00033](https://arxiv.org/abs/2607.00033)
- **GitHub Repository:** [https://github.com/nvidia-isaac/video_to_data](https://github.com/nvidia-isaac/video_to_data)
- **Hugging Face:** [https://huggingface.co/nvidia](https://huggingface.co/nvidia)

---

## Performance & Benchmarks
- **Average Task Success Rate:** 82.12% across 1,831 evaluated simulation tasks.
- **Whole-Body Generalization:** 90.77% success rate transferring hand demonstrations to humanoid whole-body tasks.

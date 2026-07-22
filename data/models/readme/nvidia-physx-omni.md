# PhysX Omni: Unified Simulation-Ready Physical 3D Asset Generation

## Model Overview
**PhysX Omni** is a unified generative framework designed to create simulation-ready 3D assets (including rigid, deformable, and articulated objects) directly from single images or text inputs.

Developed by researchers at **S-Lab, Nanyang Technological University (NTU)** in collaboration with **ACE Robotics** (Ziang Cao, Yinghao Liu, Ziwei Liu, et al.), PhysX Omni embeds physical attributes—such as absolute scale, mass, material stiffness, joint kinematics, and functional affordance—enabling direct export to simulation formats (USD, URDF, XML) for physics engines like MuJoCo and Isaac Sim.

---

## Key Features
- **Unified Multi-Category Generation:** Generates rigid, deformable, and articulated physical 3D objects in a single architecture.
- **Simulation-Ready Asset Export:** Produces USD, URDF, and XML formats with complete physical, material, and kinematic annotations.
- **Template-Based 2D RLE Encoding:** Novel 3D geometry representation tailored for Vision-Language Models without lossy compression.
- **PhysXVerse Dataset Integration:** Trained on >8,700 high-fidelity physical assets across >2,900 indoor/outdoor categories.
- **End-to-End VLM Reasoning:** Built on Qwen2.5-VL-7B-Instruct for global physical property prediction and structure generation.

---

## Verified Project Links
- **Project Website:** [https://physx-omni.github.io/](https://physx-omni.github.io/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.21572](https://arxiv.org/abs/2605.21572)
- **GitHub Repository:** [https://github.com/physx-omni/PhysX-Omni](https://github.com/physx-omni/PhysX-Omni)
- **Hugging Face Model:** [https://huggingface.co/PhysX-Omni/PhysX-Omni](https://huggingface.co/PhysX-Omni/PhysX-Omni)

---

## Performance & Benchmarks
- **PhysX-Bench Kinematic Score:** 80.72 (outperforms Articulate-Anything 71.25 and PhysXGen 69.17).
- **Absolute Scale Prediction Error:** 2.79 units (reduces error by two orders of magnitude).

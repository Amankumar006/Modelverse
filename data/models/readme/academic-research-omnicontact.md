# OmniContact

## Model Overview
**OmniContact** is a hierarchical framework for generalizable humanoid loco-manipulation developed by researchers at **Noitom Robotics** and the **Hong Kong University of Science and Technology (HKUST)**. Published in June 2026 ([arXiv:2606.26201](https://arxiv.org/abs/2606.26201)), OmniContact addresses the challenge of combining locomotion (movement) and manipulation (object handling) into unified, dynamic execution. 

By introducing the concept of **Contact Flow (CF)**—a compact interface combining key body trajectories and time-series binary contact signals—OmniContact bridges high-level semantic task planning (via Vision-Language Models) with low-level physical tracking.

---

## Methodology & Architecture

OmniContact employs a two-tier hierarchical architecture:

1. **High-Level Reference Generator (`CF-Gen`):**
   - Synthesizes contact-flow references (body pose, contact timing, and target trajectories) for meta-skills such as carrying, pushing, sliding, relocating, and kicking.
   - Enables real-time replanning and autonomous recovery when perturbations or failures occur.

2. **Low-Level Control Policy (`CF-Track`):**
   - An ONNX-exported reinforcement learning policy operating at **50Hz** in MuJoCo and real-world deployment.
   - Robustly tracks task-space contact-flow references or raw MoCap human-object interaction trajectories formatted as `.npz` files.
   - Integrated with an Xbox controller finite state machine (FSM) for hot-swapping states (Default Pose -> Locomotion -> OmniContact Policy).

```
+-------------------------------------------------------------+
|                      Task Goal / VLM                        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|        CF-Gen: Contact Flow Generation & Replanning          |
|    (Synthesizes body trajectories & binary contact timing)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|          CF-Track: 50Hz Low-Level Policy (ONNX)             |
|   (Tracks contact-flow reference / NPZ motion in MuJoCo)    |
+-------------------------------------------------------------+
```

---

## Key Features & Capabilities

- **Unified Meta-Skill Chaining:** Seamlessly sequences elementary actions (e.g. walk -> reach -> push -> carry) without manual resetting.
- **Robust Failure Recovery:** Autonomously adjusts contact positions and timings to recover from external bumps or object slips.
- **Long-Horizon Performance:** Supports continuous multi-task execution over extended operational windows (tested up to ~40 minutes).
- **VLM & MoCap Integration:** Combines high-level visual language guidance with low-level Motion Capture datasets (`lightcone02/OmniContact-Dataset`).

---

## Benchmarks & Evaluation

| Benchmark Metric | OmniContact Performance | Notes |
| :--- | :--- | :--- |
| **Carry Box Success Rate** | **98.7%** | High stability across dynamic movement |
| **Push-Stack / Push Suitcase** | **76.5% – 82.5%** | Complex contact transitions |
| **Meta-Skill Learning Gain** | **+40.9%** | Outperforms decoupled baselines |
| **Skill Chaining Gain** | **+66.5%** | Outperforms decoupled baselines |
| **Continuous Operation** | **~40 minutes** | Demonstrated endurance in sim/real |

---

## Verified Links

- **Project Website:** [https://omnicontact.github.io/](https://omnicontact.github.io/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.26201](https://arxiv.org/abs/2606.26201)
- **Paper PDF:** [https://arxiv.org/pdf/2606.26201](https://arxiv.org/pdf/2606.26201)
- **GitHub Repository (sim2sim):** [https://github.com/Ingrid789/OmniContact_sim2sim](https://github.com/Ingrid789/OmniContact_sim2sim)
- **Hugging Face Dataset:** [https://huggingface.co/datasets/lightcone02/OmniContact-Dataset](https://huggingface.co/datasets/lightcone02/OmniContact-Dataset)

---

## Quickstart & Code Usage

### 1. Environment Setup

```bash
# Create conda environment
conda create -n omnicontact python=3.11 -y
conda activate omnicontact

# Install PyTorch & dependencies
conda install pytorch==2.3.1 torchvision==0.18.1 torchaudio==2.3.1 pytorch-cuda=12.1 -c pytorch -c nvidia -y
pip install numpy onnx onnxruntime mujoco pyyaml scipy pygame
```

### 2. MuJoCo Simulation Execution

```bash
# Clone the repository
git clone https://github.com/Ingrid789/OmniContact_sim2sim.git
cd OmniContact_sim2sim

# Run scripted policy tracking with CF-Gen reference
python deploy_omnicontact/run_skill_omnicontact.py --policy policy.onnx --reference-source CFgen

# Track full NPZ motion dataset trajectory
python deploy_omnicontact/run_skill_omnicontact.py --policy policy.onnx --reference-source NPZmotion
```

---

## Institution & Team

Developed as a joint research project by **Noitom Robotics** and the **Hong Kong University of Science and Technology (HKUST)**.

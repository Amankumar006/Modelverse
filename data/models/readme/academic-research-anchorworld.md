# AnchorWorld: Embodied Egocentric World Simulation

**AnchorWorld** is a pioneer AI framework for embodied egocentric world simulation, developed collaboratively by researchers from **Tsinghua University**, **Huazhong University of Science and Technology (HUST)**, and the **Kling Team at Kuaishou Technology**. Published in June 2026 ([arXiv:2606.07326](https://arxiv.org/abs/2606.07326)), AnchorWorld addresses key challenges in interactive first-person video generation by introducing 3D human motion as an active control modality and utilizing view-based anchor customization for self-evolving digital environments.

---

## 🔬 Core Capabilities & Features

- **3D Motion-Driven Embodied Control:** Employs SMPL-X parametric 3D body motion sequences as continuous physical control signals, enabling interactive navigation and body interaction simulation.
- **Hybrid-View Exogenous Supervision:** Solves the truncated body part issue inherent to egocentric cameras by integrating third-person (exogenous) view data during training.
- **Evolvable Anchor-View Customization:** Allows users to anchor specific RGB images, 3D poses, and textual prompts within a shared 3D world coordinate system to control local scene updates without causing global temporal collapse.
- **Flow-Matching DiT Architecture:** Built upon a Flow-Matching Diffusion Transformer for high-fidelity and geometrically consistent video synthesis.

---

## 📊 Benchmark Metrics

Evaluated on **Ego-Exo4D** and **LEMMA** multi-view datasets:
- **Visual Fidelity:** Evaluated via PSNR, SSIM, FVD, and LPIPS.
- **Pose Accuracy:** Evaluated via MPJPE (Mean Per-Joint Position Error).
- **Text & Evolution Alignment:** Evaluated via CLIP-V (Text Alignment score).

---

## 🚀 Quickstart Usage

```python
from datasets import load_dataset

# Load AnchorWorld dataset from HuggingFace
dataset = load_dataset("lyabc/anchorworld-dataset")

# Sample data structure
sample = dataset["train"][0]
print("Ego Video Path:", sample["ego_video_path"])
print("SMPL-X Motion Data:", sample["smplx_pose"])
print("Anchor Views:", sample["anchor_views"])
print("Evolution Prompt:", sample["evolution_prompt"])
```

---

## 🔗 Paper & Resources
- [Official Project Page](https://yuli0103.github.io/AnchorWorld/)
- [arXiv Paper (arXiv:2606.07326)](https://arxiv.org/abs/2606.07326)
- [Paper PDF Download](https://arxiv.org/pdf/2606.07326.pdf)
- [GitHub Repository](https://github.com/yuli0103/AnchorWorld)
- [Hugging Face Dataset (lyabc/anchorworld-dataset)](https://huggingface.co/datasets/lyabc/anchorworld-dataset)

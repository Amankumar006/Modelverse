# WorldString: Actionable World Representation

**WorldString** (commonly known as **Actionable World**) is a foundational neural architecture designed for physical world modeling. Developed through a collaboration between researchers from **Tsinghua University (IEI Lab)**, **UC San Diego (UCSD)**, **CalTech**, and **NVIDIA**, WorldString acts as an interactive digital twin. Rather than focusing solely on passive video generation or static 3D scene reconstruction, WorldString explicitly represents real-world objects as **actionable entities** with dynamic physical states—spanning articulated, skinned, and soft/deformable categories.

---

## 🔬 Core Capabilities & Architecture

- **Direct Physical Stream Learning**: Processes 3D point clouds and RGB-D video streams directly without requiring hand-coded parametric CAD models.
- **Unified Representation across Object Types**:
  - **Articulable Objects**: Handles robotic hands, arms, doors, and jointed assemblies (e.g., XHand, Unitree Go2, Unitree H1).
  - **Skinning Objects**: Models humans and biological structures with skeletal hierarchies.
  - **Soft / Deformable Objects**: Captures dynamic states of cloth, ropes, and flexible materials.
- **Keypoint & Canonical Embedding Space**: Bridges rigid kinematics and non-rigid deformations into a shared, compact state representation.
- **Fully Differentiable Architecture**: Enables seamless end-to-end integration with neural dynamics simulators and reinforcement learning / policy learning algorithms.

```
Input State Encoder (Point Cloud / RGB-D) ───► Canonical Keypoint Tokenizer ───► Neural Point Cloud Renderer ───► Physics Simulator Alignment
```

---

## 🚀 Quickstart & Installation

```bash
# Clone the repository
git clone https://github.com/MaureenZOU/worldstring.git
cd worldstring

# Create Conda environment & install dependencies
conda create -n worldstring python=3.11 -y
conda activate worldstring
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install gradio numpy scipy pyyaml open3d pybullet mujoco trimesh

# Launch interactive Gradio visualization demo
python app.py
```

---

## 🔗 Official Links & Resources
- [Official Website](https://worldstring-iei.github.io/)
- [arXiv Paper (arXiv:2605.18743)](https://arxiv.org/abs/2605.18743)
- [Paper PDF Download](https://arxiv.org/pdf/2605.18743)
- [GitHub Repository](https://github.com/MaureenZOU/worldstring)
- [Hugging Face Dataset (Tera-AI/STRIDE)](https://huggingface.co/datasets/Tera-AI/STRIDE)

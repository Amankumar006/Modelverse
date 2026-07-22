# MeshFlow: Efficient Artistic Mesh Generation via MeshVAE and Flow-based Diffusion Transformer

**MeshFlow** is a state-of-the-art 3D generative model introduced as a **CVPR 2026 Highlight** by researchers from **Meta AI** and **HKUST** (Weiyu Li, Antoine Toisoul, Tom Monnier, Roman Shapovalov, Rakesh Ranjan, Ping Tan, and Andrea Vedaldi). 

MeshFlow addresses the fundamental limitations of prior Auto-Regressive (AR) 3D mesh generators—such as slow token-by-token sequence generation and quantization artifacts from discretizing vertex coordinates—by establishing a continuous latent space representation and leveraging parallel flow matching diffusion transformers.

---

## 🔬 Architecture & Methodology

MeshFlow operates via a two-stage architecture:

1. **MeshVAE (Variational Autoencoder)**:
   - Learns a compact continuous latent space for complex 3D triangular meshes.
   - Encodes continuous 3D vertex positions, surface normals, and face connectivity without requiring coordinate discretization or quantization.
   - Optimized with graph contrastive losses and topological regularization to ensure clean manifold mesh reconstruction.

2. **Flow-Based Diffusion Transformer**:
   - Built on Rectified Flow formulation over continuous MeshVAE latents.
   - Replaces slow sequential AR token prediction with parallel generation of all mesh vertices and faces simultaneously.
   - Conditioned on text prompts, reference images, or sparse point clouds via cross-attention mechanisms.

```
Input (Text / Image / Point Cloud) ──► Latent Condition Encoder ──► Flow-based DiT ──► Continuous Mesh Latent ──► MeshVAE Decoder ──► 3D Triangular Mesh (.obj / .ply)
```

---

## ⚡ Key Features & Benchmarks

- **18× – 26× Faster Inference**: Generates artist-grade 3D meshes in ~1 second per asset on modern GPUs, drastically outperforming autoregressive baseline models like MeshGPT.
- **Zero Coordinate Quantization**: Operates in continuous space, eliminating vertex snapping and staircase artifacts common in discrete coordinate models.
- **Explicit Mesh Output**: Outputs native 3D triangular meshes with clean connectivity and explicit vertices, ready for game engines (Unreal/Unity) and VFX suites (Blender/Maya).
- **Flexible Conditioning**: Supports text-to-3D, image-to-3D, and point-cloud-to-3D generation pipelines.

### Benchmark Performance

| Metric / Benchmark | MeshFlow (Flow-DiT) | Autoregressive Baselines (e.g. MeshGPT) |
|---|---|---|
| **Inference Time per Mesh** | **~1.0 s** | ~18 - 26 s |
| **Generation Mechanism** | Parallel Continuous Flow | Sequential Discrete Tokens |
| **Quantization Artifacts** | None (Continuous Space) | Present (Grid Discretization) |
| **Chamfer Distance (Objaverse)** | **State-of-the-Art** | Baseline |

---

## 🚀 Quickstart & Usage

```bash
# Clone official MeshFlow repository
git clone https://github.com/facebookresearch/meshflow.git
cd meshflow

# Create Conda environment & install dependencies
conda create -n meshflow python=3.10 -y
conda activate meshflow
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt

# Inference: Text-to-3D Mesh Generation
python sample.py \
  --config configs/meshflow_t23d.yaml \
  --prompt "An artistic wooden chair with ornate carving" \
  --output_dir ./outputs/
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://mesh-flow.github.io/)
- [arXiv Paper (arXiv:2606.04621)](https://arxiv.org/abs/2606.04621)
- [Paper PDF Download](https://arxiv.org/pdf/2606.04621)
- [GitHub Repository (facebookresearch/meshflow)](https://github.com/facebookresearch/meshflow)
- [Hugging Face Space Demo](https://huggingface.co/spaces/facebook/meshflow)

# MoVerse: Real-Time Video World Modeling with Panoramic Gaussian Scaffold

**MoVerse** is a video world modeling framework developed by researchers from **Alibaba Group (Youku Moku-Lab)**, **South China University of Technology (SCUT)**, and **Columbia University**. Published in June 2026 ([arXiv:2606.13376](https://arxiv.org/abs/2606.13376)), MoVerse enables real-time interactive 3D world creation and navigation starting from a single narrow-field-of-view (NFOV) photo.

---

## 🔬 Architecture & Methodology

MoVerse separates 3D world construction from camera observation rendering via a three-stage pipeline:

1. **Stage I: Panoramic Generation:**
   Uses a topology-aware latent diffusion model to expand a single NFOV input image into a gravity-aligned, horizontally periodic 360° Equirectangular Projection (ERP) panorama.
2. **Stage II: Panoramic 3D Gaussian Scaffold:**
   Lifts the generated 360° panorama into a persistent 3D Gaussian scaffold using feed-forward residual prediction in angular–inverse-depth space, acting as a splattable, dense spatial memory.
3. **Stage III: Autoregressive Video Refinement:**
   A Gaussian-conditioned video renderer translates scaffold renderings along user camera trajectories into photorealistic video. A bidirectional diffusion teacher is distilled into a causal autoregressive student model to support bounded-latency streaming at **8 FPS on a single NVIDIA RTX 4090 GPU**.

---

## 📊 Benchmark Metrics

| Metric | Score / Value | Target / Hardware |
| :--- | :--- | :--- |
| **Real-Time Throughput** | 8 FPS | NVIDIA RTX 4090 GPU |
| **Input Modality** | Single NFOV Image | RGB Image |
| **Spatial Consistency** | Persistent Scaffold | 360° ERP Angular-Depth Space |

---

## 🚀 Quickstart Usage

```python
import torch
from moverse import MoVersePipeline

# Load pretrained MoVerse pipeline
pipeline = MoVersePipeline.from_pretrained("Orange-3DV-Team/MoVerse")
pipeline.to("cuda")

# Stage I: Synthesize 360° ERP Panorama from single image
panorama = pipeline.generate_panorama(image_path="input_room.jpg")

# Stage II: Construct persistent 3D Gaussian Scaffold
scaffold = pipeline.build_scaffold(panorama)

# Stage III: Render real-time interactive camera walkthrough
trajectory = pipeline.create_trajectory(preset="free_roam_circle")
video_stream = pipeline.render_video(scaffold, trajectory=trajectory, fps=8)
video_stream.save("moverse_walkthrough.mp4")
```

---

## 🔗 Paper & Resources

- [Official Project Page](https://orange-3dv-team.github.io/MoVerse/)
- [arXiv Paper (arXiv:2606.13376)](https://arxiv.org/abs/2606.13376)
- [Paper PDF Download](https://arxiv.org/pdf/2606.13376.pdf)
- [GitHub Repository](https://github.com/Orange-3DV-Team/MoVerse)
- [Hugging Face Repository](https://huggingface.co/Orange-3DV-Team/MoVerse)

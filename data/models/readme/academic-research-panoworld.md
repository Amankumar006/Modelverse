# PanoWorld: Generative Spatial World Model for Consistent Whole-House Panorama Synthesis

## Model Overview
**PanoWorld** is a generative spatial world model designed by researchers at **Ke Holdings Inc. (Beike)** (Jinrang Jia, Zhenjia Li, Yijiang Hu, Yifeng Shi) to synthesize photorealistic, consistent, whole-house virtual reality (VR) panorama tours from a 2D floorplan layout and visual style references. 

By framing whole-house panorama synthesis as an autoregressive graph navigation task, PanoWorld matches the discrete node-based navigation standard of commercial VR property tours while guaranteeing multi-room geometric and style coherence.

---

## Core Architecture & Methodology

PanoWorld decouples coarse geometric structure from fine-grained visual synthesis through a multi-stage spatial pipeline:

1. **Floorplan-Derived 3D Shell (Global Geometric Proxy):**
   - Converts 2D floorplan vector layouts into a 3D structural shell (walls, ceilings, floor planes, and door openings).
   - Serves as a global geometric constraint preventing spatial distortion across interconnected room nodes.

2. **Dynamic 3D Gaussian Splatting (3DGS) Cache:**
   - Functions as renderable spatial memory. As navigation progresses from node to node, prior viewpoints are stored in a 3DGS cache.
   - When synthesizing a new viewpoint, the model queries the cache for overlapping visual context to ensure previously "seen" geometry and materials remain consistent.

3. **Panoramic Large Reconstruction Model (Pano-LRM):**
   - A feed-forward neural architecture that directly predicts 3D Gaussian primitives from 360° equirectangular panoramas.
   - Enables fast, feed-forward 2D-to-3D lifting and cache updating without costly per-scene optimization loops.

4. **Room-Aware Group Attention (RAGA):**
   - Restricts cross-attention operations to tokens within the same room or connected portals (doorways).
   - Eliminates cross-room visual feature bleed, ensuring distinct rooms (e.g., kitchen vs. bedroom) retain appropriate decor and boundaries.

5. **Topology-Aware Progressive Caching:**
   - Merges node-level 3DGS predictions into the scene graph following topological proximity, maintaining global coherence across whole-house navigation trees.

---

## Key Features
- **Whole-House VR Tour Generation:** Synthesizes multi-node 360° panoramas for complete floorplans.
- **Cross-View & Cross-Room Consistency:** Maintains material identity, structural alignment, and spatial continuity across adjacent room viewpoints.
- **Renderable Spatial Memory:** Dynamic 3DGS memory prevents hallucinated structural shifts when revisiting previously generated rooms.
- **Fast Feed-Forward Inference:** Pano-LRM enables rapid 2D-to-3D scene lifting and panorama synthesis.

---

## Verified Project Links
- **Project Website:** [https://jjrcn.github.io/PanoWorld-project/](https://jjrcn.github.io/PanoWorld-project/)
- **arXiv Abstract:** [https://arxiv.org/abs/2605.17916](https://arxiv.org/abs/2605.17916)
- **Paper PDF:** [https://arxiv.org/pdf/2605.17916](https://arxiv.org/pdf/2605.17916)
- **GitHub Repository:** [https://github.com/jjrCN/PanoWorld](https://github.com/jjrCN/PanoWorld)
- **Hugging Face Space Demo:** [https://huggingface.co/spaces/JiaJinrang/PanoWorld-VR-Tour](https://huggingface.co/spaces/JiaJinrang/PanoWorld-VR-Tour)

---

## Datasets & Benchmarks
- **RealSee3D Dataset:** Evaluated on 10,000 multi-room indoor environments (1,000 real-world 3D scans and 9,000 synthetic scenes with RGB-D ground truth).
- **Perceptual Quality (HPSv3):** Demonstrates top-tier visual fidelity and prompt alignment for 360° equirectangular panorama synthesis.
- **Cross-Node Alignment (Overlap PSNR / SSIM / LPIPS):** Outperforms traditional diffusion models in maintaining cross-view geometric alignment and portal transitions.
- **Style Retention (CLIP-I):** High visual consistency across multi-room VR navigation nodes.

---

## Quickstart & Code Usage

### 1. Environment Setup
```bash
git clone https://github.com/jjrCN/PanoWorld.git
cd PanoWorld

# Prerequisites: Python 3.10, PyTorch 2.3.1, CUDA 12.1
pip install -r requirements.txt
```

### 2. Configuration & Data Setup
Download the RealSee3D evaluation dataset and model checkpoints as described in the GitHub repository. Update `configs/inference_1024_512.yaml`:
```yaml
data:
  root_data_dir: "/path/to/RealSee3D"
  data_path: "/path/to/inference_samples"
inference:
  ckpt_path: "/path/to/panoworld_lrm.pth"
  out_dir: "./output_results"
```

### 3. Run Inference
```bash
# Launch inference script
bash infer_1024_512.sh

# Or directly via Python script:
python inference.py --config configs/inference_1024_512.yaml
```

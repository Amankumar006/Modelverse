# Déjà View (DVLT): Looping Transformers for Multi-View 3D Reconstruction

## Model Overview
**Déjà View** (DVLT - Déjà View Looping Transformer) is a parameter-efficient model for multi-view 3D reconstruction developed by **NVIDIA Dynamic Vision and Learning (DVL) Group**, **ETH Zürich**, and **University of Toronto (Vector Institute)** (Alessandro Burzio, Tobias Fischer, Zan Gojcic, et al.).

Rather than scaling model depth via deep stacks of distinct transformer layers, DVLT employs a single, weight-tied transformer block applied recurrently across per-view features over $K$ refinement steps. From unposed RGB images or video, DVLT jointly predicts per-pixel depth, ray maps, and camera intrinsics/extrinsics.

---

## Key Features
- **Weight-Tied Looping Transformer Block:** Uses a single shared transformer block recurrently over $K$ refinement steps instead of deep stacks of unshared layers.
- **Inference-Time Compute Knob ($K$):** Allows users to adjust refinement steps dynamically during inference to balance latency and accuracy.
- **Parameter Efficiency (~117M Parameters):** Operates at ~117M parameters—achieving SOTA performance using 8–10× fewer parameters and 1.9–2.3× less compute than billion-parameter baselines.
- **Joint Geometry & Camera Estimation:** Infers dense per-pixel depth, ray maps, and camera intrinsics/extrinsics simultaneously.
- **Cross-Domain Generalization:** Robust performance across indoor (ScanNet), outdoor (Waymo), and object-centric (CO3D) environments.

---

## Verified Project Links
- **Project Website:** [https://research.nvidia.com/labs/dvl/projects/dvlt/](https://research.nvidia.com/labs/dvl/projects/dvlt/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.30215](https://arxiv.org/abs/2605.30215)
- **GitHub Repository:** [https://github.com/nv-tlabs/dvlt](https://github.com/nv-tlabs/dvlt)
- **Hugging Face Model:** [https://huggingface.co/nvidia/dvlt](https://huggingface.co/nvidia/dvlt)

---

## Performance & Benchmarks
- Outperforms feed-forward baselines (DUSt3R, MASt3R, VGGSfM) on ScanNet, ScanNet++, DTU, and RealEstate10K datasets.

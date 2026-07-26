# MAMMA

## 📌 Model Overview

MAMMA (Markerless Accurate Multi-person Motion Acquisition) is a state-of-the-art markerless multi-view human motion capture framework developed by MPI-IS and CMU (CVPR 2026 Oral). Powered by MammaNet (a ViT-Base transformer predicting 512 contact-aware and visibility-aware surface landmarks), it accurately fits SMPL-X body models to complex multi-person physical interactions.

**MAMMA** is a **Research Preview** model developed by **Academic/Research**, released on **2026-07-15**. It is engineered primarily for **Search Retrieval** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Search Retrieval |
| **Deployment** | self-hostable |
| **Modality** | vision, 3d, video |
| **MammaNet Transformer Architecture** | MammaNet Transformer Architecture: Employs a ViT-Base backbone to decode 512 dense surface landmarks with pixel coordinates, uncertainty, and visibility estimation |
| **Contact-Aware & Visibility Heads** | Contact-Aware & Visibility Heads: Jointly predicts person-to-person and person-to-floor contact probabilities to constrain 3D multi-person pose optimization |
| **Markerless SMPL-X Fitting** | Markerless SMPL-X Fitting: Recovers full-body expressive SMPL-X parameters directly from synchronized multi-view video without specialized marker suits |
| **Multi-View Epipolar Optimization** | Multi-View Epipolar Optimization: Uses symmetric epipolar distance matching across camera views to resolve person-to-landmark correspondences under heavy occlusion |
| **MammaSyn Synthetic Dataset** | MammaSyn Synthetic Dataset: Trained on a large-scale synthetic multi-person dataset with ground-truth dense landmarks and physics-based contact labels |
| **Web GUI & CLI Tooling** | Web GUI & CLI Tooling: Offers zero-config command-line execution (python -m inference run) as well as a local web browser user interface on port 3000 |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | Academic/Research |
| **Release Date** | 2026-07-15 |
| **Model Type** | Research Preview |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | proprietary |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **Multi-Person Motion Capture (Vicon MoSh++ Benchmark)** | `State-of-the-Art Precision` | Independent Eval |
| **Landmark Surface Reconstruction (MammaSyn Evaluation)** | `Sub-centimeter Error` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://mamma.is.tue.mpg.de/](https://mamma.is.tue.mpg.de/) |
| **paper** | [https://arxiv.org/abs/2506.13040](https://arxiv.org/abs/2506.13040) |
| **github** | [https://github.com/cuevhv/mamma](https://github.com/cuevhv/mamma) |

---

## 📜 License & Usage

This model is governed by the **proprietary** license. Please check official developer guidelines before commercial deployment.

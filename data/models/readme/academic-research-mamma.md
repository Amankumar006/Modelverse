# MAMMA

## Model Overview
**MAMMA** is a **undisclosed-parameter** model developed by **Academic/Research**.
Released on **2026-07-15**.

---

## 📊 Quick Specs

| Specification | Value |
|:---|:---|
| **Parameters** | undisclosed |
| **Task** | other |
| **Modality** | vision, 3d, video |
| **License** | Other/Custom |
| **Type** | research-preview |

---

## ✨ Key Features

- MammaNet Transformer Architecture: Employs a ViT-Base backbone to decode 512 dense surface landmarks with pixel coordinates, uncertainty, and visibility estimation
- Contact-Aware & Visibility Heads: Jointly predicts person-to-person and person-to-floor contact probabilities to constrain 3D multi-person pose optimization
- Markerless SMPL-X Fitting: Recovers full-body expressive SMPL-X parameters directly from synchronized multi-view video without specialized marker suits
- Multi-View Epipolar Optimization: Uses symmetric epipolar distance matching across camera views to resolve person-to-landmark correspondences under heavy occlusion
- MammaSyn Synthetic Dataset: Trained on a large-scale synthetic multi-person dataset with ground-truth dense landmarks and physics-based contact labels
- Web GUI & CLI Tooling: Offers zero-config command-line execution (python -m inference run) as well as a local web browser user interface on port 3000

---

## 🔗 Resources


- **GitHub**: [Repository](https://github.com/cuevhv/mamma)
- **Paper**: [arXiv](https://arxiv.org/abs/2506.13040)
- **Website**: [Project Page](https://mamma.is.tue.mpg.de/)

---

## 📜 License & Access
**Other/Custom** — See repository for specific license details.

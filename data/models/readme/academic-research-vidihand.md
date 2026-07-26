# VidiHand

## 📌 Model Overview

VidiHand is a generative 4D hand motion reconstruction model developed by Nanyang Technological University (NTU) and Shanghai Jiao Tong University (SJTU). It recovers metric-scale 3D/4D two-hand pose trajectories from monocular egocentric video by fine-tuning internet-scale video diffusion models (Wan2.1-VACE) without needing external hand detectors or test-time optimization.

**VidiHand** is a **Open Weights** model developed by **Academic/Research**, released on **2026-06-29**. It is engineered primarily for **Search Retrieval** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Search Retrieval |
| **Deployment** | self-hostable |
| **Modality** | video, 3d |
| **Capability** | Detector-Free Full-Frame Processing without localized cropping or hand detectors |
| **Capability** | Leverages Internet-Scale Pretrained Video Diffusion Models (Wan2.1-VACE) |
| **Capability** | Extreme Robustness to Heavy Hand-Object and Hand-Hand Occlusions |
| **Capability** | Eliminates Test-Time Optimization (TTO) and post-hoc temporal infilling |
| **Capability** | State-of-the-Art Temporal Smoothness (jitter down to 3.18 mm/frame) and Pose Accuracy (21.668 mm MPJPE-p on ARCTIC) |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | Academic/Research |
| **Release Date** | 2026-06-29 |
| **Model Type** | Open Weights |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | proprietary |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **ARCTIC Benchmark (MPJPE-p)** | `21.668 mm (Rank 1st / SOTA across all 9 metrics)` | Independent Eval |
| **ARCTIC Motion Jitter** | `3.18 mm/frame (4.8x smoother)` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://vidihand.github.io/](https://vidihand.github.io/) |
| **paper** | [https://arxiv.org/abs/2606.30308](https://arxiv.org/abs/2606.30308) |
| **github** | [https://github.com/NTUYWANG103/ViDiHand](https://github.com/NTUYWANG103/ViDiHand) |
| **huggingface** | [https://huggingface.co/papers/2606.30308](https://huggingface.co/papers/2606.30308) |

---

## 📜 License & Usage

This model is governed by the **proprietary** license. Please check official developer guidelines before commercial deployment.

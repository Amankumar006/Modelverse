# PanoWorld

## 📌 Model Overview

PanoWorld is a generative spatial world model developed by Ke Holdings Inc. (Beike) for consistent whole-house 360° panorama synthesis from 2D floorplans and style references using a floorplan 3D shell proxy and dynamic 3D Gaussian Splatting (3DGS) spatial memory.

**PanoWorld** is a **Research Preview** model developed by **Academic/Research**, released on **2026-05-26**. It is engineered primarily for **Search Retrieval** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Search Retrieval |
| **Deployment** | self-hostable |
| **Modality** | 3d, vision |
| **Floorplan 3D Shell Proxy** | Floorplan 3D Shell Proxy: Converts 2D floorplans into global geometric 3D shells to enforce multi-room spatial coherence |
| **Dynamic 3DGS Spatial Memory** | Dynamic 3DGS Spatial Memory: Uses 3D Gaussian Splatting as renderable cache memory to preserve cross-view consistency during navigation |
| **Panoramic LRM** | Panoramic LRM: Feed-forward Large Reconstruction Model lifting 360° panoramas directly into local 3D Gaussian updates |
| **Room-Aware Group Attention (RAGA)** | Room-Aware Group Attention (RAGA): Eliminates cross-room visual interference by scoping attention to room topology |
| **Topology-Aware Progressive Caching** | Topology-Aware Progressive Caching: Progressively updates global scene cache across VR tour navigation graphs |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | Academic/Research |
| **Release Date** | 2026-05-26 |
| **Model Type** | Research Preview |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | proprietary |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **RealSee3D Cross-Node Overlap PSNR** | `State-of-the-Art` | Independent Eval |
| **Single-Node Perceptual Quality (HPSv3)** | `High Realism` | Independent Eval |
| **Cross-View Style Consistency (CLIP-I)** | `High Coherence` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://jjrcn.github.io/PanoWorld-project/](https://jjrcn.github.io/PanoWorld-project/) |
| **paper** | [https://arxiv.org/abs/2605.17916](https://arxiv.org/abs/2605.17916) |
| **github** | [https://github.com/jjrCN/PanoWorld](https://github.com/jjrCN/PanoWorld) |
| **huggingface** | [https://huggingface.co/spaces/JiaJinrang/PanoWorld-VR-Tour](https://huggingface.co/spaces/JiaJinrang/PanoWorld-VR-Tour) |

---

## 📜 License & Usage

This model is governed by the **proprietary** license. Please check official developer guidelines before commercial deployment.

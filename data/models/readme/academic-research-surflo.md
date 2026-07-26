# Surflo

## 📌 Model Overview

Surflo (Consistent 3D Surface Flow Model with Global State) is a feed-forward 3D surface reconstruction model developed by École Polytechnique, Kyoto University, Kyutai, and UC Berkeley. It encodes unposed RGB images into a 128-token global latent state and decodes 3D surface points using continuous flow matching with photometric rendering guidance.

**Surflo** is a **Open Weights** model developed by **Academic/Research**, released on **2026-06-11**. It is engineered primarily for **Search Retrieval** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Search Retrieval |
| **Deployment** | self-hostable |
| **Modality** | image, 3d |
| **Global Latent State Compression** | Global Latent State Compression: Encodes arbitrary unposed views into a fixed-size 128-token latent using a Perceiver compressor over a VGGT-1B backbone |
| **Arbitrary-Resolution Flow Matching Decoder** | Arbitrary-Resolution Flow Matching Decoder: Decodes 3D points continuously from noise, enabling sampling from thousands to millions of surface points without spatial grid constraints |
| **Inference-Time Photometric Guidance** | Inference-Time Photometric Guidance: Incorporates 3D Gaussian Splatting rendering loss gradients during ODE integration to resolve per-point decoding inconsistencies |
| **Order-of-Magnitude Speedup** | Order-of-Magnitude Speedup: Provides fast feed-forward inference compared to compute-heavy optimization-based reconstruction algorithms |
| **Unposed Multi-View Flexibility** | Unposed Multi-View Flexibility: Seamlessly handles between 2 and 64 unposed input images without pre-calibrated camera parameters |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | Academic/Research |
| **Release Date** | 2026-06-11 |
| **Model Type** | Open Weights |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | proprietary |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **DL3DV (Meshed) Chamfer Distance** | `State-of-the-Art Feed-Forward Surface Accuracy` | Independent Eval |
| **Tanks & Temples Chamfer Distance & F1** | `Outperforms per-view pointmap fusion baselines` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://anttwo.github.io/surflo/](https://anttwo.github.io/surflo/) |
| **paper** | [https://arxiv.org/abs/2606.13644](https://arxiv.org/abs/2606.13644) |
| **github** | [https://github.com/Anttwo/Surflo](https://github.com/Anttwo/Surflo) |
| **huggingface** | [https://huggingface.co/papers/2606.13644](https://huggingface.co/papers/2606.13644) |

---

## 📜 License & Usage

This model is governed by the **proprietary** license. Please check official developer guidelines before commercial deployment.

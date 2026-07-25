# Surflo

## Model Overview
**Surflo** is a **undisclosed-parameter** model developed by **Academic/Research**.
Released on **2026-06-11**.

---

## 📊 Quick Specs

| Specification | Value |
|:---|:---|
| **Parameters** | undisclosed |
| **Task** | other |
| **Modality** | image, 3d |
| **License** | Other/Custom |
| **Type** | open-weights |

---

## ✨ Key Features

- Global Latent State Compression: Encodes arbitrary unposed views into a fixed-size 128-token latent using a Perceiver compressor over a VGGT-1B backbone
- Arbitrary-Resolution Flow Matching Decoder: Decodes 3D points continuously from noise, enabling sampling from thousands to millions of surface points without spatial grid constraints
- Inference-Time Photometric Guidance: Incorporates 3D Gaussian Splatting rendering loss gradients during ODE integration to resolve per-point decoding inconsistencies
- Order-of-Magnitude Speedup: Provides fast feed-forward inference compared to compute-heavy optimization-based reconstruction algorithms
- Unposed Multi-View Flexibility: Seamlessly handles between 2 and 64 unposed input images without pre-calibrated camera parameters

---

## 🔗 Resources

- **Hugging Face**: [Surflo](https://huggingface.co/papers/2606.13644)
- **GitHub**: [Repository](https://github.com/Anttwo/Surflo)
- **Paper**: [arXiv](https://arxiv.org/abs/2606.13644)
- **Website**: [Project Page](https://anttwo.github.io/surflo/)

---

## 📜 License & Access
**Other/Custom** — See repository for specific license details.

# LiTo: Surface Light Field Tokenization

## Model Overview
**LiTo** (Surface Light Field Tokenization) is a 3D latent representation developed by **Apple Research** (Jen-Hao Rick Chang, Xiaoming Zhao, Dorian Chan, Oncel Tuzel) that jointly captures object geometry and view-dependent surface appearance. LiTo bridges neural rendering and generative modeling by tokenizing view-dependent radiance on object surfaces into a compact, unified latent space from which a flow matching model can generate high-quality 3D objects from a single image input. Published at **ICLR 2026**.

---

## 🔬 Technical Approach

LiTo introduces a novel 3D latent representation that encodes both:
- **Surface Geometry**: The 3D shape and mesh structure of objects
- **View-Dependent Appearance**: Surface light fields capturing how appearance changes with viewing angle (reflections, specularity, translucency)

Built upon this unified representation, a **latent flow matching model** enables image-to-3D generation by learning to generate LiTo latent codes conditioned on a single input image.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Surface Light Field Tokenization** | Tokenizes view-dependent radiance on object surfaces for efficient latent encoding |
| **Unified Geometry + Appearance** | Single latent code captures both shape and view-dependent appearance jointly |
| **Image-to-3D Generation** | Feed-forward 3D object reconstruction from a single RGB image |
| **Latent Flow Matching** | Uses continuous normalizing flows for high-quality, diverse 3D generation |
| **ICLR 2026** | Peer-reviewed research at International Conference on Learning Representations 2026 |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **Project Page** | [apple.github.io/ml-lito](https://apple.github.io/ml-lito/) |
| **Paper (Apple ML)** | [machinelearning.apple.com/research/lito](https://machinelearning.apple.com/research/lito) |
| **arXiv** | [arxiv.org/abs/2603.11047](https://arxiv.org/abs/2603.11047) |
| **GitHub Code** | [github.com/apple/ml-lito](https://github.com/apple/ml-lito) |

---

## 👥 Authors & Institution

Developed by the **Apple Machine Learning Research** team:
- Jen-Hao Rick Chang* (equal contribution)
- Xiaoming Zhao* (equal contribution)
- Dorian Chan
- Oncel Tuzel

**Institution**: Apple

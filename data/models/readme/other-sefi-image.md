# SeFi-Image: Semantic-First Diffusion for Text-to-Image Generation

## Model Overview
**SeFi-Image** is a text-to-image foundation model built on **Semantic-First Diffusion** — a new paradigm that separates semantic layout streams from texture detail streams to improve generation quality while dramatically reducing training compute requirements. Available in 1B, 2B, and 5B parameter sizes with Base, RL, and Turbo (4-step) variants, SeFi-Image achieves strong benchmark performance on only 125K A800 GPU hours for the 5B model — a fraction of the compute used by comparable models.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Semantic-First Design** | Separates high-level semantic layout processing from visual texture detailing |
| **Three Variants** | Base, RL (reinforcement-learned), and Turbo (4-step fast generation) |
| **Compute Efficient** | 5B model trained in only 125K A800 GPU hours |
| **Multiple Scales** | Available in 1B, 2B, and 5B parameter sizes |
| **Open-Weights** | Weights released on HuggingFace |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **HuggingFace** | [SeFi-Image/SeFi-Image-1B-turbo](https://huggingface.co/SeFi-Image/SeFi-Image-1B-turbo) |
| **Paper** | [arXiv:2606.22568](https://arxiv.org/html/2606.22568v4) |

---

## 📜 License

**Custom Non-Commercial License** — Available for research use. See HuggingFace repository for full terms.

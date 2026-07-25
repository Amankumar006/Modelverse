# Motion4Motion: Cross-Subject Motion Transfer at Inference

## Model Overview
**Motion4Motion** is a training-free framework for **cross-subject motion transfer** presented at **SIGGRAPH 2026**. Developed by researchers from Tsinghua University, HKUST, and StepFun, Motion4Motion takes a fundamentally different approach from prior skeleton-based motion transfer methods. Instead of requiring a predefined skeleton topology (which limits generalization to human-like figures), Motion4Motion models **motion flow** — the trajectory and dynamics of subject movement — enabling motion transfer across completely different species and body types at inference time without any task-specific training.

---

## 🔬 Technical Approach

Motion4Motion's core innovation is the **TransPE (Transferring Positional Encoding)** technique, which maps spatial motion patterns from a source video to a target subject at different scales. By operating on motion flow rather than skeleton joints:

- Works for any species (human → animal, animal → cartoon character)
- No skeleton annotation required
- No additional fine-tuning needed
- Generalizes to diverse morphologies at inference time

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Training-Free** | No fine-tuning required — motion transfer happens at inference time on any video pair |
| **Skeleton-Free** | Models motion flow rather than skeleton topology for species-agnostic transfer |
| **Cross-Species Transfer** | Works across diverse morphologies: human, animal, and non-human characters |
| **TransPE Technique** | Novel Transferring Positional Encoding maps motion across different body scales |
| **SIGGRAPH 2026** | Accepted at ACM SIGGRAPH 2026 Conference Papers — the premier venue for computer graphics |

---

## 📊 Applications

- **Character Animation**: Animate any 2D/3D character from reference motion videos
- **Dance Transfer**: Transfer dance choreography across human performers
- **Cross-Species Animation**: Apply human motion to animals or non-humanoid characters
- **Novel Character Rigging**: Animate new characters without skeleton setup

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **Project Page** | [lhchen.top/Motion4Motion](https://lhchen.top/Motion4Motion/) |
| **Paper PDF** | [Motion4Motion Paper](https://lhchen.top/Motion4Motion/static/m4m_paper.pdf) |
| **Demo Video** | [YouTube Overview](https://www.youtube.com/watch?v=-rcL7cQhiyc) |

---

## 👥 Authors & Institutions

- **Ling-Hao Chen** (Tsinghua University, StepFun)
- **Zixin Yin** (HKUST, StepFun)
- **Duomin Wang** (StepFun)
- **Xianfang Zeng** (StepFun)
- **Gang Yu** (StepFun) — Corresponding Author

**Venue**: SIGGRAPH 2026 Conference Papers

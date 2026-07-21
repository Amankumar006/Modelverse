# Motion4Motion: Training-Free Cross-Subject Motion Transfer

Motion4Motion is a novel training-free framework for cross-subject motion transfer via **Transferring Positional Encoding (TransPE)**, presented at SIGGRAPH 2026 by Tsinghua University, StepFun, and HKUST.

---

## 🔬 Methodology: Transferring Positional Encoding (TransPE)

Traditional motion transfer requires retraining or fine-tuning control nets per subject. Motion4Motion operates entirely at inference time by mapping target motion positional encodings directly into the self-attention features of pretrained video diffusion backbones.

```
Source Video (Subject A) ───► Motion Feature Extractor (TransPE) ┐
                                                                 ├──► Motion-Preserved Target Video
Target Image (Subject B) ───► Video Diffusion Self-Attention     ┘
```

---

## 📊 Qualitative & Quantitative Results

- **Training Required**: None (Zero-shot inference)
- **Pose Preservation**: 96.4% Structural Similarity (SSIM) on HumanMotion-3D
- **Identity Preservation**: 98.1% Face-ID retention on target subject

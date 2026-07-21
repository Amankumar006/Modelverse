# Wan-Dancer: Minute-Scale Coherent Music-to-Dance Video Generation

Wan-Dancer is a hierarchical deep framework developed by Tongyi Lab (Alibaba Group) for generating long-duration, rhythmically synchronized, minute-scale dance videos from raw audio tracks.

---

## 🎭 Methodology & Hierarchical Architecture

Wan-Dancer decomposes music-to-dance synthesis into three distinct sub-systems:

1. **Music-Beat Feature Extraction**: Extracts rhythmic structure, tempo, and acoustic genre embeddings.
2. **Hierarchical Pose Generation**: Predicts global body trajectory and fine-grained skeletal motion sequences.
3. **Motion-Guided Video Rendering**: Uses a 14B Wan-based diffusion backbone to generate photorealistic dance videos with temporal coherence across minutes.

---

## 📊 Evaluation & Comparative Results

| Model | Max Duration | Beat Alignment Score | Motion Coherence |
| :--- | :--- | :--- | :--- |
| **Wan-Dancer (14B)** | **> 3 Minutes** | **94.8%** | **4.85 / 5.0** |
| Prior Baselines | < 30 Seconds | 78.2% | 3.60 / 5.0 |

---

## 🔗 Project Page
- [Wan-Dancer Project Page](https://humanaigc.github.io/wan-dancer-project/)

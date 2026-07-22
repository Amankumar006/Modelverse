# SCAIL 2: End-to-End In-Context Controlled Character Animation

## Model Overview
**SCAIL 2** is an open-source, end-to-end framework for controlled character animation and video-to-video motion transfer developed by researchers at **Tsinghua University (KEG Group)** and **Z.ai** (Wenhao Yan, Fengjia Guo, Jie Tang, et al.).

It enables video-to-video motion transfer directly from a driving video to a reference character image/video without relying on intermediate representations such as 3D skeletons, OpenPose maps, depth maps, or foreground masks.

---

## Key Features
- **End-to-End Motion Transfer Architecture:** Bypasses traditional pose skeleton/depth map extraction, eliminating information loss and allowing motion transfer onto arbitrary character styles and non-humanoids.
- **Unified In-Context Mask & Mode-Specific RoPE:** Uses in-context mask conditioning alongside Rotary Position Embeddings (RoPE) to unify single-character animation, character replacement, and multi-character interaction.
- **MotionPair-60K Dataset:** Trained on a heterogeneous dataset of 60,000 synthetic motion transfer pairs.
- **Bias-Aware Direct Preference Optimization (DPO):** Post-training DPO improves generation quality in fine-detail regions like fingers, facial expressions, and limb overlaps.
- **ComfyUI Integration:** Features native integration and memory-efficient offloading for ComfyUI.

---

## Verified Project Links
- **Project Website:** [https://teal024.github.io/SCAIL-2/](https://teal024.github.io/SCAIL-2/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.10804](https://arxiv.org/abs/2606.10804)
- **GitHub Repository:** [https://github.com/zai-org/SCAIL-2](https://github.com/zai-org/SCAIL-2)
- **Hugging Face Model:** [https://huggingface.co/zai-org/SCAIL-2](https://huggingface.co/zai-org/SCAIL-2)

---

## Benchmarks & Evaluation
- Evaluated on TikTok and X-Dance datasets for pose & motion consistency.
- **Studio-Bench:** Achieved >70% win-rate over skeleton-based baselines in real-world cross-identity animation.

# SCOPE: Simulating Cross-game Operations in Playable Environments

## Model Overview
**SCOPE** (Simulating Cross-game Operations in Playable Environments) is an interactive real-time FPS world model developed by researchers at the **University of Chinese Academy of Sciences (UCAS)** (Zizhao Tong, Hongfeng Lai, et al.).

SCOPE addresses global screen distortion artifacts common in interactive game world models when performing localized actions (such as weapon recoil, scoping, or reloading). By embedding a **Spatial Action Decoupling module** directly into video diffusion transformer blocks (Wan2.2), SCOPE decouples localized weapon/HUD visual effects from background environment rendering without manual segmentation labels.

---

## Key Features
- **Spatial Action Decoupling Module:** Per-pixel temporal action conditioning inside video diffusion blocks to isolate weapon/UI actions from global background stability.
- **10-DoF Hybrid Action Control:** Supports 4 continuous axes (dual joysticks) and 6 discrete action buttons (fire, reload, jump, crouch, aim, sprint).
- **CrossFPS Multi-Game Dataset:** Trained on 69,000+ 5-second video clips across 7 distinct FPS titles with frame-aligned telemetry.
- **Zero-Shot Cross-Game Generalization:** Demonstrates robust action control transfer to unseen FPS game environments without retraining.
- **Elimination of Global Screen Artifacts:** Maintains spatial stability across the screen during high-frequency action execution.

---

## Verified Project Links
- **Project Website:** [https://z2tong.github.io/SCOPE/](https://z2tong.github.io/SCOPE/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.23345](https://arxiv.org/abs/2605.23345)
- **GitHub Repository:** [https://github.com/z2tong/SCOPE](https://github.com/z2tong/SCOPE)
- **Hugging Face Model:** [https://huggingface.co/zizhaotong/SCOPE](https://huggingface.co/zizhaotong/SCOPE)

---

## Benchmarks & Evaluation
- **Fréchet Video Distance (FVD):** 690.3 (28% improvement over LingBot-World).
- **JEPA Similarity:** 0.806 (31% improvement over baseline).
- **Photometric Smoothness:** 0.198 (3.2× smoother than LingBot-World).

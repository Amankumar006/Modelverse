# VidiHand: Generative 4D Hand Motion Reconstruction

## Model Overview
**VidiHand** (*"The Surprising Effectiveness of Video Diffusion Models for Hand Motion Reconstruction"*) is a generative 4D hand motion reconstruction framework developed by researchers at **Nanyang Technological University (NTU)** and **Shanghai Jiao Tong University (SJTU)** (Yuxi Wang, Xingang Pan, et al.).

It recovers metric-scale 3D/4D two-hand pose trajectories from monocular egocentric videos. By leveraging the implicit spatiotemporal motion priors embedded inside pretrained video diffusion models (Wan2.1-VACE), VidiHand extracts metric MANO hand mesh parameters directly across full-frame video sequences.

---

## Key Features
- **Detector-Free Full-Frame Processing:** Eliminates reliance on external hand detectors or localized image cropping.
- **Pretrained Video Diffusion Priors:** Capitalizes on generative spatiotemporal world priors from internet-scale video diffusion backbones (Wan2.1-VACE).
- **Robustness to Heavy Occlusion:** Handles severe hand-hand and hand-object occlusions effectively via implicit diffusion motion dynamics.
- **Zero Test-Time Optimization (TTO):** Does not require frame-by-frame optimization or temporal infilling during inference.
- **Superior Temporal Smoothness:** Delivers up to 4.8× smoother trajectories (jitter reduced to 3.18 mm/frame) and SOTA pose accuracy.

---

## Verified Project Links
- **Project Website:** [https://vidihand.github.io/](https://vidihand.github.io/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.30308](https://arxiv.org/abs/2606.30308)
- **GitHub Repository:** [https://github.com/NTUYWANG103/ViDiHand](https://github.com/NTUYWANG103/ViDiHand)
- **Hugging Face:** [https://huggingface.co/papers/2606.30308](https://huggingface.co/papers/2606.30308)

---

## Benchmarks & Evaluation
- **ARCTIC Benchmark:** Ranked 1st place across all 9 evaluation metrics (21.668 mm MPJPE-p, 3.18 mm/frame jitter).
- **HOT3D Benchmark:** Ranked 1st place across all 9 evaluation metrics.

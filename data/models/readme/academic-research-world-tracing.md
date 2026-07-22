# World Tracing: Generative Multilayer 3D Geometry Representation

## Model Overview
**World Tracing** is a generative 3D geometry representation framework developed by researchers from **World Labs** and **University of Illinois Urbana-Champaign (UIUC)** (Hao Zhang, Mohamed El Banani, et al.).

It bridges the gap between monocular depth estimation (high pixel alignment, incomplete geometry) and 3D generative models (complete geometry, poor pixel alignment). Given a single 2D image or short video clip, World Tracing predicts an ordered stack of camera-space 3D points (X, Y, Z) along camera rays for every pixel. The first layer represents visible surfaces, while subsequent layers generate occluded geometry behind them.

---

## Key Features
- **Multilayer Pixel-Aligned Geometry:** Predicts an ordered stack of 3D points per pixel, maintaining 1:1 alignment while capturing occluded surfaces.
- **WT-DiT Architecture:** Utilizes a Flow-Matching Diffusion Transformer that treats geometry layers as coupled denoising tokens with factorized attention.
- **Unified Multi-Domain Support:** Provides specialized variants for single objects (WT-O), scenes (WT-S), and dynamic video sequences.
- **Zero-Shot Downstream Integration:** Enables text-guided 3D scene editing, novel-view video synthesis, and integration with mesh generators.
- **Faithfulness & Completeness Balance:** Preserves high-precision visible surface depth accuracy while generating complete 3D structure.

---

## Verified Project Links
- **Project Website:** [https://haoz19.github.io/world-tracing-page/](https://haoz19.github.io/world-tracing-page/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.13652](https://arxiv.org/abs/2606.13652)
- **GitHub Repository:** [https://github.com/haoz19/world-tracing](https://github.com/haoz19/world-tracing)
- **Hugging Face Demo:** [https://huggingface.co/spaces/haoz19/world-tracing-demo](https://huggingface.co/spaces/haoz19/world-tracing-demo)

---

## Benchmarks & Evaluation
- **Objects & 3D-FRONT Benchmarks:** Outperforms monocular depth and image-to-3D generative baselines in depth accuracy and occluded geometry reconstruction.

# PixlRelight: Physically Controllable Single-Image Relighting

## Model Overview
**PIXLRelight** is a feed-forward, transformer-based neural rendering framework for physically controllable single-image relighting. Developed by Miguel Farinha and Ronald Clark at the **University of Oxford**, it bridges physically based rendering (PBR) and learned image synthesis via shared intrinsic conditioning.

By using per-pixel affine modulation, PIXLRelight preserves fine-grained source details, textures, and scene geometry while achieving ultra-fast feed-forward inference (<0.1s per image).

---

## Key Features
- **Physically Controllable Relighting:** Enables exact lighting changes on a single image using target HDRI maps or synthetic PBR lighting controls.
- **Dual Conditioning Modes:** Accepts either real target reference photographs (via Marigold-IID-Lighting) or path-traced Blender Cycles renders.
- **Ultra-Fast Feed-Forward Inference:** Performs single-image relighting in under 0.1 seconds per image on modern GPUs.
- **Detail-Preserving Affine Modulation:** Employs per-pixel affine transformations to preserve original textures and geometric boundaries.
- **Integrated Intrinsic Estimation:** Incorporates Depth Anything 3 for geometry recovery and Marigold-IID-Appearance for material estimation.

---

## Verified Project Links
- **Project Website:** [https://mlfarinha.github.io/pixl-relight/](https://mlfarinha.github.io/pixl-relight/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.18735](https://arxiv.org/abs/2605.18735)
- **GitHub Repository:** [https://github.com/mlfarinha/pixlrelight](https://github.com/mlfarinha/pixlrelight)
- **Hugging Face Model:** [https://huggingface.co/mlfarinha/pixlrelight](https://huggingface.co/mlfarinha/pixlrelight)

---

## Performance & Benchmarks
- **Relighting Quality (PSNR/SSIM):** Outperforms prior baseline methods (DiffusionRenderer, UniRelight, RGBX) on synthetic and real benchmarks.
- **Perceptual Quality (LPIPS):** Delivers state-of-the-art perceptual scores at sub-100ms inference speeds.

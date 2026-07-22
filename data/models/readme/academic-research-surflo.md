# Surflo: Consistent 3D Surface Flow Model with Global State

## Model Overview
**Surflo** (*Consistent 3D Surface Flow Model with Global State*) is a feed-forward 3D reconstruction framework developed by researchers at **École Polytechnique (LIX)**, **Kyoto University**, **Kyutai**, and **UC Berkeley (BAIR)** (Antoine Guédon, Shu Nakamura, Angjoo Kanazawa, et al.).

It generates dense, accurate, and consistent 3D surface geometry from a variable number of unposed RGB images by encoding views into a compact global latent state ($K=128$ tokens) and decoding 3D surface points independently using continuous flow matching ODE integration with photometric rendering guidance.

---

## Key Features
- **Global Latent State Compression:** Encodes an arbitrary number of unposed RGB input images into a compact fixed-size representation of $K=128$ latent tokens.
- **Flow Matching Surface Decoder:** Continuous-time flow matching decodes 3D surface points independently from noise at arbitrary output resolutions (from thousands to over a million points).
- **Photometric Inference Guidance:** Injects photometric gradients (via 3D Gaussian Splatting rendering loss) during ODE integration to enforce local consistency.
- **Order-of-Magnitude Speedup:** Fast feed-forward inference compared to optimization-based NeRF or Gaussian Splatting pipelines.
- **Unposed Multi-View Flexibility:** Processes 2 to 64 unposed images without pre-computed camera calibration.

---

## Verified Project Links
- **Project Website:** [https://anttwo.github.io/surflo/](https://anttwo.github.io/surflo/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.13644](https://arxiv.org/abs/2606.13644)
- **GitHub Repository:** [https://github.com/Anttwo/Surflo](https://github.com/Anttwo/Surflo)
- **Hugging Face:** [https://huggingface.co/papers/2606.13644](https://huggingface.co/papers/2606.13644)

---

## Benchmarks & Evaluation
- **DL3DV (Meshed):** Establishes new state-of-the-art surface accuracy among feed-forward models on 16 unposed input views.
- **Tanks & Temples, Mip-NeRF 360, DTU:** Outperforms per-view pointmap fusion baselines in Chamfer Distance and F1-score.

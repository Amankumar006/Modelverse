# Relightable Chars: Relightable Holoported Characters

## Model Overview
**Relightable Chars** (*Relightable Holoported Characters: Capturing and Relighting Dynamic Human Performance from Sparse Views*) is a 3D vision and neural rendering framework developed by researchers at the **Max Planck Institute for Informatics (MPI-INF)**, **VIA Research Center**, and **Google** (Kunwar Maheep Singh, Vladislav Golyanik, Christian Theobalt, et al.).

The framework synthesizes photorealistic free-viewpoint renders and enables arbitrary relighting of full-body dynamic human performances using only **sparse-view RGB video inputs** at inference time through 3D Gaussian Splatting and a single-pass transformer RelightNet.

---

## Key Features
- **Sparse-View Dynamic Relighting:** Performs free-view rendering and relighting of full-body dynamic human performances from sparse RGB views.
- **Single-Pass RelightNet Architecture:** Evaluates target lighting conditions and complex light transport (shadows, specularities) in a single transformer feed-forward pass.
- **Physics-Informed 3D Gaussian Splatting:** Combines texel-aligned 3D Gaussian splats with explicit physical features (mesh proxy, albedo, shading maps).
- **Alternating Illumination Capture:** Multi-view lightstage capture protocol alternating uniform tracking frames with dynamic environment illumination.
- **Superior Generalization & Quality:** Outperforms motion-driven avatar baselines (*Relighting4D*, *IntrinsicAvatar*) in shadow fidelity and identity preservation.

---

## Verified Project Links
- **Project Website:** [https://vcai.mpi-inf.mpg.de/projects/RelightableChars/](https://vcai.mpi-inf.mpg.de/projects/RelightableChars/)
- **arXiv Paper:** [https://arxiv.org/abs/2512.00255](https://arxiv.org/abs/2512.00255)

---

## Performance & Benchmarks
- Accepted at **CVPR 2026**.
- Outperforms baseline models across PSNR, SSIM, and LPIPS metrics on full-body dynamic human capture sequences.

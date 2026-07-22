# PhysiFormer: Physically Plausible 3D Object Mechanics Simulation

## Model Overview
**PhysiFormer** is a diffusion transformer model developed by researchers at the **Visual Geometry Group (VGG), University of Oxford** (Yiming Chen, Yushi Lan, Andrea Vedaldi).

It simulates physically plausible 3D object dynamics directly in 3D world coordinates. Conditioned on initial 3D vertex positions, velocities, and material type descriptors (rigid vs. elastic), PhysiFormer treats full-horizon 3D trajectory prediction as a single denoising diffusion process without relying on view-dependent pixel-space video models or ad-hoc latent spaces.

---

## Key Features
- **World-Space Mesh Trajectory Diffusion:** Casts 3D vertex trajectory prediction into a single denoising diffusion process directly in 3D world coordinates.
- **Material & Velocity Conditioning:** Conditioned on initial per-vertex 3D positions, initial velocities, and material properties (rigid or elastic mechanics).
- **Factorized Spatio-Temporal-Object Attention:** Enables permutation-invariant multi-object reasoning without explicit object encoding.
- **Generalization Across Geometries:** Trained on 100,000+ simulated trajectories and generalizes to unseen real-world 3D geometries and mixed-material interactions.
- **Constant-Time Rollout:** Avoids error accumulation typical of autoregressive Euler-marching models by sampling full-horizon trajectories in a unified step.

---

## Verified Project Links
- **Project Website:** [https://yimingc9.github.io/physiformer/](https://yimingc9.github.io/physiformer/)
- **arXiv Paper:** [https://arxiv.org/abs/2606.27364](https://arxiv.org/abs/2606.27364)
- **GitHub Repository:** [https://github.com/yimingc9/PhysiFormer](https://github.com/yimingc9/PhysiFormer)
- **Hugging Face Model:** [https://huggingface.co/yslan/PhysiFormer](https://huggingface.co/yslan/PhysiFormer)

---

## Performance & Benchmarks
- Substantially lower trajectory prediction error compared to autoregressive baselines.
- Outperforms baselines in preserving 3D structural rigidity and momentum conservation.

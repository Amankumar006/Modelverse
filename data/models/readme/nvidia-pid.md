# PiD: Pixel Diffusion Decoder

## Model Overview
**PiD** (Pixel Diffusion Decoder) is a generative model and decoding paradigm developed by the **NVIDIA Spatial Intelligence Lab (SIL)** (Yifan Lu, Qi Wu, Sanja Fidler, et al.).

It reformulates latent-to-pixel decoding as a conditional pixel-space diffusion process, replacing traditional Variational Autoencoder (VAE) decoders in latent diffusion pipelines. By unifying decoding and spatial super-resolution (4× to 8× upsampling) into high-resolution pixel space (up to 2048×2048 / 4K), PiD achieves sharp texture synthesis in just 4 steps via DMD2 distillation.

---

## Key Features
- **Unified Decoding & Upsampling:** Combines latent-to-pixel decoding with 4×/8× spatial super-resolution into a single generative pixel-diffusion step.
- **Sigma-Aware Adapter:** Injects noise-corrupted latents into the pixel diffusion backbone, allowing latent diffusion to terminate early.
- **Fast 4-Step Distilled Inference:** Achieves 2048×2048 resolution output in 211ms on NVIDIA GB200 or <1s on RTX 5090.
- **Universal Latent Compatibility:** Functions as a drop-in replacement for standard VAE, SigLIP, and DINOv2 latents across FLUX, SD3, and Z-Image.
- **High Detail Synthesis:** Eliminates the soft, blurry artifacts of traditional reconstruction VAE decoders.

---

## Verified Project Links
- **Project Website:** [https://research.nvidia.com/labs/sil/projects/pid/](https://research.nvidia.com/labs/sil/projects/pid/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.23902](https://arxiv.org/abs/2605.23902)
- **GitHub Repository:** [https://github.com/nv-tlabs/PiD](https://github.com/nv-tlabs/PiD)
- **Hugging Face Model:** [https://huggingface.co/nvidia/PiD](https://huggingface.co/nvidia/PiD)

---

## Performance Benchmarks
- **Decoding Latency (512×512 → 2048×2048):** 211.2 ms (GB200) / <1.0 s (RTX 5090).
- **Inference Steps:** 4 steps via DMD2 Distillation.
- **5.9× acceleration** over standard cascaded super-resolution pipelines (SeedVR2).

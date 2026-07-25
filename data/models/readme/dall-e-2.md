# DALL-E 2: Hierarchical Text-Conditional Image Generation

## Model Overview
**DALL-E 2** (unCLIP) is a 3.5 billion parameter text-conditional image generation model developed by **OpenAI** (Aditya Ramesh, Prafulla Dhariwal, Alex Nichol, et al.).

It operates via a two-stage unCLIP architecture: a prior model converting text prompts into CLIP image embeddings, followed by a diffusion decoder and super-resolution cascade (64×64 → 256×256 → 1024×1024).

---

## Key Features
- **Hierarchical Two-Stage unCLIP Architecture:** Inverts CLIP image encoders to generate images directly from text-derived CLIP image latents.
- **Language-Guided Image Editing:** Enables replacing, adding, or modifying specific rectangular/masked areas of an image based on text prompts.
- **Image Variations:** Generates visually distinct yet semantically consistent variations of an existing reference image.
- **Latent Space Interpolation:** Interpolates seamlessly between two images by blending CLIP image embeddings.
- **High-Resolution Cascaded Diffusion:** Multi-stage upscaling diffusion networks synthesize realistic 1024×1024 pixel images.

---

## Verified Project Links
- **Official Overview:** [https://openai.com/index/dall-e-2/](https://openai.com/index/dall-e-2/)
- **arXiv Paper:** [https://arxiv.org/abs/2204.06125](https://arxiv.org/abs/2204.06125)
- **GitHub Repository:** [https://github.com/openai/dalle-2-preview](https://github.com/openai/dalle-2-preview)
- **Hugging Face:** [https://huggingface.co/papers/2204.06125](https://huggingface.co/papers/2204.06125)

---

## Performance & Benchmarks
- **MS-COCO 256×256 Zero-Shot FID:** 10.39 (outperforms GLIDE at 12.24).
- **Human Evaluation:** 88.8% photorealism preference over DALL-E 1.

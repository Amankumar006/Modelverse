# Bernini: Latent Semantic Planning for Video Diffusion

**Bernini** is a unified artificial intelligence framework for video generation and instruction-based video editing developed by **ByteDance Research**. Introduced in May 2026 (*"Bernini: Latent Semantic Planning for Video Diffusion"*), Bernini employs a decoupled "division of labor" architecture that separates high-level semantic reasoning from fine-grained pixel synthesis.

---

## 🔬 Architecture & Methodology

The framework consists of two core components:
1. **Semantic Planner:** Powered by an MLLM (Qwen2.5-VL-7B) that generates target semantic plans directly in the Vision Transformer (ViT) embedding space using Chain-of-Thought (CoT) reasoning.
2. **Pixel Renderer (Bernini-R):** Powered by a Diffusion Transformer (DiT based on Wan2.2-A14B) that executes flow-matching denoising in VAE latent space conditioned on the planner's semantic representations.

```
Input Video & Prompt ───► MLLM Semantic Planner (Qwen2.5-VL-7B) ───► Target ViT Semantic Vectors ───► DiT Latent Renderer (Bernini-R) ───► Output Video
```

---

## 📊 Benchmarks & Performance

| Benchmark | Score (7B+14B) | Score (14B Renderer) | Status |
| :--- | :--- | :--- | :--- |
| **EditVerse** | **8.02** | 7.99 | Verified |
| **OpenVE** | **4.03** | 3.78 | Verified |
| **VBench** | **84.37** | 84.64 | Verified |

---

## 🚀 Quickstart & Usage

```bash
git clone https://github.com/bytedance/Bernini.git
cd Bernini
pip install -r requirements.txt
pip install -U huggingface_hub
hf download ByteDance/Bernini-R-Diffusers --local-dir pretrained_models/Bernini-R-Diffusers
```

```python
import torch
from diffusers import DiffusionPipeline

# Load Bernini-R Diffusers pipeline
pipe = DiffusionPipeline.from_pretrained(
    "ByteDance/Bernini-R-Diffusers",
    torch_dtype=torch.bfloat16
).to("cuda")

# Run video inference
output = pipe(
    prompt="A cinematic drone shot of a snowy mountain peak at sunrise",
    num_inference_steps=50,
    guidance_scale=6.0,
    height=480,
    width=832,
    num_frames=81
)

video_frames = output.frames
```

---

## 🔗 Official Resources & Links
- [Official Project Page](https://bernini-ai.github.io/)
- [arXiv Paper (arXiv:2605.22344)](https://arxiv.org/abs/2605.22344)
- [Paper PDF Download](https://arxiv.org/pdf/2605.22344)
- [GitHub Repository](https://github.com/bytedance/Bernini)
- [Hugging Face Models Collection](https://huggingface.co/collections/ByteDance/bernini-665e75141071d279930f36f6)

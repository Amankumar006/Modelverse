# ControlLight: Controllable Low-Light Image Enhancement

**ControlLight** is a controllable, consistent, and generalizable low-light image enhancement framework introduced by Yufeng Yang et al. (May 2026). Built as a Low-Rank Adaptation (LoRA) upon the **FLUX.2-klein-9B** generative foundation architecture, ControlLight empowers users with continuous control over illumination enhancement strength via an adjustable scaling parameter ($\alpha$).

---

## 🔬 Key Features & Core Innovations

- **Controllable Illumination Scale ($\alpha$)**: Allows continuous adjustment of enhancement intensity from mild shadow recovery ($\alpha \to 0$) to bright, well-exposed scenes ($\alpha \to 1$) without overexposure or contrast loss.
- **FLUX.2-klein-9B LoRA Adaptation**: Leverages the high visual quality and deep generative priors of FLUX.2-klein-9B while training lightweight LoRA weights (`controllight.safetensors`).
- **Structural & Detail Preservation**: Ensures strict preservation of underlying scene layout, high-frequency textures, and edge fidelity even under severe low-light conditions.
- **Light100K Dataset**: Trained on Light100K, a curated large-scale dataset specifically constructed for continuous illumination learning.

```
Low-Light Input (x_0) ──► Latent Encoder ──► FLUX.2-klein-9B + ControlLight LoRA (scale α) ──► Enhanced Image
```

---

## 🚀 Quickstart & Usage

```bash
git clone https://github.com/yfyang007/ControlLight.git
cd ControlLight
conda create -n controlight python=3.12 -y
conda activate controlight
pip install -r requirements.txt
```

```python
import torch
from diffusers import FluxPipeline

# Load base FLUX.2-klein-9B pipeline
pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.2-klein-base-9B",
    torch_dtype=torch.bfloat16
).to("cuda")

# Attach ControlLight LoRA weights
pipe.load_lora_weights("ControlLight/ControlLight", weight_name="controllight.safetensors")

# Enhance low-light image with controllable alpha strength
alpha_strength = 0.5  # Range [0.0, 1.0]
enhanced_image = pipe(
    prompt="A clearly lit scene with natural colors and balanced contrast",
    image=input_image,
    joint_attention_kwargs={"scale": alpha_strength},
    num_inference_steps=20,
    guidance_scale=1.0,
).images[0]

enhanced_image.save("enhanced_output.png")
```

---

## 🔗 Official Links & Resources

- [Official Project Webpage](https://yfyang007.github.io/ControlLight/)
- [arXiv Paper (arXiv:2605.25569)](https://arxiv.org/abs/2605.25569)
- [Paper PDF Download](https://arxiv.org/pdf/2605.25569)
- [GitHub Code Repository](https://github.com/yfyang007/ControlLight)
- [Hugging Face Model Weights](https://huggingface.co/ControlLight/ControlLight)
- [Hugging Face Light100K Dataset](https://huggingface.co/datasets/ControlLight/Light100K)

# CubePart: Open-Vocabulary Part-Controllable 3D Generator

**CubePart** is an open-vocabulary, part-controllable 3D generative framework developed by researchers at **Roblox Research**, **Carnegie Mellon University**, and **Stanford University** (presented at **SIGGRAPH 2026**). Unlike traditional 3D generative models that produce monolithic, single-mesh objects, CubePart introduces controllable multi-part mesh synthesis. Users provide a text prompt alongside an open-ended "parts schema" (e.g., `[chassis, wheels, headlights, doors]`), and the model generates an assembled set of distinct, semantically labeled 3D meshes ready for game engine integration.

---

## 🔬 Architecture & Key Innovations

CubePart features a two-stage generative framework powered by Multi-Modal Diffusion Transformers and multimodal language modeling:

1. **Schema-Aware Text Encoding**: Utilizes **Qwen-VL** to encode global text prompts and arbitrary open-vocabulary parts schemas into unified conditioning vectors.
2. **Stage 1 (MM-DiT Denoiser)**: A Multi-Modal Diffusion Transformer operates on **VecSet** latent shape representations to synthesize holistic multi-part shape latents.
3. **Stage 2 (Part-Level Decoder)**: Decodes multi-part shape latents into discrete, high-fidelity 3D sub-meshes, ensuring geometric alignment, joint compatibility, and semantic label accuracy.
4. **Mesh Decomposition**: In addition to text-to-3D generation, CubePart can accept a single monolithic 3D mesh as input and decompose it into semantic multi-part meshes based on a target schema.

```
Text Prompt + Parts Schema ──► Qwen-VL Encoder ──► MM-DiT VecSet Denoiser ──► Part-Level Decoder ──► Multi-Mesh GLB Asset
```

---

## 🚀 Quickstart & Usage

```bash
git clone https://github.com/Roblox/cube.git
cd cube
pip install -e .[meshlab]
huggingface-cli download Roblox/cubepart --local-dir weights
```

```python
import torch
from cube.models import CubePartPipeline

# Load pipeline
pipeline = CubePartPipeline.from_pretrained(
    "Roblox/cubepart",
    torch_dtype=torch.float16
).to("cuda")

# Generate multi-part asset
prompt = "A futuristic cyberpunk hover-car"
parts_schema = ["chassis", "hover_thrusters", "windshield", "cockpit_seat"]

mesh_collection = pipeline(
    prompt=prompt,
    parts_schema=parts_schema,
    num_inference_steps=50,
    guidance_scale=7.5
)

mesh_collection.export("hover_car.glb")
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://cubepart.github.io/)
- [arXiv Paper (arXiv:2605.28763)](https://arxiv.org/abs/2605.28763)
- [Paper PDF Download](https://arxiv.org/pdf/2605.28763)
- [GitHub Code Repository](https://github.com/Roblox/cube)
- [Hugging Face Model & Demo](https://huggingface.co/Roblox/cubepart)

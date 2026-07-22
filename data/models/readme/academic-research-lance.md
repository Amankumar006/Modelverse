# Lance: Unified Multimodal Modeling by Multi-Task Synergy

## Model Overview
**Lance** is a lightweight, open-source native unified multimodal model developed by **ByteDance Research**. Built with 3 billion active parameters on a dual-stream Mixture-of-Experts (MoE) architecture, Lance seamlessly unifies image and video understanding, text-to-image/video generation, and visual media editing within a single, end-to-end model framework.

By using a staged multi-task training recipe and novel Modality-aware Rotary Positional Encoding (MaPE), Lance resolves the traditional performance trade-offs between understanding and generation while drastically reducing computational requirements during pre-training.

## Key Capabilities & Features
* **Unified Multimodal Framework:** Seamlessly handles image/video understanding, generation, and editing within a single model.
* **Dual-Stream Mixture-of-Experts (MoE):** Utilizes 3B active parameters to decouple high-level semantic reasoning pathways from visual generative synthesis pathways.
* **Modality-Aware Rotary Positional Encoding (MaPE):** Resolves spatial and temporal alignment conflicts between heterogeneous semantic tokens (from Qwen2.5-VL) and 3D causal VAE latent tokens.
* **Staged Multi-Task Synergy:** Employs a multi-stage training curriculum (CT1 → CT2 → CT3) that steadily builds generative and reasoning capabilities without catastrophic forgetting.
* **Compute Efficiency:** Trained from scratch using fewer than 128 GPUs, achieving top-tier performance at ~20% of the training compute required by legacy dense unified models.

## Resource Links
* **Project Website:** [https://lance-project.github.io/](https://lance-project.github.io/)
* **arXiv Paper:** [arXiv:2605.18678](https://arxiv.org/abs/2605.18678)
* **Paper PDF:** [Download PDF](https://arxiv.org/pdf/2605.18678)
* **GitHub Repository:** [bytedance/Lance](https://github.com/bytedance/Lance)
* **Hugging Face Model:** [bytedance-research/Lance](https://huggingface.co/bytedance-research/Lance)

## Architecture & Methodology
Lance addresses the conflict between high-level visual understanding (which requires dense semantic abstraction) and fine-grained visual generation (which requires spatial-temporal reconstruction):
1. **Heterogeneous Sequence Interleaving:** Combines text, vision semantic tokens, and 3D causal VAE latent tokens into shared sequence representations.
2. **Dual-Stream MoE Router:** Directs tokens to specialized expert pathways according to task requirements (generative vs. analytical).
3. **Modality-Aware Positional Encoding (MaPE):** Decouples 1D textual, 2D visual, and 3D temporal positional embeddings to prevent token interference across modalities.

## Performance & Benchmarks
Lance demonstrates state-of-the-art performance among open-source unified multimodal architectures:
| Benchmark | Task / Metric | Score | Notes |
| :--- | :--- | :--- | :--- |
| **MVBench** | Video Understanding | **62.0** | Ranked #1 among open unified models (+11.3% over Show-o2 7B) |
| **VBench** | Video Generation Quality | **68.7** | Improved from 52.3 (CT1 stage) to 68.7 (CT3 final stage) |
| **MMBench** | Multimodal Understanding | **Competitive** | Retains high VQA accuracy alongside generative capability |

## Quickstart Usage

### Environment Setup
```bash
git clone https://github.com/bytedance/Lance.git
cd Lance
pip install -r requirements.txt
```

### Python Inference Example
```python
import torch
from lance import LanceModel, LanceTokenizer

# Load pre-trained Lance model and tokenizer from Hugging Face
model_id = "bytedance-research/Lance"
tokenizer = LanceTokenizer.from_pretrained(model_id)
model = LanceModel.from_pretrained(model_id, torch_dtype=torch.bfloat16).cuda()

# Text-to-Video Generation Example
prompt = "A cinematic drone shot of a misty mountain range during sunrise"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

with torch.no_grad():
    output_frames = model.generate(**inputs, max_new_tokens=512, num_frames=16)

# Save generated video
output_frames.save_video("mountain_sunrise.mp4", fps=24)
```

## License & Usage Notes
* **License:** Licensed under the open-source **Apache-2.0** license.
* **Hardware Requirements:** Requires a GPU with at least 40 GB VRAM (e.g., NVIDIA A100/H100) for local inference.

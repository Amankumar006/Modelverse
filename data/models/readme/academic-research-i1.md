# i1: A Simple and Fully Open Recipe for Strong Text-to-Image Models

## Model Overview
**i1** is a 3-billion-parameter open-source text-to-image diffusion model developed by researchers at **ZLab, Princeton University**. Introduced in June 2026 (*arXiv:2606.11289*), i1 addresses the lack of transparency in modern generative vision models by providing a completely open recipe: open model weights (1B and 3B variants), full training and inference code in PyTorch and JAX, data processing pipelines, and a massive 160M+ dataset of synthetically annotated image-caption pairs (`i1-captions`).

Developed through more than 300 systematic ablation experiments across 700,000+ TPU v6e compute hours, i1 demonstrates how principled choices in model architecture, text adapters, and dataset curation can achieve performance competitive with top-tier open-weight models at 1024x1024 resolution.

## Key Technical Features & Architecture
- **Diffusion Transformer Backbone:** Employs an XL/2-sized LightningDiT cross-attention backbone with Query-Key (QK) normalization and long skip connections for high-fidelity spatial generation.
- **Text Conditioning Adapter:** Integrates a T5-Gemma-2B text encoder, leveraging a larger adapter design to significantly boost prompt understanding and fine-grained text adherence.
- **Visual VAE:** Incorporates the FLUX.2 VAE for high-density latent encoding and decoding of 1024x1024 image resolution.
- **Synthetic Caption Pipeline:** Utilizes `i1-captions`, curated from 12 open datasets and re-captioned with detailed synthetic descriptions using Qwen3-VL-30B-A3B.
- **Dual PyTorch & JAX Implementations:** Includes full source code for training and inference across both JAX (TPU-optimized) and PyTorch (GPU-optimized) frameworks.

## Performance & Benchmarks
i1 substantially outpaces prior fully open-source baselines and achieves competitive alignment and visual quality against leading open-weight models across multiple standard benchmarks:
- **GenEval:** Evaluates compositional fidelity, object attributes, and spatial relationships.
- **DPG-Bench:** Measures compliance with complex multi-sentence prompts.
- **PRISM:** Assesses general visual quality, alignment, and aesthetic appeal.
- **CVTG-2K:** Tests in-image visual text generation performance.
- **LongText-Bench:** Evaluates adherence to extended, detailed descriptions.

## Quickstart & Usage

### 1. Environment Setup
```bash
conda create -n i1_infer python=3.11 -y
conda activate i1_infer

# Install dependencies
python -m pip install torch==2.6.0 --index-url https://download.pytorch.org/whl/cu124
python -m pip install numpy==1.26.4 pillow tqdm transformers==4.57.1 diffusers==0.35.1 accelerate safetensors sentencepiece
```

### 2. PyTorch Inference CLI
```bash
git clone https://github.com/zlab-princeton/i1
cd i1/torch_inference

# Generate image from prompt
python generate.py \
  --prompt "A serene mountain lake at sunrise, highly detailed, realistic oil painting style"
```

## Official Links & Resources
- **Project Page / Website:** [zlab-princeton.github.io/i1](https://zlab-princeton.github.io/i1/)
- **arXiv Preprint:** [arXiv:2606.11289](https://arxiv.org/abs/2606.11289)
- **Paper PDF:** [Download PDF](https://arxiv.org/pdf/2606.11289)
- **GitHub Repository:** [zlab-princeton/i1](https://github.com/zlab-princeton/i1)
- **Hugging Face Model Checkpoints:** [zlab-princeton/i1-3B](https://huggingface.co/zlab-princeton/i1-3B)
- **Hugging Face Dataset:** [zlab-princeton/i1-captions](https://huggingface.co/datasets/zlab-princeton/i1-captions)

# CogOmniControl: Reasoning-Driven Controllable Video Generation

**CogOmniControl** is a reasoning-driven framework designed for controllable video generation, developed by researchers at the **University of Macau (UM-Lab)** (Hongji Yang, Songlian Li, Yucheng Zhou, Xiaotong Zhao, Alan Zhao, Chengzhong Xu, Jianbing Shen).

Existing video diffusion models often struggle with abstract, sparse, or complex conditions—such as storyboard sketches, block-outs, or clay renders—frequently leading to a gap between human creative intent and the generated video output. CogOmniControl resolves this by factorizing the generation process into two core stages: **Creative Intent Cognition** and **Unified In-Context Synthesis**.

---

## 🔬 Architecture & Methodology

```
Sparse Input (Sketch / Render) ──► CogVLM (Intent Cognition) ──► Dense Reasoning Plan ──► CogOmniDiT (In-Context Video DiT) ──► Best-of-N Candidate Selection
```

1. **Creative Intent Cognition (CogVLM)**: Fine-tuned Vision-Language Model trained on authentic anime production and professional workflow data. Interprets sparse or abstract input conditions (rough storyboard sketches, clay renders) and converts them into dense, actionable reasoning plans.
2. **Unified Video Synthesis (CogOmniDiT)**: A Diffusion Transformer (DiT) architecture that unifies diverse control signals via in-context generation, guided directly by CogVLM reasoning outputs.
3. **Reinforcement Learning Alignment**: Aligns the diffusion sampling trajectory with VLM reasoning prompts using reinforcement learning optimization.
4. **Closed-Loop Best-of-N Harness**: CogVLM dynamically plans downstream evaluators to inspect candidate videos and select the output that best satisfies the original creative intent.

---

## 📊 Benchmarks & Performance

Evaluated on two novel benchmarks built on real-world professional production data:
- **CogReasonBench**: Benchmark measuring VLM reasoning accuracy, structural decomposition, and intent translation from sparse cues.
- **CogControlBench**: Evaluation suite testing controllable video generation under complex professional constraints (sketches, depth maps, pose vectors, multi-modal controls).

---

## 🚀 Quickstart & Usage

```bash
git clone https://github.com/um-lab/CogOmniControl.git
cd CogOmniControl
conda create -n cogomnicontrol python=3.10 -y
conda activate cogomnicontrol
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install transformers diffusers accelerate gradio opencv-python
```

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from diffusers import CogOmniDiTPipeline

# Step 1: Load CogVLM for Intent Cognition
vlm_model = AutoModelForCausalLM.from_pretrained("um-lab/CogVLM-Intent", torch_dtype=torch.float16).cuda()
vlm_tokenizer = AutoTokenizer.from_pretrained("um-lab/CogVLM-Intent")

sketch_image = "examples/storyboard_sketch.png"
prompt = "Animate this sketch into a dynamic combat sequence with cinematic lighting."

inputs = vlm_tokenizer(prompt, return_tensors="pt").to("cuda")
reasoning_plan = vlm_model.generate(**inputs, max_new_tokens=512)

# Step 2: Pass Reasoning Plan to CogOmniDiT for Video Synthesis
pipe = CogOmniDiTPipeline.from_pretrained("um-lab/CogOmniDiT", torch_dtype=torch.float16).to("cuda")
video_frames = pipe(
    prompt=reasoning_plan,
    control_image=sketch_image,
    num_frames=49,
    guidance_scale=6.0
).frames

pipe.save_video(video_frames, "output_cogomnicontrol.mp4")
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://um-lab.github.io/CogOmniControl/)
- [arXiv Paper (arXiv:2605.19995)](https://arxiv.org/abs/2605.19995)
- [Paper PDF Download](https://arxiv.org/pdf/2605.19995)
- [Hugging Face Paper Page](https://huggingface.co/papers/2605.19995)
- [GitHub Organization (UM-Lab)](https://github.com/um-lab)

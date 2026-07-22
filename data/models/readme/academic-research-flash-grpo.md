# Flash-GRPO: Efficient Alignment for Video Diffusion via One-Step Policy Optimization

**Flash-GRPO** is a breakthrough alignment framework for video diffusion models developed by researchers from **Zhejiang University** and presented at **ICML 2026** ([arXiv:2605.15980](https://arxiv.org/abs/2605.15980)). 

Standard Group Relative Policy Optimization (GRPO) for multi-billion parameter video diffusion models (e.g., 1.3B to 14B parameters) requires full-trajectory denoising sampling, rendering RL alignment prohibitively expensive (requiring hundreds of GPU days). **Flash-GRPO** transforms this process into a single-step policy optimization framework, achieving **up to 6× training acceleration** while matching or exceeding the alignment quality of full-trajectory training.

---

## 🔬 Methodology & Architecture

Flash-GRPO introduces two fundamental techniques to stabilize single-step policy optimization in video diffusion models:

1. **Iso-Temporal Grouping:** Eliminates *timestep-confounded variance* by enforcing prompt-wise temporal consistency. Candidate completions in a GRPO group are sampled at identical prompt and diffusion timestep configurations, decoupling policy performance from timestep difficulty.
2. **Temporal Gradient Rectification:** Neutralizes time-dependent scaling factors ($\lambda(t)$) across denoising timesteps. By rectifying gradient weights ($w(t) = 1/\lambda(t)$), gradient magnitudes remain uniform across the trajectory, ensuring monotonic reward improvement and training stability.

```
Prompt Input + Timestep t ───► Iso-Temporal Group Sampling (K completions) ───► Video Reward Model ───► Temporal Gradient Rectification ───► Policy Gradient Update
```

---

## 📊 Benchmarks & Performance Highlights

| Metric / Evaluation | Performance | Comparison |
| :--- | :--- | :--- |
| **Training Acceleration** | **6× Speedup** | vs. Full-Trajectory GRPO |
| **Wan2.1-1.3B Wall-Clock Time** | **~26 Hours** | 8× A100/H100 GPU node |
| **Supported Model Scales** | **1.3B – 14B Parameters** | Wan2.1, CogVideoX, HunyuanVideo |
| **VBench Alignment Quality** | **State-of-the-Art** | Exceeds sliding-window & full-trajectory baselines |

---

## 🚀 Quickstart & Usage

### Installation

```bash
git clone https://github.com/Shredded-Pork/Flash-GRPO.git
cd Flash-GRPO
pip install -r requirements.txt
```

### Python Example

```python
import torch
from flash_grpo import FlashGRPOTrainer, IsoTemporalConfig

# Initialize configuration for Wan2.1-1.3B backbone
config = IsoTemporalConfig(
    model_name="Wan-AI/Wan2.1-T2V-1.3B",
    group_size=4,
    rectify_gradients=True,
    learning_rate=1e-5,
)

# Instantiate Flash-GRPO Trainer
trainer = FlashGRPOTrainer(config=config)

# Run One-Step Policy Optimization
trainer.train(
    prompt_dataset="data/video_prompts.json",
    reward_model="video_reward_model",
    output_dir="./output/flash_grpo_wan2.1",
    epochs=3
)
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://shredded-pork.github.io/Flash-GRPO.github.io/)
- [arXiv Paper (arXiv:2605.15980)](https://arxiv.org/abs/2605.15980)
- [Paper PDF](https://arxiv.org/pdf/2605.15980.pdf)
- [GitHub Repository](https://github.com/Shredded-Pork/Flash-GRPO)
- [Hugging Face Paper Entry](https://huggingface.co/papers/2605.15980)

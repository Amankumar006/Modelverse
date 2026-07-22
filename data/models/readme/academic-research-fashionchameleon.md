# FashionChameleon: Real-Time Interactive Human-Garment Video Customization

**FashionChameleon** is a groundbreaking academic research framework for real-time, interactive human-garment video customization. Developed collaboratively by researchers from **Xiamen University**, **Zhejiang University**, and **Alibaba Group** (*Quanjian Song, Yefeng Shen, Mengting Chen, Hao Sun, Jinsong Lan, Xiaoyong Zhu, Bo Zheng, and Liujuan Cao*), FashionChameleon enables instant garment replacement and dynamic outfit switching during streaming video synthesis.

Built upon the open-weights **Wan2.2-TI2V-5B** diffusion transformer backbone, FashionChameleon generates customized 720p video at an unprecedented **23.8 FPS on a single NVIDIA H200 GPU**—delivering a **30× to 180× speedup** over existing video try-on and video customization baselines.

---

## 🔬 Methodology & Architecture

FashionChameleon addresses three major challenges in human-centric video generation: long latency, poor temporal motion coherence, and the inability to perform interactive multi-garment switches online.

```
Reference Person + Target Garment ───► In-Context Teacher Model ───► Streaming DMD ───► KV-Cache Rescheduling ───► Real-Time Video (23.8 FPS)
```

### Core Architecture Components
1. **Teacher Model with In-Context Learning:** Trained strictly on single reference-garment pairs using an intentional mismatch strategy to implicitly decouple body motion from garment identity.
2. **Streaming Distillation with Gradient-Reweighted DMD:** Fine-tunes the autoregressive diffusion pipeline into a low-step streaming model using *Gradient-Reweighted Distribution Matching Distillation (DMD)* to eliminate error accumulation and motion drift.
3. **Training-Free KV Cache Rescheduling:** Enables real-time interactive multi-garment switching during ongoing video generation via *Garment KV Refresh*, *Historical KV Withdraw*, and *Reference KV Disentangle*.

---

## 📊 Benchmarks & Performance

| Benchmark Metric | FashionChameleon Performance | Baseline Comparison | Status |
| :--- | :--- | :--- | :--- |
| **Inference Speed (720p)** | **23.8 FPS** (Single H200 GPU) | ~0.1 - 0.8 FPS (30x–180x speedup) | Verified |
| **Backbone Architecture** | Wan2.2-TI2V-5B | Standard Multi-Step Diffusion | Verified |
| **Benchmark Dataset** | HGC-Bench (240 Triplets) | Custom Evaluation Sets | Verified |
| **Interactive Switching** | Supported (Training-Free KV Cache) | Requires Retraining / Offline | Verified |

---

## 🚀 Quickstart & Code Usage

```bash
git clone https://github.com/QuanjianSong/FashionChameleon.git
cd FashionChameleon
pip install -r requirements.txt
```

```python
import torch
from fashionchameleon import FashionChameleonPipeline

# Load model pipeline initialized on Wan2.2-TI2V-5B backbone
pipeline = FashionChameleonPipeline.from_pretrained(
    "QuanjianSong/FashionChameleon",
    torch_dtype=torch.bfloat16
).to("cuda")

# Generate customized human-garment video stream
output = pipeline(
    reference_image="assets/person.png",
    garment_image="assets/red_jacket.png",
    prompt="A person wearing a stylish red leather jacket walking down a illuminated street",
    num_frames=81,
    height=720,
    width=1280,
    enable_kv_rescheduling=True,
    streaming=True
)

output.save("output_customized_video.mp4")
```

---

## 🔗 Official Links & Resources
- [Official Project Page](https://quanjiansong.github.io/projects/FashionChameleon/)
- [arXiv Paper (arXiv:2605.15824)](https://arxiv.org/abs/2605.15824)
- [Paper PDF Download](https://arxiv.org/pdf/2605.15824)
- [GitHub Repository](https://github.com/QuanjianSong/FashionChameleon)
- [Hugging Face Dataset (QuanjianSong/HGC-Bench)](https://huggingface.co/datasets/QuanjianSong/HGC-Bench)

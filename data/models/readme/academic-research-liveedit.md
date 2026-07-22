# LiveEdit: Real-Time Diffusion-Based Streaming Video Editing

**LiveEdit** is an open-source, diffusion-based streaming video editing framework developed collaboratively by researchers from **Tsinghua University** and **HKUST (Hong Kong University of Science and Technology)**. Accepted for presentation at **ECCV 2026** (arXiv:2606.26740), LiveEdit addresses the challenge of real-time, causal video manipulation by enabling chunk-by-chunk frame processing at approximately **12.66 FPS** on consumer-grade GPUs.

Built on top of the **Wan2.1-T2V-1.3B** foundation model, LiveEdit converts traditional offline (bidirectional) diffusion video editing models into a real-time unidirectional streaming system.

---

## 🔬 Key Technical Features & Architecture

```
Input Video Stream ──► Foundation Tuning ──► Teacher Forcing ──► DMD Distillation (4 steps) ──► Real-Time Streaming Video Output (~12.66 FPS)
```

1. **Real-Time Streaming Performance (~12.66 FPS):** Performs low-latency video editing on standard GPUs (e.g., RTX 4070 / RTX 4090) in real time.
2. **Causal Unidirectional Processing:** Eliminates the requirement to "peek" into future frames, rendering it suitable for live broadcasting, AR visual effects, and real-time streaming feeds.
3. **Three-Stage Distillation Pipeline:**
   - *Stage 1 (Foundation Tuning):* Trains a bidirectional model on video editing pairs to gain broad instruction-following editing capabilities.
   - *Stage 2 (Teacher Forcing):* Transitions the bidirectional backbone into a causal, chunk-wise autoregressive student model.
   - *Stage 3 (DMD Distillation):* Compresses multi-step diffusion sampling into 4 fast denoising steps via Diffusion Model Distillation.
4. **AR-Oriented Mask Cache:** Identifies static and unedited spatial-temporal regions across streaming video chunks and reuses their features, preventing background temporal flickering.

---

## 📊 Performance & Benchmarks

| Metric | Benchmark / Value | Status |
| :--- | :--- | :--- |
| **Inference Speed** | **~12.66 FPS** (on RTX 4070/4090) | Verified |
| **Denoising Steps** | **4 steps** (via DMD distillation) | Verified |
| **Base Backbone** | **Wan2.1-T2V-1.3B** | Verified |
| **Conference** | **ECCV 2026** | Verified |

---

## 🚀 Quickstart & Usage

```bash
git clone https://github.com/cp-cp/LiveEdit.git
cd LiveEdit
conda create -n liveedit python=3.10 -y
conda activate liveedit
pip install -r requirements.txt
```

```python
import torch
from liveedit.pipeline import LiveEditPipeline

# Load LiveEdit streaming model
pipeline = LiveEditPipeline.from_pretrained(
    base_model="wan_models/Wan2.1-T2V-1.3B",
    checkpoint="checkpoints/liveedit/ar-forcing_002000.pt",
    torch_dtype=torch.bfloat16
).to("cuda")

# Enable AR-oriented Mask Cache for background stability
pipeline.enable_mask_cache(cache_threshold=0.85)

# Process streaming video chunks sequentially
prompt = "Change the red currants to deep black grapes."
for chunk in input_stream:
    edited_chunk = pipeline.edit_chunk(
        video_chunk=chunk,
        prompt=prompt,
        num_inference_steps=4
    )
    output_stream.write(edited_chunk)
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://live-edit.github.io/)
- [arXiv Paper (arXiv:2606.26740)](https://arxiv.org/abs/2606.26740)
- [Paper PDF Download](https://arxiv.org/pdf/2606.26740.pdf)
- [GitHub Code Repository](https://github.com/cp-cp/LiveEdit)
- [Hugging Face Models](https://huggingface.co/cp-cp/LiveEdit)

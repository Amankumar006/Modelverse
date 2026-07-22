# Flex4DHuman: Flexible Multi-view Video Diffusion for 4D Human Reconstruction

**Flex4DHuman** is a generative AI framework for flexible multi-view video diffusion and 4D human reconstruction, developed by researchers from the **University of Washington**, **Zhejiang University**, and **Tencent**. Unlike conventional 4D reconstruction methods that depend heavily on explicit geometry priors like SMPL skeletal rigs, depth maps, or surface normals, Flex4DHuman leverages relative camera-pose conditioning within a multi-view video diffusion model. Given monocular or sparse multi-view video recordings of dynamic subjects, the model natively generates synchronized, dense multi-view videos suitable for dynamic 4D representations.

---

## 🔬 Architecture & Key Innovations

- **Pose-Conditioned Video Diffusion:** Transforms monocular or sparse multi-view video streams into synchronized, dense multi-view videos guided purely by relative camera poses.
- **Wan 2.1 1.3B Diffusion Backbone:** Built upon the Wan 2.1 1.3B text-to-video foundation model, retaining strong temporal coherence and visual appearance priors.
- **5-Axis Spatio-Temporal RoPE:** Employs an extended Rotary Positional Embedding (RoPE) across 5 axes—frame index, spatial coordinates (x, y), view index, and continuous SE(3) camera pose parameters—enabling precise camera-conditioned multi-view attention.
- **Three-Stage Curriculum Training:** Structured training strategy involving pose following, flexible reference-to-target view synthesis, and long-sequence temporal rollout.
- **Direct 4D Gaussian Splatting Integration:** The synthesized dense multi-view video outputs directly plug into downstream 4D Gaussian Splatting (4D-GS) optimization pipelines for real-time 4D avatar rendering.

```
Monocular / Sparse Video ──► Wan 2.1 1.3B + 5-Axis RoPE ──► Synchronized Dense Multi-View Video ──► 4D Gaussian Splatting
```

---

## 📊 Benchmarks & Performance

- **DNA-Rendering Dataset:** Achieves state-of-the-art performance in multi-view video synthesis measured by PSNR, SSIM, and LPIPS metrics.
- **ActorsHQ Dataset:** Demonstrates robust zero-shot novel view synthesis and temporal consistency across complex human motions.

---

## 🚀 Quickstart & Usage

```python
import torch
from flex4dhuman import Flex4DHumanPipeline
from flex4dhuman.utils import load_video, generate_camera_trajectory

# Initialize pipeline with pre-trained Wan 2.1 1.3B backbone weights
model_id = "Andy-Cheng/Flex4DHuman"
pipe = Flex4DHumanPipeline.from_pretrained(model_id, torch_dtype=torch.float16).to("cuda")

# Load input monocular or sparse multi-view video
input_video = load_video("examples/sample_human_video.mp4")

# Define target camera trajectory (relative SE(3) poses)
target_poses = generate_camera_trajectory(num_views=16, radius=2.5, height=1.0)

# Run multi-view video diffusion generation
with torch.no_grad():
    multiview_videos = pipe(
        video=input_video,
        target_poses=target_poses,
        num_inference_steps=50,
        guidance_scale=7.5
    )

# Save multi-view video outputs for 4D-GS reconstruction
multiview_videos.save("outputs/synchronized_multiview.mp4")
```

---

## 🔗 Official Links & Resources
- [Official Project Page](https://andy-cheng.github.io/Flex4DHuman/)
- [arXiv Paper (arXiv:2606.13655)](https://arxiv.org/abs/2606.13655)
- [Paper PDF Download](https://arxiv.org/pdf/2606.13655)
- [GitHub Code Repository](https://github.com/Andy-Cheng/Flex4DHuman)
- [Hugging Face Dataset](https://huggingface.co/datasets/andaba/multi-view_caption)

# VideoMDM: 3D Human Motion Generation from 2D Supervision

VideoMDM is a diffusion-based generative framework developed by Technion (Israel Institute of Technology) and NVIDIA Research that learns 3D human motion priors directly from 2D pose trajectories extracted from monocular videos—eliminating the need for scarce 3D ground truth motion capture datasets.

---

## 🔬 Methodology & Architecture

Traditional 3D motion generators rely on expensive 3D MoCap datasets (like AMASS), limiting motion diversity and scaling. VideoMDM leverages abundant in-the-wild monocular videos by combining:

1. **Monocular 2D Pose Extraction**: Extracts multi-frame 2D skeletal keypoint trajectories from web videos.
2. **Differentiable 2D-to-3D Projection**: Projects 3D motion diffusion samples onto camera planes to compute 2D reprojection loss.
3. **Motion Diffusion Prior**: A UNet-based motion diffusion architecture trained via 2D reprojection supervision.

```
Monocular In-The-Wild Video ───► 2D Keypoint Tracker ┐
                                                     ├──► Differentiable Reprojection Loss ───► 3D Motion Generator (VideoMDM)
3D Motion Diffusion Samples ───► Camera Projection ──┘
```

---

## 🚀 Quickstart & Installation

```bash
git clone https://github.com/Amir-Mann/VideoMDM_release.git
cd VideoMDM_release
pip install -r requirements.txt
```

```python
import torch
from videomdm import VideoMDMGenerator

# Load pretrained VideoMDM model
model = VideoMDMGenerator.from_pretrained("Amir-Mann/VideoMDM_release")

# Sample 3D human motion sequence from text prompt
motion_3d = model.sample(
    text_prompt="A person performing a backflip and landing smoothly",
    num_frames=120,
    fps=30
)

print("Generated 3D motion shape:", motion_3d.shape)
```

---

## 🔗 Official Links & Papers
- [VideoMDM Official Website](https://videomdm.github.io/)
- [Research Paper PDF](https://videomdm.github.io/VideoMDM.pdf)
- [arXiv Preprint](https://arxiv.org/abs/2606.13364)
- [GitHub Repository](https://github.com/Amir-Mann/VideoMDM_release)

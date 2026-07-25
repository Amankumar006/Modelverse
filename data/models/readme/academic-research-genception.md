# GenCeption: Video Generation Models as General-Purpose Vision Learners

## Model Overview
**GenCeption** is a unified, feed-forward general-purpose vision model that repurposes a **text-to-video generative diffusion model** into a single multi-task visual perception system. Rather than building separate task-specific networks for each vision problem, GenCeption demonstrates that video generative pretraining provides a rich and universal visual representation that can be steered by text instructions to perform diverse visual perception tasks — achieving state-of-the-art performance across depth estimation, surface normals, pose estimation, semantic segmentation, keypoint detection, and 4D grounding from a single unified model.

---

## 🔬 Technical Approach

GenCeption's key insight is that **video generative models** implicitly learn rich scene understanding through their training objective — understanding geometry, motion, occlusions, and appearance across frames. GenCeption repurposes these learned representations into a discriminative perception model steered by natural language task specifications.

---

## 🎯 Supported Tasks

| Task | Description |
|:---|:---|
| **Depth Estimation** | Per-pixel metric or relative depth from a single image |
| **Surface Normals** | Surface orientation estimation for 3D scene understanding |
| **Pose Estimation** | Human body pose keypoint localization |
| **Semantic Segmentation** | Per-pixel class assignment across object categories |
| **Keypoint Detection** | Structural keypoint localization for objects and people |
| **4D Grounding** | Spatiotemporal localization in video (3D space + time) |

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Unified Multi-Task Model** | Single feed-forward model handles 6+ perception tasks without task-specific fine-tuning |
| **Text-Steered Inference** | Tasks specified via natural language instructions at inference time |
| **4D Grounding** | Supports spatiotemporal grounding across video frames |
| **No Task-Specific Training** | Video generative pretraining alone provides sufficient visual representation |
| **SOTA Performance** | Outperforms specialist models on multiple visual perception benchmarks |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **Project Page** | [genception.github.io](https://genception.github.io/) |

---

## 💡 Significance

GenCeption challenges the paradigm of building task-specific vision models, demonstrating that **generative pretraining is a superior inductive bias** for visual perception. This connects large-scale video generation research directly to practical computer vision applications.

# GenCeption: Video Generation Models as General-Purpose Vision Learners

GenCeption is a research paradigm that demonstrates how text-to-video generative diffusion models can be repurposed into single feed-forward, general-purpose vision models steered purely by text instructions.

---

## 💡 Key Concept & Applications

By framing visual perception tasks (depth estimation, segmentation, optical flow, surface normals, pose tracking) as conditioned video generation tasks, GenCeption achieves state-of-the-art vision performance without task-specific architectural heads.

| Vision Task | Instruction Prompt | Output Quality (mIoU / RMSE) |
| :--- | :--- | :--- |
| **Monocular Depth** | *"Generate dense depth map for frame sequence"* | **0.041 RMSE** |
| **Instance Segmentation** | *"Segment all dynamic objects in the scene"* | **64.2 mIoU** |
| **Optical Flow** | *"Estimate motion vectors across consecutive frames"* | **1.82 EPE** |

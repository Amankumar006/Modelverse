# LocateAnything: Universal Visual Grounding & Spatial Localization

## Model Overview
**LocateAnything** is a high-speed, high-accuracy vision-language model developed by **NVIDIA Learning and Perception Research (LPR) Lab** (Shihao Wang, Shilong Liu, et al., accepted to ECCV 2026). It introduces **Parallel Box Decoding (PBD)** to predict bounding box coordinates and keypoints as atomic multi-token units in a single forward pass, achieving up to 10× higher throughput compared to traditional coordinate token models.

---

## Key Features
- **Parallel Box Decoding (PBD):** Decodes bounding box coordinates atomically in a single pass rather than sequentially token-by-token.
- **High Throughput & Speed:** Delivers up to 10× higher decoding throughput (up to 12.7 boxes/sec on an NVIDIA H100 GPU) supported by custom `la_flash` CUDA kernels.
- **Hybrid Inference Mechanism:** Uses Fast Mode (PBD) by default with automatic fallback to Slow Mode for complex edge cases.
- **LocateAnything-Data Corpus:** Pretrained on 138+ million training samples and 785+ million bounding box annotations across natural scenes, GUI screenshots, and OCR.
- **Universal Multi-Task Localization:** Supports open-set object detection, GUI element grounding, scene text OCR localization, and visual prompt tuning via LoRA.

---

## Verified Project Links
- **Project Website:** [https://research.nvidia.com/labs/lpr/locateanything/](https://research.nvidia.com/labs/lpr/locateanything/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.27365](https://arxiv.org/abs/2605.27365)
- **GitHub Repository:** [https://github.com/NVlabs/Eagle](https://github.com/NVlabs/Eagle)
- **Hugging Face Model:** [https://huggingface.co/nvidia/LocateAnything-3B](https://huggingface.co/nvidia/LocateAnything-3B)

---

## Performance & Benchmarks
- **COCO Object Detection:** 54.7 F1@mIoU
- **LVIS Long-Tailed Object Detection:** 50.7 F1@mIoU
- **RefCOCOg Referring Expression Grounding:** 78.7 (val) / 76.7 (test-dev) / 77.6 (test-std)

# MedGemma 1.5 4B: Multimodal Open Medical VLM

## Model Overview
**MedGemma 1.5 4B** (`google/medgemma-1.5-4b-it`) is an open-weight, multimodal vision-language model developed by **Google DeepMind** and **Google Research** as part of the Health AI Developer Foundations (HAI-DEF) program.

Built upon the Gemma 3 architecture and integrating MedSigLIP (a specialized medical vision encoder), MedGemma 1.5 4B natively processes 2D/3D radiology scans (CT/MRI) and multi-patch whole-slide histopathology images (WSI), running efficiently on workstation or local edge environments.

---

## Key Features
- **High-Dimensional Medical Imaging Support:** Native processing of 3D volumetric CT/MRI scans and whole-slide histopathology alongside 2D clinical imaging.
- **Longitudinal Visual Reasoning:** Compares sequential medical images (prior vs current X-rays) to track disease progression.
- **Clinical Record Structuring:** Extracts structured FHIR and SOAP data from unstructured physician notes and lab reports.
- **MedSigLIP Integration:** Medically tuned SigLIP vision encoder optimized across radiology, pathology, and dermatology.
- **Compute-Efficient Deployment:** 4B parameter footprint optimized for low-latency inference on local workstations and Apple Silicon (MLX).

---

## Verified Project Links
- **arXiv Paper:** [https://arxiv.org/abs/2604.05081](https://arxiv.org/abs/2604.05081)
- **GitHub Repository:** [https://github.com/Google-Health/medgemma](https://github.com/Google-Health/medgemma)
- **Hugging Face Model:** [https://huggingface.co/google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it)

---

## Benchmarks & Performance
- **MedQA (USMLE 4-option):** 64.4% (up from 50.7% in MedGemma 1 4B).
- **MedMCQA:** 55.7%.
- **PubMedQA:** 73.4%.

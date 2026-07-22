# RDM: Representation Distribution Matching for One-Step Visual Generation

## Model Overview
**Representation Distribution Matching (RDM / iRDM)** is a paradigm for training state-of-the-art one-step visual generation models developed by researchers from **EPFL (VITA Lab)**, **Valeo.ai**, and **Sorbonne Université** (Lanfeng Judge, et al.). It matches feature distributions between generated and reference images using Maximum Mean Discrepancy (MMD) with Nyström estimation across a battery of frozen pretrained encoders.

Post-training multi-step diffusion models (such as FLUX.2 Klein) with RDM distills them into single-step generators that match or exceed the visual quality and prompt adherence of their multi-step teacher models.

---

## Key Features
- **Representation Distribution Matching (RDM):** Directly matches generated image distributions with real image feature distributions using MMD across frozen pretrained visual encoders.
- **Improved RDM (iRDM):** Combines within-batch repulsion with Nyström landmark estimation for efficient feature attraction.
- **Multi-Encoder Battery Defense:** Evaluated across a battery of 14 frozen encoders (SW_r14 metric) to prevent model representation gaming.
- **Single-Step FLUX.2 Distillation:** Post-trains FLUX.2 Klein into a 1-step generator outperforming its 4-step teacher on key visual benchmarks.
- **Large-Batch MMD Estimation:** Utilizes large batch training to ensure stable gradient estimation for single-step generation.

---

## Verified Project Links
- **Project Website:** [https://alan-lanfeng.github.io/rdm/](https://alan-lanfeng.github.io/rdm/)
- **arXiv Paper:** [https://arxiv.org/abs/2607.02375](https://arxiv.org/abs/2607.02375)
- **GitHub Repository:** [https://github.com/vita-epfl/RDM](https://github.com/vita-epfl/RDM)
- **Hugging Face Model:** [https://huggingface.co/epfl-vita/flux2-klein-1step-rdm](https://huggingface.co/epfl-vita/flux2-klein-1step-rdm)

---

## Benchmarks & Results
- **GenEval (FLUX.2 Klein 1-Step):** 0.826 score (vs. 0.794 for the 4-step teacher model).
- **PickScore (FLUX.2 Klein 1-Step):** 22.76 (vs. 22.58 for teacher model).
- **Human Preference:** 71.2% preference win-rate over prior single-step diffusion baselines.

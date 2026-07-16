# MedGemma 1.5 4B

## Model Overview
**MedGemma 1.5 4B** is a specialized, multimodal open-weights model developed by Google DeepMind, released on January 13, 2026. Built upon the Gemma 3 architecture, it is part of the Health AI Developer Foundations (HAI-DEF) collection. This 4-billion parameter model is optimized specifically for medical and healthcare AI applications, featuring advanced support for high-dimensional medical imaging analysis.

## Capabilities
MedGemma 1.5 4B introduces several major capabilities tailored for the healthcare domain:
- **High-Dimensional Medical Imaging:** Unlike earlier 2D-focused models, it natively processes 3D volumes, including CT scans, MRI scans, and longitudinal X-rays.
- **Histopathology Analysis:** Capable of anatomical localization and Whole Slide Image (WSI) parsing for complex pathology tasks.
- **Structured Report Generation:** Can generate structured medical reports directly from clinical image data.
- **Medical Text Reasoning:** Highly accurate in medical text reasoning and electronic health record (EHR) information retrieval.
- **Compute Efficiency:** At 4B parameters with an 8k context window, it is highly optimized to run on consumer hardware (laptops, local workstations) while maintaining robust performance.

## Example Use Cases
- **Medical Image Analysis:** Assisting researchers in parsing and analyzing 3D MRI or CT scans to identify anatomical structures.
- **EHR Data Extraction:** Retrieving and summarizing complex patient histories from Electronic Health Records.
- **Pathology Research:** Analyzing Whole Slide Images (WSI) to detect anomalies or patterns in tissue samples.
- **Healthcare App Development:** Serving as the foundational model for developers building local, privacy-preserving health AI applications.

## Performance & Benchmarks
MedGemma 1.5 4B has demonstrated significant generational leaps over its predecessor (MedGemma 1 4B):
- **Pathology Imaging:** Achieved a **47% macro F1 gain** in whole-slide pathology imaging tasks.
- **Anatomical Localization:** Delivered a **35% increase in Intersection over Union (IoU)** for anatomical localization on chest X-rays.

## Intended Use & Limitations
- **Developer Tool, Not a Medical Device:** MedGemma 1.5 is intended to accelerate the development of healthcare AI applications. It is **not clinical-grade**, not an approved medical device, and must not be used to directly inform clinical diagnoses, patient management, or treatment decisions.
- **Verification Required:** All model outputs should be considered preliminary and require validation by qualified medical professionals.
- **Licensing:** Released as open-weights under the Gemma Terms of Use, allowing for self-hosted, local deployments.

## About Google DeepMind
Google DeepMind is a leading AI research laboratory dedicated to solving intelligence to advance science and benefit humanity. Through initiatives like AlphaFold and MedGemma, DeepMind is actively pioneering the intersection of artificial intelligence and healthcare, providing researchers and developers with cutting-edge tools to drive medical innovation.

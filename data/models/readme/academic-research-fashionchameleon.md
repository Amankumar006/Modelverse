## Model Overview
FashionChameleon is an academic research model for real-time and interactive human-garment video customization. Developed by researchers from Zhejiang University, Xiamen University, and Alibaba Group, this framework utilizes advanced video diffusion techniques to perform fine-grained clothing changes in videos at exceptionally low latency. Built upon the Wan2.2-TI2V-5B backbone, it can generate these modifications in real-time, achieving approximately 23.8 FPS on a single H200 GPU—making it 30 to 180 times faster than existing baselines.

## Capabilities
- **Real-Time Video Generation:** Processes and generates human-garment video customization at ~23.8 FPS, significantly accelerating workflow compared to traditional methods.
- **Teacher Model with In-Context Learning:** Employs a teacher model trained on single-reference-garment pairs. It maintains motion coherence during garment transitions by implicitly learning from mismatched reference and garment images during training.
- **Streaming Distillation:** Ensures consistency across long-form video generation by fine-tuning the model with in-context teacher forcing and gradient-reweighted distribution matching distillation (DMD). This mitigates error accumulation and prevents motion drift.
- **Training-Free KV Cache Rescheduling:** This core interactivity mechanism enables multi-garment customization during the generation process itself. It actively manages the Key-Value (KV) cache via garment KV refresh, historical KV withdraw, and reference KV disentangle techniques.

## Example Use Cases
- **E-Commerce & Virtual Try-On:** Allows shoppers to visualize different clothing items dynamically in video format, changing outfits instantaneously.
- **Digital Content Creation:** Empowers creators and editors to modify subject outfits in post-production with minimal latency.
- **Interactive Advertising:** Enables the delivery of highly personalized video advertisements where the apparel showcased adjusts in real-time based on user preferences.

## Performance & Benchmarks
FashionChameleon demonstrates state-of-the-art performance in inference speed and consistency for video generation tasks:
- **Frame Rate:** Achieves ~23.8 FPS on a single H200 GPU for human-garment customization.
- **Efficiency:** Operates 30–180 times faster than contemporary baseline methods without compromising output fidelity.
- **Stability:** The integration of gradient-reweighted distribution matching distillation effectively reduces error accumulation during long-form video synthesis.

## Intended Use & Limitations
**Intended Use:** Designed primarily for academic research and application exploration within virtual try-on, interactive content creation, and synthetic media enhancement.
**Limitations:** Being an academic research model, it is tailored towards generating modifications within its domain (human garments) and its capabilities might be bounded by the fidelity of the input video and the capacity of the Wan2.2-TI2V-5B backbone. Specific contexts beyond standard human pose and clothing may yield unpredictable results. 

## About Academic/Research
This model is the product of a collaborative academic research effort involving Zhejiang University, Xiamen University, and the Alibaba Group. The primary developers and researchers include Quanjian Song, Yefeng Shen, Mengting Chen, Hao Sun, Jinsong Lan, Xiaoyong Zhu, Bo Zheng, and Liujuan Cao. The research aims to push the boundaries of real-time multi-modal generative AI, making robust tools accessible for academic and community exploration.

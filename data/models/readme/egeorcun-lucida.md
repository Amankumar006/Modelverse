# Lucida: Precision Background Removal That Keeps What Matters

## Model Overview
**Lucida** is a state-of-the-art **BiRefNet-based image matting model** fine-tuned specifically for the cases where general-purpose background removers fail: semi-transparent glass, camouflaged subjects, logos and typography with soft shadows, glow/VFX effects, illustrations, and print-style designs. Trained iteratively across 7 versions on ~52,882 image/alpha pairs spanning 9 specialized categories, Lucida v7 achieves the **lowest overall MAE (0.0257) of any model measured** — including commercial APIs.

---

## 📊 Benchmark Results (MAE — Lower is Better)

| Category (n) | **Lucida v7** | InSPyReNet | Ideogram* | RMBG-2.0 | BiRefNet-HR |
|:---|:---:|:---:|:---:|:---:|:---:|
| Camouflage (25) | **0.0270** | 0.0582 | 0.1179 | 0.1405 | 0.0752 |
| Transparent (25) | 0.0358 | 0.0725 | **0.0343** | 0.0741 | 0.0687 |
| Complex (29) | 0.0484 | **0.0110** | 0.1046 | 0.0241 | 0.0385 |
| Thin (36) | 0.0322 | **0.0166** | 0.0521 | 0.0180 | 0.0196 |
| Hair (40) | 0.0093 | 0.0069 | 0.0112 | **0.0045** | 0.0048 |
| Text (12) | **0.0091** | 0.0181 | 0.0123 | 0.0173 | 0.0207 |
| FX (12) | 0.0180 | 0.0269 | **0.0165** | 0.0268 | 0.0272 |
| Illustration (12) | **0.0092** | 0.0242 | 0.0215 | 0.0125 | 0.0157 |
| Design (12) | **0.0235** | 0.0587 | 0.0518 | 0.0478 | 0.0544 |
| **OVERALL (203)** | **0.0257** | 0.0295 | 0.0507 | 0.0401 | 0.0346 |

*Ideogram = fal.ai Ideogram remove-background (commercial API)

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Best Overall Accuracy** | MAE 0.0257 — lowest error of any measured model, commercial or open |
| **Camouflage Champion** | 2x better than best open model; 4.4x better than commercial reference |
| **Print Design & Text Logos** | 2x+ better than all competitors including commercial APIs |
| **9 Specialized Categories** | Glass, camouflage, complex, thin, hair, text, VFX, illustration, print designs |
| **ComfyUI Integration** | Distributed in ComfyUI official BiRefNet collection as `lucida.safetensors` |

---

## 🔧 Usage

```python
from transformers import AutoModelForImageSegmentation
model = AutoModelForImageSegmentation.from_pretrained("egeorcun/lucida", trust_remote_code=True)
```

Recommended input resolution: **1024×1024**. Loadable with HuggingFace `transformers`.

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **GitHub** | [github.com/egeorcun/lucida](https://github.com/egeorcun/lucida) |
| **HuggingFace** | [huggingface.co/egeorcun/lucida](https://huggingface.co/egeorcun/lucida) |
| **Live Demo** | [HuggingFace Space (ZeroGPU)](https://huggingface.co/spaces/egeorcun/lucida-demo) |
| **ComfyUI** | [Comfy-Org/BiRefNet](https://huggingface.co/Comfy-Org/BiRefNet) |

---

## 📜 License

**MIT License** — weights are released under MIT, suitable for commercial use (see repo for training data license notes).

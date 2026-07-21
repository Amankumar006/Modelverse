# Lucida: High-Fidelity Background Removal Fine-Tune

Lucida is an open-source fine-tune of **BiRefNet** designed specifically for difficult edge cases in background removal: transparent glass, camouflage, fine text, neon glows, and intricate line art.

---

## 🎨 Features & Preserved Details

| Object Category | Standard Removers | Lucida BiRefNet |
| :--- | :--- | :--- |
| **Glass / Reflections** | Erased or opaque | **Semitransparent alpha channel preserved** |
| **Fine Text & Line Art** | Jagged borders | **Crisp vector-like edge preservation** |
| **Camouflage Objects** | Missed boundary | **Accurate contrast separation** |
| **Glow & Smoke Effects** | Clipped out | **Smooth alpha gradient falloff** |

---

## 🚀 Quickstart

```python
from transformers import AutoModelForImageSegmentation
from PIL import Image
import torch

# Load Lucida fine-tuned BiRefNet
model = AutoModelForImageSegmentation.from_pretrained("egeorcun/lucida", trust_remote_code=True)

image = Image.open("input_sample.jpg")
output_mask = model.remove_background(image)
output_mask.save("result_transparent.png")
```

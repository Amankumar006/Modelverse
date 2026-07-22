# MuSViT: Music Score Vision Transformer Foundation Model

**MuSViT** (Music Score Vision Transformer) is the first domain-specific foundation vision model designed explicitly for **Optical Music Recognition (OMR)** and symbolic sheet music representation. Developed by the Pattern Recognition and Artificial Intelligence Group (**PRAIG**) at the University of Alicante and accepted at **ECCV 2026**.

Standard general-purpose vision foundation models (like DINOv2 or CLIP) are optimized for natural images and frequently struggle to capture the complex, fine-grained 2D spatial layouts of sheet music—such as staff line alignments, notehead pitches, and polyphonic symbols. **MuSViT** addresses this gap by utilizing a Vision Transformer backbone with 2D sinusoidal positional encodings, pre-trained via Masked Autoencoders (MAE) on **9.7 million sheet music pages** from the International Music Score Library Project (IMSLP).

---

## 🔬 Architecture & Methodology

- **Vision Transformer Backbone:** Built on a ViT-Base architecture (12 Transformer layers, 768 projection dimensions, 16x16 patch size, ~86M parameters).
- **2D Sinusoidal Positional Encodings:** Replaces standard 1D positional encodings with explicit 2D sinusoidal encodings to capture both horizontal temporal progression and vertical pitch relationships across staves.
- **Two-Stage Curriculum Pre-training:**
  1. *Warm-up Phase:* Pre-trained on synthetic typeset scores (DeepScoresV2) to initialize baseline feature representations and prevent dimensional collapse.
  2. *Scale Phase:* Masked Autoencoder (MAE) self-supervised training across 9.7M real-world scanned pages from IMSLP.
- **Task-Agnostic Feature Embeddings:** Outputs high-dimensional embeddings suitable for linear probing, fine-tuning, or zero-shot feature extraction across diverse downstream music recognition tasks.

```
Sheet Music Image (1024x1024) ──► 16x16 Patching + 2D Positional Enc ──► 12-Layer ViT MAE Encoder ──► [1, 4097, 768] Embeddings
```

---

## 🎯 Downstream Applications & Benchmarks

| Downstream Task | Performance & Comparison |
| :--- | :--- |
| **Full-Page & Staff OMR** | Significantly outperforms general vision backbones (DINOv2/v3, ViT-Base) on symbolic music transcription. |
| **Music Symbol Detection** | Achieves top accuracy in detecting clefs, key signatures, noteheads, and rests. |
| **Score Difficulty Classification** | Superior linear-probe accuracy when categorizing score complexity across classical repertoires. |

---

## 🚀 Quickstart Usage

MuSViT can be loaded directly via the Hugging Face `transformers` library:

```python
import torch
from transformers import ViTModel
from PIL import Image
from torchvision import transforms as T

# 1. Load the pre-trained MuSViT foundation model
model = ViTModel.from_pretrained('PRAIG/musvit', trust_remote_code=True)
model.eval()

# 2. Preprocess input sheet music (Resize or Pad to 1024x1024)
image_path = 'sheet_music_sample.png'
image = Image.open(image_path).convert("RGB")

transform = T.Compose([
    T.Resize([1024, 1024]),
    T.ToTensor()
])

input_tensor = transform(image).unsqueeze(0)  # Shape: [1, 3, 1024, 1024]

# 3. Extract feature representations
with torch.no_grad():
    outputs = model(input_tensor)
    embeddings = outputs.last_hidden_state  # Shape: [1, 4097, 768]

print("Successfully extracted MuSViT embeddings:", embeddings.shape)
```

---

## 🔗 Official Links & Resources

- [Official Project Webpage](https://grfia.dlsi.ua.es/musvit/)
- [arXiv Paper (arXiv:2606.31811)](https://arxiv.org/abs/2606.31811)
- [Paper PDF Download](https://arxiv.org/pdf/2606.31811)
- [GitHub Code Repository](https://github.com/OMR-PRAIG-UA-ES/MuSViT)
- [Hugging Face Model Card (`PRAIG/musvit`)](https://huggingface.co/PRAIG/musvit)

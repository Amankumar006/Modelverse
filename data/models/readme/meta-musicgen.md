# MusicGen: Meta's Open-Source Music Generation Model

## Model Overview
**MusicGen** is Meta AI's open-source music generation model, released in June 2023. Based on a single-stage autoregressive transformer, MusicGen generates high-quality music from text descriptions and optional melody conditioning. Unlike prior music generation models that required multiple cascaded models or complex pipelines, MusicGen simplifies the process with a single transformer decoder operating on Encodec audio tokens. It was among the first high-quality open-source music generation models publicly released.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Single-Stage Generation** | Generates music in one pass without cascaded models |
| **Melody Conditioning** | Can generate music that follows a provided melody or hummed tune |
| **Multiple Model Sizes** | Available in 300M, 1.5B, and 3.3B parameter variants |
| **Open Weights** | Fully open-source under MIT license on HuggingFace |
| **EnCodec Based** | Uses Meta's EnCodec neural audio codec as the token representation |

---

## 📊 Model Variants

| Model | Parameters | Notes |
|:---|:---:|:---|
| MusicGen Small | 300M | Fastest inference |
| MusicGen Medium | 1.5B | Balanced quality/speed |
| MusicGen Large | 3.3B | Highest quality |
| MusicGen Melody | 1.5B | Includes melody conditioning |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **HuggingFace** | [facebook/musicgen-large](https://huggingface.co/facebook/musicgen-large) |
| **GitHub** | [facebookresearch/audiocraft](https://github.com/facebookresearch/audiocraft) |
| **Paper** | [arXiv:2306.05284](https://arxiv.org/abs/2306.05284) |
| **Demo** | [HuggingFace Space](https://huggingface.co/spaces/facebook/MusicGen) |

---

## 📜 License

**MIT License** — Fully open-source for commercial and non-commercial use.

# Sora: OpenAI's Text-to-Video World Model

## Model Overview
**Sora** is OpenAI's groundbreaking text-to-video generation model announced in February 2024 and publicly released in December 2024. Sora can generate realistic and imaginative videos up to one minute long from text prompts, as well as extend existing videos and generate videos from still images. Trained as a "world simulator," Sora demonstrates emergent understanding of physical world dynamics, object permanence, and spatiotemporal consistency beyond prior video generation systems.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **High-Fidelity Video** | Generates videos up to 1080p resolution, up to 60 seconds long |
| **Physical World Understanding** | Demonstrates emergent understanding of physics, object interactions, and world dynamics |
| **Multiple Input Modes** | Text-to-video, image-to-video, video-to-video, and video extension |
| **Temporal Consistency** | Maintains character identity, lighting, and scene coherence across long sequences |
| **Storyboard Support** | Generates videos with multiple shots based on narrative prompts |

---

## 🛡️ Technical Architecture

Sora is a **diffusion transformer** that operates on **video and image patches** (similar to Vision Transformers). The model uses a **spacetime compression network** to compress videos into a lower-dimensional latent space, followed by a transformer model that denoises patches of latents.

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **Product Page** | [openai.com/sora](https://openai.com/sora) |
| **Technical Report** | [Video generation models as world simulators](https://openai.com/research/video-generation-models-as-world-simulators) |

---

## 📜 License & Access

**Proprietary** — Available to ChatGPT Plus and Pro subscribers (Dec 2024). Not available via API as of initial launch.

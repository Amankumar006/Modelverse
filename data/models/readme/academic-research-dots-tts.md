# Dots TTS (`dots.tts`): Continuous Space Text-to-Speech Foundation Model

**Dots TTS** (`dots.tts`) is a 2-billion parameter, fully continuous, end-to-end autoregressive text-to-speech (TTS) foundation model developed by **RedNote HiLab** (the AI research division of Xiaohongshu).

Traditional TTS models often rely on discrete speech codec tokens (such as EnCodec or SoundStream), which can introduce acoustic information loss similar to image pixelation. In contrast, **Dots TTS** operates entirely within a **continuous latent space**, using a 48 kHz AudioVAE combined with an autoregressive flow-matching head over a Qwen2.5-1.5B LLM backbone. This design achieves exceptionally high acoustic fidelity, natural intonation, and superior zero-shot speaker cloning.

---

## 🔬 Key Features & Architecture

- **Fully Continuous Latent Representation:** Operates over continuous audio embeddings via a high-resolution 48 kHz AudioVAE, eliminating discrete tokenization artifacts.
- **Qwen2.5 Backbone + Flow-Matching Acoustic Head:** Combines semantic reasoning capabilities of a Qwen2.5 LLM backbone with autoregressive flow-matching for detailed audio synthesis.
- **Self-Corrective Alignment (SCA):** Incorporated into the `dots.tts-soar` model variant to minimize alignment drift and enhance speaker identity preservation.
- **MeanFlow Low-Latency Distillation:** Powers `dots.tts-mf`, enabling few-step inference for real-time speech generation with first-packet latency as low as **54 ms**.
- **Multilingual Zero-Shot Voice Cloning:** Supports 24 languages with prompt-based zero-shot voice cloning from short audio reference clips.

```
Text Input + Audio Reference Prompt ───► Qwen2.5-1.5B LLM ───► Flow-Matching Acoustic Head ───► 48kHz AudioVAE Decoder ───► High-Fidelity Audio
```

---

## 📊 Model Variants & Checkpoints

| Checkpoint Name | Purpose & Performance |
| :--- | :--- |
| **`dots.tts-soar`** | **Recommended Default.** Refined via Self-Corrective Alignment for highest fidelity and speaker similarity. |
| **`dots.tts-mf`** | **Real-Time Streaming.** Distilled with MeanFlow for ultra-fast generation (54ms first-packet latency). |
| **`dots.tts-base`** | **Base Foundation Model.** Pretrained 2B checkpoint for fine-tuning. |

---

## 🚀 Quickstart & Code Usage

```bash
pip install dots.tts
```

```python
from dots_tts.runtime import DotsTtsRuntime
import soundfile as sf

# Load pre-trained model (e.g. dots.tts-soar)
runtime = DotsTtsRuntime.from_pretrained("rednote-hilab/dots.tts-soar")

# Generate speech from text and prompt audio
audio = runtime.synthesize(
    text="Welcome to the future of continuous space text-to-speech synthesis.",
    prompt_audio="reference_voice.wav",
    prompt_text="Transcript of reference voice sample."
)

# Export audio file at 48kHz
sf.write("output.wav", audio, samplerate=48000)
print("Speech synthesis complete: output.wav")
```

---

## 🔗 Paper & Resources
- [Official Project Page & Demos](https://rednote-hilab.github.io/dots.tts-demo/)
- [arXiv Paper (arXiv:2606.07080)](https://arxiv.org/abs/2606.07080)
- [Paper PDF Download](https://arxiv.org/pdf/2606.07080.pdf)
- [GitHub Repository](https://github.com/rednote-hilab/dots.tts)
- [Hugging Face Model Collection](https://huggingface.co/collections/rednote-hilab/dotstts)

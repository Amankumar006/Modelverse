# NAVA: Native Audio-Visual Alignment for Generation

**NAVA** (Native Audio-Visual Alignment for Generation) is a 6.3-billion parameter multimodal foundation model developed by **Baidu ERNIE Research**. It synthesizes temporally synchronized and semantically coherent 720p video alongside full stereo audio directly from text or image prompts in a single unified generation pass.

Traditional multimodal video models typically employ either "dual-tower" designs (generating video and audio independently before attempting post-hoc alignment) or "unified tri-modal" architectures (mixing text, audio, and visual representations across all transformer layers). NAVA introduces an **Align-then-Fuse MMDiT** (Multi-Modal Diffusion Transformer) architecture that establishes dedicated audio-video alignment in a joint interaction space before applying external conditioning cues.

---

## 🔬 Architecture & Key Innovations

- **Align-then-Fuse MMDiT:** Separates cross-modal temporal alignment from global semantic conditioning. Fine-grained audio-visual correspondence is learned in a primary interaction space prior to joint denoising.
- **Timbre-in-Context Conditioning:** Enables controllable speech identity by associating reference audio WAV clips with specific text speech spans, preserving multi-speaker timbre characteristics.
- **Native Stereo Audio-Video Generation:** Directly generates high-definition 720p video paired with stereo audio without requiring post-hoc vocoder fitting, visual warping, or secondary lip-sync models.
- **Controllability & Flexibility:** Features natural language camera control (motion, pacing, shot composition) and supports multiple aspect ratios.
- **High Parameter Efficiency:** With 6.3B parameters, NAVA outperforms much larger pipelines while requiring only ~1 minute to generate clips on an 8-GPU node.

```
Text Prompt + Reference Audio ───► T5 Text / Audio Encoder ───► Align-then-Fuse MMDiT ───► Audio/Video VAE Decoders ───► Synchronized 720p Video + Stereo Audio
```

---

## 📊 Benchmarks & Performance

| Evaluation Metric / Benchmark | NAVA (6.3B) Performance |
| :--- | :--- |
| **Verse-Bench (Audio-Visual Sync C/D)** | **State-of-the-Art** (Superior synchronization over open-source baselines) |
| **Video Visual Quality & Realism** | **Top Open-Source Tier** |
| **Seed-TTS Voice Similarity** | **High Fidelity Multi-Speaker Cloning** |
| **Generation Speed (8x GPU setup)** | **~60 seconds for 720p clip** |

---

## 🚀 Quickstart & Code Usage

### Installation

```bash
git clone https://github.com/ernie-research/NAVA
cd NAVA

pip install torch torchvision torchaudio diffusers transformers accelerate safetensors einops scipy PyYAML tqdm sentencepiece
pip install flash-attn --no-build-isolation
```

### Running Inference

```bash
# Text-to-Audio-Video Generation
bash scripts/inference.sh

# Image-to-Audio-Video with Timbre Control
bash scripts/inference_timbre.sh
```

### Python API Usage

```python
import torch
from nava.pipeline import NAVAPipeline

# Load NAVA model weights from Hugging Face / local directory
pipeline = NAVAPipeline.from_pretrained(
    "ernie-research/NAVA",
    torch_dtype=torch.bfloat16
).to("cuda")

# Generate synchronized 720p video and stereo audio
output = pipeline(
    prompt="A news anchor speaking passionately in a modern studio setting with background ambient music",
    audio_prompt="reference_timbre.wav",
    speech_span="in a modern studio setting",
    num_inference_steps=50,
    guidance_scale=7.5
)

# Save generated video and audio outputs
output.save_video("output_synchronized.mp4")
output.save_audio("output_audio.wav")
print("NAVA audio-visual generation completed successfully.")
```

---

## 🔗 Verified Resources & Links

- **Project Website & Demos:** [ernie-research.github.io/NAVA](https://ernie-research.github.io/NAVA/)
- **arXiv Research Paper:** [arXiv:2605.30073](https://arxiv.org/abs/2605.30073)
- **Paper PDF:** [Download PDF](https://arxiv.org/pdf/2605.30073.pdf)
- **GitHub Repository:** [ernie-research/NAVA](https://github.com/ernie-research/NAVA)
- **Hugging Face Model Page:** [ernie-research/NAVA](https://huggingface.co/ernie-research/NAVA)

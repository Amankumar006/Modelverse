# MobileWan: On-Device Real-Time Video Generation

MobileWan is Qualcomm AI Research's lightweight, on-device video generation diffusion model optimized for Snapdragon mobile platforms and edge devices. It enables text-to-video and image-to-video synthesis locally with minimal power consumption.

---

## ⚡ Key Highlights & Architecture

- **On-Device Quantization**: NPU-optimized 8-bit quantized weights targeting Snapdragon 8 Gen series mobile SoCs.
- **Real-Time Synthesis**: Generates 720p videos locally at up to 30 FPS without requiring cloud API connections.
- **Low Power Profile**: Consumes less than 4W peak power during video generation runs.

---

## 📊 Performance Benchmarks

| Metric | Target Hardware | Performance Score |
| :--- | :--- | :--- |
| **Inference Speed** | Snapdragon 8 Gen 4 | 28.5 FPS |
| **Resolution** | Local Screen Output | 1280×720 (720p) |
| **Memory Footprint** | Mobile DRAM | < 3.2 GB |

---

## 💻 Quickstart (Qualcomm AI Hub SDK)

```python
import qai_hub as hub

# Load MobileWan model from Qualcomm AI Hub
model = hub.load_model("qualcomm/mobilewan-720p")

# Run local on-device compilation for Snapdragon NPU
compiled_model = hub.compile_model(model, target_device="Snapdragon 8 Gen 4")

# Generate video locally
video_bytes = compiled_model.generate(
    prompt="A serene beach at sunset with subtle ocean waves",
    num_frames=60
)
```

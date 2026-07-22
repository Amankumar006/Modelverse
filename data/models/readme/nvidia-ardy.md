# NVIDIA ARDY: Audio-Driven Talking Head Dynamics

ARDY is NVIDIA Research's audio-driven video synthesis model capable of generating photo-realistic 3D talking head videos from raw audio speech input.

---

## 🎙️ Key Features & Architecture

- **Audio-to-Expressive Motion**: Predicts dynamic facial expressions, eye blinks, and natural head poses synchronized with speech pitch and cadences.
- **Neural Radiance Fields (NeRF)**: Synthesizes multi-view consistent talking head video at 4K resolution.
- **Sub-100ms Streaming Latency**: Optimized for real-time digital avatar conversational agents.

---

## 📊 Performance Benchmark

| Metric | Target Hardware | Score |
| :--- | :--- | :--- |
| **Lip Sync Accuracy (LSE-C)** | RTX 4090 | **8.42** (SOTA) |
| **Real-time Frame Rate** | RTX 4090 | **60 FPS @ 1080p** |

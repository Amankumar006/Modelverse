# Wan Streamer v0.3: Real-Time Audio-Visual World Interaction

Wan Streamer v0.3 is Alibaba Group's real-time video generation framework that learns video generation as a **persistent physical world plus event streams**. By decoupling static scene understanding from dynamic event unfolding, Wan Streamer v0.3 brings free-form agent behavior to real-time audio-visual conversations.

---

## 📈 Lineage Comparison: v0.1 vs v0.2 vs v0.3

`v0.2` improved visual stream clarity and resolution. `v0.3` makes generation more general and expressive with free-form agent behavior while preserving `v0.2`'s low-latency performance.

| Aspect | v0.1 | v0.2 | v0.3 |
| :--- | :--- | :--- | :--- |
| **Main Step** | End-to-end live A/V | Higher resolution | **General video learning + free behavior** |
| **Training Focus** | Interaction data | Interaction data | **World-event video pretraining, then interaction** |
| **Agent Behavior** | Speech + listening | Same, higher fidelity | **Speech + free-form actions** |
| **Video Stream** | 192×336 · 25 fps | 640×368 · 25 fps | **640×368 · 25 fps** |
| **Latency** | ~200 ms model / ~550 ms total | ~200 ms model / ~550 ms total | **~200 ms model / ~550 ms total** |
| **Serving** | Thinker + 1-GPU performer | Thinker + parallel performer | **Thinker + parallel performer (v0.2 architecture)** |

---

## 🎯 Key Innovations in v0.3

### 1. World-Event Decoupled Pretraining
Rather than learning videos strictly as frame sequences, Wan Streamer v0.3 models the static environment background as a high-dimensional latents space ("World") and incoming user commands/audio inputs as localized dynamic transformations ("Events").

### 2. Full-Duplex Audio-Visual Interaction
Enables real-time full-duplex conversations where the agent can react visually (gestures, expressions, camera movements) simultaneously as audio is streamed, without waiting for turn completion.

### 3. Sub-200ms Model Inference Latency
Leverages a dual-engine architecture:
- **Thinker Engine**: Processes multimodal context and plans high-level event trajectory.
- **Parallel Performer Engine**: Generates 25 fps video frames in real time across parallelized GPU streams.

---

## 💻 Getting Started with Wan Streamer v0.3

### 1. Streaming Setup
```python
from wan_streamer import WanStreamerClient

# Initialize client with stream endpoint
client = WanStreamerClient(
    endpoint="wss://api.wan-streamer.com/v0.3/stream",
    api_key="YOUR_API_KEY"
)

# Start real-time audio-visual session
session = client.create_session(
    resolution="640x368",
    fps=25,
    enable_full_duplex=True
)

print(f"Session started with ID: {session.id}")
```

### 2. Audio-Visual Pipeline Loop
```python
async for frame in session.receive_video_stream():
    # Render video stream at 25 fps
    display_frame(frame)
```

---

## 🔗 Official Links & Papers
- [Wan Streamer v0.3 Official Website](https://wan-streamer.com/v0.3/)
- [Alibaba Group AI Research](https://github.com/alibaba)

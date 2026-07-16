# LiveEdit

## Model Overview
LiveEdit is an innovative, open-source framework designed for real-time, diffusion-based streaming video editing. Developed collaboratively by researchers from Tsinghua University and HKUST (arXiv:2606.26740), it represents a major leap forward in causal video editing. Accepted for presentation at ECCV 2026, LiveEdit compresses the powerful editing capabilities of foundational models into a lightweight, unidirectional streaming editor that can process live streams on consumer-grade hardware.

## Capabilities
* **Real-Time Streaming Editing:** Operates at impressive speeds of approximately 12–13 frames per second (FPS), making it suitable for live and interactive applications.
* **Causal Frame-by-Frame Processing:** Unlike traditional bidirectional models that need an entire video clip beforehand, LiveEdit processes and edits each frame sequentially based only on previous information.
* **Three-Stage Distillation Pipeline:** Successfully distills the robust capabilities of large foundational video models into a highly efficient, real-time framework.
* **AR-Oriented Mask Cache:** Reuses region-specific computations across consecutive frames. This drastically reduces redundant processing and ensures exceptional background stability during editing.
* **Consumer GPU Compatibility:** Designed to run efficiently on modern consumer graphics cards (e.g., RTX 4070+).

## Example Use Cases
* **Augmented Reality (AR):** Providing real-time, stable visual overlays and edits for immersive AR experiences.
* **Live Broadcasting & Streaming:** Allowing creators to apply complex, diffusion-based visual effects on the fly during live streams.
* **Interactive Video Conferencing:** Enhancing virtual meetings with real-time background replacement, style transfer, or avatar modifications.
* **Rapid Video Prototyping:** Enabling filmmakers to preview complex VFX in real-time on set.

## Performance & Benchmarks
LiveEdit stands out for its remarkable inference speed, achieving 12–13 FPS on consumer-grade hardware like the RTX 4070. By leveraging its AR-oriented mask cache and three-stage distillation pipeline, it successfully overcomes the latency and temporal inconsistency issues that typically plague diffusion-based video editing, offering a stable and smooth real-time output.

## Intended Use & Limitations
**Intended Use:** The framework is intended for developers, researchers, and creators looking to integrate real-time video editing into AR, live streaming, and interactive applications. It is fully open-source, promoting exploration and adaptation.

**Limitations:**
* The causal (unidirectional) nature of the editing means it cannot "look ahead," which may limit the precision of edits that depend on future context.
* While highly optimized, it still requires relatively modern consumer GPUs (RTX 4070 or better) to achieve its 12–13 FPS real-time performance.
* Subject to custom licensing restrictions as outlined by the academic institutions.

## About Tsinghua University, HKUST
Tsinghua University (Beijing, China) and the Hong Kong University of Science and Technology (HKUST) are two of the world's leading academic institutions in engineering and computer science. Their collaborative research labs consistently produce cutting-edge advancements in artificial intelligence, computer vision, and machine learning, frequently contributing impactful, open-source frameworks to the global AI community.

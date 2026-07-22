# ReactiveGWM: Steering NPC in Reactive Game World Models

## Model Overview
**ReactiveGWM** (Reactive Game World Models) is an interactive game world modeling framework developed by researchers at **National University of Singapore (NUS)** in collaboration with Tencent, HKPolyU, and HKUST-GZ.

It addresses a key limitation in current world models by decoupling player action controls from Non-Player Character (NPC) autonomy. Using an additive bias for player actions and cross-attention interaction modules for high-level NPC strategies (e.g. Offense, Defense, Control), ReactiveGWM enables steerable, prompt-aligned NPC behavior and zero-shot strategy transfer across different games without domain retraining.

---

## Key Features
- **Decoupled Control Architecture:** Separates player action inputs from NPC behavior control, eliminating static/passive NPC rendering.
- **Strategy-Grounded Cross-Attention:** Dedicated cross-attention interaction modules ground high-level NPC intents (Offense, Control, Defense) directly into generated video frames.
- **Zero-Shot Strategy Transfer:** Interaction modules encode game-agnostic logic, allowing them to plug directly into unannotated game world models.
- **Real-Time Steerable Video Generation:** Maintains precise player action responsiveness while generating reactive NPC behaviors frame-by-frame.
- **Multi-Game Causal Forcing Benchmarks:** Evaluated on *Street Fighter II: Champion Edition* and *Street Fighter III*.

---

## Verified Project Links
- **Project Website:** [https://inv-wzq.github.io/ReactiveGWM/](https://inv-wzq.github.io/ReactiveGWM/)
- **arXiv Paper:** [https://arxiv.org/abs/2605.15256](https://arxiv.org/abs/2605.15256)
- **GitHub Repository:** [https://github.com/INV-WZQ/ReactiveGWM](https://github.com/INV-WZQ/ReactiveGWM)
- **Hugging Face Model:** [https://huggingface.co/INV-WZQ/ReactiveGWM-Models](https://huggingface.co/INV-WZQ/ReactiveGWM-Models)

---

## Performance & Evaluation
- Evaluated across FVD, PSNR, SSIM, LPIPS, Player Action Accuracy, and NPC Strategy Alignment Score on *Street Fighter II* and *Street Fighter III*.

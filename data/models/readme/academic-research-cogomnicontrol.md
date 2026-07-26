# CogOmniControl

## 📌 Model Overview

CogOmniControl is a reasoning-driven framework for controllable video generation developed by University of Macau. It factorizes generation into creative intent cognition (CogVLM) and in-context video diffusion (CogOmniDiT), optimized via RL and Best-of-N candidate selection.

**CogOmniControl** is a **Research Preview** model developed by **Academic/Research**, released on **2026-05-19**. It is engineered primarily for **Video Generation** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Video Generation |
| **Deployment** | self-hostable |
| **Modality** | text, vision, video |
| **Reasoning-Driven Controllable Video Generation** | Reasoning-Driven Controllable Video Generation: Decouples creative intent understanding from video synthesis |
| **CogVLM Intent Cognition** | CogVLM Intent Cognition: Specialized VLM trained on authentic anime production data to turn sparse sketches into dense reasoning |
| **CogOmniDiT Generation** | CogOmniDiT Generation: Unified Diffusion Transformer supporting multi-condition in-context video synthesis |
| **Reinforcement Learning Alignment** | Reinforcement Learning Alignment: Aligns DiT generation paths with VLM reasoning outputs using RL |
| **Closed-Loop Best-of-N Harness** | Closed-Loop Best-of-N Harness: Uses planned evaluators to select optimal generated video candidates |
| **Professional Production Workflow Focus** | Professional Production Workflow Focus: Designed for storyboard sketches, clay renders, and complex multi-modal controls |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | Academic/Research |
| **Release Date** | 2026-05-19 |
| **Model Type** | Research Preview |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | proprietary |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **CogReasonBench Intent Cognition Score** | `State-of-the-Art` | Independent Eval |
| **CogControlBench Video Quality Score** | `State-of-the-Art` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://um-lab.github.io/CogOmniControl/](https://um-lab.github.io/CogOmniControl/) |
| **paper** | [https://arxiv.org/abs/2605.19995](https://arxiv.org/abs/2605.19995) |
| **github** | [https://github.com/um-lab](https://github.com/um-lab) |
| **huggingface** | [https://huggingface.co/papers/2605.19995](https://huggingface.co/papers/2605.19995) |

---

## 📜 License & Usage

This model is governed by the **proprietary** license. Please check official developer guidelines before commercial deployment.

# Aspire

## 📌 Model Overview

ASPIRE (Agentic Skill Programming through Iterative Robot Exploration) is a continual learning framework for robotics developed by NVIDIA GEAR Lab in collaboration with UMich, UIUC, UC Berkeley, and CMU. Using a code-as-policy approach, ASPIRE enables robot agents to autonomously generate, test, debug, and refine executable Python control programs.

**Aspire** is a **Open Weights** model developed by **NVIDIA**, released on **2026-07-01**. It is engineered primarily for **Chat Reasoning** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Chat Reasoning |
| **Deployment** | self-hostable |
| **Modality** | text, image, multimodal |
| **Code-as-Policy Paradigm** | Code-as-Policy Paradigm: Translates task goals into executable Python control programs for interpretable, modular robot behaviors |
| **Closed-Loop Execution Engine** | Closed-Loop Execution Engine: Exposes per-primitive execution traces (perception, grasp candidates, trajectory data, contact dynamics) for failure diagnosis |
| **Continually Expanding Skill Library** | Continually Expanding Skill Library: Automatically extracts and indexes validated code repairs into a persistent library of reusable skills |
| **Evolutionary Search for Task & Code Optimization** | Evolutionary Search for Task & Code Optimization: Systematically generates and debugs task sequences and control programs |
| **Zero-Shot Long-Horizon Generalization** | Zero-Shot Long-Horizon Generalization: Adapts rapidly to unseen manipulation and household tasks without fine-tuning model weights |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | NVIDIA |
| **Release Date** | 2026-07-01 |
| **Model Type** | Open Weights |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | proprietary |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **LIBERO-Pro Object Perturbations** | `+77 percentage points over baselines` | Independent Eval |
| **Robosuite Bimanual Handover Success Rate** | `92% (up from 20%)` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://research.nvidia.com/labs/gear/aspire/](https://research.nvidia.com/labs/gear/aspire/) |
| **paper** | [https://arxiv.org/abs/2607.00272](https://arxiv.org/abs/2607.00272) |
| **huggingface** | [https://huggingface.co/papers/2607.00272](https://huggingface.co/papers/2607.00272) |

---

## 📜 License & Usage

This model is governed by the **proprietary** license. Please check official developer guidelines before commercial deployment.

# ASPIRE: Agentic Skill Programming through Iterative Robot Exploration

## Model Overview
**ASPIRE** (**Agentic Skill Programming through Iterative Robot Exploration**) is a continual learning framework for robotics developed by **NVIDIA GEAR Lab** (Generalist Embodied Agent Research) in collaboration with researchers from UMich, UIUC, UC Berkeley, and CMU (Runyu Lu, Linxi "Jim" Fan, Guanzhi Wang, et al.).

Operating on a **code-as-policy** paradigm, ASPIRE enables robot agents to autonomously generate, test, debug, and refine executable Python control programs. When encountering execution failures, its closed-loop execution engine collects fine-grained multimodal execution traces to localize root causes, synthesize code patches, and distill successful repairs into an expanding skill library.

---

## Key Features
- **Code-as-Policy Paradigm:** Translates high-level task goals into structured Python control programs for interpretable, modular robot behaviors.
- **Closed-Loop Execution Engine:** Exposes per-primitive execution traces (spatial perception, grasp candidates, trajectory data, contact dynamics) to diagnose and validate code repairs.
- **Continually Expanding Skill Library:** Automatically extracts and indexes validated failure fixes into a persistent library of reusable skills.
- **Evolutionary Search:** Systematically generates and debugs task sequences and control programs beyond simple trajectory tuning.
- **Zero-Shot Long-Horizon Generalization:** Enables robots to adapt rapidly to unseen manipulation and household tasks without updating model weights.

---

## Verified Project Links
- **Project Website:** [https://research.nvidia.com/labs/gear/aspire/](https://research.nvidia.com/labs/gear/aspire/)
- **arXiv Paper:** [https://arxiv.org/abs/2607.00272](https://arxiv.org/abs/2607.00272)
- **Hugging Face:** [https://huggingface.co/papers/2607.00272](https://huggingface.co/papers/2607.00272)

---

## Performance & Benchmarks
- **LIBERO-Pro (Object Perturbations):** +77 percentage points success rate improvement over baselines (CaP-Agent, OpenVLA, π0).
- **Robosuite (Bimanual Handover):** Success rate increased from 20% to 92% (+72 percentage points).
- **BEHAVIOR-1K (Nav & Pick up Radio):** Success rate increased from 56% to 88% (+32 percentage points).

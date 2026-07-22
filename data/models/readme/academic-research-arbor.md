# Arbor: Autonomous Research via Hypothesis-Tree Refinement

Arbor is a generalist autonomous research agent framework developed by researchers at the Gaoling School of Artificial Intelligence, Renmin University of China (RUC-NLPIR), in collaboration with Microsoft Research. Rather than operating as a standalone LLM, Arbor functions as an agent framework designed to conduct long-horizon, autonomous scientific research and software/ML system optimization.

Arbor introduces **Hypothesis-Tree Refinement (HTR)**, replacing standard linear agent execution with a structured tree of hypotheses, experimental evidence, and distilled insights. This allows the system to continuously learn from both successful attempts and failed experiments across extended sessions.

---

## 🔬 Key Capabilities & Architecture

- **Hypothesis-Tree Refinement (HTR):** Maintains a persistent memory tree connecting hypotheses, artifacts, evaluation metrics, and lessons learned across long research sessions.
- **Dual-Agent Architecture:**
  - **Coordinator Agent:** Long-lived planner that directs research strategy, prunes unpromising hypothesis branches, and coordinates experiment iterations.
  - **Executor Agents:** Ephemeral agents executed in isolated `git` worktrees to test specific hypotheses without modifying main repository code.
- **Autonomous Optimization (AO):** Formulates research tasks as iterative optimization problems guided by target-specific evaluation scripts.
- **Literature & Novelty Verification:** Built-in literature search tools verify hypothesis novelty against current academic publications before running experiments.

```
[ User Task / Research Goal ]
              │
              ▼
   ┌───────────────────────┐
   │   Coordinator Agent   │ ◄── Maintains Hypothesis Tree
   └──────────┬────────────┘
              │ Dispatches task in git worktree
              ▼
    ┌────────────────────┐
    │  Executor Agent    │ ──► Evaluates Code / Model Artifacts
    └─────────┬──────────┘
              │ Returns Metrics & Insights
              ▼
   ┌───────────────────────┐
   │ Hypothesis Tree Update│ (Node Added: Evidence, Artifact, Insight)
   └───────────────────────┘
```

---

## 📊 Performance & Benchmarks

| Benchmark | Score | Status |
| :--- | :--- | :--- |
| **MLE-Bench Lite (Any Medal Rate)** | **86.36%** | Verified |
| **Relative Performance vs Baseline Agents** | **2.5× Gain** | Verified |

---

## 🚀 Quickstart Usage

### Standalone CLI
```bash
pip install arbor-agent
arbor setup
arbor
```

### Claude Code Plugin Integration
```bash
claude plugin marketplace add RUC-NLPIR/Arbor
claude plugin install arbor
```

### Interactive Demo Mode
```bash
arbor replay --demo
```

---

## 🔗 Paper & Resources
- [Official Website](https://ruc-nlpir.github.io/Arbor/)
- [arXiv Paper (2606.11926)](https://arxiv.org/abs/2606.11926)
- [Paper PDF Download](https://arxiv.org/pdf/2606.11926.pdf)
- [GitHub Repository](https://github.com/RUC-NLPIR/Arbor)
- [Hugging Face Paper Page](https://huggingface.co/papers/2606.11926)

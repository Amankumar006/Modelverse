# Co-Scientist: AI Co-Scientist for Scientific Discovery

## Model Overview
**Co-Scientist** (AI Co-Scientist) is a Gemini 2.0-powered multi-agent AI system developed by **Google DeepMind** in collaboration with Google Research, Google Cloud, and Google Labs.

Designed to act as a virtual scientific collaborator, Co-Scientist augments and accelerates the scientific discovery process by generating, debating, evolving, and ranking novel research hypotheses. Managed by a central Supervisor agent, a coalition of specialized agents executes an iterative workflow mirroring the scientific method.

---

## Key Features
- **Multi-Agent Architecture & Specialized Scientific Roles:** Operates a coalition of specialized agents (Supervisor, Generation, Peer Review, Ranking, Evolution) that propose, critique, and synthesize hypotheses.
- **Elo Tournament System:** Implements an automated pairwise idea tournament using Elo ratings to systematically evaluate and rank research hypotheses.
- **Test-Time Compute Scaling:** Asynchronous execution framework scales compute during inference for long-horizon refinement.
- **Biomedical & Experimental Validation:** Formulates hypotheses validated by in-vitro laboratory testing (drug repurposing for acute myeloid leukemia, antimicrobial resistance).
- **Citation Grounding:** Integrated into scientist workflows with clickable citations to literature databases.

---

## Verified Project Links
- **Official Portal:** [https://labs.google/science](https://labs.google/science)
- **arXiv Paper:** [https://arxiv.org/abs/2502.18864](https://arxiv.org/abs/2502.18864)

---

## Benchmarks & Impact
- Published in **Nature (2026)**.
- Outperformed baseline LLMs in double-blind expert evaluations for hypothesis novelty and feasibility.

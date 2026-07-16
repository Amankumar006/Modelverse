## Model Overview
Arbor is an open-source autonomous research and optimization framework developed by researchers at the Gaoling School of Artificial Intelligence, Renmin University of China, in collaboration with Microsoft Research. Rather than being a standalone large language model, Arbor is a specialized autonomous agent framework designed to improve the performance of software systems and machine learning pipelines. It utilizes a persistent "hypothesis tree" to organize research, storing hypotheses, evidence, and insights, which allows the system to learn from both successes and failures over long-running sessions. The framework is model-agnostic and can be integrated with various LLM backends (like GPT-5.5 or Claude Opus).

## Capabilities
- **Hypothesis-Tree Refinement (HTR):** Systematically organizes research by maintaining a structured tree of hypotheses and evidence.
- **Dual-Agent Architecture:** Employs a long-lived Coordinator agent to manage overall strategy and short-lived Executor agents that run isolated experiments in `git` worktrees.
- **Autonomous Research:** Continuously refines software and machine learning pipelines without human intervention.
- **Model Agnosticism:** Can utilize various underlying LLM backends for its reasoning capabilities.

## Example Use Cases
- Optimizing machine learning models and training pipelines autonomously.
- Refining software systems by generating, testing, and evaluating code improvements over extended periods.
- Conducting long-term automated research experiments that require memory of past successes and failures.

## Performance & Benchmarks
In benchmarks, Arbor has been shown to achieve significant gains—reportedly 2.5 times the average relative performance improvement compared to standard AI coding agents like Claude Code and Codex, operating under the same computational budget. Its performance is heavily dependent on the capabilities of the underlying model used as its reasoning engine.

## Intended Use & Limitations
Arbor is intended for academic and research applications, particularly for developers and researchers looking to automate complex software engineering and machine learning optimization tasks. Its primary limitation is that it requires an external LLM backend to function, and its overall efficacy is bounded by the reasoning and coding capabilities of that underlying model. Additionally, as an experimental framework, it may require significant setup and configuration to integrate with specific pipelines.

## About Renmin University of China
Renmin University of China, specifically the Gaoling School of Artificial Intelligence, is a leading academic institution engaged in advanced artificial intelligence research. Their work often focuses on novel methodologies in natural language processing, autonomous agents, and system optimization, contributing open-source tools and frameworks to the global AI research community.

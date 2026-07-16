# North Mini Code

## Model Overview
North Mini Code (slug: `cohere-north-mini-code`) is an open-weights, agentic coding model released by Cohere on June 9, 2026. It is the debut model in Cohere’s "North" series, specifically engineered for software engineering workflows and terminal-based tasks. The model utilizes a sparse Mixture-of-Experts (MoE) architecture with 30 billion total parameters (3 billion active per token) and supports a massive 256K-token context window.

## Capabilities
* **Agentic Software Engineering:** Designed for repository-level tasks, sub-agent orchestration, systems architecture mapping, and multi-file code reviews.
* **Terminal & Tool Use:** Optimized to drive shell tools end-to-end, supporting native tool use, interleaved reasoning, and structured JSON schema outputs.
* **High-Efficiency Inference:** Its MoE architecture allows it to run locally on a single NVIDIA H100 GPU using FP8 or FP4 quantization with low latency.

## Example Use Cases
* Automating complex software engineering environments and testing harnesses.
* Operating as an autonomous agent within terminal environments to execute commands and scripts.
* Performing large-scale, repository-wide code reviews taking advantage of its 256K context window.
* Local, low-latency deployments in edge or self-hosted environments.

## Performance & Benchmarks
North Mini Code achieves a score of **33.4** on the Artificial Analysis Coding Index. According to Cohere, it outperforms similarly sized models (such as Qwen3.5 35B and Gemma 4 26B) and even some significantly larger models. It was post-trained using two-stage supervised fine-tuning followed by reinforcement learning with verifiable rewards (RLVR) on extensive software engineering data.

## Intended Use & Limitations
* **Intended Use:** Ideal for developers and organizations wanting to self-host a highly capable, agentic coding model for software automation and tool integration.
* **Limitations:** While highly efficient, it relies on an MoE structure which may require specific hardware optimizations (like an H100) to achieve its advertised low latency. 

## About Cohere
Cohere is a leading enterprise AI company that builds state-of-the-art language models designed to power the next generation of business applications, with a strong emphasis on practical, scalable, and secure deployment options.

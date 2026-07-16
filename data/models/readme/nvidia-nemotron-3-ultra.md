# Nemotron 3 Ultra

## Model Overview
Nemotron 3 Ultra is an open-weights, frontier-reasoning model developed by NVIDIA, designed for complex agentic workflows, long-context analysis, and high-stakes reasoning. As the most capable model in the Nemotron 3 family, it utilizes a Hybrid Transformer-Mamba MoE (Mixture-of-Experts) architecture with LatentMoE, offering exceptional accuracy and efficiency. Boasting 550 billion total parameters (with 55 billion active during inference), it is engineered to be a powerhouse for advanced AI orchestration.

## Capabilities
* **Hybrid Transformer-Mamba MoE:** Combines the strengths of Transformers and Mamba architectures, leveraging LatentMoE for optimized routing and processing.
* **Massive Context Window:** Supports an expansive context window of up to 1 million tokens, allowing for deep repository-level research and extensive document analysis.
* **Configurable Reasoning:** Features inference-time reasoning (via an `enable_thinking` flag) allowing the model to "think" before responding to complex prompts.
* **Multi-Token Prediction (MTP):** Integrates MTP layers to accelerate inference speeds without compromising output quality.
* **Optimized Pretraining:** Pretrained using NVFP4 to maximize memory efficiency and inference speed on NVIDIA's hardware ecosystem.

## Example Use Cases
* **Agentic Workflows:** Serving as the orchestrator for multi-step, autonomous agent workflows requiring long-term planning and tool use.
* **Deep Codebase Research:** Synthesizing and debugging information across massive code repositories within a single prompt due to its 1M token context window.
* **Complex Data Analysis:** Processing and reasoning over large datasets, financial reports, or legal documents to extract insights and summaries.
* **High-Stakes Reasoning:** Tackling intricate logic problems, mathematical proofs, and strategic planning scenarios that require dedicated thinking time.

## Performance & Benchmarks
* **Scale:** 550B total parameters with 55B active parameters per token, balancing immense capacity with computational efficiency.
* **Speed:** Offers up to 5x faster inference and significantly lower operational costs compared to previous generations for comparable agentic workloads.
* **Context Capacity:** Flawlessly handles up to 1,000,000 tokens for long-context tasks.

## Intended Use & Limitations
Nemotron 3 Ultra is intended for enterprise and research environments requiring state-of-the-art reasoning and agentic orchestration. It is released under the OpenMDW License Agreement (v1.1), providing open access to weights, data, and training recipes. While highly optimized, running the full 550B model requires substantial computational resources, though community efforts like GGUF formats assist in broader deployability. 

## About NVIDIA
NVIDIA is at the forefront of artificial intelligence and accelerated computing. By developing both the cutting-edge hardware and the sophisticated foundation models that run on them, NVIDIA empowers developers, researchers, and enterprises to solve the world's most complex challenges.

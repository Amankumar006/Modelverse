# NVIDIA Nemotron 3 Ultra: Open Frontier LLM for Agentic Reasoning

## Model Overview
**NVIDIA Nemotron 3 Ultra** is a flagship open-weight frontier large language model family developed by **NVIDIA**. It is engineered specifically for agentic AI workloads, long-context understanding, multi-step complex reasoning, automated coding, and tool calling.

The family includes the **Nemotron 3 Ultra 550B** (a hybrid Transformer-Mamba LatentMoE model with 55B active parameters per token and up to 1M token context) and **Llama-3.1-Nemotron-Ultra-253B-v1** (a dense 253B model optimized for single-node 8xH100/B200 enterprise deployment).

---

## Key Features
- **Hybrid LatentMoE & Mamba-2 Architecture:** Combines Mamba-2 state space model layers with Latent Mixture-of-Experts (550B total / 55B active parameters) to maximize throughput and long-sequence processing.
- **Dual-Mode System:** Features configurable low-latency chat (reasoning off) and extended Chain-of-Thought (reasoning on) modes controlled via prompt parameters.
- **Ultra-Long Context Window:** Supports up to 1,000,000 (1M) tokens context window (550B MoE) and 128,000 (128K) tokens (253B Dense).
- **Native NVFP4 Quantization:** Native NVFP4 4-bit floating-point quantization enables single-node enterprise inference with up to 5x throughput speedups.
- **Agentic Post-Training:** Multi-environment RL post-training tailored for function calling (BFCL), complex multi-turn execution, automated coding (SWE-bench), and RAG.

---

## Verified Project Links
- **Developer Blog:** [https://developer.nvidia.com/blog/nvidia-releases-nemotron-ultra](https://developer.nvidia.com/blog/nvidia-releases-nemotron-ultra)
- **Technical Report (arXiv):** [https://arxiv.org/abs/2512.20856](https://arxiv.org/abs/2512.20856)
- **GitHub Repository:** [https://github.com/NVIDIA/NeMo](https://github.com/NVIDIA/NeMo)
- **Hugging Face Model:** [https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1](https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1)

---

## Performance & Benchmarks
- **MMLU-Pro (550B MoE):** 86.8%
- **SWE-bench Verified (550B MoE):** 70.7%
- **MATH-500 (253B Reasoning On):** 97.0%
- **BFCL v2 Tool Calling (253B):** 74.1%

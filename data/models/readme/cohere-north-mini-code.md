# North Mini Code: 30B Sparse MoE Coding Model

## Model Overview
**North Mini Code** (1.0) is a specialized 30B total parameter, sparse Mixture-of-Experts (MoE) coding model with ~3B active parameters per token developed by **Cohere** and **Cohere Labs**.

Designed for agentic software engineering and developer workflows, it achieves near-30B-scale reasoning and multi-file code editing performance with the low compute overhead of a 3B parameter model.

---

## Key Features
- **Sparse MoE Architecture:** 30B total parameters across 128 experts with 8 active per token (~3B active parameters).
- **Hybrid Attention Design:** Interleaves sliding-window attention (with RoPE) and global attention in a 3:1 ratio.
- **Extended Context Capability:** Features a 256K token context window with up to 64K output token generation.
- **Agentic Optimization:** Post-trained via two-stage SFT and RLVR for multi-file repo changes, terminal execution, and scaffolds like OpenCode and SWE-Agent.
- **Open Weights & Deployability:** Released under the permissive **Apache 2.0** license for single-GPU local execution.

---

## Verified Project Links
- **Developer Blog:** [https://cohere.com/blog/north-mini-code](https://cohere.com/blog/north-mini-code)
- **GitHub Repository:** [https://github.com/cohere-ai](https://github.com/cohere-ai)
- **Hugging Face Model:** [https://huggingface.co/CohereLabs/North-Mini-Code-1.0](https://huggingface.co/CohereLabs/North-Mini-Code-1.0)

---

## Performance & Benchmarks
- **SWE-bench Verified:** 67.6% (pass@1) / 80.2% (pass@10).
- **HumanEval:** 50.0%.
- **Artificial Analysis Coding Index:** 33.4.

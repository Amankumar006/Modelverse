# Agents A1: 35B MoE Long-Horizon Agentic Model

**Agents A1** is a 35-billion parameter Mixture-of-Experts (MoE) agentic model developed by the **InternScience** group at the **Shanghai Artificial Intelligence Laboratory**. Built upon the `Qwen3.5-35B-A3B` base architecture, Agents A1 is designed to scale **horizon capability**—the length, depth, and coherence of multi-step task execution—activating only ~3 billion parameters per token for ultra-fast local inference.

---

## 🔬 Architecture & Training

- **Mixture-of-Experts (MoE)**: 35B total parameters with ~3B active parameters per token, providing high computational efficiency.
- **256K Context Window**: Supports up to 262,144 tokens, allowing the model to analyze large code repositories, extensive scientific literature, and long multi-turn interactions.
- **Three-Stage Training Recipe**:
  1. *Full-Domain SFT*: Foundation alignment for generic agentic behavior and tool calling.
  2. *Domain-Level Teacher Training*: Deep domain specialization across 6 distinct fields.
  3. *Multi-Teacher Domain-Routed On-Policy Distillation*: Distills knowledge from domain experts into a unified MoE routing structure.
- **Long-Horizon Trajectory Execution**: Optimized for generating and maintaining long-horizon knowledge-action trajectories averaging 45,000 tokens in length.

```
Full-Domain SFT ───► Domain-Level Teacher Training ───► Multi-Teacher Domain-Routed On-Policy Distillation ───► Agents A1 MoE
```

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Description | Status |
| :--- | :--- | :--- | :--- |
| **GAIA** | **96.0** | General AI assistant tool use & planning | Verified |
| **IFEval** | **94.8** | Strict multi-constraint instruction following | Verified |
| **FrontierScience (Olympiad)** | **79.0** | Complex scientific reasoning & problem solving | Verified |
| **SEAL-0** | **56.4** | Search-augmented reasoning on noisy web data | Verified |
| **HLE (with tools)** | **47.6** | Humanity's Last Exam complex reasoning | Verified |
| **HiPhO** | **46.4** | Scientific agentic reasoning & tool orchestration | Verified |

---

## 🚀 Quickstart & Serving with vLLM

```bash
vllm serve InternScience/Agents-A1 \
 --port 8000 \
 --tensor-parallel-size 1 \
 --max-model-len 262144 \
 --reasoning-parser qwen3 \
 --enable-auto-tool-choice \
 --tool-call-parser qwen3_coder
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="none"
)

response = client.chat.completions.create(
    model="InternScience/Agents-A1",
    messages=[
        {"role": "user", "content": "Analyze the codebase and construct a long-horizon plan for refactoring."}
    ],
    temperature=0.7,
)

print(response.choices[0].message.content)
```

---

## 🔗 Official Paper & Resources
- [Official Website](https://internscience.github.io/Agents-A1/)
- [arXiv Paper (arXiv:2606.30616)](https://arxiv.org/abs/2606.30616)
- [Paper PDF Download](https://arxiv.org/pdf/2606.30616)
- [GitHub Repository](https://github.com/InternScience/Agents-A1)
- [Hugging Face Model Collection](https://huggingface.co/collections/InternScience/agents-a1)

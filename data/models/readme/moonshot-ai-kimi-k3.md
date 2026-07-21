# Kimi K3: Frontier Intelligence & Open Weights Reasoning

Kimi K3 is Moonshot AI's flagship 2.8T parameter open-source mixture-of-experts model, architected specifically for complex abstract reasoning, long-horizon coding, and multimodal intelligence. Built on **Kimi Delta Attention (KDA)** and **Attention Residuals (AttnRes)**, Kimi K3 sets a new benchmark for open-weights performance while operating with unprecedented context caching efficiency.

---

## 🔬 Architecture & Methodology

Kimi K3 replaces traditional dense attention mechanisms with a hybrid attention-residual architecture engineered for 1M+ token context scaling.

```
       ┌────────────────────────────────────────────────────────┐
       │                 Output Layer (AttnRes)                 │
       └───────────────────────────▲────────────────────────────┘
                                   │
      ┌────────────────────────────┴───────────────────────────┐
      │  3× MoE Blocks (Stable LatentMoE + Gated MLA + KDA)    │
      └────────────────────────────▲───────────────────────────┘
                                   │
      ┌────────────────────────────┴───────────────────────────┐
      │        Kimi Delta Attention (KDA) Base Module          │
      └────────────────────────────▲───────────────────────────┘
                                   │
      ┌────────────────────────────┴───────────────────────────┐
      │       Shared Experts (2) + Routed Experts (16/896)     │
      └────────────────────────────────────────────────────────┘
```

### Core Innovations
1. **Kimi Delta Attention (KDA)**: A state-space hybrid operator that reduces KV-cache memory overhead by 72% while preserving long-range attention accuracy up to 1M tokens.
2. **Stable LatentMoE**: Features 896 total fine-grained experts, dynamically routing 16 active experts per token for ultra-high memory bandwidth efficiency.
3. **Attention Residuals (AttnRes)**: Replaces standard additive residual connections with a learned linear gate ($\alpha$) across residual blocks to prevent signal degradation in deep networks.

---

## 📊 Benchmark Performance

Kimi K3 demonstrates frontier-grade performance across complex reasoning, competitive coding, and math evaluation suites:

| Benchmark | Task Domain | Kimi K3 Score | Prior SOTA Open | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ARC-AGI-2** | Abstract Reasoning | **77.1%** | 31.1% | Verified |
| **SWE-bench Verified** | Software Engineering | **68.4%** | 52.8% | Verified |
| **MATH-500** | Competition Mathematics | **94.2%** | 90.1% | Verified |
| **HumanEval** | Code Generation | **92.6%** | 89.4% | Verified |
| **MMMU** | Multimodal Reasoning | **78.9%** | 73.5% | Self-Reported |

> 💡 **Note**: Context caching is automatically enabled for requests matching repeating system prompts or long documents, reducing latency by up to 10× on repeat calls.

---

## 🚀 Get Started

The examples below require Python 3.9+ and the OpenAI Python SDK. Install the SDK and initialize the client once to start issuing reasoning completions.

### 1. Installation

```bash
python3 -m pip install --upgrade 'openai>=1.0.0'
```

### 2. Environment Setup

```bash
export MOONSHOT_API_KEY="your-moonshot-api-key"
```

### 3. Basic Completion Call

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MOONSHOT_API_KEY"],
    base_url="https://api.moonshot.ai/v1",
)

completion = client.chat.completions.create(
    model="kimi-k3",
    messages=[
        {
            "role": "system",
            "content": "You are Kimi K3, a frontier AI assistant specialized in complex reasoning and software architecture."
        },
        {
            "role": "user",
            "content": "Explain Kimi Delta Attention (KDA) in one concise sentence."
        }
    ],
    temperature=0.3,
)

print(completion.choices[0].message.content)
```

### 4. cURL API Example

```bash
curl https://api.moonshot.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MOONSHOT_API_KEY" \
  -d '{
    "model": "kimi-k3",
    "messages": [
      {
        "role": "user": "Write a Python script to compute prime numbers up to N."
      }
    ]
  }'
```

---

## 🔗 Official Resources
- [Moonshot AI Official Site](https://www.kimi.com)
- [Kimi K3 Technical Blog](https://www.kimi.com/blog/kimi-k3)
- [API Quickstart Documentation](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)

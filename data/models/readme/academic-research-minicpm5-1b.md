# MiniCPM5 1B

## Overview

**MiniCPM5 1B** is a state-of-the-art 1.08 billion parameter dense language model developed by **OpenBMB**, explicitly designed for on-device deployment, local execution, and agentic workflows. Built upon a standard `LlamaForCausalLM` backbone, MiniCPM5 1B offers an unprecedented balance of compact parameter scale, 128K native context length, and flexible dual-mode reasoning.

## Architecture & Technical Specifications

| Specification | Details |
| :--- | :--- |
| **Total Parameters** | ~1.08 Billion |
| **Non-Embedding Parameters** | ~679.5 Million |
| **Layer Count** | 24 Layers |
| **Attention Mechanism** | Grouped-Query Attention (GQA) — 16 Query / 2 KV Heads |
| **Context Window** | 128K tokens (131,072 max position embeddings) |
| **Base Architecture** | Standard `LlamaForCausalLM` |
| **License** | Apache 2.0 |

Because MiniCPM5 1B adheres strictly to standard Llama model primitives, it requires no custom CUDA kernels and works out-of-the-box across all major LLM serving engines.

## Key Capabilities & Features

1. **Dual-Mode Reasoning (`Think` / `NoThink`)**: 
   A single model checkpoint supports both instant low-latency responses ("NoThink") and extended Chain-of-Thought reasoning ("Think"). Users can toggle modes during prompt template application via `enable_thinking`.
2. **Native 128K Context Length**:
   Efficiently processes long documents, technical manuals, and multi-turn agent histories up to 131,072 tokens.
3. **Agentic Tool Calling & Structured Output**:
   Pre-trained and instruction-tuned for dependable function execution, API integration, and schema-constrained JSON generation.
4. **Broad Engine Compatibility**:
   Native support in `vLLM`, `SGLang`, `llama.cpp` (GGUF), `Ollama`, `LM Studio`, and `MLX` for Apple Silicon.

## Benchmark Performance

MiniCPM5 1B sets a new benchmark for sub-2B parameter models:
* **Average Benchmark Suite Score:** **42.57** (significantly surpassing previous generation 1B SLMs averaging ~35.6).
* **Artificial Analysis Intelligence Index:** **17.9**, ranking at the top of its parameter class.
* **Specialized Strengths:** Demonstrates exceptional capability on competition math (GSM8K/MATH) and code generation (HumanEval).

## Quickstart Usage

### PyTorch / Hugging Face Transformers

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "openbmb/MiniCPM5-1B"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Example 1: No-Think Mode (Fast response)
messages = [{"role": "user", "content": "What is the capital of France?"}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

outputs = model.generate(**inputs, max_new_tokens=128)
print(tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))

# Example 2: Think Mode (Chain-of-Thought reasoning)
messages = [{"role": "user", "content": "How many r's are in strawberry?"}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=True)
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

outputs = model.generate(**inputs, max_new_tokens=512)
print(tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))
```

### Ollama Deployment

```bash
ollama run minicpm5:1b
```

## Verified References & Paper Links

* **Hugging Face Model Weights:** [openbmb/MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B)
* **GitHub Repository:** [OpenBMB/MiniCPM](https://github.com/OpenBMB/MiniCPM)
* **Technical Report:** [arXiv:2506.07900](https://arxiv.org/abs/2506.07900)
* **Foundational Paper:** [arXiv:2404.06395](https://arxiv.org/abs/2404.06395)

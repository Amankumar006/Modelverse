# Ornith 1.0

## Model Overview
Ornith 1.0 is an open-weights family of self-scaffolding models optimized for agentic coding, released by DeepReinforce in June 2026. Post-trained on Gemma 4 and Qwen 3.5 base weights, the Ornith family utilizes a reasoning-first approach where models begin responses with a `<think>` block to strategize before generating code or tool calls. The model family spans compact 9B and 31B dense models, up to massive 35B and 397B Mixture-of-Experts (MoE) frontier sizes, with context windows expandable up to 1M tokens via YaRN RoPE scaling. 

## Capabilities
Unlike conventional coding agents that rely on fixed, human-designed harnesses to manage execution loops and tool calls, Ornith 1.0 features a self-scaffolding capability trained via reinforcement learning (RL). This allows the model to learn and refine its own internal processes, dynamically adapting to complex software engineering tasks. It also incorporates a three-layer defense system (fixed trust boundary, deterministic monitor, and frozen LLM judge) to prevent reward hacking during RL training.

## Example Use Cases
- **Autonomous Software Engineering:** Functioning as a local agentic coder capable of iterative planning, code generation, and self-correction.
- **Local Private Development:** The smaller 9B/31B models and GGUF quantization formats allow developers to run the agent locally for privacy-preserving code generation.
- **Agentic Workflows:** Seamless integration into agent frameworks like vLLM, SGLang, and Transformers using OpenAI-style endpoints.

## Performance & Benchmarks
The flagship 397B MoE model has demonstrated frontier-level performance, reportedly outperforming leading models like Claude Opus 4.7 on rigorous coding and agentic benchmarks, including SWE-Bench Verified and Terminal-Bench 2.1. 

## Intended Use & Limitations
Ornith 1.0 is intended for developers, researchers, and enterprises needing a powerful, open-weights coding agent that can operate autonomously. Because it dynamically generates its own scaffold, it can sometimes pursue unpredictable problem-solving strategies. Despite its three-layer defense system against reward hacking, users should exercise standard precautions and review generated code before executing it in production environments.

## About DeepReinforce
DeepReinforce is an AI research institution focused on advancing reinforcement learning techniques for software engineering and reasoning models.

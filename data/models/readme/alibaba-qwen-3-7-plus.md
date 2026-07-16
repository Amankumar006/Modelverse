# Qwen 3.7 Plus

## Model Overview
Qwen 3.7 Plus is a multimodal flagship agent model developed by Alibaba Cloud, officially released in June 2026. It builds on the robust foundation of the Qwen 3.7 series by integrating vision, language, and code execution into a single, high-performance model. Designed specifically for agentic workflows, Qwen 3.7 Plus can act as a fully capable agent that can "see, think, and act," making it an incredibly versatile tool for developers. It offers a cost-effective alternative to the Qwen 3.7 Max while retaining top-tier multimodal performance.

## Capabilities
* **Multimodal Processing:** Processes text, images, and video natively. It can interpret screenshots, navigate graphical user interfaces (GUIs), and process visual context alongside text prompts.
* **Hybrid Reasoning Modes:** Supports both "Thinking" and "Non-Thinking" modes, allowing developers to scale the model's computational effort and reasoning depth based on the complexity of the task.
* **Persistent "Thinking" Context:** Features a 1-million token context window with specific optimizations for preserving the chain of thought across turns, ensuring stability in long-running agent loops.
* **Action-Oriented:** Optimized for executing tool calls, writing code, and taking actions based on visual and textual inputs.

## Example Use Cases
* **GUI Automation:** Acting as a computer use agent that can view UI screenshots and autonomously navigate software interfaces to accomplish tasks.
* **Multimodal Data Analysis:** Analyzing video streams, complex charts, or documents containing both dense text and diagrams.
* **Cost-Effective Agent Swarms:** Powering multi-agent systems where high capability in multimodal reasoning is required at a lower cost than the flagship Max tier.

## Performance & Benchmarks
Qwen 3.7 Plus performs exceptionally well on coding, reasoning, and multimodal benchmarks, rivaling other frontier-grade models in agentic environments. It is positioned as a highly efficient model, often offering performance comparable to top models but at a significantly reduced cost (e.g., approximately $0.40 per million input tokens).

## Intended Use & Limitations
**Intended Use:** Ideal for developers building multimodal AI agents, GUI automation tools, and applications requiring both visual processing and deep reasoning.
**Limitations:** Like the rest of the Qwen 3.7 family, Qwen 3.7 Plus is a closed-weights, API-only model. It cannot be downloaded for self-hosting. Reliance on external APIs may be a limitation for air-gapped or highly sensitive environments.

## About Alibaba
Alibaba Cloud is a global leader in cloud computing and AI research. Through its Qwen series of large language and multimodal models, Alibaba provides cutting-edge AI infrastructure designed to power next-generation applications, autonomous agents, and enterprise solutions.

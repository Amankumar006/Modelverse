# Kimi K2.7 Code

## Model Overview
**Kimi K2.7 Code** is a 1-trillion-parameter Mixture-of-Experts (MoE) model developed by Moonshot AI, specifically optimized for complex, long-horizon software engineering and agentic coding workflows. With 32 billion active parameters per token and a massive 256K (262,144) token context window, it moves beyond simple snippet generation to autonomous, end-to-end task execution.*

## Capabilities
* **Agentic Workflows:** Designed for multi-step agentic execution, including project planning, codebase navigation, patch generation, and task completion.
* **Reasoning Efficiency:** Operates exclusively in a "thinking mode" with locked sampling parameters (Temperature 1.0, Top-p 0.95) to ensure consistent logic. It achieves a ~30% reduction in "thinking token" overhead compared to its predecessor (K2.6).
* **Multimodal Support:** While primarily focused on text and code, it leverages the MoonViT encoder for native multimodal understanding (text, image, and video input).
* **Instruction Following:** Enhanced reliability for following complex, multi-part instructions in long-context scenarios (up to 256K tokens).

## Example Use Cases
* **Autonomous Software Engineering:** Planning architecture, writing code, and generating complete pull requests for software projects.
* **Codebase Refactoring:** Ingesting large repositories to execute wide-scale migrations or refactors using its long context window.
* **AI Coding Assistants:** Serving as the reasoning engine for tools like GitHub Copilot (available for Pro, Pro+, and Max tiers) or custom AI coding agents.

## Performance & Benchmarks
The model is heavily optimized for coding benchmarks like **SWE-bench**, showing significant improvements in patch generation and code planning accuracy. Its architectural efficiency provides HighSpeed variants that maximize output speed while preserving top-tier logic capabilities, outperforming many proprietary and open-weight models in its class for coding tasks.

## Intended Use & Limitations
The model is intended for developers, AI agent builders, and enterprises needing a robust coding foundation. Because it enforces a strict "thinking mode" with locked sampling parameters, it is not ideal for creative writing or scenarios where output randomness needs to be highly adjusted. Additionally, its large MoE architecture (1T parameters total) requires significant VRAM to self-host effectively, despite the sparse 32B active parameter footprint.

## About Moonshot AI
Moonshot AI is an artificial intelligence research company known for pushing the boundaries of long-context language models and agentic capabilities. With the Kimi family of models, they have focused heavily on solving real-world software engineering challenges, optimizing for reasoning efficiency, and actively contributing open-weights foundation models to the developer community.

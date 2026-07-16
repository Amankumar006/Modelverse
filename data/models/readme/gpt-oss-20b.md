# gpt-oss-20b

## Model Overview
**gpt-oss-20b** (slug: `gpt-oss-20b`) is a medium-sized, open-weight Mixture-of-Experts (MoE) language model released by OpenAI in July 2026. Featuring 21 billion total parameters and 3.6 billion active parameters per forward pass, it is designed for local, low-latency, and specialized use cases.0 license.

## Capabilities
*   **Agentic Optimization:** Highly optimized for agentic tasks including tool use, web browsing, Python code execution, and structured outputs.
*   **Configurable Reasoning:** Supports adjustable reasoning effort (low, medium, high) to tailor the balance of speed and depth.
*   **Chain-of-Thought Transparency:** Provides access to its full chain-of-thought process for interpretability and debugging.
*   **High Efficiency:** Thanks to MXFP4 quantization, the model is remarkably lightweight and can run on consumer-grade hardware with approximately 16GB of memory.

## Example Use Cases
*   **Local Edge AI:** Running sophisticated reasoning tasks locally on consumer hardware or edge devices without relying on cloud APIs.
*   **Private Agentic Systems:** Building autonomous agents for internal corporate data where strict privacy and data security mandates require local execution.
*   **Rapid Prototyping:** Ideal for developers needing a fast, highly capable reasoning model for rapid testing and iteration.

## Performance & Benchmarks
gpt-oss-20b is positioned as a remarkably high-performing reasoning model for its compact size, often delivering performance comparable to the proprietary **o3-mini**.
*   **MMLU:** 85.3
*   **GPQA Diamond:** 71.5
*   **Competition Math (AIME 2024/2025):** 96.0 / 98.7

## Intended Use & Limitations
Intended for developers and organizations that need a lightweight, highly efficient, and capable reasoning model that can be self-hosted on modest hardware. It is strongly recommended to use OpenAI's "harmony" response format when deploying this model to ensure correct behavior. While powerful, its smaller active parameter count compared to the 120b variant means it may not match the larger model's depth in highly complex, multi-layered reasoning scenarios.

## About OpenAI
OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. Alongside their flagship proprietary models, they have released the `gpt-oss` series to empower the open-source community with high-performance, efficient reasoning models.

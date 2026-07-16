# gpt-oss-120b

## Model Overview
**gpt-oss-120b** (slug: `gpt-oss-120b`) is a highly capable open-weight Mixture-of-Experts (MoE) model released by OpenAI in July 2026. With approximately 117 billion total parameters and 5.1 billion active parameters during a forward pass, it represents OpenAI's push into the open-source ecosystem. The model is released under the permissive Apache 2.0 license, making it broadly available for commercial and research use. It is specifically designed to be highly efficient, fitting comfortably on a single 80GB GPU like an NVIDIA H100 or AMD MI300X using MXFP4 quantization.

## Capabilities
*   **Advanced Reasoning:** Designed for high-reasoning, agentic workflows, and general-purpose tasks.
*   **Configurable Reasoning Effort:** Users can adjust reasoning levels (low, medium, high) to balance between generation speed and response accuracy.
*   **Chain-of-Thought (CoT):** Provides developers full access to the internal reasoning process.
*   **Tool Use and Execution:** Native support for function calling, web browsing, and Python code execution.
*   **Structured Outputs:** Highly reliable generation of structured data for seamless integration into developer pipelines.

## Example Use Cases
*   **Enterprise Deployments:** Ideal for businesses needing powerful reasoning capabilities in local or private cloud environments where data privacy and control are critical.
*   **Agentic Workflows:** Powering autonomous AI agents that require robust tool use, coding capabilities, and complex multi-step reasoning.
*   **Research & Fine-Tuning:** Leveraging the permissive Apache 2.0 license, researchers and developers can deeply modify and fine-tune the model for domain-specific applications.

## Performance & Benchmarks
The gpt-oss-120b model offers an exceptional price-to-intelligence ratio. Despite being open-weight and highly optimized, it performs on par with or close to proprietary models like **o4-mini** on core reasoning benchmarks, including MMLU, coding, and mathematical reasoning.

## Intended Use & Limitations
This model is intended for developers, researchers, and enterprises that require self-hosted, private, and customizable high-performance AI. While exceptionally powerful for its size, as an MoE model, its active parameter count is smaller than dense frontier models, which may result in slight performance trade-offs on extremely vast world-knowledge recall compared to massive closed-source counterparts. 

## About OpenAI
OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. They are the creators of the GPT series of models and have expanded their offerings to include highly capable open-weight models under the `gpt-oss` family.

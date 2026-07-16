# Step 3.7 Flash

## Model Overview
Step 3.7 Flash is a high-performance, multimodal sparse Mixture-of-Experts (MoE) vision-language model developed by StepFun. It features an impressive architecture comprising 198 billion parameters in total, which includes a 196B language backbone and a 1.8B vision encoder. By leveraging its sparse MoE design, the model activates only about 11 billion parameters per token, enabling exceptionally fast inference speeds of up to 400 tokens per second. It supports an expansive 256K token context window, making it highly effective for deep contextual understanding. Released under the Apache 2.0 license, this model is positioned as an advanced solution for high-memory local hardware and API deployment.

## Capabilities
* **Sparse Mixture-of-Experts (MoE):** Employs an efficient parameter activation strategy to deliver maximum performance with lower latency.
* **Native Multimodality:** Offers robust image understanding, capable of processing and analyzing visual interfaces, charts, and complex datasets directly.
* **Large Context Processing:** The 256K context window enables the model to ingest, analyze, and retain information across extremely long documents and lengthy interactions.
* **Selectable Reasoning Levels:** Provides low, medium, and high reasoning tier configurations, allowing developers to balance speed, cost, and analytical depth for specific workloads.
* **Agentic Workflows:** Specifically engineered to orchestrate autonomous coding, multi-step search loops, and tool usage seamlessly.

## Example Use Cases
* **Autonomous Agents:** Ideal for powering autonomous coding assistants and tools that require multi-step reasoning and execution loops.
* **Document and Visual Parsing:** Excellent for digesting extensive reports that blend long-form text with complex graphs, charts, and visual interfaces.
* **High-Speed Multimodal Chatbots:** Enables responsive, context-aware conversational AI for customer support or enterprise search that relies on fast token generation.

## Performance & Benchmarks
Step 3.7 Flash delivers state-of-the-art inference speeds for its size class, generating up to 400 tokens per second. Its MoE architecture allows it to punch above its weight, maintaining high fidelity in reasoning and visual tasks while utilizing only a fraction of its total 198B parameters per forward pass.

## Intended Use & Limitations
The model is intended for enterprise developers, researchers, and creators looking to build fast, multimodal AI agents and applications. It is particularly suited for high-memory environments, such as systems with 128GB of unified memory. While highly efficient, deploying the full model locally requires substantial hardware resources. 

## About StepFun
StepFun is an AI research and development company dedicated to advancing the frontier of multimodal and agentic artificial intelligence. They focus on delivering highly optimized, accessible, and scalable models like the Step Flash series to empower developers and researchers with cutting-edge tools under permissive licenses.

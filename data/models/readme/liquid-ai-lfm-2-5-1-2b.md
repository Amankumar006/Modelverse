# LFM 2.5 1.2B

## Model Overview
**LFM 2.5 1.2B** (Liquid Foundation Model 2.5, 1.2 Billion parameters) is a highly optimized, hybrid AI model developed by Liquid AI. Engineered specifically for edge AI and on-device deployment, it is part of the LFM 2.5 family which utilizes a novel architecture known as Liquid Neural Networks (LNN). The model combines gated short-range convolutions (LIV blocks) with a minimal number of Grouped Query Attention (GQA) blocks to achieve high performance with a dramatically reduced memory footprint. Typically requiring less than 1 GB of RAM, it is ideal for deployment on consumer hardware such as Raspberry Pi, smartphones, and local laptops without requiring a continuous cloud connection. The model comes in reasoning-focused ("Thinking") and general-purpose instruction-tuned ("Instruct") variants, trained on up to 28 trillion tokens.

## Capabilities
*   **Edge Reasoning & "Thinking":** The *Thinking* variant can generate step-by-step chain-of-thought traces locally before producing a final answer, which enables advanced mathematical reasoning and code generation entirely on-device.
*   **Instruction Following & Chat:** The *Instruct* variant provides general-purpose chat capabilities, rapid instruction following, and integration into standard agentic pipelines with zero latency.
*   **Large Context Window:** Despite its small parameter count, it supports a long context length of up to 32K tokens.
*   **Memory Efficiency:** Can run inference entirely offline on resource-constrained devices like CPUs and standard mobile chipsets.

## Example Use Cases
*   **Local AI Agents:** Deploying privacy-preserving AI assistants on smartphones and laptops that do not send data back to a central cloud server.
*   **Embedded Systems:** Running local inference on robotics or IoT devices (like a Raspberry Pi) for real-time decision making.
*   **On-Device Tool Use:** Enabling edge devices to trigger local APIs, perform data extraction, and handle latency-sensitive commands.

## Performance & Benchmarks
While exact benchmark scores are continuously updated, the LFM 2.5 1.2B models are noted for outperforming significantly larger models in specific local-execution benchmarks. Their hybrid architecture allows them to maintain competitive reasoning scores while operating exponentially faster and with less memory overhead than traditional transformer-only architectures of similar sizes.

## Intended Use & Limitations
*   **Intended Use:** Designed for developers looking to build local, private, and zero-latency AI applications. It is well-suited for mobile applications, edge computing, and offline use cases.
*   **Limitations:** With only 1.2 billion parameters, it may struggle with encyclopedic knowledge recall or highly nuanced, complex creative writing tasks compared to massive cloud-based models like GPT-4 or Claude 3. It is best used for focused, instruction-following tasks rather than general broad knowledge queries.

## About Liquid AI
**Liquid AI** is an artificial intelligence company known for its pioneering work on Liquid Neural Networks (LNNs)—dynamic, highly efficient AI architectures that adapt to new data streams. Formed by researchers with ties to MIT, the company focuses on building powerful foundation models that bring high-level intelligence to edge devices, prioritizing efficiency, privacy, and speed over simply scaling up parameter counts.

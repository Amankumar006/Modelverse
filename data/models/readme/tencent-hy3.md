# Hy3

## Model Overview
Hy3 (Hunyuan 3) is Tencent's flagship open-weights language model, representing a massive leap in reasoning, agentic workflows, and productivity. Released under the Apache 2.0 license on July 6, 2026, Hy3 boasts a staggering 295 billion total parameters. It utilizes a highly efficient Mixture-of-Experts (MoE) architecture, activating just 21 billion parameters per token via top-8 routing across 192 experts. Designed specifically for long-context analysis and complex multi-step logic, Hy3 introduces innovative architectural features like a dedicated 3.8B Multi-Token Prediction (MTP) layer, setting a new standard for open-weights reasoning efficiency.

## Capabilities
* **Advanced Hybrid Reasoning:** Equipped with an active chain-of-thought configuration, the model excels at deeply analytical tasks, mathematical logic, and complex problem-solving.
* **Configurable 'Reasoning Effort':** Developers can dynamically adjust the depth of the model's chain-of-thought, balancing inference time against reasoning thoroughness.
* **Massive Context Processing:** Features a massive 256K token context window, allowing for the ingestion and analysis of entire codebases, extensive document libraries, and long-running conversation histories.
* **Speculative Decoding (MTP Layer):** The integrated 3.8B parameter MTP layer acts as a built-in draft model, predicting multiple future tokens simultaneously. This allows the main model to verify drafts in parallel, massively boosting generation speed.

## Example Use Cases
* **Agentic Workflows:** Acting as the central "brain" for multi-agent systems, efficiently managing tool calling, planning, and executing complex, multi-step API interactions.
* **Software Engineering:** Code generation, repository-scale refactoring, bug detection, and frontend development tasks, taking advantage of its deep reasoning and 256K context window.
* **Data Analysis & Processing:** Synthesizing insights from massive datasets, logs, or long-form documents to generate structured reports and strategic recommendations.
* **High-Throughput Serving:** Enterprise deployment where the built-in MTP speculative decoding layer can be leveraged to maximize queries-per-second (QPS) and reduce latency.

## Performance & Benchmarks
Hy3 is positioned at the cutting edge of open-weights language modeling, explicitly optimized for productivity and reasoning benchmarks.
* **SWE-bench Excellence:** Demonstrates top-tier performance on software engineering benchmarks (SWE-bench), rivaling leading closed-source developer models.
* **Inference Throughput:** Thanks to the MTP architecture, Hy3 achieves 1.5x to 2x higher decoding throughput compared to traditional models of similar active parameter counts, making it exceptionally cost-effective to run via frameworks like vLLM.
* **Routing Efficiency:** The sparse MoE design (192 experts, top-8 routing) ensures that despite its 295B size, computational overhead during inference is kept remarkably low (21B active parameters).

## Intended Use & Limitations
Hy3 is intended for developers, researchers, and enterprises seeking a powerful, locally hostable model for reasoning and productivity tasks. 
* **Intended Use:** The permissive Apache 2.0 license encourages broad commercial integration. It is highly recommended for tasks requiring deep logic, coding assistance, and massive context digestion.
* **Limitations:** Serving a 295B parameter model (even sparsely activated) requires significant VRAM overhead to hold the full model weights in memory, necessitating multi-GPU enterprise hardware (e.g., multiple 80GB GPUs) for efficient local deployment. While the MTP layer significantly accelerates generation, optimal performance requires specific tuning in serving engines (e.g., setting `num_speculative_tokens=1` in vLLM).

## About Tencent
Tencent is a premier global technology corporation driving innovation in artificial intelligence, gaming, and cloud services. The Hunyuan AI project embodies Tencent's commitment to building world-class, open-source foundation models. By releasing flagship models like Hy3, Tencent provides the global AI community with state-of-the-art tools for reasoning, software development, and next-generation agentic applications.

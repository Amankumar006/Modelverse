# MiniMax-M3

## Model Overview
MiniMax-M3 is a native multimodal foundation model developed by MiniMax. It integrates frontier-level coding, agentic reasoning, and a massive 1-million-token context window into a single open-weight architecture. Featuring a total of 428B parameters (with 23B active parameters per token), it utilizes a proprietary architecture known as MiniMax Sparse Attention (MSA) to solve the quadratic computational cost typically associated with standard attention in long-context models.

## Capabilities
- **Native Multimodality:** Trained with mixed-modality data from the start, allowing for deep semantic fusion across text, image, and video inputs.
- **Ultra-Long Context:** Supports a context window of up to 1 million tokens, maintaining high performance for large-scale analysis without the traditional memory overhead.
- **MiniMax Sparse Attention (MSA):** A two-branch system built upon Grouped Query Attention (GQA) that scores and selects highly relevant key-value blocks, performing exact attention only on the subset.
- **Frontier-Level Coding & Agentic Work:** Excels at complex, long-horizon tasks, autonomous task decomposition, multi-step reasoning, and tool invocation (including desktop and terminal operation).

## Example Use Cases
- **Automated Code Reviews:** Analyzing entire repositories simultaneously to identify bugs, security vulnerabilities, and cross-file dependencies.
- **Long-Horizon Agentic Workflows:** Powering persistent AI agents that need to remember state across sessions, browse the web, or automate multi-step tasks across software tools.
- **Complex Debugging:** Processing massive error logs, stack traces, and entire codebases to accurately trace bugs to their root cause.
- **Large-Scale Refactoring:** Executing codebase-wide updates and framework migrations where maintaining global context is critical.
- **Multimodal Analysis:** Handling tasks that require the integration of video, image, and textual data in long-form environments.

## Performance & Benchmarks
MiniMax-M3 is highly competitive with leading closed-source frontier models and stands out as a top-tier open-weight model:
- **SWE-bench Pro:** ~59%, demonstrating exceptional capabilities in debugging, code refactoring, and feature implementation.
- **Terminal-Bench 2.1:** ~66%
- **KernelBench Hard:** ~28.8%
- **Efficiency:** MSA significantly reduces memory and compute footprints, achieving approximately 28.4× less compute per token at 1M context compared to dense GQA, with massive speedups on prefill and decoding.

## Intended Use & Limitations
MiniMax-M3 is ideal for developers and enterprises needing a highly capable open-weights model for long-context reasoning, coding, and multimodal processing. While its Sparse Attention mechanism is highly efficient, self-hosting a 428B MoE model still requires significant infrastructure. Its agentic capabilities must be deployed with appropriate safety boundaries to prevent unintended actions during autonomous workflows.

## About MiniMax
MiniMax is a Shanghai-based artificial intelligence company known for developing cutting-edge foundation models. With a strong focus on open-weights releases and architectural innovations like MiniMax Sparse Attention, MiniMax is recognized for pushing the boundaries of what is possible in long-context reasoning and multimodal AI capabilities.

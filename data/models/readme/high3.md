## Model Overview
High3 (also referred to as Hunyuan-High3 or Hy3) is a powerful open-weights Mixture-of-Experts (MoE) model developed by Tencent, released on July 7, 2026. *Note: Some technical details are derived from video transcripts and recent announcements.* High3 features 295 billion total parameters, with only 21 billion active during inference. It is designed to punch above its weight class, competing directly with much larger trillion-parameter models in reasoning, math, and agentic coding.

## Capabilities
- **Massive Context Window:** Supports an impressive 1 million token context window, allowing for the ingestion and analysis of massive documents, codebases, or datasets simultaneously.
- **Efficient MoE Architecture:** Despite its 295B total parameters, the model only activates 21B parameters per token, making it highly efficient for inference.
- **Multi-Agent Collaboration:** Optimized for complex, multi-agent workflows where the model coordinates various sub-tasks to achieve a broader goal.
- **Agentic & Vibe-Coding:** Exceptional capabilities in generating UI components, web applications, and performing agentic coding tasks.
- **Enterprise Integration:** Accompanied by an "Industry Template Library" covering 12 vertical fields (e.g., finance, healthcare), enhancing its utility for specialized enterprise applications.

## Example Use Cases
- **Enterprise Multi-Agent Systems:** Deploying coordinated AI agents to handle complex business operations in finance, healthcare, or industrial sectors.
- **Vibe-Coding & UI Generation:** Rapidly prototyping web applications, frontend components, and user interfaces directly from natural language prompts.
- **Long-Document Analysis:** Summarizing, querying, and extracting insights from massive code repositories or extensive legal and financial documents using its 1M token context window.
- **Self-Hosted AI Solutions:** Ideal for small and medium-sized enterprises (SMEs) looking to run a powerful, cost-effective open-weights model locally or on private cloud infrastructure.

## Performance & Benchmarks
High3 is designed for exceptional cost-efficiency, projecting a 40% reduction in inference costs for SMEs compared to traditional dense models. While specific raw benchmark numbers are still emerging, Tencent asserts that High3 competes closely on agentic and reasoning benchmarks against closed-source models that are 4 to 5 times its size.

## Intended Use & Limitations
**Intended Use:** High3 is intended for developers and enterprises who need a highly capable, open-weights model for self-hosting. It is particularly well-suited for agentic coding, long-context analysis, and specialized industry applications.
**Limitations:** While open-weights, the license is Custom/Other, meaning commercial use may have specific restrictions defined by Tencent. Its performance in highly specific, non-Chinese localized tasks may vary, and running a 295B MoE still requires significant hardware for self-hosting.

## About Tencent
Tencent is a global technology and entertainment conglomerate headquartered in China. A major player in cloud computing and AI research, Tencent develops the Hunyuan series of large models. The company focuses on integrating advanced AI capabilities into its vast ecosystem of enterprise services, social platforms, and gaming networks.

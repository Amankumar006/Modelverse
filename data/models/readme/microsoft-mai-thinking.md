# MAI Thinking

*

## Model Overview
MAI-Thinking-1 is a flagship reasoning model developed internally by Microsoft AI (MAI), introduced in June 2026. Built from the ground up using Microsoft's "Hill-Climbing Machine" pipeline, it emphasizes clean, enterprise-grade, human-authored data without relying on distillation from other labs. As a sparse Mixture of Experts (MoE) model with 35B active parameters (and ~1T total parameters), it brings the control of open-source models with the managed infrastructure and guarantees of a closed-source enterprise model.

## Capabilities
- **Reasoning Architecture:** Generates an internal chain of thought before providing a final answer, allowing it to handle complex, multi-step analytical tasks effectively.
- **Enterprise Integration:** Features native integration with Azure AI Foundry, Microsoft Fabric, and Microsoft 365 Copilot.
- **Advanced Context:** Supports a 256k token context window, function calling, and complex developer instructions.
- **Clean Data Provenance:** Trained on highly curated, auditable, and compliant enterprise-grade data.

## Example Use Cases
- **Complex Analytical Reasoning:** Ideal for tasks requiring logic, mathematical rigor, and multi-step problem-solving.
- **Software Engineering:** Highly suited for complex coding tasks, agentic workflows, and build-environment automation.
- **Enterprise Workflows:** Perfect for organizations requiring transparency regarding training data lineage and avoiding the risks associated with opaque model sources.
- **Azure-Native Development:** Recommended for developers operating within the Azure ecosystem needing deep integration with existing authentication, access controls, and governance logging.

## Performance & Benchmarks
MAI-Thinking-1 is highly competitive with other frontier-grade models in its weight class. Key reported metrics include:
- **SWE-Bench Pro:** ~52.8%
- **AIME 2025:** 97.0%
- **LiveCodeBench v6:** 87.7%
- **Human Preference:** Microsoft reports preference over competitors like Claude Sonnet 4.6 in blind human side-by-side evaluations.

## Intended Use & Limitations
The model is specifically positioned for high-stakes enterprise applications that require precision, data provenance, and compliance.It may over-think simple prompts due to its inherent chain-of-thought design, leading to higher latency on trivial tasks compared to standard reactive models.

## About Microsoft
Microsoft is a leading global technology provider and a pioneer in cloud computing and enterprise artificial intelligence. Through Microsoft AI, the company focuses on delivering robust, secure, and highly capable AI models designed specifically to integrate seamlessly into modern enterprise ecosystems like Azure and Microsoft 365.

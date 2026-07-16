# Kimi K2.5

## Model Overview
**Kimi K2.5** is an open-weights, native multimodal model developed by **Moonshot AI**, released on January 27, 2026. It utilizes a massive Mixture-of-Experts (MoE) architecture with approximately 1 Trillion total parameters (32B active per token). K2.5 establishes Moonshot's Agent Swarm paradigm, allowing it to seamlessly handle text and visual inputs while orchestrating complex, multi-agent workflows within a 256K token context window.

## Capabilities
* **Agent Swarm Technology:** Capable of orchestrating up to 100 specialized sub-agents working in parallel to decompose and execute complex tasks.
* **Native Multimodality:** Incorporates the MoonViT 400M parameter vision encoder to natively process and understand both text and images.
* **Operational Modes:** Offers distinct modes including Instant (fast responses), Thinking (analytical reasoning), Agent (tool-calling), and Agent Swarm (multi-agent coordination).
* **High Efficiency:** The MoE architecture (32B active parameters) ensures frontier-level performance with reduced inference costs.

## Example Use Cases
* **Advanced Software Development:** Especially proficient in front-end development and coding tasks.
* **Autonomous Workflows:** Breaking down large enterprise tasks into parallel sub-tasks using the Agent Swarm.
* **Multimodal Analysis:** Analyzing complex visual data alongside large textual documents.

## Performance & Benchmarks
Trained on approximately 15 trillion tokens of mixed visual and textual data, K2.5 delivers highly competitive performance on complex reasoning benchmarks such as Humanity's Last Exam (HLE). Its Agent Swarm feature is noted to reduce task execution time by up to 4.5x compared to single-agent setups.

## Intended Use & Limitations
* **Intended Use:** General-purpose multimodal tasks, agentic workflows, and self-hosted enterprise orchestration.
* **Limitations:** Multi-agent orchestration (Agent Swarm) requires careful prompt engineering and may consume significant computational resources when deploying all 100 sub-agents simultaneously.

## About Moonshot AI
Moonshot AI is a leading artificial intelligence company focused on pushing the boundaries of long-context understanding and agentic workflows. With the K2 series, they have pioneered the open-weights Agent Swarm concept, making large-scale autonomous AI accessible to developers for self-hosting and customization.

# Agents A1

## Model Overview
Agents A1 is a 35-billion-parameter Mixture-of-Experts (MoE) agentic model developed by the InternScience group at the Shanghai Artificial Intelligence Laboratory. Released as an open-weights model, it is designed to provide trillion-parameter-level performance for long-horizon agentic tasks. Built on a base of Qwen3.5-35B-A3B, Agents A1 focuses on "agent-horizon scaling" rather than merely parameter scaling, meaning it is specifically optimized for maintaining coherence, reasoning, and tool use over extended, multi-step tasks. 

## Capabilities
- **Mixture-of-Experts (MoE) Architecture**: Boasts 35 billion total parameters with approximately 3 billion active parameters per token, enabling massive capability scaling while maintaining computational efficiency.
- **Massive Context Window**: Supports an impressive 256K-token context window, allowing it to process and analyze repository-level codebases and lengthy documents.
- **Long-Horizon Planning**: Trained on long-horizon knowledge-action trajectories averaging 45,000 tokens, enabling it to execute complex reasoning, tool use, execution feedback, and verification over extended periods.
- **Autonomous Tool Use**: Highly proficient at integrating and operating external tools such as search engines, code interpreters, and data analysis utilities.

## Example Use Cases
- **Scientific Reasoning**: Assisting researchers with complex, multi-step literature reviews, data analysis, and hypothesis generation.
- **Research-Level Coding & ML Engineering**: Serving as an autonomous software engineer capable of navigating entire code repositories, writing features, and debugging complex ML systems.
- **Extended Task Automation**: Managing complex, long-running workflows that require iterative feedback loops, such as autonomous research or comprehensive system auditing.

## Performance & Benchmarks
Agents A1 has demonstrated state-of-the-art performance against much larger, trillion-parameter models. It achieves highly competitive results on rigorous benchmarks like SEAL-0, IFBench, HiPhO, and various complex scientific reasoning evaluations. Its three-stage training recipe—incorporating multi-teacher domain distilled routing—allows it to perform efficiently with only 3B active parameters per token while mimicking the expertise of significantly larger dense models.

## Intended Use & Limitations
**Intended Use**: Targeted towards researchers, developers, and ML engineers who need open-source, highly capable agentic models for complex workflow automation, software engineering, and scientific exploration. 

**Limitations**: 
- While it boasts a 256K context window, effectively managing and retrieving information across the entirety of that context can still present challenges in highly ambiguous tasks.
- As an MoE model, deployment and serving (e.g., via vLLM or SGLang) require specific infrastructure setups to manage the memory footprint of the full 35B parameters.

## About Shanghai AI Laboratory (InternScience)
The Shanghai Artificial Intelligence Laboratory is a leading global institution dedicated to advancing fundamental AI research and open-source models. The InternScience group focuses specifically on building cutting-edge models that empower scientific discovery and complex reasoning tasks. By open-sourcing models like Agents A1 under the Apache-2.0 license, the lab continues its mission to democratize access to advanced, high-performance artificial intelligence.

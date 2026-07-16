# Claude 2

## Model Overview
Claude 2, released on July 11, 2023, represents the second major generation of Anthropic's foundational language models. Building upon the safety-first foundation of Claude 1, Claude 2 delivered significant enhancements in logical reasoning, coding, and mathematics, alongside a massively expanded context window. It was the first Anthropic model to be made available directly to the public via the claude.ai web interface, in addition to its API deployment.

## Capabilities
Claude 2 brought several major advancements over its predecessor:
- **Extended Context Window:** Featured a 100K token context window, enabling the model to ingest, analyze, and synthesize hundreds of pages of documentation, long books, or extensive codebases in a single prompt.
- **Advanced Coding & Math:** Demonstrated substantial improvements in technical tasks, writing more reliable Python code and solving complex grade-school math problems.
- **Enhanced Reasoning:** Exhibited high-level performance in reading, writing, and analytical tasks, performing exceptionally well on standardized tests.
- **Constitutional AI:** Continued Anthropic's commitment to safety, utilizing Constitutional AI to remain helpful, harmless, and honest while being less prone to jailbreaks than its peers.

## Example Use Cases
- **Legal & Financial Analysis:** Analyzing massive legal contracts, financial reports, or SEC filings in a single prompt due to the 100K context window.
- **Software Development:** Assisting with code generation, debugging, and explaining complex programming concepts.
- **Academic Research:** Synthesizing multiple long-form research papers to extract methodologies and conclusions.
- **Content Creation:** Generating high-quality, long-form content, essays, and creative writing with better coherence over extended passages.

## Performance & Benchmarks
At the time of its release in mid-2023, Claude 2 achieved highly competitive scores across industry-standard benchmarks:
- **Codex HumanEval (Python coding):** 71.2%
- **GSM8k (Grade-school math):** 88.0%
- **Multistate Bar Exam (Multiple choice):** 76.5%
- **MMLU (5-shot CoT):** 78.5%
- **GRE Reading/Writing:** Scored above the 90th percentile, demonstrating exceptional verbal and reading comprehension abilities.

## Intended Use & Limitations
**Intended Use:**
Claude 2 was designed for professionals, developers, and enterprises needing to process large volumes of text and perform complex reasoning tasks while adhering to strict safety constraints.

**Limitations:**
- **Legacy Status:** As of 2026, Claude 2 is a retired model, succeeded by much more powerful iterations like Claude 3, Opus, and newer families.
- **Text-Only Modality:** It did not natively support image processing or other non-text modalities.
- **Hallucinations:** While improved over Claude 1, it could still occasionally invent facts or confidently state incorrect information.
- **API/Web Interface Only:** It was restricted to API access and the claude.ai interface, without support for local deployment.

## About Anthropic
Anthropic is an AI safety and research company based in San Francisco. Founded in 2021 by former OpenAI members, Anthropic focuses on developing highly capable, reliable, and interpretable AI systems. The company is best known for its Claude family of AI assistants and its pioneering work on Constitutional AI—a framework designed to train AI systems to adhere to a specific set of human values and ethical principles.

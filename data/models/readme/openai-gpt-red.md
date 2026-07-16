## Model Overview

GPT-Red is an automated AI red-teaming system developed by OpenAI, officially announced on July 15, 2026. Designed as an internal security and adversarial testing tool, GPT-Red simulates highly sophisticated human prompt injection attacks and discovers vulnerabilities in language models prior to deployment. Operating via an API-only deployment, it serves as a critical defense mechanism, testing the boundaries of agentic systems and generative models to ensure robust safety standards.

## Capabilities

*   **Automated Adversarial Simulation:** Acts as a relentless adversarial agent that generates, observes, and iterates on prompt injection attacks to achieve malicious goals (e.g., data exfiltration) at scale.
*   **Self-Play Reinforcement Learning:** Trained using an advanced self-play RL architecture where GPT-Red acts as the attacker against defending models, creating a continuous feedback loop of security improvements.
*   **Vulnerability Discovery:** Specially tailored to detect, exploit, and help mitigate prompt injection vulnerabilities and jailbreaks in complex agentic workflows.
*   **Real-World System Testing:** Capable of attacking not just isolated models, but live deployed agentic systems, including command-line agents and physical AI-run interfaces.

## Example Use Cases

*   **Pre-Deployment Security Audits:** Continuously probing new foundational models (such as GPT-5.6) for jailbreaks and alignment flaws before they are released to the public.
*   **Agentic Workflow Stress-Testing:** Attacking AI agents that have access to sensitive tools (like databases or payment systems) to ensure they cannot be manipulated into performing unauthorized actions.
*   **Automated Red-Teaming at Scale:** Replacing manual human red-teaming with a faster, more exhaustive automated system that can test millions of attack vectors overnight.

## Performance & Benchmarks

GPT-Red has dramatically accelerated the vulnerability discovery process at OpenAI. Its integration into the training pipeline of subsequent models, such as GPT-5.6 Sol, has resulted in those models being substantially more resistant to prompt injection and adversarial attacks compared to their predecessors. Trained via massive-scale self-play, GPT-Red represents state-of-the-art capabilities in offensive AI simulation, though specific parameter counts and internal benchmarks remain strictly undisclosed.

## Intended Use & Limitations

GPT-Red is intended exclusively for internal use by OpenAI as an automated security testing and red-teaming system. It is designed to harden AI models and agentic systems against exploitation.
**Limitations:** OpenAI has explicitly stated that GPT-Red will not be released to the public or provided as a developer API, as its advanced offensive capabilities pose significant risks if acquired by malicious actors. It is a specialized tool constrained to defensive security research.

## About OpenAI

OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. By developing advanced security systems like GPT-Red, OpenAI leads the industry in proactive AI safety, adversarial robustness, and the secure deployment of agentic models.

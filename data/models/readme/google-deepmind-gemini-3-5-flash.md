# Gemini 3.5 Flash

## Model Overview
Gemini 3.5 Flash is a high-efficiency multimodal model from Google DeepMind, released on May 19, 2026. Designed specifically for agentic workflows, complex reasoning, and coding tasks, it is a frontier model that balances high-speed performance with capabilities that rival or exceed larger flagship models. As part of the Gemini 3 family, it serves as the default "workhorse" model for the Gemini app and AI Mode in Google Search, delivering "near-Pro" intelligence at a "Flash-tier" cost and speed.

## Capabilities
* **Agentic & Coding Performance:** Built for autonomous agent loops and multi-step workflows. It excels at planning and executing complex actions across various environments.
* **Multimodal Reasoning:** Processes text, images, audio, video, and code. It is highly capable in chart-and-data reasoning and complex visual tasks like document understanding and object counting.
* **Computer Use:** Features native "computer use" capabilities, allowing the model to interact with browser, desktop, and mobile environments to automate long-horizon tasks.
* **Massive Context Window:** Supports a 1,048,576 token (approx. 1 million) context window, enabling it to ingest and process vast amounts of data, such as entire codebases, long meeting transcripts, or books in a single prompt.

## Example Use Cases
* **Autonomous AI Agents:** Powering multi-step, complex agentic workflows that require continuous planning and tool execution.
* **Codebase Analysis & Generation:** Analyzing massive code repositories, identifying bugs, and generating production-ready code.
* **Data Extraction & Multimodal Search:** Extracting structured data from hours of video, audio transcripts, or hundreds of document pages simultaneously.
* **Desktop Automation:** Interacting directly with graphical user interfaces to automate repetitive workflows on computers or mobile devices.

## Performance & Benchmarks
Gemini 3.5 Flash has demonstrated significant leadership in benchmarks focused on agentic behavior and coding:
* **Terminal-Bench 2.1:** Scored 76.2%, outperforming several previous flagship models.
* **MCP Atlas:** Achieved 83.6% in multi-step workflows.
* **SWE-Bench Pro:** Achieved 55.1% in agentic coding tasks.
* **CharXiv Reasoning:** Scored 84.2%, surpassing Gemini 3.1 Pro (83.2%).
* **MMMU-Pro (no tools):** Scored 83.6%.
* **Vision:** Set a record for the highest score ever recorded on the Roboflow Vision Evals leaderboard.

## Intended Use & Limitations
* **Intended Use:** Fast, scalable, and complex multimodal and agentic tasks where high throughput and low latency are critical.
* **Limitations:** While exceptionally fast and capable, extremely specialized or deeply nuanced creative tasks might still occasionally benefit from a larger "Pro" or "Ultra" tier model depending on the workload.

## About Google DeepMind
Google DeepMind is a premier artificial intelligence research laboratory, formed by the merger of Google Brain and DeepMind. Their mission is to solve intelligence to advance science and benefit humanity, creating general-purpose AI systems like the Gemini family that can learn, reason, and interact safely and efficiently with the world.

## Model Overview
Bernini is a unified artificial intelligence framework for video generation and editing developed by ByteDance Research. Introduced in May 2026, the model employs a "partitioned" architecture that separates semantic understanding from pixel rendering. This design includes a Semantic Planner based on Qwen 2.5-VL-7B for reasoning and planning, and a Renderer utilizing a Diffusion Transformer (DiT) based on the Wan 2.2-A14B model for synthesizing high-quality visual outputs. Named after the Italian Baroque sculptor Gian Lorenzo Bernini, the framework excels at minimizing common video generation issues such as flickering and drift in untouched regions.

## Capabilities
- **Text-to-Video Generation:** Creates high-quality video sequences from descriptive text prompts.
- **Instruction-Based Video Editing:** Modifies existing videos based on natural language instructions.
- **Reference-Guided Editing:** Edits video content while adhering to provided visual references.
- **Subject-to-Video Generation:** Generates videos centered around specific, user-provided subjects.
- **Content Insertion:** Seamlessly integrates new elements into existing video footage.

## Example Use Cases
- Professional video editing and post-production, automating complex visual modifications.
- Generating cinematic sequences from scripts or storyboards for filmmakers and content creators.
- Creating dynamic marketing content by animating static images or integrating specific subjects into new environments.

## Performance & Benchmarks
By separating semantic planning from pixel generation, Bernini demonstrates superior performance in maintaining temporal consistency and spatial coherence. It effectively minimizes artifacts like flickering and drift, which are common in traditional diffusion models, resulting in highly stable and realistic video outputs suitable for commercial applications.

## Intended Use & Limitations
Bernini is intended for both academic research and commercial applications in video production and editing. Released under the Apache License 2.0, it allows for wide adoption and modification. However, as a complex dual-model framework, it requires substantial computational resources for inference and fine-tuning. Users should also consider the ethical implications of video generation, including the potential for generating misleading content.

## About ByteDance Research
ByteDance Research is the research and development arm of ByteDance, a global technology company known for innovative applications of artificial intelligence. The research division focuses on advancing the state-of-the-art in machine learning, computer vision, natural language processing, and generative AI, often releasing open-source models and frameworks to foster community collaboration and innovation.

# DiffusionGemma

## Model Overview
DiffusionGemma is an experimental, open-weights text diffusion model developed by Google DeepMind. Built upon the Gemma 4 26B Mixture-of-Experts (MoE) architecture, it shifts away from traditional sequential autoregressive decoding in favor of parallel block decoding. This allows the model to generate up to 256 tokens simultaneously, acting across a continuous "canvas" rather than one token at a time. This paradigm shift offers significant latency reductions and novel approaches to text generation and refinement.

## Capabilities
- **Parallel Block Decoding:** Generates up to 256 tokens simultaneously in a single forward pass, providing massive improvements in latency.
- **Bi-Directional Attention:** All tokens can attend to all other tokens simultaneously, which is highly advantageous for code infilling, editing, and handling non-linear data structures.
- **Self-Correction & Refinement:** Intelligently iterates on text blocks, refining and self-correcting outputs during the diffusion process.
- **Mixture of Experts (MoE):** Operates on a highly efficient MoE footprint, utilizing a total of 26B parameters while only activating 3.8B per step.
- **Multimodal Inputs:** Natively supports text, image, and video inputs to condition the generated text.

## Example Use Cases
- **High-Speed Text Generation:** Generating massive amounts of text rapidly in latency-sensitive applications where traditional LLMs bottleneck.
- **Code Infilling & Editing:** Its bi-directional attention makes it exceptionally capable at inserting code or text into the middle of existing documents, unlike strictly left-to-right autoregressive models.
- **Iterative Drafting:** Applications that require continuous refinement and self-correction of generated content over multiple passes.
- **Local & Edge Deployment:** Its high compute efficiency and manageable active parameter count (3.8B) make it highly suitable for execution on high-end consumer hardware or edge devices.

## Performance & Benchmarks
- **Inference Speed:** Delivers up to 4x faster text generation compared to equivalent autoregressive models.
- **Throughput Benchmarks:** Achieves 1000+ tokens per second on an NVIDIA H100 GPU and 700+ tokens per second on a consumer-grade NVIDIA GeForce RTX 5090.
- **Task Specifics:** While raw generation speed is unprecedented, zero-shot performance on complex reasoning tasks may lag behind standard autoregressive Gemma 4 models. However, its performance significantly improves on specific logic tasks (like Sudoku) when fine-tuned.

## Intended Use & Limitations
DiffusionGemma is released under an Apache 2.0 license, aimed at researchers and developers exploring the frontiers of non-autoregressive text generation and efficient inference. 
**Limitations:**
- Output quality on complex, sequentially dependent reasoning tasks may initially be lower than traditional state-of-the-art LLMs, requiring fine-tuning for specific applications.
## About Google DeepMind
Google DeepMind is a world-leading artificial intelligence research laboratory dedicated to advancing AI for the benefit of humanity. With breakthroughs spanning from AlphaFold's protein structure predictions to the Gemini family of multimodal models, DeepMind consistently pioneers new techniques in machine learning, model efficiency, and generative AI.

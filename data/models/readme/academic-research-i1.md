# i1

## Model Overview
The i1 model is a 3-billion-parameter text-to-image diffusion model developed by researchers at Princeton University. Designed as a "fully open" recipe for text-to-image generation, i1 distinguishes itself from many state-of-the-art proprietary models by providing public access to its model weights, training code, and data. It is built on a Multi-Modal Diffusion Transformer (MMDiT) backbone and incorporates advanced design features like a large text encoder adapter, long skip connections, and a combination of sinusoidal and Rotary Positional Embedding (RoPE).

## Capabilities
- **Text-to-Image Generation:** Produces high-quality, 1024-resolution images from textual descriptions.
- **Open Architecture:** Fully transparent modeling and data choices, allowing researchers to study and modify the model easily.
- **Optimized Transformer Backbone:** Utilizes an MMDiT architecture tailored for efficient and high-fidelity visual generation.
- **Robust Positional Embeddings:** Combines sinusoidal and RoPE positional embeddings to better capture spatial relationships and complex compositions.

## Example Use Cases
- **Academic Research:** Serving as a fully open baseline for researchers developing new diffusion models, sampling algorithms, or fine-tuning techniques.
- **Creative Content Generation:** Generating illustrations, concept art, and visual assets based on user prompts.
- **Educational Purposes:** Providing a transparent, end-to-end example of a modern, large-scale text-to-image model for students and educators in AI.
- **Custom Model Development:** Acting as a strong foundation model that developers can fine-tune for specific domains, styles, or tasks without the restrictions of closed models.

## Performance & Benchmarks
Developed after more than 300 controlled experiments and over 700,000 TPU v6e hours of evaluation, i1 is highly competitive with leading open-weight models at the 1024-resolution mark. It significantly outperforms existing fully open models across a variety of industry-standard benchmarks, including:
- GenEval
- DPG-Bench
- PRISM
- CVTG-2K
- LongText-Bench

## Intended Use & Limitations
**Intended Use:**
The i1 model is intended for research, education, and open-source development. It is designed to foster transparency, collaboration, and innovation in the field of generative AI by providing a strong, fully open baseline.

**Limitations:**
- As a text-to-image model, it may struggle with highly complex prompts involving multiple subjects with precise spatial relationships, or rendering highly legible text within images.
- Like all generative models, it may inherit biases present in its open training data, potentially leading to stereotypical or unrepresentative outputs.
- Running and fine-tuning a 3-billion-parameter model requires substantial GPU resources.

## About Princeton University
Princeton University is a prestigious Ivy League research university located in Princeton, New Jersey. The research team behind i1 is affiliated with Princeton's computer science and AI labs, which are dedicated to advancing the frontiers of machine learning, computer vision, and artificial intelligence with a strong emphasis on open science, transparency, and rigorous methodological evaluation.

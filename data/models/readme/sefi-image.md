## Model Overview
SeFi-Image is an open-weights text-to-image foundation model family released in June 2026, built on a novel latent diffusion paradigm known as Semantic-First Diffusion (SFD). Available in 1B, 2B, and 5B parameter sizes, the model separates the generation of semantic layouts from visual texture details. By denoising the high-level semantic stream before the fine-grained texture stream, SeFi-Image creates a "structural anchor" for image generation. This approach dramatically improves both the reconstruction fidelity of generated images and the training efficiency of the model.

## Capabilities
* **Semantic-First Diffusion (SFD):** The model separates high-level layout processing from visual texture detailing. It denoises semantic latents first to establish a structural base, then generates both streams asynchronously, and finally refines the texture.
* **Exceptional Training Efficiency:** The 5B parameter variant achieved strong benchmark performance using only 125K A800 GPU hours—roughly 10% to 20% of the compute required by comparable state-of-the-art models.
* **Turbo Variants:** For environments with lower latency requirements or diverse hardware constraints, SeFi-Image offers DMD2-distilled "Turbo" variants (4-step generation) for each model size.
* **Advanced Architecture:** The model integrates a Flux.2 "Klein"-based Diffusion Transformer (DiT) combined with a Qwen3-VL text encoder for superior prompt comprehension.

## Example Use Cases
* **Efficient Self-Hosted Image Generation:** Deploying the 1B, 2B, or 5B variants in resource-constrained environments for local image generation using community tools like ComfyUI.
* **High-Fidelity Text-to-Image:** Utilizing the structural anchor provided by SFD to generate images with highly accurate layouts and semantic coherence.
* **Real-time or Low-Latency Applications:** Using the 4-step Turbo variants to build applications requiring near real-time image generation.
* **AI Research and Development:** Serving as a foundational base for researchers to explore asynchronous denoising strategies and compute-efficient model training.

## Performance & Benchmarks
Despite its drastically reduced training compute, the SeFi-Image 5B model achieves competitive or superior performance on key industry benchmarks, including GenEval, LongTextBench, and DPG-Bench. The separation of semantic and texture streams allows it to punch well above its compute budget in terms of layout accuracy and visual quality.

## Intended Use & Limitations
**Intended Use:** SeFi-Image is designed for developers, researchers, and hobbyists who wish to self-host and experiment with highly efficient, structurally coherent text-to-image generation.
**Limitations:** The model is released under a custom Non-Commercial license (similar to CC BY-NC 4.0), which restricts its use in commercial products. While it is highly efficient, getting the most out of the model may require specific community-built nodes or integration into platforms like ComfyUI.

## About Other
*Note: The specific lab or individual developer behind SeFi-Image is categorized as "Other" in the model registry. The model was introduced via a research publication on arXiv (arXiv:2606.22568) and its weights are hosted on Hugging Face, reflecting a strong commitment to open research and compute-efficient AI development.*

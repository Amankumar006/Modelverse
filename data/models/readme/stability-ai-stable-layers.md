## Model Overview
Stable Layers is a specialized research-preview model developed by Stability AI, released on July 15, 2026. It introduces an innovative framework capable of decomposing a single flat image into multiple editable RGBA layers, such as subject, background, and sky. Built upon the Qwen-Image-Layered architecture, Stable Layers leverages advanced reinforcement learning and Vision-Language Model (VLM) feedback to achieve high-quality image decomposition without the need for paired training data.

## Capabilities
*   **Image Decomposition:** Accurately separates a standard flat image into distinct, editable layers (e.g., separating a foreground subject from the background environment).
*   **VLM-Scored Supervision:** Utilizes a Vision-Language Model to evaluate and guide the decomposition process, bypassing the need for expensive ground-truth labels.
*   **Flow-GRPO & LoRA Adaptation:** Employs Group Relative Policy Optimization (Flow-GRPO) combined with LoRA adaptation to refine layer separation and maintain image fidelity.
*   **Advanced Inpainting for Occlusions:** Intelligently handles occluded areas, filling in the background realistically where the foreground subject was removed.

## Example Use Cases
*   **Professional Photo Editing:** Allowing graphic designers and photographers to easily isolate subjects and replace backgrounds without tedious manual masking.
*   **VFX and Compositing:** Providing visual effects artists with pre-separated layers from flat reference images to speed up compositing workflows.
*   **E-commerce & Product Photography:** Quickly extracting product images from their original backgrounds for use in catalogs and promotional materials.
*   **Creative Prototyping:** Enabling users to experiment with different visual elements by independently editing the foreground, midground, and background of an AI-generated or real image.

## Performance & Benchmarks
Compared to previous base models, Stable Layers produces decompositions with significantly stronger layer separation and clarity. The two-stage VLM evaluation process (structured per-sample scoring and grid-based calibration) ensures the model minimizes artifacts and blank layers. The framework demonstrates robust performance in handling complex edges and realistically inpainting occluded regions, setting a new standard for zero-shot image decomposition.

## Intended Use & Limitations
**Intended Use:** Stable Layers is designed for researchers, developers, and creative professionals exploring next-generation image editing and compositing technologies. It is offered as a self-hostable research preview to gather community feedback and drive further innovation in editable generative AI.

**Limitations:**
*   As a research preview, the model may struggle with highly complex images containing intricate overlapping details (e.g., hair, fine foliage).
*   The VLM-scored supervision, while effective, can sometimes lead to subjective layer separations based on the VLM's interpretation of the scene.
*   Inpainting for large occluded areas may occasionally produce repetitive textures or inconsistencies with the surrounding environment.

## About Stability AI
Stability AI is a leading open-source generative AI company committed to democratizing access to advanced AI models. Known for its Stable Diffusion image generation models, Stability AI focuses on creating accessible, transparent, and highly capable tools for image, video, audio, and text generation.

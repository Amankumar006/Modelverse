## Model Overview
Stable Audio 3 is an advanced generative audio model developed by Stability AI, released as a research preview on July 15, 2026. This model excels at generating high-quality, variable-length music, and sound effects from text prompts. Exploring new techniques in audio synthesis, Stable Audio 3 is available in a family of sizes (Small, Medium, and Large) to accommodate a wide range of hardware capabilities, from consumer-grade laptops to professional enterprise deployments.

## Capabilities
*   **Variable-Length Generation:** Stable Audio 3 can generate audio tracks up to approximately 6 minutes and 20 seconds, efficiently producing only the requested duration rather than relying on fixed-length outputs.
*   **Semantically-Aligned Music Autoencoder (SAME):** Utilizes a novel architecture to compress audio into compact latents, facilitating remarkably fast inference without sacrificing quality.
*   **Advanced Audio Inpainting:** Supports targeted audio editing and audio-to-audio transformations, allowing users to modify specific sections of a track or transform existing audio based on new prompts.
*   **Model Family Flexibility:** The Small and Medium models are open-weights and optimized for local execution on devices like MacBooks, while the Large model provides the highest fidelity for professional musical performance.

## Example Use Cases
*   **Music Production:** Generating backing tracks, instrument samples, and full-length musical compositions for producers and musicians.
*   **Sound Design:** Creating specific, high-quality sound effects (SFX) for video games, films, and podcasts.
*   **Audio Editing:** Using inpainting features to seamlessly replace or modify specific sections of an existing audio track.
*   **Content Creation:** Providing background music and soundscapes for videos and social media content, ensuring fully licensed and commercially safe outputs.

## Performance & Benchmarks
Stable Audio 3 achieves state-of-the-art results in text-to-audio generation, particularly in structural coherence over long durations. The implementation of the SAME autoencoder significantly improves generation speed. The model family offers a versatile performance spectrum, allowing users to balance computational efficiency (Small/Medium models) with maximum audio fidelity and musical structure (Large model).

## Intended Use & Limitations
**Intended Use:** The model is intended for researchers, musicians, sound designers, and developers looking to integrate advanced audio generation into their workflows. The Small and Medium models are self-hostable, while the Large model is accessible via API. The model was trained exclusively on fully licensed data, ensuring commercial safety.

**Limitations:**
*   As a research preview, the model may occasionally produce unexpected artifacts, particularly in highly complex or genre-blending prompts.
*   While variable-length generation is supported, coherence over the maximum 6+ minute duration can sometimes degrade.
*   The Small model, while highly accessible, may lack the nuanced musical structuring present in the Large model.

## About Stability AI
Stability AI is a leading open-source generative AI company committed to democratizing access to advanced AI models. Known for its Stable Diffusion image generation models, Stability AI focuses on creating accessible, transparent, and highly capable tools for image, video, audio, and text generation.

# PixWorld

## Model Overview
PixWorld is a cutting-edge unified 3D scene generation and reconstruction AI framework. Developed as a collaborative open-source research initiative, the model operates directly in pixel space using a two-stream diffusion transformer. Unlike traditional approaches that rely on latent space autoencoders—which often result in information loss and blurring—PixWorld leverages pixel-space diffusion to maintain remarkable geometric fidelity. By outputting 3D Gaussian representations, it can generate fully explorable and consistent 3D environments from one or multiple reference images in mere seconds.

## Capabilities
* **Unified Reconstruction and Generation:** Seamlessly handles both the reconstruction of scenes from posed multi-view inputs and the generation of entirely new 3D environments.
* **Pixel-Space Diffusion:** Operates directly on pixels rather than latent space, preserving intricate textures and structural accuracy.
* **3D Gaussian Splatting Output:** Generates rich, fast-rendering 3D Gaussian representations that allow for real-time exploration of the created environments.
* **Geometry Perception:** Utilizes a specialized geometry perception loss during training to ensure the generated 3D structures perfectly align with grounded physical realities.

## Example Use Cases
* **Virtual Reality and Gaming:** Rapidly prototypes and generates immersive, fully explorable 3D environments and assets for games and VR experiences.
* **Digital Twins and Architecture:** Reconstructs accurate 3D spatial models from a handful of reference photos for architectural visualization and digital twin modeling.
* **VFX and Content Creation:** Empowers creators to generate consistent backgrounds, sets, and cinematic scenes with high geometric fidelity directly from single image prompts.

## Performance & Benchmarks
Operating with approximately 1.04 billion parameters, PixWorld demonstrates state-of-the-art performance on structural and scene generation benchmarks such as WorldScore. Its optimized architecture allows for the rapid creation of high-quality scenes; notably, its four-step generation version can output consistent 480p 3D scenes in approximately 6 seconds, heavily outperforming many traditional optimization-based reconstruction methods in both speed and visual quality.

## Intended Use & Limitations
PixWorld is intended for researchers, developers, and creative professionals working in 3D generation, computer vision, and spatial computing. Provided as an open-source tool, it encourages community exploration in 3D Gaussian splatting and pixel-space diffusion. While highly capable, generating higher resolution scenes or extremely complex geometric topologies may require significant GPU compute power for optimal inference times.

## About Other
PixWorld was developed by an independent collaborative group of leading academic researchers from institutions including Nanyang Technological University (NTU) and MBZUAI, led by Sensen Gao. Their work focuses on pushing the boundaries of spatial computing, unified diffusion models, and high-fidelity 3D generative artificial intelligence.

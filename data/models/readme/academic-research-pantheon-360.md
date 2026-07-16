# Pantheon 360

## Model Overview
Pantheon 360 is an innovative 3D-aware 360° video diffusion model developed by researchers at the University of Southern California (USC), in collaboration with National Yang Ming Chiao Tung University, Cornell University, and Bosch Research. The model is specifically designed to generate temporally consistent and high-fidelity 360-degree videos from sparse or single 360-degree input images, offering precise geometric control.

## Capabilities
Pantheon 360 pushes the boundaries of panoramic video generation:
* **Controllable Video Generation:** Synthesizes complete 360° videos based on user-defined camera trajectories from a single panoramic input.
* **Explicit 3D Cache:** Utilizes a "3D Cache"—a geometric scaffold reconstructed directly from the input image—to rigidly enforce global geometric consistency across frames.
* **Photorealistic Refinement:** Leverages advanced video diffusion models to refine textures and ensure the output is photorealistic, bridging the gap between geometric rendering and generative AI.
* **Temporal Consistency:** Dramatically reduces flickering and warping commonly seen in AI-generated videos by grounding the generation process in actual 3D geometry.

## Example Use Cases
* **Digital Twin Generation:** Creating comprehensive and navigable digital twins from sparse video or image captures.
* **Video Stabilization:** Transforming shaky, inconsistent 360-degree footage into perfectly smooth and stable video output.
* **Motion Interpolation & Extrapolation:** Synthesizing smooth motion between disjointed frames or extending existing camera paths seamlessly.
* **Street View Enhancement:** Stitching and interpolating data from sources like Google Maps Street View for continuous, smooth navigation.

## Performance & Benchmarks
Accepted for presentation at CVPR 2026, Pantheon 360 demonstrates superior temporal consistency and geometric stability compared to baseline video diffusion models. By constraining the generative diffusion process with a robust 3D Cache, it outperforms standard text-to-video and image-to-video models in tasks requiring strict structural adherence and spatial reasoning.

## Intended Use & Limitations
**Intended Use:** The framework is intended for academic research, digital twin creation, VR content generation, and advanced video processing tasks requiring 360-degree spatial awareness.
**Limitations:** The requirement to construct and maintain an explicit 3D Cache can introduce high computational overhead. Complex dynamic scenes with heavy object motion (non-rigid scenes) might challenge the static geometric scaffold assumption, leading to artifacts in moving objects.

## About University of Southern California (USC)
The University of Southern California (USC) is a premier private research university located in Los Angeles. Its engineering and computer science programs are internationally recognized for pioneering research in artificial intelligence, computer vision, computer graphics, and immersive technologies.

## Model Overview

Unlike traditional large language models, LiTo is a highly specialized spatial AI model focused on generating 3D objects from a single 2D image. Presented at ICLR 2026, LiTo introduces a novel 3D latent representation that simultaneously models an object's geometry and its view-dependent appearance, marking a significant step forward for spatial AI, virtual reality, and robotics.

It should not be confused with "Lito," an unrelated business software tool.*

## Capabilities

LiTo specializes in advanced 3D generation and rendering:
- **Joint Geometry and Appearance Modeling**: It tokenizes surface light fields into compact latent vectors, capturing both the physical shape of an object and how light interacts with its surface (e.g., reflections, specular highlights, Fresnel effects).
- **High-Fidelity 3D Generation**: Produces highly realistic 3D models from a single 2D image, excelling where traditional models fail, such as with glossy, metallic, or reflective surfaces.
- **Rapid Inference**: Capable of performing complex image-to-3D generation in approximately 4.7 seconds on high-end hardware (e.g., NVIDIA H100 GPUs).
- **Cross-Platform Compatibility**: The open-source implementation (available at `apple/ml-lito`) supports full training and inference on Linux with NVIDIA GPUs, and interactive demos on macOS with Apple Silicon (M-series chips).

## Example Use Cases

- **Virtual and Augmented Reality**: Rapidly generating realistic 3D assets for AR/VR environments from simple 2D reference photos.
- **Game Development**: Accelerating the creation of 3D props and environments, particularly for objects with complex lighting properties like glass or metal.
- **Robotics and Spatial Computing**: Enabling robots or spatial AI systems to better understand the 3D physical world and material properties based on minimal 2D visual input.
- **E-commerce**: Automatically converting 2D product photos into interactive, highly realistic 3D models for online shopping experiences.

## Performance & Benchmarks

Notably, it achieves this high quality while maintaining impressive speed, generating complete 3D representations with complex light fields in under 5 seconds on modern data center GPUs.

## Intended Use & Limitations

LiTo is intended for researchers, developers, and creators working in spatial computing, 3D graphics, and computer vision.
Its focus is strictly on image-to-3D generation; it does not possess text generation, reasoning, or general-purpose chat capabilities. Full training requires significant computational resources (NVIDIA GPUs), though Apple Silicon users can run the interactive demo.

## About Apple

Apple is a global technology leader known for its consumer electronics, software, and services. In recent years, Apple has significantly expanded its artificial intelligence research, focusing heavily on on-device machine learning, spatial computing (driven by products like the Vision Pro), and open-source contributions to the AI research community to foster innovation in privacy-preserving and highly efficient AI models.

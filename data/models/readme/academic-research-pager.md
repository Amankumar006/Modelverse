# PaGeR

## Model Overview
PaGeR (Panoramic Geometry Reconstruction) is an advanced framework developed by researchers at the Photogrammetry and Remote Sensing Lab at ETH Zurich. It is designed for unified 3D geometry estimation from panoramic images. PaGeR effectively "lifts" powerful 3D foundation models, which were originally built for perspective imagery, adapting them for the 360-degree panorama domain. By doing so, it unlocks state-of-the-art scene understanding for omnidirectional vision.

## Capabilities
PaGeR offers robust and efficient panoramic reconstruction features:
* **Comprehensive 3D Estimation:** Reconstructs a full 360-degree scene from a single panoramic image in just a single forward pass.
* **Multi-Modal Predictions:** Accurately predicts scale-invariant depth, metric depth, surface normals, and sky masks.
* **Distortion-Free Projection:** Instead of relying on a panorama-specific network that struggles with polar distortion, PaGeR projects equirectangular panoramas into cubemaps (a 6-face cube projection).
* **Transformer Integration:** Utilizes pre-trained 3D-reconstruction transformers (such as Depth Anything 3) as its backbone for high-fidelity outputs.

## Example Use Cases
* **Immersive Virtual Reality:** Rapid creation of 3D assets and environments from single 360-degree photos for VR applications.
* **Real Estate & Virtual Tours:** Enhancing 360-degree property tours with accurate depth and structural awareness.
* **Robotics & Navigation:** Providing omnidirectional depth perception for autonomous robots operating in complex environments.
* **Indoor Scene Reconstruction:** Assisting architects and designers in mapping indoor spaces accurately.

## Performance & Benchmarks
By bypassing traditional equirectangular distortion artifacts through its cubemap projection strategy, PaGeR achieves significant improvements in depth and normal estimation accuracy. By leveraging state-of-the-art vision transformers like Depth Anything 3, the model delivers highly consistent, high-resolution geometry predictions that outperform native panoramic depth estimators on standard 3D reconstruction benchmarks.

## Intended Use & Limitations
**Intended Use:** PaGeR is intended for academic research, photogrammetry, and computer vision applications requiring comprehensive 360-degree scene understanding.
**Limitations:** Since it relies on projecting to cubemaps and using perspective-based foundation models, performance is closely tied to the generalization capabilities of the underlying backbone (e.g., Depth Anything 3). Edge artifacts at the boundaries of the cubemap faces can occasionally occur in highly complex geometric scenes.

## About ETH Zurich
ETH Zurich (Swiss Federal Institute of Technology in Zurich) is a world-renowned public research university. The Photogrammetry and Remote Sensing Lab at ETH Zurich is at the forefront of research in 3D computer vision, spatial computing, and environmental monitoring, continuously pushing the boundaries of how machines perceive and reconstruct the visual world.

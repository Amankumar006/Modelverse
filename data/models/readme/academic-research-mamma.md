# MAMMA

## Model Overview
**MAMMA** (Markerless Accurate Multi-person Motion Acquisition) is a state-of-the-art computer vision model developed by the **Max Planck Institute for Intelligent Systems (MPI-IS)** in collaboration with Carnegie Mellon University. Officially released on July 15, 2026, MAMMA is designed as a markerless motion-capture pipeline capable of recovering **SMPL-X** (expressive body model) parameters from multi-view videos, specifically targeting complex two-person interactions. At its core, the model utilizes **MammaNet**, a transformer-based dense landmark estimator that sets a new standard for multi-person pose and motion acquisition.

## Capabilities
MAMMA possesses advanced capabilities in human motion tracking and pose estimation:
*   **MammaNet Architecture:** Extracts rich image features using a ViT-Base backbone and decodes 512 surface landmarks.
*   **Dense Landmark Estimation:** Uniquely learns individual embeddings for each landmark, predicting pixel coordinates, uncertainty, visibility, and contact probabilities (both person-to-person and person-to-floor).
*   **Markerless Motion Capture:** Bypasses the need for traditional motion-capture suits, operating seamlessly on multi-view video inputs.
*   **Complex Interaction Handling:** Specifically tuned to handle intricate multi-person interactions and high-fidelity hand poses, a notorious challenge in computer vision.

## Example Use Cases
*   **Animation & Game Development:** High-quality, markerless motion capture for creating realistic character animations without expensive studio setups.
*   **Sports & Biomechanics Analysis:** Tracking athletes' movements and interactions during competitive play to analyze biomechanics and performance.
*   **Robotics & Human-Robot Interaction:** Enabling robots to accurately perceive and predict human body language, poses, and multi-person dynamics in shared spaces.
*   **Virtual Reality (VR) & Augmented Reality (AR):** Translating real-world human interactions into virtual environments with high fidelity.

## Performance & Benchmarks
MAMMA was trained on the expansive **MammaSyn dataset**, a large-scale synthetic dataset containing complex multi-person interactions and ground-truth dense landmarks. The system effectively matches predicted 2D landmarks across different camera views using symmetric epipolar distance to optimize SMPL-X parameters. By leveraging predicted uncertainty and contact information natively, MAMMA avoids the need for complex, hand-crafted pose priors or loss terms, resulting in highly robust and accurate motion acquisition even in heavily occluded scenarios.

## Intended Use & Limitations
MAMMA is released as a research preview to invite community feedback and advance the field of computer vision. It is intended for self-hostable academic, research, and non-commercial development purposes. While highly accurate in multi-view setups, its performance may degrade in single-view scenarios or in environments with extreme lighting conditions that obscure landmark visibility.

## About Max Planck Institute for Intelligent Systems
The **Max Planck Institute for Intelligent Systems (MPI-IS)**, located in Tübingen and Stuttgart, Germany, is a world-renowned research institution focusing on artificial intelligence, robotics, and machine learning. Their research explores the principles of perception, action, and learning in intelligent systems, heavily contributing to foundational models in computer vision and human body modeling (such as the SMPL body model family).

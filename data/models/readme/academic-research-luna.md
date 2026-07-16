# Luna

## Model Overview
Luna (Learning Universal 3D Human Animation Beyond Skinning) is an advanced research model developed by Peng Li and a collaborative team from HKUST, Tsinghua University, and the Meta Codec Avatars Lab. Presented at ECCV 2026, Luna is a pioneering universal neural animation model that eschews traditional Linear Blend Skinning (LBS) constraints. It creates photorealistic, animatable 3D human avatars directly from monocular images, relying on 3D Gaussian deformations to achieve unprecedented realism and flexibility.

## Capabilities
* **LBS-Free Neural Animation:** Bypasses the limitations and artifacts of traditional parametric body models (like SMPL) by utilizing an LBS-free approach.
* **Universal 3D Gaussian Deformations:** Maps a diverse array of 2D controls—including images, keypoints, and sketches—directly into expressive 3D Gaussian deformations.
* **Transformer-Based Motion Regressor:** Employs a sophisticated transformer architecture to effectively disentangle global rigid motion from fine-grained, localized dynamics.
* **Monocular 3D Generation:** Capable of generating robust, animatable 3D avatars from standard, single-view 2D images.
* **Zero-Shot Generalization:** Designed to adapt to unseen characters and varied body topologies seamlessly.

## Example Use Cases
* **Next-Generation Gaming & VR:** Creating highly realistic, dynamic avatars for virtual reality and gaming without the need for complex, manual rigging.
* **Virtual Try-On & E-Commerce:** Allowing users to generate accurate 3D representations of themselves from a single photo to try on digital clothing.
* **Digital Humans & Film Production:** Streamlining the creation of digital extras and stunt doubles with lifelike motion and fewer visual artifacts.
* **Telepresence:** Driving photorealistic 3D representations of users in metaverse and virtual conferencing environments.

## Performance & Benchmarks
Luna establishes a new paradigm in human animation by utilizing 3D Gaussian deformations instead of standard parametric meshes. While explicit benchmark figures remain tailored to academic evaluation, the model's transformer-based motion regressor significantly reduces the common skinning artifacts (e.g., joint collapsing or candy-wrapper effects) found in traditional LBS models. This results in smoother, more natural motion, especially in complex or fine-grained movements.

## Intended Use & Limitations
**Intended Use:** Luna is intended for researchers and developers in the fields of 3D vision, computer graphics, and virtual reality. It serves as a foundational tool for exploring new methods of human digitization and animation beyond conventional skinning techniques.

**Limitations:**
* The generation quality heavily depends on the clarity and pose of the input monocular image.
* Processing complex 3D Gaussian deformations requires substantial computational resources compared to traditional lightweight mesh rendering.
* The model's context capabilities and exact parameter count remain undisclosed, and users are expected to self-host the framework.

## About HKUST, Tsinghua University
The collaboration between the Hong Kong University of Science and Technology (HKUST) and Tsinghua University represents a powerhouse of computer vision and graphics research. Supported by researchers who also collaborate with leading industry labs like Meta's Codec Avatars Lab, these institutions are at the forefront of 3D generation, human reconstruction, and AI-driven animation techniques.

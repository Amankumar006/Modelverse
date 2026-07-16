# ProxyPose

## Model Overview
ProxyPose is a novel 6-Degree-of-Freedom (6-DoF) pose tracking system introduced in July 2026. It revolutionizes 3D position and rotation tracking by reframing it as a video-to-video translation problem. Operating entirely at the pixel level, the model tracks objects accurately without the need for traditional requirements like 3D models, depth maps, or object segmentation. Given a video and a user-selected pixel, the model translates the input into a synthetic "proxy video" where a simple polyhedron mirrors the movement, allowing for precise geometric calculation of the 6-DoF trajectory.

## Capabilities
- **Video-to-Video Translation**: Leverages advanced video diffusion models (like Wan-14B with LoRA adapters) to create a synthetic representation of the tracked object's movement.
- **Robust Tracking**: Excellently handles traditionally difficult tracking scenarios, including transparent, reflective, and textureless surfaces, as well as highly occluded objects.
- **Versatility**: While primarily trained on rigid objects, the system extends its tracking capabilities to deformable surfaces (e.g., human faces) and camera pose estimation.
- **Efficiency**: Achieves high accuracy purely from monocular RGB video input and synthetic training data, bypassing complex traditional geometric pipelines.

## Example Use Cases
- **Augmented Reality (AR) and Virtual Reality (VR)**: Anchoring virtual objects realistically onto transparent or featureless surfaces in real-world videos.
- **Robotics**: Enabling robots to track and manipulate objects that have challenging optical properties, like glass or highly reflective metal.
- **Motion Capture**: Tracking the movement of objects or facial features in videos without requiring physical markers or specialized multi-camera setups.

## Performance & Benchmarks
ProxyPose achieves state-of-the-art accuracy in 6-DoF tracking using only monocular RGB input. It consistently outperforms traditional methods, particularly in scenes lacking clear textures or where objects are partially obscured. Currently, specific numerical benchmark scores are not published in the overarching metadata, but the system's reliance on a training-free geometric solver combined with video diffusion gives it unprecedented reliability in complex environments.

## Intended Use & Limitations
ProxyPose is intended for researchers and developers working in computer vision, AR/VR, and robotics who require precise 3D object tracking from standard 2D video feeds. It is available under a custom open-source license. As a limitation, while the method handles rigid objects flawlessly, highly extreme deformations might challenge the synthetic proxy mapping. Additionally, generating the proxy video requires the computational overhead associated with running video diffusion models.

## About Other
ProxyPose was developed collaboratively by researchers from the University of Toronto and the Vector Institute. Their research focuses on pushing the boundaries of computer vision and bridging the gap between generative AI and classical geometric problem-solving.

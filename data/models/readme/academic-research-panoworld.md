# PanoWorld

## Model Overview
PanoWorld is a generative spatial world model designed for consistent whole-house panorama synthesis. Developed primarily by researchers at Ke Holdings Inc. (Beike) in collaboration with prominent academic institutions, the model focuses on generating realistic, multi-room virtual reality tours that maintain cross-view spatial coherence, mimicking the discrete navigation experience used by real-world VR tour products.

## Capabilities
PanoWorld brings advanced spatial synthesis techniques to 360-degree environments:
* **Whole-House Synthesis:** Generates interconnected, multi-room panoramic virtual tours from foundational data.
* **Global Geometric Proxy:** Utilizes a floorplan-derived 3D shell to ensure structural accuracy across different generated rooms.
* **Dynamic 3DGS Cache:** Employs a dynamic 3D Gaussian Splatting (3DGS) cache as renderable spatial memory, enabling the system to remember and consistently render previously "seen" areas as the viewpoint moves.
* **Spatial Coherence:** Maintains strict cross-view spatial coherence, ensuring doors, windows, and structural elements align perfectly when transitioning between panoramic nodes.

## Example Use Cases
* **Real Estate Virtual Tours:** Automatically generating explorable, photorealistic virtual tours for properties based on simple floorplans or sparse data.
* **Architectural Visualization:** Allowing architects and clients to visually navigate through generated conceptual layouts of homes and buildings.
* **Interior Design Preview:** Synthesizing cohesive indoor designs across multiple interconnected rooms.
* **Gaming and Metaverse:** Procedurally generating consistent indoor environments for interactive 360-degree digital worlds.

## Performance & Benchmarks
PanoWorld achieves state-of-the-art performance in spatial coherence for multi-room panorama generation. Compared to previous independent panorama generation models, its integration of a 3D shell proxy and 3DGS spatial memory drastically reduces geometric warping and structural inconsistencies when navigating between viewpoints.

## Intended Use & Limitations
**Intended Use:** The model is optimized for indoor architectural visualization, VR tour synthesis, and spatial computing applications where geometric consistency across a whole house is required.
**Limitations:** The model's success heavily relies on the quality of the floorplan-derived 3D proxy. Highly irregular architectures or spaces lacking clear structural delineations may challenge the model's spatial memory mechanisms.

## About Ke Holdings Inc. (Beike)
Ke Holdings Inc. (Beike) is a leading integrated online and offline platform for housing transactions and services. With a strong emphasis on integrating technology into the real estate sector, Beike actively researches and develops spatial computing, 3D reconstruction, and virtual reality technologies to enhance how users experience and interact with properties digitally.

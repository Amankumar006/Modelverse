# CubePart

## Model Overview
CubePart is an advanced generative artificial intelligence framework developed by Roblox, designed specifically for creating 3D mesh assets tailored for game engines. Unlike traditional generative models that output single, monolithic meshes, CubePart introduces "part-controllable generation." Users can define a "parts schema"—a breakdown of specific components such as wheels, chassis, and engines—and the model will generate these elements as separate, coherent 3D parts. Operating as an open-vocabulary text-to-3D system, CubePart bridges the gap between raw AI generation and functional game asset creation.

## Capabilities
*   **Part-Controllable Generation:** Allows users to supply a parts schema alongside a text prompt, enabling the model to generate objects divided into precise, semantic components.
*   **Open-Vocabulary Text-to-3D:** Generates a vast array of 3D objects based on simple text prompts, utilizing deep language understanding to define the global shape and structure.
*   **Game Engine Ready:** Produces assets that are immediately usable in engines like Roblox and Unity without requiring manual separation, meaning the assets are ready for rigging, animation, physics simulations, and scripting directly out of the box.
*   **Consistent Structural Integrity:** Ensures that the generated sub-parts seamlessly fit together to form a cohesive final object, preserving functional relationships between components.

## Example Use Cases
*   **Game Development:** Rapidly generating functional assets such as vehicles (with separate wheels and chassis) or characters (with separate limbs) that can be easily animated by developers.
*   **Interactive Environments:** Creating dynamic props for virtual worlds where parts need to break, move, or be interacted with individually.
*   **Prototyping and Modding:** Accelerating the 3D prototyping phase for creators and modders by instantly providing modular assets rather than static meshes.
*   **Physics Simulations:** Generating test models for physics engines where independent collisions, joints, and constraints need to be applied to different parts of an object.

## Performance & Benchmarks
While exact parameter counts and formal performance benchmarks are currently undisclosed, CubePart demonstrates a significant breakthrough in generative 3D modeling. Qualitatively, it excels in maintaining part-to-part coherence and avoiding the "fused" artifacts commonly seen in standard text-to-3D generation. The resulting meshes are optimized for structural logic, dramatically reducing the post-processing time required to make AI-generated assets functional in interactive applications.

## Intended Use & Limitations
**Intended Use:** CubePart is released as a research preview and is intended for researchers, game developers, and 3D artists exploring the next generation of procedural and AI-assisted asset creation. It is designed to accelerate workflows in interactive media.
**Limitations:** Being a research preview, the model may occasionally generate overlapping geometry or misinterpret highly complex or ambiguous parts schemas. Its use is currently governed by a research-specific license, and it may not fully support every edge-case structural requirement for hyper-realistic physics simulations.

## About Roblox
Roblox is a global platform that brings people together through play. With millions of experiences built by a massive community of creators, Roblox is at the forefront of user-generated content and metaverse technologies. Their research division focuses on developing cutting-edge tools, including generative AI, to empower creators and lower the barrier to entry for developing rich, interactive 3D experiences.

# Mira

*

## Model Overview
Operating as a dynamic world model, Mira is entirely a video generator that responds to live user key presses. Unlike traditional games, it bypasses pre-designed game engines to render physics and collisions on the fly. It features a 5B parameter architecture and is accessible via an API-only deployment.

## Capabilities
* **Real-time Video Generation:** Generates responsive gameplay frames directly from user inputs.
* **Physics & Collisions:** Simulates and renders physics and collisions natively on the fly without a standard game engine.
* **High Framerate:** Produces 20 frames per second on a single B200 GPU.
* **Multiplayer Collaboration:** Supports live, four-player collaborative sessions.

## Example Use Cases
* **Next-Generation Gaming:** Creating fully AI-rendered, engine-less multiplayer games.
* **Interactive Simulations:** Prototyping physics-based environments where mechanics are learned rather than programmed.
* **Real-time World Modeling:** Academic and commercial research into predictive interactive video generation.

## Performance & Benchmarks
While traditional LLM benchmarks are not applicable, Mira's primary performance metric is its ability to generate 20 FPS real-time rendering on a single B200 GPU. It was trained on 10,000 hours of standard gameplay data to achieve its fluid world-modeling capabilities.

## Intended Use & Limitations
* **Intended Use:** Designed for research into real-time interactive video and zero-engine game simulations.
* **Limitations:** The context window is currently undisclosed, and as a 5B parameter model focused on video generation, it is not suited for text or general-purpose reasoning tasks.

## About Other
The developer is listed as "Other", reflecting a custom or independent research initiative (e.g., Mira-WM).
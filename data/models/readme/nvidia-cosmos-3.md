# Cosmos 3

## Model Overview
Cosmos 3 is an experimental "omnimodel" open-frontier model developed by NVIDIA. It is specifically designed for Physical AI, representing a unified architecture capable of reasoning, generating, and acting. Released as a research preview, Cosmos 3 showcases novel methods to consolidate vision-language modeling, world simulation, and action generation into a single framework.

## Capabilities
- **Omnimodal Architecture:** Natively understands and generates text, images, video, audio, and action sequences without relying on separate perception and generation models.
- **Mixture-of-Transformers:** Employs a breakthrough architecture enabling world generation, physical reasoning, and action generation.
- **Physical Reasoning:** Grounds language in visual data, allowing it to interpret spatial relationships, temporal cues, and object states to make physically accurate predictions.
- **Efficiency:** Significantly reduces the cycle time for Physical AI training and evaluation by combining various processing stages into a single pipeline.

## Example Use Cases
- **Autonomous Vehicles & Robotics:** Operating as a "world action model" that helps autonomous systems navigate and interact with the physical world.
- **Synthetic Data Generation:** Generating physically accurate and temporally consistent synthetic data for training other AI models.
- **Closed-Loop Simulation:** Powering highly realistic simulations for testing robots and agents before real-world deployment.

## Performance & Benchmarks
- Available in various scales, including the **Cosmos 3 Super** (a 64B parameter variant optimized for maximum performance on datacenter GPUs like Hopper and Blackwell).
- The **Cosmos 3 Edge** variant is specifically optimized for high-performance, low-latency execution in robotics and vision AI edge devices.
- Achieves significant efficiencies in data processing and training compared to disjointed perception-generation pipelines.

## Intended Use & Limitations
- **Intended Use:** Research and development in Physical AI, robotics, vision AI, autonomous driving, and advanced simulation.
- **Limitations:** Released as a research preview, meaning it is still experimental. Its primary focus is on physical and spatial reasoning, which may not translate ideally to abstract, non-grounded language tasks.

## About NVIDIA
NVIDIA is a global leader in accelerated computing and artificial intelligence. The company's platforms power the next generation of AI research, with a strong focus on open models and foundational technology that bridge the gap between digital intelligence and the physical world.

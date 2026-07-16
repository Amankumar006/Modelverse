# CHORD

## Model Overview
Developed by NVIDIA, CHORD is a specialized research preview model exploring new techniques in robotics and specialized research. It focuses on enabling robots to learn dexterous manipulation skills from human demonstrations. Rather than being a general-purpose language or chat AI model, CHORD is a dedicated robotics approach that improves how AI agents learn physical tasks by emphasizing physical forces and interactions with objects.

## Capabilities
- **Robotic Skill Re-creation:** Enables robots to replicate human manipulation skills by focusing on "hold" (physical forces and object interactions) instead of merely mimicking exact finger positions.
- **Skill Transfer:** Can translate human movements into "push" and "twist" commands, facilitating skill transfer across varied robotic hands (e.g., using a five-fingered human demonstration to train a robot with a three-fingered claw).
- **Physical Task Adaptation:** Emphasizes contact-focused demonstrations, allowing robust adaptation in dynamic physical environments.

## Example Use Cases
- **Dexterous Manipulation:** Training robotic hands to handle complex, precise tasks with varying object shapes and weights.
- **Whole-Body Manipulation:** Translating human coordination into full-body robotic commands in simulated or real-world setups.
- **Cross-Form Factor Robotics:** Porting manipulation skills demonstrated by human hands into morphologically distinct robotic end-effectors, like grippers or specialized claws.

## Performance & Benchmarks
- Demonstrates high success rates in complex manipulation tasks.
- Effectively handles both two-handed simulation tasks and whole-body manipulation.
- Capable of successful zero-shot or few-shot transfer to physical, real-world robots from human demonstrations.

## Intended Use & Limitations
- **Intended Use:** Robotics research, physical AI development, and industrial automation where dexterous manipulation is required.
- **Limitations:** CHORD is a highly specialized model, not intended for text generation, conversational AI, or general-purpose tasks. Its capabilities are constrained strictly to the domain of robotic physical manipulation.

## About NVIDIA
NVIDIA is a pioneer in GPU computing, artificial intelligence, and robotics. With platforms like NVIDIA Isaac and cutting-edge research in Physical AI, NVIDIA continues to push the boundaries of how AI agents perceive, reason, and interact with the physical world.

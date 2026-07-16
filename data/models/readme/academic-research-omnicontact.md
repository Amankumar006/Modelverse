# OmniContact

## Model Overview
OmniContact is a pioneering framework for humanoid loco-manipulation developed by researchers at Noitom Robotics and HKUST. It empowers humanoid robots to seamlessly combine locomotion (movement) with manipulation (object interaction) to perform complex, physically demanding tasks in the real world. By utilizing a novel concept called "Contact Flow," OmniContact bridges the gap between high-level reasoning and low-level physical execution.

## Capabilities
- **Loco-Manipulation:** Allows humanoid robots to simultaneously move and interact with their environment and objects.
- **Contact Flow Generation (CF-Gen):** Synthesizes optimized contact-flow segments, effectively chaining together various "meta-skills" required for a task.
- **Closed-Loop Execution (CF-Track):** Executes the generated contact-flow segments under a robust, closed-loop control system operating at 50Hz, ensuring stable and responsive physical interaction.
- **VLM Integration:** Capable of interpreting and executing commands driven by Vision-Language Models (VLMs), translating natural language instructions into complex physical actions.

## Example Use Cases
- **Warehouse Automation:** Enabling humanoid robots to autonomously lift, carry, and place heavy boxes across dynamic warehouse environments.
- **Assistive Robotics:** Assisting individuals with tasks such as pushing suitcases or moving furniture.
- **Disaster Response:** Navigating uneven terrain while manipulating debris or operating tools in hazardous environments.
- **Advanced Manufacturing:** Performing multi-step assembly tasks that require both precise manipulation and mobility around a workspace.

## Performance & Benchmarks
OmniContact demonstrates remarkable success rates in executing complex, VLM-driven commands that involve simultaneous movement and physical interaction. Its 50Hz closed-loop control system (CF-Track) ensures high stability and adaptability during physical tasks, outperforming traditional decoupled approaches to locomotion and manipulation in standard humanoid robotics benchmarks.

## Intended Use & Limitations
The framework is intended for academic and industrial research in the fields of embodied AI and humanoid robotics. It is designed to be deployed on advanced humanoid hardware. Limitations may include the requirement for highly accurate sensor data for the CF-Track system to maintain its 50Hz control loop, and performance is heavily dependent on the physical capabilities of the underlying robot hardware.

## About Noitom Robotics, HKUST
The collaboration between Noitom Robotics and the Hong Kong University of Science and Technology (HKUST) brings together industry-leading motion capture and robotics technology with top-tier academic research. Their joint efforts focus on pushing the boundaries of embodied intelligence, loco-manipulation, and the seamless integration of advanced AI models with physical robotic systems.

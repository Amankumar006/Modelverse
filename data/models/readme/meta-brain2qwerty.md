# Brain2qwerty

It is not a finalized consumer product and serves primarily to showcase novel methods in non-invasive brain-computer interfaces.

## Model Overview
It is a non-invasive brain-computer interface (BCI) designed to decode typed sentences directly from brain activity. Unlike surgical implants, Brain2qwerty utilizes magnetoencephalography (MEG) and electroencephalography (EEG) to capture neural signals through a specialized scanner while a user imagines typing. It then uses a hierarchical deep learning architecture—comprising an Encoder, an Aligner, and a Large Language Model (LLM)—to translate those noisy signals into coherent text in real-time.

## Capabilities
*   **Non-Invasive Neural Decoding:** Reconstructs intended text from brain signals without requiring invasive surgical implants or electrodes.
*   **Real-Time Generation:** Version 2 can generate sentences in real-time without needing the precise timing of individual imagined keypresses.
*   **Hierarchical Architecture:** Uses a sophisticated pipeline to clean noisy neural data, align it with linguistic structures, and output text via a standard LLM.
*   **AI-Optimized Training:** The training pipeline for v2 was notably optimized using autonomous AI coding agents, showcasing advanced AI-assisted research workflows.

## Example Use Cases
*   **Assistive Technology:** The primary goal is to restore communication for individuals with neurodegenerative conditions (like ALS), locked-in syndrome, or severe brain injuries who cannot speak or move.
*   **Neuroscience Research:** Provides a framework (alongside open-sourced tools like NeuralSet and NeuralBench) for researchers to study brain activity and improve non-invasive BCI technology.

## Performance & Benchmarks
In its latest iteration (v2), Brain2qwerty achieved an average word accuracy of approximately 61%. Notably, the best-performing participants in the study reached up to 78% accuracy when decoding imagined typing. While still trailing the accuracy of invasive surgical implants, this represents a major milestone in narrowing the performance gap for non-invasive BCIs.

## Intended Use & Limitations
Meta has open-sourced the training code to accelerate global research.
*   **Limitations:** The technology is not currently viable for everyday consumer use. It relies on massive, highly specialized, and expensive MEG scanner hardware to read the brain signals accurately. The decoding accuracy, while impressive for a non-invasive tool, is still imperfect and highly dependent on the individual participant's neural signal clarity.

## About Meta
**Meta** (formerly Facebook) is a global technology conglomerate that heavily invests in artificial intelligence through its Fundamental AI Research lab (FAIR). Through projects like Brain2qwerty and the broader "Digital Brain" initiative, Meta is focused on pushing the boundaries of AI in neuroscience, open-sourcing foundational models and frameworks to drive innovation in medical research and human-computer interaction.

# LocateAnything

## Model Overview
LocateAnything is a vision-language model (VLM) developed by NVIDIA that introduces a groundbreaking approach to visual grounding and object detection called Parallel Box Decoding (PBD). By rethinking how models predict spatial locations, LocateAnything drastically improves inference speed and maintains superior geometric consistency compared to traditional autoregressive vision-language models. The model leverages a MoonViT vision encoder alongside a Qwen2.5-3B-Instruct language model, and was trained on a massive dataset of 12 million images, 138 million language queries, and 785 million bounding boxes.

## Capabilities
* **Parallel Box Decoding (PBD):** Predicts complete bounding box coordinates as a single, atomic unit rather than sequentially generating them token-by-token.
* **Hybrid Inference Mode:** Defaults to ultra-fast parallel decoding but can fall back to standard sequential decoding if format irregularities are detected, ensuring high robustness.
* **General Object Detection & Grounding:** Can accurately detect and ground objects, phrase expressions, and referring expressions across diverse visual scenes.
* **Text & GUI Localization:** Capable of precise text localization (OCR) and GUI element grounding, making it highly effective for agentic UI tasks.
* **Point-Based Layout Localization:** Supports diverse layout detection and point-based targeting.

## Example Use Cases
* **UI Automation & Agentic Workflows:** Identifying and grounding GUI elements for AI agents to interact with software applications.
* **Advanced OCR & Text Extraction:** Precisely locating and extracting text blocks in complex document layouts or natural images.
* **Visual Search & Retrieval:** Finding specific objects within images based on complex, open-ended natural language queries.
* **Robotics & Autonomous Systems:** Quickly identifying obstacles or objects of interest in an environment with high throughput.

## Performance & Benchmarks
* **Throughput:** Achieves up to 10× faster decoding than models like Qwen3-VL and 2.5× faster than alternatives such as Rex-Omni.
* **Consistency:** Parallel Box Decoding ensures that predicted boxes remain geometrically consistent, avoiding the errors common in sequential token generation.
* **Dataset Scale:** Trained on LocateAnything-Data, featuring 785 million bounding boxes, ensuring broad generalization across tasks.

## Intended Use & Limitations
LocateAnything is designed for research purposes, including academic studies in computer vision, UI automation, and multimodal agent development. It is released under the NVIDIA License for non-commercial use. Users should be aware that while highly robust, extreme edge cases in complex visual layouts may still require sequential decoding fallbacks.

## About NVIDIA
NVIDIA is a global leader in AI computing, providing the hardware and software foundations for the AI revolution. Through its research labs, NVIDIA continues to push the boundaries of computer vision, generative AI, and multimodal learning.

## Model Overview

omni-moderation (also known as omni-moderation-latest) is OpenAI's multimodal moderation model designed to automatically detect and identify potentially harmful content across both text and image inputs. Released on July 14, 2026, and built on the GPT-4o architecture, it provides a comprehensive safety net for developers integrating generative AI or handling user-generated content. As an API-only offering, it replaces legacy text-only moderation models, providing a unified solution for content safety.

## Capabilities

*   **Multimodal Analysis:** Capable of processing and classifying both text and images simultaneously, a significant upgrade over previous text-only moderation classifiers.
*   **Detailed Safety Categories:** Assesses content for a wide variety of harmful categories including hate speech, self-harm, sexual content, and violence.
*   **Granular Probability Scores:** Returns detailed probability scores across all moderation categories, giving developers fine-grained control over their specific moderation thresholds.
*   **Integrated Generation Safety:** Available via the standard `/v1/moderations` endpoint, as well as integrated into generation requests to seamlessly block or flag outputs in real-time.

## Example Use Cases

*   **User-Generated Content Moderation:** Automatically scanning uploads on social platforms, forums, and comment sections to prevent the spread of harmful images or text.
*   **Safety Guardrails for AI Apps:** Implementing a safety layer on top of AI conversational agents to ensure generated responses and user inputs adhere to safety guidelines.
*   **Compliance and Filtering:** Helping enterprise applications maintain compliance with internal content policies by accurately identifying hate speech, violence, or explicit material.

## Performance & Benchmarks

The omni-moderation model delivers higher accuracy and lower latency compared to legacy moderation models. It is particularly noted for its improved performance on non-English languages and a broader range of nuanced content categories. Because it is built on the GPT-4o architecture, it handles complex, multi-modal context efficiently, scaling to process large volumes of API requests with high reliability. Detailed parameter and context window sizes are not publicly specified.

## Intended Use & Limitations

This model is intended to serve as a safety and compliance tool for developers building applications that require content moderation. It is entirely free to use via OpenAI's Moderation API.
**Limitations:** The model is currently focused on text and image classification and does not process or classify audio inputs. Like all automated moderation systems, it may occasionally exhibit false positives or false negatives, and developers are encouraged to use its granular scores to calibrate thresholds appropriate for their specific use case.

## About OpenAI

OpenAI is an artificial intelligence research laboratory and deployment company dedicated to ensuring that artificial general intelligence (AGI) benefits all of humanity. Known for pioneering models like GPT-4 and DALL-E, OpenAI also provides robust safety, moderation, and alignment tools to help developers build responsible AI systems.

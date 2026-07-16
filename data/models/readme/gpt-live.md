# GPT Live

## Model Overview
**GPT-Live** (slug: `gpt-live`) is a recently released family of voice-optimized AI models from OpenAI, launched globally on July 1, 2026. It is a closed-source model designed to transform the ChatGPT voice experience by enabling more human-like, real-time conversational interaction. Unlike previous turn-based systems, GPT-Live uses a full-duplex architecture, allowing the model to "listen" and "speak" simultaneously. It is currently available primarily as an API-only service and consumer application via ChatGPT.

## Capabilities
*   **Full-Duplex Architecture:** Can handle natural conversational interruptions, pauses, and pacing naturally, functioning much like a live phone call.
*   **Background Delegation:** Capable of delegating complex reasoning tasks, web searches, or tool usage to frontier models like GPT 5.5 in the background while keeping the live conversation flowing.
*   **Multimodal Outputs:** Generates live visual UI cards (e.g., weather updates, stock charts) alongside voice responses.
*   **Variants:** Available as GPT-Live-1 (for paid users) and GPT-Live-1 mini (a scaled-down version for free users).

## Example Use Cases
*   **Live Customer Support:** Serving as a natural, conversational AI agent that can handle complex user queries over voice without awkward delays.
*   **Interactive Voice Assistants:** Acting as a personal voice assistant on mobile or desktop devices that can be interrupted and seamlessly perform background tasks.
*   **Language Learning:** Providing real-time, flowing conversational practice for language learners where interruptions and natural pauses are critical.

## Performance & Benchmarks
In internal evaluations by OpenAI, **GPT-Live-1** achieved a score of **75.5**, significantly outperforming the previous ChatGPT voice processing models. It has also demonstrated enhanced performance over the previous Advanced Voice Mode on specific benchmarks like **GPQA (scientific reasoning)** and **BrowseComp (web search)**.

## Intended Use & Limitations
GPT-Live is intended for real-time voice and multimodal interactions where low latency and natural conversational flow are paramount. While it is highly capable in voice interaction, its deepest reasoning capabilities rely on background delegation to more powerful frontier models, which might introduce slight delays or dependencies for extremely complex cognitive tasks. 

## About OpenAI
OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. They are the creators of the GPT series of models, including GPT-4, GPT-5, and various specialized models tailored for text, audio, and visual generation tasks.

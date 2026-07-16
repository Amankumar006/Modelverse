## Model Overview

**GPT-Realtime-Translate** is a purpose-built, low-latency streaming model from OpenAI designed specifically for live, speech-to-speech translation. Released in mid-2026 alongside the broader Realtime API suite, it is optimized to function as a live interpreter rather than a conversational assistant. It provides continuous processing of audio streams, offering translated audio and transcript deltas in near real-time without requiring speakers to pause frequently.

## Capabilities

- **Live Interpretation:** Trained on thousands of hours of professional interpreter audio, allowing it to process continuous speech flows and wait for sufficient context before translating accurately.
- **Multilingual Support:** Capable of handling speech input from over 70 languages and translating them into 13 distinct output languages.
- **Continuous Processing:** Operates over continuous audio streams (via WebSockets or WebRTC) to provide both translated audio and corresponding transcript deltas in real-time.
- **Dedicated Architecture:** Utilizes a specialized translation endpoint (`/v1/realtime/translations`), distinguishing it from standard conversational models.

## Example Use Cases

- **Live Broadcast Translation:** Providing immediate, professional-grade speech-to-speech translation for live events and international broadcasts.
- **Global Conferences:** Enabling seamless interpretation for multi-lingual conferences and seminars.
- **Multilingual Customer Support:** Facilitating real-time communication between support agents and customers speaking different languages.
- **Cross-lingual Meetings:** Powering real-time translation features in enterprise communication platforms like Microsoft Teams or Zoom.

## Performance & Benchmarks

- **Latency:** Engineered for ultra-low latency specifically for live interpretation, effectively reducing the gap between the source speech and the translated audio.
- **Contextual Accuracy:** By waiting for adequate context before outputting translations, it mirrors human interpreters, resulting in higher fidelity translations compared to traditional word-for-word translation engines.
- *(Note: Specific quantitative benchmark scores are not widely published).*

## Intended Use & Limitations

- **Intended Use:** Strictly intended for live interpretation use cases where the primary goal is translating spoken audio from one language to another continuously.
- **Limitations:** Unlike conversational models (e.g., GPT-Realtime-2.1), this model is not designed to "converse," answer questions, or invoke tools. It acts purely as a conduit for translating input audio to output audio.

## About OpenAI

OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. They are the creators of the GPT series of large language models, ChatGPT, and a suite of advanced APIs for text, vision, and audio generation.

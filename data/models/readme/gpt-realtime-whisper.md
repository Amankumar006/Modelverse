## Model Overview

**GPT-Realtime-Whisper** is a specialized, low-latency streaming speech-to-text model developed by OpenAI. Designed specifically for real-time applications that require live transcription, it diverges from the original batch-processing Whisper models by offering continuous, native streaming capabilities. Operating via the Realtime API, it allows developers to process audio as it arrives, providing immediate transcription for dynamic and interactive environments.

## Capabilities

- **Native Streaming:** Built from the ground up for continuous streaming, providing "transcript deltas" that allow applications to display text incrementally before an utterance is even complete.
- **Ultra-Low Latency:** Optimized for speed, making it highly suitable for interactive voice experiences where minimizing the delay between speech and text output is critical.
- **Multimodal Integration:** Seamlessly integrates with text systems and other Realtime models (like `gpt-realtime-translate`) to provide source-language text alongside other outputs.
- **Protocol Support:** Can be accessed via modern streaming protocols including WebSockets (for server-side pipelines) and WebRTC (for low-latency browser or mobile applications).

## Example Use Cases

- **Live Captioning:** Providing instant, accurate captions for live streams, webinars, and virtual meetings.
- **Voice Agent Transcription:** Serving as the ultra-fast transcription layer for interactive voice agents, allowing the application logic to process user intent while they are still speaking.
- **Real-Time Analytics:** Transcribing customer support calls or interviews live for immediate sentiment analysis, compliance checking, or agent assistance.
- **Translation Workflows:** Supplying the foundational source-language transcription for downstream real-time translation services.

## Performance & Benchmarks

- **Latency:** Significantly outperforms traditional batch-processing models (like `whisper-1`) in time-to-first-token for transcription, due to its native streaming architecture.
- **Pricing Efficiency:** Billed based on the duration of the audio processed rather than by text tokens, which aligns with its continuous streaming nature.
- *(Note: Specific quantitative benchmark scores and word error rates (WER) are proprietary, though it maintains the high accuracy standard set by the Whisper family).*

## Intended Use & Limitations

- **Intended Use:** Ideal for "transcription sessions" where the primary objective is converting continuous speech to text with minimal delay.
- **Limitations:** GPT-Realtime-Whisper is purely a speech-to-text model. It does not generate conversational responses, synthesize voice, or invoke tools (capabilities reserved for models like GPT-Realtime-2.1).

## About OpenAI

OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. They are the creators of the GPT series of large language models, ChatGPT, and a suite of advanced APIs for text, vision, and audio generation.

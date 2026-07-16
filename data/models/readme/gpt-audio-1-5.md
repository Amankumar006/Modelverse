# GPT-Audio-1.5

## Model Overview
**gpt-audio-1.5** (often slugged as `gpt-audio-1-5`) is an advanced, natively multimodal audio model released by OpenAI in early 2026. As a successor to earlier audio models in the `gpt-audio` family, it is recognized as OpenAI's premier voice model for "audio in, audio out" tasks using the standard Chat Completions API. The model brings significant enhancements in instruction following, voice naturalness, and function calling support.

*Note: Depending on the specific platform (e.g., OpenAI API vs.*

## Capabilities
- **Native Multimodal Input & Output:** Accepts both text and audio inputs, and seamlessly generates high-fidelity audio and text outputs without needing intermediary text transcription.
- **Enhanced Instruction Following:** Vastly improved at adhering to complex, multi-step instructions provided via voice or text.
- **Superior Voice Naturalness:** Generates highly realistic, expressive, and human-like speech, capturing nuance, emotion, and proper pacing.
- **Function Calling:** Supports advanced function calling directly from audio inputs, allowing the model to trigger external APIs based on spoken commands.
- **Large Context Window:** Supports a 128,000-token context window and up to 16,384 output tokens.

## Example Use Cases
- **Advanced Voice Assistants:** Powering voice-based applications that require complex reasoning, tool usage, and natural-sounding responses (where sub-second real-time latency is not strictly required).
- **Interactive Voice Response (IVR) Systems:** Upgrading customer service phone trees with highly intelligent, natural-sounding automated agents that can query databases (via function calling).
- **Rich Audio Summarization:** Processing lengthy audio recordings (like lectures or interviews) and generating a summarized audio report.
- **Multimodal Content Creation:** Generating podcasts, voiceovers, or educational content dynamically based on text scripts or audio prompts.

## Performance & Benchmarks
Released as a major update to the audio series, `gpt-audio-1.5` sets a new standard for voice naturalness and reliability in tool usage. By operating natively on audio, it completely bypasses the latency and information-loss issues associated with traditional Speech-to-Text -> LLM -> Text-to-Speech pipelines. It handles massive context (128K tokens), making it highly performant for batch audio processing and long-form analysis.

## Intended Use & Limitations
**Intended Use:** Designed for developers building asynchronous or standard chat-flow applications requiring top-tier audio understanding and generation. It is accessed via the Chat Completions API on OpenAI and Microsoft Azure platforms.
**Limitations:**
- **Not for Real-Time Streaming:** Like the base `gpt-audio` model, it is a request-response model. It is not optimized for persistent, low-latency, WebSocket-based real-time conversations (for which the `gpt-realtime` models are intended).
- **Token Costs:** Pricing is tiered, and processing/generating audio tokens is typically more expensive than text tokens (e.g., audio inputs/outputs incur higher costs compared to standard text rates).

## About OpenAI
OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence (AGI) benefits all of humanity. Through models like GPT-Audio-1.5, OpenAI continues to push the boundaries of multimodal AI, making machines capable of interacting natively in human modalities like sight and sound.

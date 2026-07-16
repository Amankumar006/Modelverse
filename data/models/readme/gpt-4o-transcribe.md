## Model Overview
GPT-4o Transcribe (`gpt-4o-transcribe`) is an advanced speech-to-text model released by OpenAI on July 14, 2026. Leveraging the powerful GPT-4o architecture, it provides high-accuracy audio transcription through the OpenAI API. It offers a significant upgrade over the original Whisper architecture, particularly in challenging audio environments.

## Capabilities
- **High-Accuracy Transcription**: Superior performance in handling heavy accents, background noise, and complex, domain-specific vocabulary.
- **Speaker Diarization**: The `gpt-4o-transcribe-diarize` variant can distinguish between different speakers in an audio recording.
- **Output Formats**: Primarily supports JSON or plain text outputs, moving away from subtitle formats like SRT/VTT favored by older models.

## Example Use Cases
- **Professional Transcription**: Generating highly accurate meeting notes and analyzing customer calls.
- **Budget-Sensitive/Real-Time Tasks**: The `gpt-4o-mini-transcribe` variant is ideal for quick-response applications and live captioning.
- **Multi-Speaker Environments**: Utilizing the diarization variant for interviews and panel discussions.

## Performance & Benchmarks
GPT-4o Transcribe generally offers a lower word error rate (WER) and better overall performance compared to `whisper-1`. The specific parameter counts and context windows remain "Unknown," but the model provides tiered performance levels for varying needs and budgets.

## Intended Use & Limitations
- **Intended Use**: Best suited for file-based audio transcription via the Transcriptions API where high accuracy is paramount.
- **Limitations**: For live, low-latency streaming transcription from a microphone, developers are recommended to use OpenAI's Realtime transcription capabilities or the `gpt-realtime-whisper` model instead of the file-based `gpt-4o-transcribe` API. It also lacks direct output support for detailed metadata subtitle formats like SRT and VTT.

## About OpenAI
OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity.

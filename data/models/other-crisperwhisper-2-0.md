## Parameters

CrisperWhisper 2.0 features several specific operational modes and configurations designed to optimize word-level timestamp precision, verbatim tracking, and execution speed. Developed by [Nyra Health](https://github.com/nyrahealth/CrisperWhisper), it runs on a highly optimized CTranslate2 production inference engine supporting speculative decoding. [[1](https://github.com/nyrahealth/CrisperWhisper), [2](https://huggingface.co/nyralabs/CrisperWhisper), [3](https://huggingface.co/nyralabs/CrisperWhisper2.0_large)]

### Core Model & Size Parameters

When initialising `CrisperWhisperModel()`, you can target four model size shorthand strings instead of utilizing complete Hugging Face IDs: [[1](https://github.com/nyrahealth/CrisperWhisper/blob/main/DOCS.md)]

- `"turbo"` (Default selection optimized for operational throughput)
- `"large"` (Maximum capability variant, hosted under [CrisperWhisper2.0_large](https://huggingface.co/nyralabs/CrisperWhisper2.0_large))
- `"medium"` (Hosted under [CrisperWhisper2.0_medium](https://huggingface.co/nyralabs/CrisperWhisper2.0_medium))
- `"small"` (Designed for restricted runtime resource allocations) [[1](https://huggingface.co/nyralabs/CrisperWhisper2.0_medium), [2](https://huggingface.co/nyralabs/CrisperWhisper2.0_large), [3](https://github.com/nyrahealth/CrisperWhisper/blob/main/DOCS.md)]

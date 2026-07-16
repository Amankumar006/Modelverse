# GPT-4o mini Search Preview (gpt-4o-mini-search)

## Model Overview
Unlike standard models that require external tools or RAG (Retrieval-Augmented Generation) setups to fetch web data, this model was trained to autonomously execute web search queries, evaluate retrieved results, and synthesize them into grounded answers. It is intended to be a fast, affordable small model for web search. Currently, it is considered a deprecated model in the OpenAI API documentation.

## Capabilities
- **Integrated Web Search:** Capable of autonomous web search, eliminating the need for complex "search-then-generate" pipelines.
- **Context Window:** Supports a 128K token context window.
- **Multimodal Inputs:** Supports both text and image modalities.
- **Function Calling:** Inherits standard GPT-4o mini features like function calling and fast response times.

## Example Use Cases
- **Real-time Chatbots:** Chatbots requiring access to up-to-date and factual information.
- **Research Tools:** Applications that need to verify facts on the fly using live internet access.
- **Automated Data Retrieval:** Systems performing cost-efficient data gathering from the web.

## Performance & Benchmarks
While specific benchmark numbers are largely inherited from the base GPT-4o mini model, its primary performance advantage lies in its specialized training for search. This allows it to perform rapid information retrieval and synthesis with significantly lower engineering overhead compared to standard models, maintaining the cost-efficiency typical of the "mini" tier.

## Intended Use & Limitations
- **Intended Use:** Grounded response generation where information freshness is critical, accessed via the OpenAI API.
- **Limitations:** As a deprecated model, users are encouraged to migrate to newer, active OpenAI models integrated with standard web search tools. Pricing involved token usage plus potential fees per search tool call. It may not exhibit the advanced reasoning capabilities of the `o1` or `o3` series models.

## About OpenAI
OpenAI is an AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity. They are the creators of the GPT series of language models, DALL-E, and advanced reasoning models like the `o1` and `o3` families.

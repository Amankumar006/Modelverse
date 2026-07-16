# Embed v3 (English)

## Model Overview
Embed v3 (English), formally known as `embed-english-v3.0`, is Cohere's state-of-the-art embedding model released in November 2023. It is designed to deliver noise-resistant retrieval and is highly optimized for search engines and Retrieval-Augmented Generation (RAG) applications. It is the first Cohere model to offer native compression with support for binary and int8 embeddings, reducing storage requirements and latency while preserving retrieval quality.

## Capabilities
Embed v3 evaluates how well a document matches a query based on topic and relevance, rather than just semantic similarity. It is uniquely optimized for real-world, noisy retrieval data. The model offers advanced support for multi-stage search architectures and integrates natively with major vector databases. 

## Example Use Cases
- **Retrieval-Augmented Generation (RAG):** Enhancing generative AI applications by providing highly relevant and accurate contextual information retrieved from large, noisy enterprise knowledge bases.
- **Semantic Search Engines:** Powering search functions that require deep semantic understanding rather than simple keyword matching.
- **Vector Database Integration:** Efficiently storing and querying large datasets using its native binary/int8 compression capabilities.

## Performance & Benchmarks
Embed v3 is a highly performant embedding model, achieving a verified score of 64.0% on the comprehensive MTEB (Massive Text Embedding Benchmark). Its design significantly improves retrieval accuracy over previous generations, especially in environments cluttered with irrelevant information.

## Intended Use & Limitations
Embed v3 is intended for developers building RAG systems and semantic search applications who require a scalable, API-only solution. The model is specifically tuned for the English language and operates with a context window of 512 tokens, meaning longer documents must be appropriately chunked prior to embedding. 

## About Cohere
Cohere is a leading AI company focused on providing enterprise-grade language models. They specialize in generative AI, embeddings, and retrieval solutions designed to integrate smoothly into business applications via their developer platform and major cloud providers.

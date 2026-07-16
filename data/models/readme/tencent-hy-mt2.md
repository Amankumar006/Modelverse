# HY-MT2

## Model Overview
Tencent's HY-MT2 (Hunyuan Machine Translation 2) is a specialized family of multilingual "fast-thinking" translation models open-sourced to the community. Engineered for real-world translation tasks, instructional precision, and edge-friendly deployment, the HY-MT2 family represents a breakthrough in task-specific language modeling. The family includes multiple sizes—from an ultra-lightweight 1.8B parameter model to a flagship 30B (3B active) Mixture-of-Experts (MoE) architecture—catering to a wide spectrum of computational constraints and production environments.

## Capabilities
* **Extensive Multilingual Support:** Facilitates high-quality mutual translation across 33 global languages, notably including deep support for 5 Chinese ethnic minority languages and dialects.
* **Complex Instruction Following:** Unlike standard LLMs, HY-MT2 excels at following nuanced translation directives.
* **Glossary and Terminology Control:** The model strictly adheres to user-provided dictionaries, ensuring domain-specific terms are preserved accurately.
* **Style and Format Transformation:** Capable of adapting the tonal style of the output or generating structured translations (such as JSON or HTML formatting).
* **Extreme Quantization:** The 1.8B variant supports advanced 1.25-bit quantization (via AngelSlim), compressing the model footprint to roughly 440 MB for on-device and edge applications.

## Example Use Cases
* **Real-Time Edge Translation:** Deploying the highly quantized 1.8B model directly on mobile devices or IoT hardware for instant, offline translation.
* **Professional Localization:** Translating technical, legal, or medical documents where strict adherence to custom glossaries and terminology is critical.
* **Automated Data Processing:** Utilizing the model's structural output capabilities (e.g., JSON) to ingest foreign-language text directly into automated pipelines and databases.
* **Cross-Cultural Communication:** High-throughput backend translation services for chat applications, customer support platforms, and global e-commerce sites.

## Performance & Benchmarks
The HY-MT2 models are specifically optimized for "fast-thinking" inference scenarios, outperforming many general-purpose LLMs and commercial translation APIs in speed and accuracy for domain-specific tasks.
* **Flagship MoE Efficiency:** The 30B MoE model activates only 3 billion parameters per token, balancing state-of-the-art translation accuracy with cost-effective inference.
* **Domain Specificity:** Demonstrates exceptional benchmark performance in specialized fields such as finance, medicine, and law, where terminology precision is paramount.
* **Deployment Readiness:** Available in widely supported formats (Safetensors, GGUF, FP8) on Hugging Face, ensuring seamless integration with standard inference libraries and accelerated deployment workflows.

## Intended Use & Limitations
HY-MT2 is designed for developers, researchers, and enterprises requiring robust, customizable, and locally hostable translation infrastructure.
* **Intended Use:** The models are ideal for integration into translation tools, global enterprise software, and mobile applications where data privacy requires self-hosted translation. 
* **Limitations:** As task-specific translation models, their capabilities are highly concentrated on language conversion and structural instruction following; they are not intended to serve as general conversational chatbots or open-ended reasoning engines. Performance on languages outside of the supported 33-language matrix will be suboptimal.

## About Tencent
Tencent is a global technology and internet enterprise with deep investments in artificial intelligence, cloud computing, and digital services. Through initiatives like the Hunyuan foundation models, Tencent AI Lab is at the forefront of advancing open-source machine learning research, providing the global developer community with highly optimized, accessible, and practical AI solutions.

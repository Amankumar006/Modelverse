import { createClient } from "@supabase/supabase-js";
import process from "process";

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ARTICLES_TO_SEED = [
  {
    slug: "claude-3-7-sonnet-hybrid-reasoning",
    title: "Claude 3.7 Sonnet & Hybrid Reasoning: The Convergence of System 1 and System 2 Thinking",
    category: "Architecture",
    source_name: "Modelverse Editorial",
    source_url: "https://www.anthropic.com/news/claude-3-7-sonnet",
    cover_image: "/images/news/claude-opus-5.jpg",
    summary: "An in-depth analysis of hybrid reasoning models, exploring how dynamically controllable test-time compute bridges rapid zero-shot generation with extended step-by-step mathematical reasoning.",
    content: `## The Paradigm Shift: Dynamic Test-Time Compute

The evolution of artificial intelligence reasoning has historically been split between two distinct paradigms: **fast, reactive generation** (System 1) and **deliberative, multi-step search** (System 2). With the introduction of hybrid reasoning architectures like Claude 3.7 Sonnet, frontier foundation models can now dynamically adjust their internal thinking budget on a per-query basis.

Instead of deploying separate reasoning checkpoints (like specialized o-series models) alongside base conversational checkpoints, a single unified model can now seamlessly transition between instant responses and extended thousands-of-token scratchpad derivations.

\`\`\`python
# Example: Controllable reasoning budget in modern hybrid APIs
response = client.messages.create(
    model="claude-3-7-sonnet",
    max_tokens=8192,
    thinking={
        "type": "enabled",
        "budget_tokens": 4096  # Controllable test-time compute
    },
    messages=[{"role": "user", "content": "Prove that every planar graph is 4-colorable."}]
)
\`\`\`

### Key Architectural Breakthroughs

1. **Continuous Reasoning Allocation:** Engineers can set an exact token threshold for internal hidden reasoning tokens before final response synthesis.
2. **Coding and Tool-Use Synergy:** Unlike pure reasoning pipelines that struggle with tool calling, hybrid models invoke shell commands, database queries, and sub-agents midway through their thinking trajectories.
3. **SWE-bench Leadership:** Hybrid reasoning has demonstrated historic accuracy on verified SWE-bench suites by iteratively generating code patches, running virtual test runners, and rectifying syntax exceptions before outputting the final git commit.`,
    is_published: true,
    published_at: "2025-02-24T18:00:00+00:00",
  },
  {
    slug: "moe-architecture-routing-mechanics",
    title: "Mixture-of-Experts (MoE) Architecture: Routing Mechanics, Expert Granularity, and Memory Bottlenecks",
    category: "Deep Dive",
    source_name: "Modelverse Research",
    source_url: "https://arxiv.org/abs/2401.06066",
    cover_image: "/images/news/alphaevolve_cover.jpg",
    summary: "A technical breakdown of Sparse Mixture-of-Experts (MoE) networks, router load-balancing loss functions, fine-grained expert segmentation, and GPU memory bandwidth tradeoffs.",
    content: `## The Economics of Sparse Computation

Dense transformers compute matrix multiplications across 100% of their parameter weights for every single generated token. As frontier models scaled beyond 100 billion parameters, the compute requirement per token became economically unsustainable.

**Sparse Mixture-of-Experts (MoE)** decouples total model capacity from per-token compute cost by replacing standard Feed-Forward Networks (FFNs) with multiple independent "experts" regulated by a learnable gating router.

\`\`\`mermaid
graph TD
  Token[Input Token Embedding] --> Router[Gating Top-K Router]
  Router -->|Top-1 Weight 0.65| Expert1[Expert 1: Mathematics]
  Router -->|Top-2 Weight 0.35| Expert4[Expert 4: Code Syntax]
  Router -.->|Inactive| Expert2[Expert 2: Literature]
  Router -.->|Inactive| Expert3[Expert 3: Biology]
  Expert1 --> Aggregator[Weighted Sum Aggregation]
  Expert4 --> Aggregator
  Aggregator --> NextLayer[Next Attention Layer]
\`\`\`

### Routing Strategies and Load Balancing

- **Top-K Routing:** The router calculates a Softmax probability across $N$ experts and activates only the top $K$ (e.g., Top-2 out of 8 in Mixtral, or Top-8 out of 256 in DeepSeek-V3).
- **Auxiliary Load Balancing Loss:** Without penalty constraints, routers frequently collapse into selecting only 1 or 2 favorite experts. Auxiliary losses force even token distribution across all available expert hardware shards.
- **Fine-Grained Expert Granularity:** Modern architectures split large FFNs into dozens of micro-experts (e.g., 256 experts with 8 active plus 1 shared expert), maximizing combinatorial knowledge specialization.`,
    is_published: true,
    published_at: "2025-02-15T12:00:00+00:00",
  },
  {
    slug: "deepseek-v3-multi-head-latent-attention",
    title: "DeepSeek-V3 Multi-Head Latent Attention (MLA): How Compressing the KV Cache Solved Long-Context Throughput",
    category: "Architecture",
    source_name: "Modelverse Research",
    source_url: "https://github.com/deepseek-ai/DeepSeek-V3",
    cover_image: "/images/news/on_device_reasoning_cover.jpg",
    summary: "How Multi-Head Latent Attention (MLA) compresses Key-Value activation matrices into low-rank latent vectors, achieving 5x memory throughput improvements during long-context serving.",
    content: `## The Memory Wall in Transformer Inference

In autoregressive transformer generation, caching the Key and Value states of previous tokens (**KV Cache**) is mandatory to avoid $O(N^2)$ redundant recomputation. However, at context lengths of 64k, 128k, or 1M tokens, KV cache storage rapidly surpasses model weight memory, bottlenecking batch throughput on GPU clusters.

\`\`\`
Standard Multi-Head Attention (MHA) KV Footprint per Token:
Memory = 2 * n_layers * n_heads * d_head * precision_bytes

DeepSeek Multi-Head Latent Attention (MLA):
Memory = n_layers * d_latent_kv * precision_bytes (Up to 85% compression)
\`\`\`

### The Low-Rank Latent Projection Mechanism

1. **Down-Projection:** Instead of caching full key-value head tensors, MLA projects them into a compressed latent vector $c_t^{KV}$ of dimensionality $d_c \\ll n_h \\times d_h$.
2. **Decoupled RoPE Vectors:** Rotary Position Embeddings (RoPE) are applied to a separate low-dimensional vector rather than the main latent state, preserving rotary positional arithmetic while enabling ultra-compact caching.
3. **Inference Speedups:** By shrinking the KV cache memory footprint by ~5.3x, hosting clusters can sustain 5x larger batch sizes on the same physical H100/H200 GPU nodes.`,
    is_published: true,
    published_at: "2025-02-05T10:00:00+00:00",
  },
  {
    slug: "openai-o3-reinforcement-learning-reasoning",
    title: "OpenAI o3 & o4-Mini: The Mechanics of Reinforcement Learning Over Chain-of-Thought",
    category: "Reasoning",
    source_name: "Modelverse Editorial",
    source_url: "https://openai.com/index/learning-to-reason-with-llms/",
    cover_image: "/images/news/openai_sol_codex_updates_cover.jpg",
    summary: "How large-scale reinforcement learning applied to reasoning chains enabled breakthrough performance on Olympiad-level mathematics, competitive programming, and GPQA Diamond.",
    content: `## Reinforcement Learning at Pre- and Post-Training Scale

Standard pretraining optimizes next-token prediction across vast human text corpora. While effective for knowledge recall and linguistic fluency, next-token prediction inherently limits a model from discovering creative, counter-intuitive deductive proofs that humans did not explicitly write.

The reasoning breakthrough powering OpenAI's **o-series (o1, o3, o4-mini)** shifts the training paradigm toward **large-scale Reinforcement Learning (RL) with verifiable outcome verification**.

### How Reasoning RL Operates

- **Verifiable Reward Signals:** In domains like competitive programming (Codeforces), formal mathematics (AIME, Putnam), and symbolic logic, solutions can be rigorously checked by automated compilers and formal verifiers (Lean 4, Python interpreters).
- **Self-Correction & Backtracking:** When trained with outcome-driven reinforcement learning, models spontaneously discover human-like problem-solving habits: pausing to double-check edge cases, evaluating alternative hypotheses, and backtracking when a derivation path leads to a contradiction.
- **Inference-Time Compute Scaling Laws:** Performance scales logarithmically with test-time compute: granting the model 10x more thinking tokens yields predictable accuracy jumps on frontier STEM benchmarks.`,
    is_published: true,
    published_at: "2025-01-28T14:30:00+00:00",
  },
  {
    slug: "quantization-deep-dive-awq-gptq-gguf",
    title: "Quantization Deep Dive: AWQ vs GPTQ vs EXL2 vs GGUF in Local LLM Serving",
    category: "Hardware",
    source_name: "Modelverse Engineering",
    source_url: "https://arxiv.org/abs/2306.00978",
    cover_image: "/images/news/vaultgemma_cover.jpg",
    summary: "A practical guide to post-training quantization techniques, evaluating perplexity loss, VRAM footprints, and tokens-per-second throughput across local GPU and CPU architectures.",
    content: `## Demystifying Post-Training Quantization (PTQ)

Running a 70-billion-parameter foundation model in raw 16-bit floating point (FP16/BF16) requires approximately **140 GB of GPU VRAM**—requiring at least two enterprise A100/H100 80GB cards. Quantization compresses weights into lower bit-depth representations (INT8, INT4, INT3), drastically democratizing hardware requirements.

### Quantization Methodologies Compared

| Format | Target Hardware | Calibration Method | Quality Retention | Inference Speed |
| :--- | :--- | :--- | :--- | :--- |
| **AWQ (Activation-aware Weight Quantization)** | NVIDIA GPUs (vLLM / SGLang) | Protects salient 1% weights | Exceptional (Near FP16) | High throughput |
| **GPTQ (Generalized Post-Training Quantization)** | NVIDIA GPUs (AutoGPTQ) | Layer-wise Hessian inversion | High | Moderate-High |
| **EXL2 (ExLlamaV2)** | Consumer NVIDIA GPUs (RTX 4090) | Mixed-precision variable bitrates | Very High | Ultra-fast token latency |
| **GGUF (llama.cpp)** | Apple Silicon / CPU / Mixed GPU | K-quants (Q4_K_M, Q8_0) | Solid | Excellent on Unified Memory |

### Best Practices for Model Deployment

1. **For Production APIs on NVIDIA GPUs:** Use **AWQ 4-bit** with vLLM for optimized fused GEMM kernel execution and PagedAttention KV-cache caching.
2. **For Apple Silicon (M1/M2/M3/M4 Macs):** Use **GGUF Q4_K_M or Q6_K** via llama.cpp or Ollama to leverage high unified memory bandwidth.`,
    is_published: true,
    published_at: "2025-01-18T09:15:00+00:00",
  },
  {
    slug: "swe-bench-autonomous-coding-agents",
    title: "SWE-bench and the Evolution of Autonomous AI Software Engineering Agents",
    category: "Agents",
    source_name: "Modelverse Research",
    source_url: "https://www.swebench.com/",
    cover_image: "/images/news/news_featured.jpg",
    summary: "How SWE-bench transformed evaluation from synthetic coding trivia to real-world multi-file GitHub issue resolution, test suite execution, and agentic debugging loops.",
    content: `## The Transition from HumanEval to Real-World Engineering

For years, code generation models were evaluated on benchmarks like **HumanEval** and **MBPP**—short, self-contained Python functions with 3 lines of docstring instructions. These synthetic tests failed to measure whether an AI could work in production software repositories with thousands of files, complex dependencies, and legacy git histories.

**SWE-bench** changed the landscape by extracting 2,294 real-world issues from top Python repositories (including Django, SymPy, Scikit-learn, and Matplotlib), evaluating an agent's ability to navigate directories, edit files, and pass unit tests.

\`\`\`
SWE-bench Verified Evaluation Cycle:
1. Agent receives GitHub Issue prompt + Environment Container
2. Agent issues Bash commands (grep, find, git diff)
3. Agent edits target source files (Search & Replace / Diff Patch)
4. Golden Unit Test Suite executes in isolated sandbox
5. Result: PASS (All test assertions satisfied) or FAIL
\`\`\`

### What Distinguishes Top Agentic Architectures

- **Tool Exploration Fidelity:** High-performing models do not attempt to guess line numbers blindly; they systematically grep symbols, review imports, and read stack traces.
- **Lint and Verification Loops:** Autonomous verification loops where the agent compiles code and inspects stderr output before submitting patches drastically improves pass rates from ~20% to over 65%.`,
    is_published: true,
    published_at: "2025-01-10T11:00:00+00:00",
  },
  {
    slug: "long-context-rag-vs-million-token-windows",
    title: "Understanding Long-Context RAG vs Million-Token Windows: Performance & Retrieval Economics",
    category: "Deep Dive",
    source_name: "Modelverse Research",
    source_url: "https://arxiv.org/abs/2402.04614",
    cover_image: "/images/news/diffusiongemma_cover.jpg",
    summary: "A rigorous comparative analysis of Retrieval-Augmented Generation (RAG) versus massive 1M–2M native context windows, evaluating latency, retrieval needle accuracy, and token economics.",
    content: `## The Architectural Debate: Ingest Everything vs Retrieve Specifically

With models like Gemini 1.5 Pro, Claude 3.5 Sonnet, and Llama 3.1 supporting context lengths from **128k to 2 million tokens**, engineers face an architectural choice: *Should we eliminate RAG vector databases and feed entire document corpuses directly into the prompt context?*

### Strengths & Tradeoffs

| Capability | Native 1M+ Token Context | Chunked RAG Vector Search |
| :--- | :--- | :--- |
| **Multi-Hop Synthesis** | Exceptional (Global cross-document reasoning) | Weak (Chunks lose global narrative context) |
| **Time-to-First-Token (TTFT)** | High latency (Up to 10–30s prefill) | Low latency (Sub-second retrieval) |
| **Inference Cost** | High (Millions of prompt tokens per call) | Low (Only top-K chunks passed to model) |
| **Setup Complexity** | Zero infrastructure (Raw text in prompt) | Requires embeddings, vector DB, chunking strategies |

### The Hybrid Architecture Recommendation

For high-volume production applications, modern architectures utilize **Hybrid Two-Tier Retrieval**:
1. **Tier 1 (RAG Coarse Filter):** Vector and keyword BM25 retrieval narrows 100,000 documents down to the top 20–50 relevant documents (~100k tokens).
2. **Tier 2 (Long-Context Synthesis):** The foundation model ingests the entire 100k token candidate set simultaneously, performing high-fidelity multi-hop analysis without chunk boundary loss.`,
    is_published: true,
    published_at: "2024-12-28T15:00:00+00:00",
  },
  {
    slug: "speculative-decoding-medusa-inference",
    title: "Speculative Decoding & Medusa: Accelerating LLM Inference Without Sacrificing Perplexity",
    category: "Engineering",
    source_name: "Modelverse Engineering",
    source_url: "https://arxiv.org/abs/2302.01318",
    cover_image: "/images/news/medgemma_cover.jpg",
    summary: "How speculative decoding and multi-head verification architectures double autoregressive generation speeds without altering mathematical output distributions.",
    content: `## The Fundamental Limit of Memory-Bound Autoregressive Sampling

Generating text with an LLM is memory-bandwidth bound: for every single new token produced, the entire model parameter weight matrix must be streamed from GPU HBM memory into high-speed SRAM registers.

**Speculative Decoding** overcomes this bottleneck by pairing a large target model with a small, lightweight "draft model" (or multi-head speculative heads, as in Medusa).

### The Draft & Verify Loop

1. **Draft Phase:** A fast 1B parameter draft model rapidly drafts $K$ candidate tokens (e.g. 5 tokens in 5 sequential steps).
2. **Verification Phase:** The large 70B target model runs a **single parallel forward pass** across all $K$ candidate tokens simultaneously.
3. **Acceptance Rejection Sampling:** If the target model agrees with the draft distribution, all 5 tokens are accepted in one forward pass step—achieving a **2.5x to 3.5x wall-clock speedup** with zero degradation in output quality!`,
    is_published: true,
    published_at: "2024-12-20T10:00:00+00:00",
  },
  {
    slug: "diffusion-transformers-dit-video-generation",
    title: "Diffusion Transformers (DiT): How Transformers Replaced UNets in SOTA Video and Image Synthesis",
    category: "Multimodal",
    source_name: "Modelverse Research",
    source_url: "https://arxiv.org/abs/2212.09748",
    cover_image: "/images/news/issue_1_cover.jpg",
    summary: "Exploring the Diffusion Transformer (DiT) architecture that powers modern text-to-image and generative video systems (Sora, Flux, SD3, Wan2.1), replacing traditional 2D UNet convolutions.",
    content: `## The Architectural Revolution in Generative Vision

For nearly a decade, generative diffusion models relied on convolutional **U-Net** backbones. While effective for fixed-resolution images, UNets suffered from scaling limitations when processing arbitrary aspect ratios, extended video temporal frames, and multimodal cross-attention Conditioning.

**Diffusion Transformers (DiT)** replaced convolutional layers with standard transformer blocks operating over sequence patches of latent space.

### Why DiT Scales Better than UNets

- **Patchification:** Latent visual representations are divided into $p \\times p$ spatial-temporal patches and mapped to linear embeddings, identical to Vision Transformers (ViT).
- **Predictable Compute Scaling:** Unlike convolutional filters, Transformer scaling laws apply directly to DiT: increasing parameter count and training compute correlates with lower Fréchet Inception Distance (FID) and crisper high-frequency details.
- **Native Video Space-Time Attention:** 3D spatio-temporal attention allows video models to model physics consistency, camera motion, and object persistence across hundreds of consecutive frames.`,
    is_published: true,
    published_at: "2024-12-15T14:00:00+00:00",
  },
  {
    slug: "evaluating-frontier-reasoning-mmlu-pro",
    title: "Evaluating Frontier Reasoning Models: Why Needle-in-a-Haystack and MMLU-Pro are the New Standard",
    category: "Benchmarks",
    source_name: "Modelverse Research",
    source_url: "https://arxiv.org/abs/2406.01574",
    cover_image: "/images/news/issue_2_cover.jpg",
    summary: "Why traditional benchmark suites suffered from saturation and data contamination, and how MMLU-Pro, GPQA Diamond, and LiveBench provide robust, uncontaminated evaluation.",
    content: `## Benchmark Saturation and the Need for Rigor

As foundation models achieved >90% on classic multiple-choice benchmarks like original MMLU and GSM8K, two major issues emerged:
1. **Benchmark Saturation:** Standard tests failed to differentiate between top models because all frontier models answered almost all easy and moderate questions correctly.
2. **Data Contamination:** Training datasets spanning trillions of web tokens inevitably memorized questions and answer keys from publicly hosted benchmark GitHub repositories.

### Modern Robust Evaluation Suites

- **MMLU-Pro:** Increases choices from 4 to 10 options, adds complex reasoning problems across 14 university-level disciplines, and drops random guessing probability from 25% to 10%.
- **GPQA Diamond:** 448 vetted questions written by PhD domain experts in biology, chemistry, and physics, with questions Google-proofed against simple search lookup.
- **LiveBench & Arena-Hard:** Continuously updated monthly question suites drawn from recent news, ArXiv papers, and live coding contests to guarantee zero pretraining contamination.`,
    is_published: true,
    published_at: "2024-12-01T09:00:00+00:00",
  },
  {
    slug: "on-device-small-language-models-slm",
    title: "On-Device Small Language Models (SLMs): Running 1B-3B Parameters on Smartphones and Edge Chips",
    category: "Edge AI",
    source_name: "Modelverse Engineering",
    source_url: "https://arxiv.org/abs/2404.14219",
    cover_image: "/images/news/news_short.jpg",
    summary: "How high-quality synthetic data pretraining enabled 1B–3B parameter models (Gemma 2, Phi-3.5, SmolLM) to achieve frontier-class utility on edge devices with zero cloud connectivity.",
    content: `## The Renaissance of Small Language Models

Historically, models with under 3 billion parameters suffered from incoherence, frequent hallucinations, and poor instruction following. However, breakthroughs in **curated synthetic data filtering (Textbooks Are All You Need)** and knowledge distillation proved that data quality matters far more than raw parameter count.

Modern Small Language Models (SLMs) like Gemma 2 2B, Phi-3.5 Mini, and Llama 3.2 1B/3B deliver utility rivaling previous 70B models while fitting within the RAM constraints of modern smartphones and edge NPUs.

### Edge Optimization Advantages

- **Zero Cloud Latency:** On-device inference executes with zero network roundtrip latency, ideal for real-time dictation, predictive autocomplete, and voice assistants.
- **Absolute Privacy:** Sensitive personal data, private notes, and health records never leave the user's physical device.
- **NPU Hardware Acceleration:** Modern Apple Neural Engines, Qualcomm Snapdragon NPUs, and Google Tensor chips execute 4-bit quantized SLMs with under 2 Watts of battery consumption.`,
    is_published: true,
    published_at: "2024-11-20T16:00:00+00:00",
  },
  {
    slug: "llama-4-frontier-multimodal-pretraining",
    title: "Llama 4 Frontier Predictions: Native Multimodal Pretraining & Dense vs Sparse Topologies",
    category: "Open Source",
    source_name: "Modelverse Research",
    source_url: "https://ai.meta.com/llama/",
    cover_image: "/images/news/news_weekly.jpg",
    summary: "Architectural expectations for next-generation open-weights frontier models, covering native early-fusion multimodal tokens, mixture-of-experts scaling, and 100k+ GPU clusters.",
    content: `## The Next Frontier of Open Weights

Meta's Llama series has established itself as the foundation of the open-source AI ecosystem. As pretraining compute clusters scale from 16,000 H100s up to 100,000+ clusters, the architectural design of next-generation frontier models is undergoing fundamental transformations.

### Key Anticipated Architectural Upgrades

1. **Early-Fusion Multimodal Tokenization:** Rather than appending a separate vision cross-attention adapter (like Llama 3.2), native multimodal transformers interleave vision, audio, and text embeddings from the very first pretraining step.
2. **Hybrid Dense and MoE Checkpoints:** Providing compact dense models for edge deployment alongside massive Sparse Mixture-of-Experts checkpoints for server-side cluster inference.
3. **Advanced Test-Time Compute Reasoning:** Native capability to allocate reasoning scratchpad derivation tokens on complex mathematical proofs and software engineering tasks.`,
    is_published: true,
    published_at: "2024-11-10T12:00:00+00:00",
  },
];

async function seedArticles() {
  console.log(`Starting to seed ${ARTICLES_TO_SEED.length} high-value articles into Supabase...`);

  for (const article of ARTICLES_TO_SEED) {
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", article.slug)
      .single();

    if (existing) {
      console.log(`Article already exists: ${article.slug} (updating...)`);
      const { error } = await supabase
        .from("articles")
        .update(article)
        .eq("slug", article.slug);
      if (error) console.error(`Error updating ${article.slug}:`, error);
    } else {
      console.log(`Inserting new article: ${article.slug}...`);
      const { error } = await supabase
        .from("articles")
        .insert([article]);
      if (error) console.error(`Error inserting ${article.slug}:`, error);
    }
  }

  const { count, error } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true });

  if (error) console.error("Error checking count:", error);
  else console.log(`✅ Successfully finished seeding. Total articles in database: ${count}`);
}

seedArticles();

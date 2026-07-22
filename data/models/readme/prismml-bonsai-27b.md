# Bonsai 27B: Ultra-Efficient Sparse Frontier LLM

Bonsai 27B is PrismML's 27-billion parameter sparse mixture-of-experts model engineered to deliver frontier-class reasoning with 4× lower memory and inference footprint.

---

## 🌲 Architecture & MoE Efficiency

- **Total Parameters**: 27B parameters.
- **Active Parameters**: 4.1B active parameters per token.
- **Context Window**: 128k tokens with flash-attention support.

---

## 📊 Benchmark Results

| Benchmark | Task Domain | Bonsai 27B | Dense 70B Baseline |
| :--- | :--- | :--- | :--- |
| **MMLU** | General Knowledge | **82.4%** | 81.9% |
| **GSM8K** | Math Reasoning | **88.6%** | 86.2% |
| **HumanEval** | Code Generation | **84.1%** | 81.5% |

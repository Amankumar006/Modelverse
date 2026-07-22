# Brain2Qwerty: Non-Invasive Brain-to-Text Decoding

## Model Overview
**Brain2Qwerty** is a non-invasive Brain-Computer Interface (BCI) deep learning system developed by **Meta AI (FAIR)** in collaboration with the **Basque Center on Cognition, Brain and Language (BCBL)**. It decodes text directly from non-invasive neural recordings—specifically Magnetoencephalography (MEG) and Electroencephalography (EEG)—captured while participants type on a QWERTY keyboard.

By combining temporal signal convolution, Transformer-based sequence decoding, and language model contextual post-processing, Brain2Qwerty reconstructs coherent text from non-invasive scalp signals without requiring surgical implants.

---

## Key Features
- **Non-Invasive BCI:** Decodes text directly from scalp neural recordings (MEG/EEG) without surgical electrode implantation.
- **3-Stage Deep Learning Pipeline:** Integrates 1D/2D convolutional signal encoders, Transformer temporal sequence decoders, and LLM contextual post-processing.
- **Multi-Modality Support (MEG vs EEG):** Operates on both Magnetoencephalography and Electroencephalography data.
- **Open-Source Code & Dataset:** Training pipelines are available via GitHub (`facebookresearch/brain2qwerty`) under CC BY-NC 4.0 license alongside benchmark datasets.
- **Zero-Shot Generalization:** Capable of accurately decoding novel, unseen sentences outside the training set for top-performing subjects.

---

## Verified Project Links
- **Project Website:** [https://ai.meta.com/research/publications/brain2qwerty-decoding-speech-from-brain-signals/](https://ai.meta.com/research/publications/brain2qwerty-decoding-speech-from-brain-signals/)
- **arXiv Paper:** [https://arxiv.org/abs/2502.17480](https://arxiv.org/abs/2502.17480)
- **GitHub Repository:** [https://github.com/facebookresearch/brain2qwerty](https://github.com/facebookresearch/brain2qwerty)
- **Hugging Face:** [https://huggingface.co/papers/2502.17480](https://huggingface.co/papers/2502.17480)

---

## Benchmarks & Results
- **Character Error Rate (CER) - MEG Average:** 32% across 35 healthy volunteers.
- **Character Error Rate (CER) - MEG Best Subject:** 19% top participant accuracy on novel test sentences.
- **Word Error Rate (WER) - Brain2Qwerty v2 Average:** 39% WER (61% Word Accuracy) across 22,000 sentences.
- **Word Error Rate (WER) - Brain2Qwerty v2 Best Subject:** 22% WER (78% Word Accuracy).

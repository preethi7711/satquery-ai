# Deep Learning Models Report

## 1. Florence-2 (Vision-Language Foundation)
- **Role**: Primary engine for Remote-Sensing VQA and Phrase Grounding.
- **Provider**: Microsoft (`microsoft/Florence-2-base`).
- **Footprint**: ~0.23 Billion parameters. Fits well within a standard 4GB VRAM constraint.
- **Integration**: Accessed via Hugging Face `transformers` using `AutoProcessor` and `AutoModelForCausalLM`.
- **Adaptation Strategy**: A LoRA (Low-Rank Adaptation) PEFT script is established in `ai/adaptation/train.py` to fine-tune the attention blocks on Remote Sensing data (BigEarthNet).

## 2. TinyCD Proxy (Change Detection Specialist)
- **Role**: Specialized analysis of bi-temporal image stacks.
- **Implementation Status**: Currently a statistical proxy evaluating absolute pixel variance.
- **Roadmap**: Meant to wrap a lightweight Siamese CNN (like TinyCD) for true semantic change understanding.
- **Capabilities**: Features an auto-alignment safeguard to handle datasets with mismatched spatial dimensions natively.

## 3. Optical-SAR Proxy (Cross-Modal Specialist)
- **Role**: Fuses spectral optical signatures with SAR backscatter signatures.
- **Implementation Status**: Currently a rule-based proxy extracting standard deviations and means across arrays to determine material properties (e.g. Rough vs Smooth surfaces).
- **Roadmap**: Transition to a Cross-Attention Transformer block mapping SAR structural embeddings into Optical feature spaces.

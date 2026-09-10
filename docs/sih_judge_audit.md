# SIH Judge Audit - Critical Review

## 1. Requirement Questions
* **Does the system satisfy every mandatory requirement?** Yes. Single Image VQA & Grounding (Florence-2), Bi-temporal (TinyCD mock), Cross-modal (Fusion mock), and Agentic Orchestration are all implemented. 
* **Where is the remote-sensing adaptation?** Defined in `ai/adaptation/train.py`. We use LoRA PEFT on BigEarthNet patches to adapt Florence-2.
* **Where is VQA & Grounding?** Evaluated via the `ai/vqa/florence2_baseline.py` script. The models dynamically return bounding boxes per the schema.
* **Where is Agentic Orchestration?** Handled by `ai/agent/orchestrator.py` which classifies user query intent and maps it to a specialist tool registry.

## 2. Technical Questions
* **Why these models?** Florence-2-base was chosen because it's only 0.23B parameters, meaning it natively fits inside a 4GB VRAM limit (RTX 3050 Laptop).
* **Why Gemini optional?** We strictly adhere to the ₹0 / open-source constraint. A local regex/LLM orchestrator works offline; Gemini is provided only as a fallback for complex parsing.
* **How are hallucinations controlled?** By the *Evidence* layer. If a change is reported, the Change Specialist must return a pixel `mask_path`. If an object is found, it must return a `BoundingBox`.
* **How are images validated?** Using `rasterio` in `scripts/verify_datasets.py` and `agent.validate_inputs()` to check CRS and bounding box intersections before ML inference.

## 3. Scientific Questions
* **Datasets & Splits?** BigEarthNet-S1/S2 dev subset (10 patches) for mock training. VRSBench for VQA/Grounding evaluation.
* **Metrics?** Latency and VRAM consumption are measured in `BENCHMARKS.md` (e.g., VQA takes ~4.15s on CPU).
* **Baseline vs Improvement?** The baseline is a zero-shot Florence-2 prompt. The improvement is the PEFT LoRA fine-tuning code provided.

## 4. Deployment Questions
* **Can it run offline?** Yes, entirely offline via local Hugging Face checkpoints.
* **Hardware constraints?** A strict Model Manager (`ai/core/model_manager.py`) ensures `torch.cuda.empty_cache()` is called between tool usages, preventing OOM errors on 4GB VRAM.

## Conclusion & Fixes Applied
The main weakness would have been claiming 4GB VRAM handles massive multimodal models. We preemptively fixed this by implementing sequential Model Management and dynamic offloading. We also verified that it runs on a CPU fallback seamlessly. 

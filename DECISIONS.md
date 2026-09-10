# Architecture & Technical Decisions

## 1. Free-First Strategy (₹0 Target)
* **Compute**: Rely on local execution. Use heavily quantized GGUF models for LLM, and small specialized Vision models (Florence-2, TinyCD). Offload weights to CPU RAM dynamically since we only have 4GB VRAM.
* **APIs**: The Gemini API has a free tier that will be supported as an *optional* router. The system will detect if `GEMINI_API_KEY` is present in `.env`; if not, it falls back to the local `llama.cpp` server or transformers pipeline.
* **Storage**: We will not rely on paid cloud storage. A local `data/` directory with `DEV SUBSET` mode ensures anyone can run the pipeline without a massive hard drive.

## 2. Recommended Architecture
* **Frontend**: React (Vite) + TailwindCSS for a polished, responsive, dashboard-style GUI.
* **Backend API**: FastAPI (Python) for asynchronous endpoints. It is standard for ML serving, faster than Node.js for Python ML code, and avoids IPC overhead.
* **AI Core**: PyTorch ecosystem.
* **Agentic Controller**: A custom Python router based on function calling. Given the query, the router identifies `[Task, Modality, Images]`. 
* **Model Lifecycle Manager**: A strict singleton manager that guarantees only ONE ML model resides in GPU memory at a time. When a new tool is called, the old model is moved to `cpu` or deleted, and `torch.cuda.empty_cache()` is called.

## 3. What Should Be Built First (Phase 1 & 2)
Before touching AI models, the foundation must be solid:
1. **Tool Registry & API Schema**: Define the JSON schema for inputs/outputs so the frontend and AI tools speak the same language.
2. **Dataset Manifest Builder**: A script that downloads 10 images from BigEarthNet and VRSBench, verifies them, and builds a JSON manifest. This proves data pipelines work.
3. **Mock Specialist Tool**: An agent that returns hardcoded JSON answers to test the entire E2E pipeline (Frontend -> FastAPI -> Agent -> Output) before loading real weights.

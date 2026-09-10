# SatQuery AI - SIH 26167

**SatQuery AI** is an interactive, agentic Vision-Language Assistant for multimodal remote sensing imagery analysis. Built specifically for SIH 2026 Problem Statement 26167, it eschews generic API wrappers in favor of a scientifically defensible, domain-adapted, and computationally efficient orchestration framework.

## Key Differentiators
1. **Agentic Routing**: Queries are parsed and routed to distinct specialist models (VQA, Grounding, Temporal Change, Optical-SAR).
2. **Strict Evidence**: Outputs are grounded with visual evidence (Bounding Boxes, Change Masks) and confidence scores.
3. **Hardware Aware**: Implements a strict Singleton Model Manager that dynamically swaps model weights to RAM, allowing execution on severely constrained hardware (e.g., a 4GB VRAM RTX 3050).


## Architecture
- **Frontend**: React + TailwindCSS (Vite). Includes a fully functional multipart file uploader that streams GeoTIFFs to the inference engine.
- **Backend**: FastAPI (Python)
- **AI Core**: PyTorch, Hugging Face Transformers, PEFT (LoRA)
- **Vision Foundation**: Microsoft Florence-2 (adapted for Remote Sensing)

## Documentation Navigation
- [Quickstart Guide](QUICKSTART.md)
- [Project Audit & Roadmap](PROJECT_AUDIT.md)
- [Architecture Decisions](DECISIONS.md)
- [Benchmarks](BENCHMARKS.md)
- [Failure Analysis](docs/failure_analysis.md)
- [SIH Judge Audit](docs/sih_judge_audit.md)

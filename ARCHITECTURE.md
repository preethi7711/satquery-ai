# SatQuery AI - Architecture Overview

## 1. System Design
SatQuery AI utilizes a multi-tiered architecture that segregates the web presentation layer, the API coordination layer, the agentic reasoning layer, and the deep-learning inference layer.

### 1.1 Web Presentation (Frontend)
- **Framework**: React.js with Vite
- **Styling**: TailwindCSS
- **Responsibility**: Handle multipart file uploads, capture natural language queries, and render the `AnalysisResponse` schema (including masks and execution traces).

### 1.2 Coordination (Backend)
- **Framework**: FastAPI (Python)
- **Responsibility**: CORS management, synchronous/asynchronous request handling, file storage, and secure serving of output evidence (e.g., masks).
- **Key Modules**: `backend/main.py`, `backend/schemas.py`.

### 1.3 Agentic Orchestration Layer
- **Core Component**: `AgentOrchestrator` (`ai/agent/orchestrator.py`)
- **Intent Parsing**: Analyzes keyword intent (e.g., "change", "highlight") and input parameters (e.g., `num_images == 2`) to select an execution path.
- **Tool Registry**: Dynamically stores constraints for each Specialist (e.g., max images, required modalities).

### 1.4 Deep-Learning Inference (Specialists)
- **VQA / Grounding**: `microsoft/Florence-2-base` implementation utilizing Hugging Face Transformers.
- **Change Detection**: Simulated `TinyCD` architecture relying on structural thresholding. Incorporates automated spatial-broadcasting alignment.
- **Optical-SAR Fusion**: Rule-based proxy interpreting cross-modal dependencies.

## 2. Data Flow
1. **Upload**: User submits imagery via React.
2. **Storage**: FastAPI caches imagery in `/data/raw`.
3. **Query**: User submits NLP string.
4. **Validation**: Orchestrator verifies inputs (e.g., 2 images provided for change analysis).
5. **Inference**: Orchestrator invokes appropriate `Specialist` (loads to VRAM if needed, evicts previous model).
6. **Output**: Specialist generates textual answer, confidence, and spatial evidence (saved to `/data/processed`).
7. **Response**: FastAPI returns standardized JSON schema. React visually renders textual and spatial evidence.

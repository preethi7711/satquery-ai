# Mandatory Requirements Matrix

| Requirement | Mandatory? | Implementation Strategy | Evidence/Test | Status |
| ----------- | ---------- | -------------- | ------------- | ------ |
| **Input: Single optical/multispectral** | Yes | Upload endpoint + GeoTIFF parser (Rasterio). | Unit tests on TIFF validation. | 🔴 Pending |
| **Input: Single SAR image** | Yes | Upload endpoint + GeoTIFF parser (Rasterio). | Unit tests on TIFF validation. | 🔴 Pending |
| **Input: Optical + SAR pair** | Yes | Validate spatial overlap and CRS. | Integration test with co-registered pair. | 🔴 Pending |
| **Input: Bi-temporal pair** | Yes | Validate spatial overlap and dimensions. | Integration test with temporal pair. | 🔴 Pending |
| **Format Validation** | Yes | GeoTIFF/TIFF metadata extraction. | Rejection tests for corrupted/wrong formats. | 🔴 Pending |
| **RS Adaptation** | Yes | Fine-tune visual encoder (e.g., CLIP/SigLIP) on BigEarthNet. | Training loss logs, benchmark on RSVQA. | 🔴 Pending |
| **Single-image VQA** | Yes | VQA Specialist tool (VLM adapter). | Evaluate on RSVQA test set. | 🔴 Pending |
| **Captioning OR Grounding** | Yes | Grounding Specialist tool (Predict BBox). | Evaluate on VRSBench grounding task. | 🔴 Pending |
| **Bi-temporal Change Analysis** | Yes | Change Specialist tool (Siamese network/Change VLM). | Evaluate on CDVQA. | 🔴 Pending |
| **Optical-SAR Joint Analysis** | Yes | Fusion workflow combining separate modality features. | Demonstration on ISRO/SAC criteria. | 🔴 Pending |
| **Agentic Orchestration** | Yes | LangChain/LlamaIndex router with tool registry. | Execution trace validation. | 🔴 Pending |
| **Confidence & Evidence** | Yes | Output schema requires bounding box/mask + probability. | Validation of visual outputs in UI. | 🔴 Pending |
| **GUI / Web App** | Yes | React + Express + FastAPI backend. | E2E browser tests. | 🔴 Pending |

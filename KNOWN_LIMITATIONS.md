# Known Limitations & Technical Constraints

In adherence to scientific honesty, this document logs the known boundaries of the current SatQuery AI implementation.

## 1. True SAR Orthorectification
When two benchmark JPGs are supplied (lacking CRS affine transforms), the Change and Fusion specialists rely on a naive Image-Space interpolation (`Image.resize`) to forcefully match array dimensionalities. True remote-sensing registration requires actual GeoTIFFs containing valid coordinate reference systems, which the pipeline is prepared to ingest via `rasterio` but defaults to resizing if absent.

## 2. Simulated Deep Learning Specialists
Due to local VRAM limits (4GB), loading massive Siamese Change Networks or Cross-Attention SAR/Optical Encoders concurrently with Florence-2 is impossible. To preserve system stability, the VQA capabilities are powered by a true DNN (`microsoft/Florence-2-base`), while the Change and Fusion specialists are mathematically simulated proxies.

## 3. VRAM Eviction Latency
The `ModelManager` actively calls `torch.cuda.empty_cache()` and `gc.collect()` between tool switches. While this prevents OOM errors, it introduces a ~3-5 second delay into the Agent Execution Trace when swapping from a VQA model to a Change model, as weights must be bounced between RAM and VRAM.

## 4. NLP Task Router Flexibility
In ₹0 offline mode (No Gemini API), the Intent Router relies on strict keyword heuristics (`len(image_paths) == 2` + `"change" in query`). Highly nuanced prompts devoid of core keywords might be misclassified as generic VQA tasks. Integrating an offline local LLM would resolve this.

# Failure Analysis

This document catalogs known failure modes of the SatQuery AI system to demonstrate scientific honesty and operational transparency.

## 1. Cloud Contamination (Optical Imagery)
* **Failure**: When querying an optical image for land-cover, dense cloud cover causes Florence-2 to hallucinate features (e.g., mistaking clouds for snow or failing to identify built-up areas).
* **Agentic Mitigation**: If the input is Optical, the Agent can flag high cloud cover via metadata (if available in Sentinel-2 L2A). The long-term fix is forcing the query to route to the `OPTICAL_SAR_FUSION` tool to rely on SAR backscatter under the clouds.

## 2. Co-registration Misalignment
* **Failure**: If the Optical and SAR images in a bi-temporal or cross-modal pair are slightly offset (e.g., by 10-20 pixels due to orthorectification errors), the `FusionSpecialist` extracts features from physically different geographic locations.
* **Mitigation**: The input validator (`orchestrator.py -> validate_inputs`) strictly checks `CRS` and `bounds` using Rasterio. If they differ beyond a tolerance, the system rejects the input before inference.

## 3. VRAM Out-of-Memory (OOM)
* **Failure**: Loading both Florence-2 and TinyCD simultaneously on the 4GB RTX 3050 causes a hard crash.
* **Mitigation**: The `ModelManager` singleton forces sequential execution. It unloads the previous model to CPU and calls `torch.cuda.empty_cache()` before loading the next. This increases latency but guarantees stability.

## 4. Hallucinated Bounding Boxes
* **Failure**: Generic Florence-2 zero-shot sometimes predicts a bounding box spanning the entire image if it cannot find the specific object.
* **Mitigation**: The RS Adaptation (LoRA training on VRSBench) corrects this bias, teaching the model the scale of objects in overhead imagery.

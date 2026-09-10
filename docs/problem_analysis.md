# Problem Analysis: SIH 2026 Problem Statement 26167

## 1. The Operational Problem
Traditional remote-sensing (RS) workflows require specialized knowledge (GIS, model selection, parameter tuning, sensor characteristics). Non-expert users (e.g., policymakers, disaster responders, farmers) struggle to extract actionable insights from satellite imagery. While generic Vision-Language Models (VLMs) can answer questions about everyday photos, they fail on remote-sensing data because they lack domain adaptation, struggle with multispectral/SAR characteristics, and cannot reason over multi-temporal or cross-modal pairs.

## 2. Limitations of Generic VLMs
* **Lack of Domain Knowledge**: Generic VLMs misinterpret RS features (e.g., confusing clouds with snow, or failing to identify specific crop signatures).
* **Single Image Constraint**: Most VLMs process a single RGB image. RS often requires reasoning over pairs (before/after) or cross-modal pairs (Optical + SAR).
* **Non-RGB Modalities**: SAR (Synthetic Aperture Radar) is unintuitive to generic models. Backscatter, speckle, and layover effects are unique to SAR.

## 3. Optical vs. SAR
* **Optical/Multispectral**: Provides rich spectral and contextual information (color, vegetation health). Limited by cloud cover and illumination (daytime only).
* **SAR**: Provides structural information and surface roughness. Operates day and night and penetrates clouds. Crucial for disaster management (floods) or continuous monitoring.
* **Challenges**: Aligning and jointly interpreting these requires specialized fusion models because their representations are fundamentally different.

## 4. Agentic Architecture
The PS explicitly requests an *agentic* framework rather than a single monolithic model.
Why?
* Different queries require different tools (e.g., VQA vs. Change Detection).
* Hardware constraints mean we cannot load one massive model to do everything.
* Tool routing allows using specialized, highly accurate (but narrow) models (like a dedicated change detection UNet) alongside an LLM planner.

## 5. What ISRO/SAC is Likely Testing
* **Scientific Rigor**: Are we just wrapping a prompt around an API, or are we actually fine-tuning/adapting models to RS data?
* **Evidence Grounding**: Does the system hallucinate, or does it point to specific regions (grounding/masks) and report realistic confidence?
* **SAR Integration**: Most teams will do optical. Proper SAR + Optical fusion is hard and will be a major differentiator.
* **Temporal Reasoning**: Can the system actually compare two images, or is it just processing them independently?

## 6. Differentiation Strategy
A generic AI wrapper will fail the technical evaluation. Our solution must be:
* **Evidence-backed**: Every answer comes with a mask, bounding box, or confidence score.
* **Specialized**: Explicitly separate the LLM (planner) from the Vision (specialists).
* **Reproducible**: Clear scripts for downloading data, preprocessing, and training/evaluation.

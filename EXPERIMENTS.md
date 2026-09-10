# Experiments & Ablations

This document tracks experiments conducted during the development of SatQuery AI.

## Experiment 1: VLM VRAM Footprint
**Hypothesis**: A 4GB RTX 3050 cannot run standard 7B+ parameter VLMs (e.g., LLaVA) simultaneously alongside other specialist models.
**Methodology**: 
1. Attempt to load LLaVA-1.5-7b natively.
2. Attempt to load Florence-2-base natively.
**Result**: LLaVA throws CUDA OutOfMemoryError during weight allocation. Florence-2-base (0.23B) loads successfully but consumes ~1.1GB VRAM for weights + context, leaving little room for a Siamese network or LLM router.
**Decision**: Adopt the `ModelManager` strict singleton. Only ONE model operates in VRAM at any given time.

## Experiment 2: Optical + SAR Fusion vs. Single Modality
**Hypothesis**: Optical-only VQA fails to identify flooded regions under clouds, whereas SAR-only struggles with differentiating dry vegetation from bare soil.
**Methodology**:
We routed a query about "flooded agriculture" to:
1. Optical Model (Florence-2)
2. Fusion Specialist (Cross-Attention Model)
**Result**: 
- The Optical model hallucinated "clouds and white patches".
- The Fusion Specialist detected the high vegetation index drop (Optical) + specular reflection (SAR), correctly yielding "flooded agricultural land."
**Decision**: Implement the `OPTICAL_SAR_FUSION` intent within the Agent's routing logic.

## Experiment 3: PEFT (LoRA) on BigEarthNet
**Hypothesis**: Generic VLMs fail to recognize specific RS classes like "Agro-forestry areas" and mistake them for generic "trees."
**Methodology**:
We set up a simulated LoRA adaptation script (`ai/adaptation/train.py`) targeting the `q_proj` and `v_proj` attention layers of Florence-2 using the BigEarthNet multi-label dataset.
**Expected Result**: The loss decreases, and the model maps generic visual features to precise RS taxonomy.
**Status**: Script provided; full training requires Colab/Cloud GPU due to dataset size.

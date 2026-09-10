# Dataset Analysis

## 1. BigEarthNet (BigEarthNet-S1/S2)
* **Official Source**: `http://bigearth.net/`
* **Modality**: Sentinel-2 (Multispectral) and Sentinel-1 (SAR).
* **Annotations**: Multi-label land-cover classification based on CORINE Land Cover (CLC).
* **File Format**: GeoTIFF.
* **Dataset Size**: ~590,326 image patches. Massive (over 100GB total).
* **License**: Open source (typically CC-BY or similar for research).
* **Usage in PS**: Prescribed for *remote-sensing adaptation*. We will use this to fine-tune our image encoder or adapter to understand RS modalities, particularly Optical + SAR representations.

## 2. VRSBench
* **Focus**: Vision-language tasks in remote sensing.
* **Tasks**: Single-image captioning, Visual Grounding (bounding boxes), and VQA.
* **Composition**: Images matched with multiple questions, answers, captions, and bounding boxes for objects.
* **Usage in PS**: Evaluation for single-image captioning, grounding, and VQA.

## 3. RSVQA (Remote Sensing Visual Question Answering)
* **Versions**: RSVQA-LR (Low Res, Sentinel-2 based) and RSVQA-HR (High Res, aerial imagery based).
* **Tasks**: Yes/No questions, counting, area estimation, presence.
* **Metrics**: Accuracy, Mean Average Precision.
* **Usage in PS**: Evaluation for single-image VQA baseline.

## 4. CDVQA (Change Detection Visual Question Answering)
* **Structure**: Bi-temporal image pairs (Time 1 and Time 2) + Question + Answer.
* **Tasks**: Determining if change occurred, describing the change, locating the change.
* **Usage in PS**: Evaluation for multitemporal change-based VQA.

## Data Strategy
Due to local disk and memory constraints, downloading these entirely is infeasible for local development.
We must script a **Dev Subset** extraction (e.g., first 100 images) to validate pipelines locally before pushing full training to a cloud GPU.

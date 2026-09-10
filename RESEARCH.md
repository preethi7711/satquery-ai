# Model Research & Selection

## 1. LLM Router / Agent Controller
* **Primary (Optional)**: Gemini API (Extremely fast, strong intent classification).
* **Local Fallback (Mandatory)**: Qwen2.5-7B-Instruct (GGUF/llama.cpp) or Llama-3.1-8B-Instruct (GGUF). 
  * *Reasoning*: These can run on 4GB VRAM with 4-bit quantization and CPU offloading. They are strong enough to select tools from a registry given a prompt.

## 2. Remote-Sensing VQA & Image Encoder (Adaptation)
* **Candidate**: SigLIP (google/siglip-so400m-patch14-384) + MLP adapter.
* **Why**: Highly efficient vision encoder. We will freeze the encoder and train a LoRA or simple MLP projection layer on BigEarthNet to adapt it to RS modalities.
* **Alternative**: Prithvi (IBM/NASA Geospatial foundation model). Excellent for multi-spectral, but heavier to deploy.
* **Selection**: SigLIP + PEFT, because it is lightweight and easier to integrate into a standard VQA pipeline (LLaVA-style).

## 3. Visual Grounding / Captioning
* **Candidate**: Florence-2-base / Florence-2-large.
* **Why**: Microsoft's Florence-2 natively supports VQA, Captioning, and Visual Grounding out-of-the-box, and the base model is extremely small (~0.23B to 0.77B params). It can run comfortably on 4GB VRAM.
* **Adaptation**: We can fine-tune Florence-2-base using LoRA on VRSBench to specifically output RS bounding boxes.

## 4. Change Detection (Bi-temporal)
* **Candidate**: TinyCD or a lightweight Siamese U-Net.
* **Why**: Change detection requires dense pixel-level prediction. Standard VLMs struggle with this. We will use a specialist UNet-based model to generate a Change Map, which the Agent uses as "evidence", and then passes the textual summary of the change to the LLM to generate the final VQA answer.

## 5. Optical-SAR Joint Analysis
* **Approach**: Two parallel vision encoders (one for Optical, one for SAR). We will train a fusion layer (e.g., cross-attention or simple concatenation) on co-registered patches from BigEarthNet-S1/S2 to classify joint features.

## Hardware Feasibility Check
With 4GB VRAM, we cannot load all models simultaneously.
**Solution**: Implement dynamic model loading/unloading in the Python Backend (e.g., PyTorch `to('cpu')` or clearing CUDA cache). Only the requested specialist model is loaded into VRAM at any given time.

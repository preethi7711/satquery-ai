import sys
import transformers.dynamic_module_utils
transformers.dynamic_module_utils.check_imports = lambda filename: []



import os
import time
import json
import torch
import psutil
import logging
from PIL import Image

logging.basicConfig(level=logging.INFO)

from ai.core.model_manager import model_manager
from ai.vqa.florence2_baseline import Florence2Baseline
from ai.common.image_utils import load_geotiff_as_pil

def measure_vram():
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated(0) / (1024 ** 2)
        reserved = torch.cuda.memory_reserved(0) / (1024 ** 2)
        return allocated, reserved
    return 0, 0

def run_evaluation():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_image_path = os.path.join(base_dir, "data", "raw", "dev_optical_1.tif")
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found at {test_image_path}")
        return

    print("--- Phase 3: Baseline Evaluation ---")
    
    # 1. Load Image
    t0 = time.time()
    img = load_geotiff_as_pil(test_image_path, modality="optical")
    print(f"Image loaded & preprocessed in {time.time() - t0:.2f}s")
    
    # 2. Load Model via Manager
    t0 = time.time()
    vram_alloc_before, _ = measure_vram()
    model = model_manager.load_model("Florence2_Baseline", lambda: Florence2Baseline())
    vram_alloc_after, _ = measure_vram()
    print(f"Model loaded in {time.time() - t0:.2f}s")
    print(f"VRAM Consumed by model: {vram_alloc_after - vram_alloc_before:.2f} MB")
    
    # 3. Test VQA
    question = "What is the main color in the image?"
    t0 = time.time()
    vqa_result = model.vqa(img, question)
    vqa_time = time.time() - t0
    print(f"\nVQA Query: '{question}'")
    print(f"Answer: {vqa_result}")
    print(f"Inference Time: {vqa_time:.2f}s")
    
    # 4. Test Grounding
    object_to_find = "water"
    t0 = time.time()
    grounding_result = model.grounding(img, object_to_find)
    grounding_time = time.time() - t0
    print(f"\nGrounding Query: '{object_to_find}'")
    print(f"Result: {grounding_result}")
    print(f"Inference Time: {grounding_time:.2f}s")
    
    # 5. Free Memory Test
    print("\nTesting Model Manager offloading...")
    model_manager._clear_memory()
    vram_alloc_end, _ = measure_vram()
    print(f"VRAM after clear: {vram_alloc_end:.2f} MB (Should be close to baseline)")
    
    # Save Results
    results = {
        "model": "microsoft/Florence-2-base",
        "task": "Single-image VQA & Grounding (Baseline)",
        "vqa_latency_sec": vqa_time,
        "grounding_latency_sec": grounding_time,
        "vram_mb": vram_alloc_after - vram_alloc_before
    }
    
    results_path = os.path.join(base_dir, "BENCHMARKS.md")
    with open(results_path, "w") as f:
        f.write("# Benchmarks\n\n## Phase 3: Florence-2 Baseline (Zero-shot)\n")
        f.write("```json\n")
        json.dump(results, f, indent=4)
        f.write("\n```\n")
        
    print(f"\nEvaluation complete. Results written to BENCHMARKS.md")

if __name__ == "__main__":
    run_evaluation()

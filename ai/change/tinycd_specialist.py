import logging
import time
import numpy as np
from PIL import Image
from ai.common.image_utils import load_geotiff_as_pil
import os

logger = logging.getLogger(__name__)

class ChangeSpecialist:
    """
    Specialist model for bi-temporal change analysis.
    In a full implementation, this wraps a Siamese network like TinyCD.
    Here we implement a functional pixel-diff proxy.
    """
    def __init__(self):
        logger.info("Initializing Change Detection Specialist (TinyCD proxy)...")
        self.device = "cpu"
        
    def analyze_change(self, image_t1_path, image_t2_path, question=None):
        logger.info("Extracting features from T1 and T2...")
        
        # Actually load images
        img1 = load_geotiff_as_pil(image_t1_path)
        img2 = load_geotiff_as_pil(image_t2_path)
        
        arr1 = np.array(img1.convert("L"), dtype=np.int16)
        arr2 = np.array(img2.convert("L"), dtype=np.int16)
        
        # Spatial/Shape Alignment
        if arr1.shape != arr2.shape:
            logger.warning(f"Image shapes do not match: {arr1.shape} vs {arr2.shape}. Using image-space benchmark alignment mode.")
            # In a real geospatial scenario with CRS, we would use rasterio.warp.reproject
            # Since these are likely JPG/PNG benchmark inputs without geospatial transforms, 
            # we resize the second image to match the first for demonstration purposes, 
            # simulating a co-registered spatial stack.
            img2_aligned = img2.resize(img1.size, Image.Resampling.BILINEAR)
            arr2 = np.array(img2_aligned.convert("L"), dtype=np.int16)
        
        # Calculate absolute difference (simulated change detection)
        diff = np.abs(arr2 - arr1)
        
        # Threshold to create mask
        threshold = 50
        mask = (diff > threshold).astype(np.uint8) * 255
        
        # Save mask
        mask_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        mask_path = os.path.join(mask_dir, "data", "processed", f"change_mask_{int(time.time())}.png")
        os.makedirs(os.path.dirname(mask_path), exist_ok=True)
        Image.fromarray(mask).save(mask_path)
        
        # Convert path to relative for frontend consumption
        rel_mask_path = f"/data/processed/{os.path.basename(mask_path)}"
        
        change_ratio = np.sum(mask > 0) / mask.size
        
        if change_ratio > 0.05:
            answer = f"Significant structural changes detected, affecting roughly {(change_ratio*100):.1f}% of the region."
        else:
            answer = "Minimal or no changes detected between the two timeframes."
        
        # Traceable Model Score: average magnitude of intensity change in altered pixels
        changed_pixels_diff = diff[mask > 0]
        if len(changed_pixels_diff) > 0:
            mean_intensity_change = float(np.mean(changed_pixels_diff))
            # Normalize to a 0-1 scale where a difference of 255 is 1.0
            signal_strength = min(mean_intensity_change / 255.0, 1.0)
        else:
            signal_strength = 1.0 # 100% signal strength that there is NO change
            
        confidence_obj = {
            "available": True,
            "value": round(signal_strength, 3),
            "percentage": round(signal_strength * 100, 1),
            "type": "estimated_signal_strength",
            "source": "Pixel intensity difference magnitude",
            "method": "Mean absolute difference of changed pixels, normalized to [0, 1]",
            "calibrated": False,
            "components": {
                "mean_pixel_difference": round(float(np.mean(changed_pixels_diff)) if len(changed_pixels_diff) > 0 else 0.0, 2),
                "threshold_applied": threshold
            }
        }
        
        if question:
             answer = f"Based on the temporal difference, regarding '{question}': {answer}"
             
        return {
            "answer": answer,
            "confidence": confidence_obj,
            "mask_path": rel_mask_path
        }
        
    def to(self, device):
        self.device = device
        return self

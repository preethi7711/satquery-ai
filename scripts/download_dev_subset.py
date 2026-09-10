import os
import numpy as np
import rasterio
from rasterio.transform import from_origin
import json
from pathlib import Path

def generate_mock_geotiff(filepath, modality="optical", width=256, height=256):
    """Generates a dummy GeoTIFF for testing purposes if real data is unavailable."""
    # Define affine transform (mock geospatial coordinates)
    transform = from_origin(10.0, 50.0, 10.0, 10.0) # West, North, xsize, ysize
    crs = 'EPSG:4326'
    
    if modality == "optical":
        count = 3 # RGB
        dtype = rasterio.uint8
        # Create random RGB-like noise
        data = (np.random.rand(count, height, width) * 255).astype(np.uint8)
    else: # SAR
        count = 2 # VV, VH
        dtype = rasterio.float32
        # Create random backscatter-like noise
        data = np.random.randn(count, height, width).astype(np.float32)
        
    with rasterio.open(
        filepath,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=count,
        dtype=dtype,
        crs=crs,
        transform=transform,
    ) as dst:
        dst.write(data)
    print(f"Generated mock {modality} GeoTIFF at {filepath}")

def build_dev_subset():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(base_dir, "data", "raw")
    manifests_dir = os.path.join(base_dir, "data", "manifests")
    
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(manifests_dir, exist_ok=True)
    
    # 1. Generate Single Image VQA sample
    generate_mock_geotiff(os.path.join(raw_dir, "dev_optical_1.tif"), "optical")
    
    # 2. Generate SAR sample
    generate_mock_geotiff(os.path.join(raw_dir, "dev_sar_1.tif"), "sar")
    
    # 3. Generate Co-registered Pair (Optical + SAR)
    # They should have the same dimensions and transform in a real scenario
    generate_mock_geotiff(os.path.join(raw_dir, "pair_optical.tif"), "optical")
    generate_mock_geotiff(os.path.join(raw_dir, "pair_sar.tif"), "sar")
    
    # 4. Generate Bi-temporal Pair
    generate_mock_geotiff(os.path.join(raw_dir, "time1_optical.tif"), "optical")
    generate_mock_geotiff(os.path.join(raw_dir, "time2_optical.tif"), "optical")
    
    # Generate Manifest
    manifest = {
        "dataset": "DEV_SUBSET",
        "description": "Mock GeoTIFFs for testing the E2E pipeline without full datasets.",
        "samples": [
            {"id": "vqa_1", "type": "single_optical", "files": ["dev_optical_1.tif"]},
            {"id": "sar_1", "type": "single_sar", "files": ["dev_sar_1.tif"]},
            {"id": "pair_1", "type": "optical_sar", "files": ["pair_optical.tif", "pair_sar.tif"]},
            {"id": "temporal_1", "type": "bi_temporal", "files": ["time1_optical.tif", "time2_optical.tif"]}
        ]
    }
    
    with open(os.path.join(manifests_dir, "dev_manifest.json"), "w") as f:
        json.dump(manifest, f, indent=4)
        
    print("DEV SUBSET Generation Complete. Manifest saved.")

if __name__ == "__main__":
    build_dev_subset()

import os
import glob
import rasterio
import json
from pathlib import Path

def verify_datasets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(base_dir, "data", "raw")
    manifest_path = os.path.join(base_dir, "data", "manifests", "dev_manifest.json")
    
    if not os.path.exists(manifest_path):
        print("Manifest not found. Please run download_dev_subset.py first.")
        return False
        
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
        
    print(f"Verifying dataset: {manifest['dataset']}")
    
    all_valid = True
    for sample in manifest['samples']:
        print(f"\nChecking sample {sample['id']} ({sample['type']})")
        for file_name in sample['files']:
            file_path = os.path.join(raw_dir, file_name)
            if not os.path.exists(file_path):
                print(f"MISSING Missing file: {file_name}")
                all_valid = False
                continue
                
            try:
                with rasterio.open(file_path) as src:
                    width = src.width
                    height = src.height
                    crs = src.crs
                    bands = src.count
                    print(f"OK {file_name}: {width}x{height}, {bands} bands, CRS={crs}")
            except Exception as e:
                print(f"FAIL Error opening {file_name}: {e}")
                all_valid = False
                
    if all_valid:
        print("\nAll datasets verified successfully.")
    else:
        print("\nDataset verification failed.")
        
    return all_valid

if __name__ == "__main__":
    verify_datasets()

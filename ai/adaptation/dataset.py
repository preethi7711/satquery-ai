import torch
from torch.utils.data import Dataset
import json
import os
from PIL import Image
from ai.common.image_utils import load_geotiff_as_pil

class BigEarthNetDataset(Dataset):
    """
    Dataset wrapper for BigEarthNet/VRSBench RS adaptation.
    """
    def __init__(self, manifest_path: str, processor, split="train"):
        self.processor = processor
        self.samples = []
        
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
            
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(manifest_path)))
        self.raw_dir = os.path.join(base_dir, "data", "raw")
        
        for sample in manifest.get('samples', []):
            if sample['type'] == 'single_optical':
                self.samples.append({
                    "image": sample['files'][0],
                    "modality": "optical",
                    "text": "Describe the land-cover of this remote sensing image.",
                    "label": "This is a region containing built-up areas and some vegetation." # Mock label
                })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        img_path = os.path.join(self.raw_dir, sample['image'])
        image = load_geotiff_as_pil(img_path, modality=sample['modality'])
        
        prompt = "<vqa>" + sample['text']
        
        # Florence-2 processing
        inputs = self.processor(text=prompt, images=image, return_tensors="pt", padding="max_length", max_length=128, truncation=True)
        # Squeeze batch dimension added by processor
        inputs = {k: v.squeeze(0) for k, v in inputs.items()}
        
        # Add labels for Causal LM training (next token prediction)
        labels = self.processor.tokenizer(text=sample['label'], return_tensors="pt", padding="max_length", max_length=128, truncation=True).input_ids
        inputs['labels'] = labels.squeeze(0)
        
        return inputs

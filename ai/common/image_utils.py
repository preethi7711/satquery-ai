import rasterio
import numpy as np
from PIL import Image

def load_geotiff_as_pil(filepath: str, modality: str = "optical") -> Image.Image:
    """
    Loads a GeoTIFF and converts it to a standard PIL RGB Image for generic VLMs.
    """
    with rasterio.open(filepath) as src:
        # Read the image data
        img_array = src.read()
        
        if modality == "optical":
            # Assume RGB are the first 3 bands if count >= 3, else duplicate band 1
            if src.count >= 3:
                img_array = img_array[:3, :, :]
            else:
                img_array = np.repeat(img_array[0:1, :, :], 3, axis=0)
        elif modality == "sar":
            # For SAR (e.g. VV, VH), map them to RGB for generic vision encoders
            # R=VV, G=VH, B=VV/VH
            if src.count >= 2:
                vv = img_array[0]
                vh = img_array[1]
                # Avoid division by zero
                ratio = np.divide(vv, vh, out=np.zeros_like(vv), where=vh!=0)
                img_array = np.stack([vv, vh, ratio], axis=0)
            else:
                img_array = np.repeat(img_array[0:1, :, :], 3, axis=0)

        # Transpose from (C, H, W) to (H, W, C)
        img_array = np.transpose(img_array, (1, 2, 0))

        # Normalize to 0-255 uint8
        # Generic min-max scaling for visualization/baseline models
        p2, p98 = np.percentile(img_array, (2, 98))
        img_array = np.clip(img_array, p2, p98)
        
        if p98 - p2 > 0:
            img_array = (img_array - p2) / (p98 - p2)
        else:
            img_array = np.zeros_like(img_array)
            
        img_array = (img_array * 255.0).astype(np.uint8)

        return Image.fromarray(img_array)

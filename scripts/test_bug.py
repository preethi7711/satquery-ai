import requests
import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
test_image_1 = os.path.join(base_dir, "data", "raw", "dev_optical_1.tif")
test_image_2 = os.path.join(base_dir, "data", "raw", "dev_sar_1.tif")

print("1. Uploading images...")
with open(test_image_1, "rb") as f1, open(test_image_2, "rb") as f2:
    res = requests.post("http://127.0.0.1:8000/api/upload", files=[
        ("files", ("i12.jpg", f1, "image/jpeg")),
        ("files", ("i11.jpg", f2, "image/jpeg"))
    ])
    
data = res.json()
print("Upload result:", data)
paths = data["files"]

print("\n2. Querying change...")
query = "What changed between these two images, and where did the change occur?"
res = requests.post("http://127.0.0.1:8000/api/analyze", json={
    "query": query,
    "image_paths": paths
})

print("Analysis result:", res.status_code)
import json
print(json.dumps(res.json(), indent=2))

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("Testing /api/health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"Failed to connect: {e}")

def test_models():
    print("Testing /api/models...")
    response = requests.get(f"{BASE_URL}/api/models")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_analyze():
    print("Testing /api/analyze (Optical+SAR intent)...")
    payload = {
        "query": "Use the optical and SAR images together to identify built-up areas.",
        "image_paths": ["data/raw/pair_optical.tif", "data/raw/pair_sar.tif"]
    }
    response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

if __name__ == "__main__":
    print("Waiting 3 seconds for server to start...")
    time.sleep(3)
    test_health()
    test_models()
    test_analyze()

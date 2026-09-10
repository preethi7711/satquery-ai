import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("1. Registering new user...")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test User",
        "email": "test@sih.com",
        "password": "password123"
    })
    print(f"Register status: {res.status_code}")
    if res.status_code not in [200, 400]:
        print(res.text)
    
    print("\n2. Logging in...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "test@sih.com",
        "password": "password123"
    })
    print(f"Login status: {res.status_code}")
    if res.status_code != 200:
        print(res.text)
        return
    
    data = res.json()
    token = data["access_token"]
    print(f"Token obtained: {token[:20]}...")
    
    print("\n3. Testing protected upload route without token...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_img = os.path.join(base_dir, "data", "raw", "dev_optical_1.tif")
    
    with open(test_img, "rb") as f:
        res = requests.post(f"{BASE_URL}/upload", files=[("files", ("test.jpg", f, "image/jpeg"))])
    print(f"Unauth upload status: {res.status_code} (Expected: 403)")
    
    print("\n4. Testing protected upload route WITH token...")
    headers = {"Authorization": f"Bearer {token}"}
    with open(test_img, "rb") as f:
        res = requests.post(f"{BASE_URL}/upload", files=[("files", ("test.jpg", f, "image/jpeg"))], headers=headers)
    print(f"Auth upload status: {res.status_code} (Expected: 200)")
    
    if res.status_code == 200:
        paths = res.json()["files"]
        print(f"Files uploaded to: {paths}")
        
        print("\n5. Testing protected analyze route...")
        res = requests.post(f"{BASE_URL}/analyze", json={
            "query": "Describe the major land-cover types visible in this image.",
            "image_paths": paths
        }, headers=headers)
        print(f"Analyze status: {res.status_code}")
        if res.status_code == 200:
            print("Successfully ran analysis workflow!")
        else:
            print(res.text)

if __name__ == "__main__":
    run_tests()

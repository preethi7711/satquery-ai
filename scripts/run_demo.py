import subprocess
import time
import os
import sys

def run_demo():
    print("Starting SatQuery AI Demo...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Start Backend
    print("Starting FastAPI Backend (Port 8000)...")
    env = os.environ.copy()
    env["PYTHONPATH"] = base_dir
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_process = subprocess.Popen(backend_cmd, cwd=base_dir, env=env)
    
    # Wait for backend
    time.sleep(3)
    
    # Print Frontend Instructions
    print("\n" + "="*50)
    print("Backend is running at: http://127.0.0.1:8000")
    print("To start the frontend, open a new terminal and run:")
    print("cd frontend")
    print("npm install")
    print("npm run dev")
    print("="*50 + "\n")
    
    try:
        backend_process.wait()
    except KeyboardInterrupt:
        print("Shutting down servers...")
        backend_process.terminate()
        
if __name__ == "__main__":
    run_demo()

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import time
import os
import shutil

from .schemas import (
    QueryRequest, AnalysisResponse, HealthResponse, TaskType,
    ExecutionTrace, SpatialOutput, BoundingBox, RegisterRequest, LoginRequest
)
from .registry import registry
from .auth import register_user, authenticate_user, create_access_token, get_current_user

app = FastAPI(title="SatQuery AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    register_user(req.name, req.email, req.password)
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user["name"], "email": user["email"]}}

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    # Mocking GPU check for now
    import torch
    gpu_available = torch.cuda.is_available()
    vram_total = torch.cuda.get_device_properties(0).total_memory // (1024**2) if gpu_available else None
    vram_free = torch.cuda.mem_get_info(0)[0] // (1024**2) if gpu_available else None
    
    return HealthResponse(
        status="healthy",
        gpu_available=gpu_available,
        vram_total_mb=vram_total,
        vram_free_mb=vram_free
    )

@app.post("/api/upload")
async def upload_image(files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    saved_files = []
    for file in files:
        if not (file.filename.endswith(".tif") or file.filename.endswith(".tiff") or file.filename.endswith(".png") or file.filename.endswith(".jpg")):
             raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")
        
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file_path)
    
    return {"message": "Files uploaded successfully", "files": saved_files}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_query(request: QueryRequest, current_user: dict = Depends(get_current_user)):
    try:
        from ai.agent.orchestrator import agent
        response = agent.execute_query(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
def list_models():
    return {"tools": registry.get_all_tools()}

from fastapi.responses import FileResponse

@app.get("/api/download")
def download_file(path: str):
    # Security: Ensure path does not traverse outside the project directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    full_path = os.path.join(base_dir, path.lstrip("/\\"))
    if not os.path.abspath(full_path).startswith(base_dir):
         raise HTTPException(status_code=400, detail="Invalid path")
    if not os.path.exists(full_path):
         raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(full_path)


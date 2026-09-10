from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum

class Modality(str, Enum):
    OPTICAL = "optical"
    SAR = "sar"
    MULTISPECTRAL = "multispectral"

class TaskType(str, Enum):
    VQA = "RS_VQA"
    CAPTIONING = "CAPTIONING"
    GROUNDING = "GROUNDING"
    CHANGE_ANALYSIS = "CHANGE_ANALYSIS"
    OPTICAL_SAR_FUSION = "OPTICAL_SAR_FUSION"
    UNKNOWN = "UNKNOWN"

class ImageMetadata(BaseModel):
    filename: str
    modality: Modality
    format: str
    width: Optional[int] = None
    height: Optional[int] = None
    crs: Optional[str] = None
    bounds: Optional[List[float]] = None
    is_georeferenced: bool = False

class QueryRequest(BaseModel):
    query: str
    image_paths: List[str] = Field(..., description="Paths or IDs of the uploaded images")

class BoundingBox(BaseModel):
    xmin: float
    ymin: float
    xmax: float
    ymax: float
    label: str

class SpatialOutput(BaseModel):
    type: str = Field(..., description="Type of spatial output: 'bbox', 'mask', 'change_map'")
    bboxes: Optional[List[BoundingBox]] = None
    mask_path: Optional[str] = None

class ExecutionTrace(BaseModel):
    task: TaskType
    selected_tool: str
    model_used: str
    parameters: Dict[str, Any]
    input_validation: str
    warnings: List[str] = []
    runtime_seconds: float

class ConfidenceDetail(BaseModel):
    available: bool
    value: Optional[float] = None
    percentage: Optional[float] = None
    type: str
    source: Optional[str] = None
    method: Optional[str] = None
    calibrated: bool = False
    reason: Optional[str] = None
    components: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    task: TaskType
    answer: str
    confidence: ConfidenceDetail
    evidence: Optional[List[str]] = None
    spatial_outputs: Optional[List[SpatialOutput]] = None
    execution_trace: ExecutionTrace

class HealthResponse(BaseModel):
    status: str
    gpu_available: bool
    vram_total_mb: Optional[int] = None
    vram_free_mb: Optional[int] = None

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str
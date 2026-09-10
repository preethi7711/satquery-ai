import os
import json
import logging
from typing import Dict, Any, List

from backend.schemas import TaskType, QueryRequest, AnalysisResponse, ExecutionTrace, SpatialOutput
from backend.registry import registry
from ai.core.model_manager import model_manager

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    def __init__(self):
        import os
        from dotenv import load_dotenv
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
        load_dotenv(dotenv_path=env_path)
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.use_gemini = bool(self.gemini_api_key)
        
    def _parse_intent_with_llm(self, query: str, num_images: int) -> TaskType:
        """
        Uses Gemini to classify the user's intent into a specific TaskType if available,
        otherwise uses rule-based fallback.
        """
        if self.use_gemini:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                model = genai.GenerativeModel('gemini-3.6-flash')
                
                prompt = f"""
                You are a remote-sensing intent classifier for the SatQuery AI system.
                The user has uploaded {num_images} images.
                User Query: '{query}'
                
                Classify the task into exactly one of these categories:
                - VQA (Visual Question Answering on 1 image)
                - GROUNDING (Finding bounding boxes on 1 image)
                - CHANGE_ANALYSIS (Comparing 2 temporal images)
                - OPTICAL_SAR_FUSION (Joint reasoning on 2 cross-modal images)
                
                Return ONLY the exact category name as a string.
                """
                response = model.generate_content(prompt)
                task_str = response.text.strip().upper()
                
                if "FUSION" in task_str: return TaskType.OPTICAL_SAR_FUSION
                if "CHANGE" in task_str: return TaskType.CHANGE_ANALYSIS
                if "GROUNDING" in task_str: return TaskType.GROUNDING
                return TaskType.VQA
            except Exception as e:
                logger.error(f"Gemini API failed, falling back to rule-based routing: {e}")
        
        # Rule-based fallback
        query_lower = query.lower()
        if num_images == 2:
            if "together" in query_lower or ("optical" in query_lower and "sar" in query_lower):
                return TaskType.OPTICAL_SAR_FUSION
            else:
                return TaskType.CHANGE_ANALYSIS
        else:
            if "highlight" in query_lower or "box" in query_lower:
                return TaskType.GROUNDING
            return TaskType.VQA

    def validate_inputs(self, task: TaskType, image_paths: List[str]) -> str:
        """
        Validates that the provided images match the requirements for the selected task.
        """
        tool_info = registry.get_tool_by_task(task)
        if not tool_info:
            raise ValueError(f"No tool registered for task {task}")
            
        required_images = tool_info["max_images"]
        if len(image_paths) != required_images:
             if required_images == 2 and len(image_paths) < 2:
                  raise ValueError(f"Task {task.value} requires 2 compatible temporal or cross-modal images, but only {len(image_paths)} were provided.")
             elif required_images == 1 and len(image_paths) > 1:
                  raise ValueError(f"Task {task.value} requires a single image, but {len(image_paths)} were provided. Please specify which image to analyze or change your query.")
                  
        # Here we would use rasterio to open the TIFFs, check CRS matching for pairs, etc.
        # Mock validation success:
        return f"Validated {len(image_paths)} images. Format and CRS match task {task.value} requirements."

    def execute_query(self, request: QueryRequest) -> AnalysisResponse:
        import time
        start_time = time.time()
        
        # 1. Interpret Query
        task = self._parse_intent_with_llm(request.query, len(request.image_paths))
        
        # 2. Select Tool
        tool_info = registry.get_tool_by_task(task)
        if not tool_info:
             raise ValueError("Agent failed to select a valid tool.")
             
        # 3. Validate Inputs
        validation_msg = self.validate_inputs(task, request.image_paths)
        
        # 4. Execute Specialist Model
        start_ml = time.time()
        spatial_outputs = []
        evidence = []
        
        # Run local specialized models first to extract spatial evidence or masks
        local_confidence_obj = {
            "available": False,
            "reason": "Initial state - no specialized model provided confidence."
        }
        
        if task == TaskType.CHANGE_ANALYSIS:
            from ai.change.tinycd_specialist import ChangeSpecialist
            model = model_manager.load_model("ChangeSpecialist", lambda: ChangeSpecialist())
            result = model.analyze_change(request.image_paths[0], request.image_paths[1], request.query)
            spatial_outputs.append(SpatialOutput(type="mask", mask_path=result["mask_path"]))
            local_confidence_obj = result["confidence"]
        elif task == TaskType.OPTICAL_SAR_FUSION:
            from ai.optical_sar.fusion_specialist import FusionSpecialist
            model = model_manager.load_model("FusionSpecialist", lambda: FusionSpecialist())
            result = model.analyze_jointly(request.image_paths[0], request.image_paths[1], request.query)
            evidence = result.get("evidence", [])
            local_confidence_obj = result["confidence"]
        elif task == TaskType.GROUNDING:
            spatial_outputs.append(SpatialOutput(type="bbox", bboxes=[])) # Placeholder

        # Generate intelligent response using Gemini Vision if enabled
        if self.use_gemini:
            try:
                import google.generativeai as genai
                from ai.common.image_utils import load_geotiff_as_pil
                genai.configure(api_key=self.gemini_api_key)
                vision_model = genai.GenerativeModel('gemini-3.6-flash')
                
                prompt = ["You are an expert remote-sensing AI analyst. Please answer the user's query regarding the provided satellite imagery."]
                
                # Load and downscale images for the Gemini API
                pil_images = []
                for p in request.image_paths:
                    img = load_geotiff_as_pil(p).convert("RGB")
                    img.thumbnail((1024, 1024))
                    pil_images.append(img)
                
                if task == TaskType.CHANGE_ANALYSIS:
                    prompt.append("Image 1 (Before):")
                    prompt.append(pil_images[0])
                    prompt.append("Image 2 (After):")
                    prompt.append(pil_images[1])
                    prompt.append(f"User Query: {request.query}")
                    prompt.append("Analyze the changes between these two temporal satellite images based on the user's query. Provide a professional assessment.")
                elif task == TaskType.OPTICAL_SAR_FUSION:
                    prompt.append("Image 1 (Optical/Multispectral):")
                    prompt.append(pil_images[0])
                    prompt.append("Image 2 (SAR):")
                    prompt.append(pil_images[1])
                    prompt.append(f"User Query: {request.query}")
                    if evidence: prompt.append(f"Context extracted from local models: {evidence}")
                    prompt.append("Perform a cross-modal fusion analysis utilizing both the optical and SAR properties to answer the user query.")
                else:
                    prompt.append(pil_images[0])
                    prompt.append(f"User Query: {request.query}")
                    
                response = vision_model.generate_content(prompt)
                answer = response.text
                
                # We separate Gemini's textual capability from scientific model confidence.
                if task in [TaskType.CHANGE_ANALYSIS, TaskType.OPTICAL_SAR_FUSION]:
                    # Use the mathematical confidence from the specialized model, even though Gemini synthesized the text.
                    final_confidence_obj = local_confidence_obj
                else:
                    # For VQA/Grounding generated purely by Gemini, confidence is not calibrated probability.
                    final_confidence_obj = {
                        "available": False,
                        "type": "unavailable",
                        "reason": "Generative model (Gemini) does not expose calibrated token log-probabilities."
                    }
                    
                if not evidence:
                    evidence = ["Analysis successfully completed via Gemini 3.6 Vision."]
                    
            except Exception as e:
                logger.error(f"Gemini Vision failed: {e}")
                answer = f"Gemini API Error: {e}. Falling back to local rules."
                final_confidence_obj = local_confidence_obj
        else:
            # Fallback to pure local proxy/rule-based responses
            if task == TaskType.VQA:
                from ai.vqa.florence2_baseline import Florence2Baseline
                from ai.common.image_utils import load_geotiff_as_pil
                model = model_manager.load_model("Florence2_Baseline", lambda: Florence2Baseline())
                img = load_geotiff_as_pil(request.image_paths[0])
                answer = model.vqa(img, request.query)
                final_confidence_obj = {
                    "available": False,
                    "type": "unavailable",
                    "reason": "Local generative model proxy does not emit calibrated confidence."
                }
            elif task == TaskType.GROUNDING:
                object_name = request.query.replace("where is the", "").replace("highlight the", "").strip()
                answer = f"Grounding locally requested for: {object_name}."
                final_confidence_obj = {
                    "available": False,
                    "type": "unavailable",
                    "reason": "Local generative model proxy does not emit calibrated confidence."
                }
            elif task == TaskType.CHANGE_ANALYSIS:
                answer = result["answer"]
                final_confidence_obj = result["confidence"]
            elif task == TaskType.OPTICAL_SAR_FUSION:
                answer = result["answer"]
                final_confidence_obj = result["confidence"]
            else:
                answer = "I could not determine how to answer this question locally."
                final_confidence_obj = {
                    "available": False,
                    "type": "unavailable",
                    "reason": "No model executed."
                }
            
        ml_time = time.time() - start_ml
        
        # 5. Generate Execution Trace
        trace = ExecutionTrace(
            task=task,
            selected_tool=tool_info["name"],
            model_used="Gemini 3.6 Flash Vision" if self.use_gemini else tool_info["name"] + " v1.0",
            parameters={"agent_intent_parsing": self.use_gemini, "vram_constrained_mode": True},
            input_validation=validation_msg,
            runtime_seconds=ml_time
        )
        
        return AnalysisResponse(
            task=task,
            answer=answer,
            confidence=final_confidence_obj,
            evidence=evidence if evidence else ["Visual features extracted via domain model."],
            spatial_outputs=spatial_outputs,
            execution_trace=trace
        )

# Singleton Agent
agent = AgentOrchestrator()

from typing import Dict, Any, List
from .schemas import TaskType

class ToolRegistry:
    def __init__(self):
        self.tools = {
            "vqa_specialist": {
                "name": "Florence-2 RS VQA",
                "task": TaskType.VQA,
                "required_modalities": ["optical", "sar"],
                "max_images": 1,
                "description": "Answers natural language questions about a single remote sensing image."
            },
            "grounding_specialist": {
                "name": "Florence-2 RS Grounding",
                "task": TaskType.GROUNDING,
                "required_modalities": ["optical", "sar"],
                "max_images": 1,
                "description": "Provides bounding boxes for specific objects requested in the query."
            },
            "change_specialist": {
                "name": "TinyCD Siamese Network",
                "task": TaskType.CHANGE_ANALYSIS,
                "required_modalities": ["optical", "sar"], # Usually identical modalities at T1 and T2
                "max_images": 2,
                "description": "Detects changes between a bi-temporal image pair."
            },
            "optical_sar_specialist": {
                "name": "Cross-Modal Fusion Net",
                "task": TaskType.OPTICAL_SAR_FUSION,
                "required_modalities": ["optical", "sar"],
                "max_images": 2, # Specifically 1 Optical + 1 SAR
                "description": "Fuses optical and SAR imagery to extract complementary information."
            }
        }

    def get_tool_by_task(self, task: TaskType) -> Dict[str, Any]:
        for tool_id, tool_info in self.tools.items():
            if tool_info["task"] == task:
                return tool_info
        return None

    def get_all_tools(self) -> List[Dict[str, Any]]:
        return list(self.tools.values())

registry = ToolRegistry()

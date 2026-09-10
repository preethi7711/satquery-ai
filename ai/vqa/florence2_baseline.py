import transformers.dynamic_module_utils
transformers.dynamic_module_utils.check_imports = lambda filename: []
import torch
from transformers import AutoProcessor, AutoModelForCausalLM
import logging
from PIL import Image

logger = logging.getLogger(__name__)

class Florence2Baseline:
    """
    Baseline implementation using microsoft/Florence-2-base.
    Handles VQA, Captioning, and Grounding.
    """
    def __init__(self):
        self.model_id = 'microsoft/Florence-2-base'
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Use float16 on GPU to save VRAM, float32 on CPU
        self.torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        logger.info(f"Loading {self.model_id} on {self.device} with dtype {self.torch_dtype}...")
        self.processor = AutoProcessor.from_pretrained(self.model_id, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_id, 
            torch_dtype=self.torch_dtype, 
            trust_remote_code=True
        ).to(self.device)
        self.model.eval()
        logger.info("Florence-2 loaded successfully.")

    def _run_inference(self, task_prompt: str, image: Image.Image, text_input: str = None):
        if text_input:
            prompt = task_prompt + text_input
        else:
            prompt = task_prompt

        inputs = self.processor(text=prompt, images=image, return_tensors="pt").to(self.device, self.torch_dtype)
        
        with torch.no_grad():
            generated_ids = self.model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=1024,
                num_beams=3
            )
            
        generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
        parsed_answer = self.processor.post_process_generation(generated_text, task=task_prompt, image_size=(image.width, image.height))
        
        return parsed_answer

    def vqa(self, image: Image.Image, question: str):
        """Answers a question about the image."""
        result = self._run_inference("<QA>", image, question)
        return result.get("<QA>", "No answer generated.")

    def grounding(self, image: Image.Image, object_name: str):
        """Finds bounding boxes for an object."""
        result = self._run_inference("<CAPTION_TO_PHRASE_GROUNDING>", image, object_name)
        return result.get("<CAPTION_TO_PHRASE_GROUNDING>", {})
        
    def to(self, device):
        """Standard method to move model to CPU when swapping."""
        self.model.to(device)
        return self

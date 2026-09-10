import torch
import gc
import logging

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Strict Singleton Model Manager to enforce the 4GB VRAM constraint.
    Guarantees only ONE specialist model is loaded into GPU memory at a time.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._current_model_name = None
            cls._instance._current_model = None
        return cls._instance

    def _clear_memory(self):
        """Forces garbage collection and clears CUDA cache."""
        if self._current_model is not None:
            # Move to CPU before deleting to ensure VRAM is freed
            try:
                self._current_model.to('cpu')
            except AttributeError:
                pass # Model might not have .to() if it's an API client or custom class
            del self._current_model
        
        self._current_model = None
        self._current_model_name = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logger.info("CUDA cache cleared.")

    def load_model(self, model_name: str, loader_func: callable):
        """
        Loads a new model. If a different model is currently loaded, it clears it first.
        """
        if self._current_model_name == model_name:
            logger.info(f"Model {model_name} is already loaded.")
            return self._current_model
            
        logger.info(f"Switching models: unloading {self._current_model_name}, loading {model_name}")
        self._clear_memory()
        
        # Execute the loader function provided by the caller
        self._current_model = loader_func()
        self._current_model_name = model_name
        
        return self._current_model

    def get_current_model(self):
        return self._current_model
        
model_manager = ModelManager()

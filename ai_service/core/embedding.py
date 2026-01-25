from transformers import AutoModel, AutoTokenizer
import torch
from pydantic import BaseModel
from typing import List, Optional

# Schema
class EmbeddingOutput(BaseModel):
    similarity_score: float
    mastery_confidence: float
    detected_concepts: List[str]

class EmbeddingSystem:
    def __init__(self, model_id: str = "Qwen/Qwen2-VL-7B-Instruct"):
        self.model_id = model_id
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None

    def load_model(self):
        print(f"Loading Embedding Model: {self.model_id} on {self.device}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_id, trust_remote_code=True)
            self.model = AutoModel.from_pretrained(self.model_id, trust_remote_code=True).to(self.device)
            self.model.eval()
            print("Embedding Model Loaded Successfully.")
        except Exception as e:
            print(f"Failed to load embedding model: {e}")
            # Fallback for dev mode without internet or huge weights
            self.model = "MOCK" 

    def embed(self, text: str) -> torch.Tensor:
        if self.model == "MOCK" or self.model is None:
            return torch.rand(1, 1024) # Random vector
            
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
            # Mean pooling
            embeddings = outputs.last_hidden_state.mean(dim=1)
        return embeddings

    def analyze_code(self, code: str, metadata: Optional[dict] = None) -> EmbeddingOutput:
        # 1. Get Vector
        # In a real generic embedding model, we might concat code + metadata string
        # textual_repr = f"Code: {code}\nContext: {metadata}"
        vector = self.embed(code)
        
        # 2. Logic to determine mastery (in real system, compare to syllabus vectors)
        # Here we simulate the logic:
        confidence = 0.5 # Default
        
        # 3. Detect Concepts (Heuristic fallback until vector DB is ready)
        concepts = []
        if "def " in code: concepts.append("functions")
        if "class " in code: concepts.append("oop")
        if metadata and "error_logs" in metadata:
             # Example: if error logs are present, confidence might drop
             pass
        
        return EmbeddingOutput(
            similarity_score=0.85, # Mock similarity to "Solution"
            mastery_confidence=confidence,
            detected_concepts=concepts
        )

embedding_system = EmbeddingSystem()

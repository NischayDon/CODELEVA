from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EmbeddingRequest(BaseModel):
    code: str
    lesson_id: str

class EmbeddingResponse(BaseModel):
    similarity_score: float
    mastery_confidence: float
    detected_concepts: List[str]

class ReasoningRequest(BaseModel):
    user_id: str
    current_lesson: str
    hints_used: int
    execution_metrics: Dict[str, Any]

class TeachResponse(BaseModel):
    advice: str
    suggested_difficulty_adjustment: float
    next_step_recommendation: str

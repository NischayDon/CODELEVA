from pydantic import BaseModel
from typing import Optional, Any

class SimulationRequest(BaseModel):
    code: str
    language: str
    component_id: str
    lesson_id: str

class ExecutionResult(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    metrics: Optional[dict[str, Any]] = None

class SimulationResponse(BaseModel):
    execution: ExecutionResult
    # Additional data can be added here

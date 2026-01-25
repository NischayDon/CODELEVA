from pydantic import BaseModel
from typing import List, Optional

class GameState(BaseModel):
    user_id: str
    level: int
    total_xp: int
    diamonds: int
    completed_lessons: List[str]

class Reward(BaseModel):
    xp: int
    diamonds: int
    level_up: bool
    new_level: int
    message: str
    
class OrchestrationRequest(BaseModel):
    state: GameState
    result_data: dict # pass pertinent result data
    hints_used: int

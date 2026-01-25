from fastapi import APIRouter, HTTPException
from ..models.simulation import SimulationRequest, SimulationResponse
from ..models.orchestrator import OrchestrationRequest, Reward, GameState
from ..models.ai import ReasoningRequest, TeachResponse, EmbeddingRequest
from ..services.simulation_engine import simulation_engine
from ..core.orchestrator import orchestrator
from ..services.ai_system import embedding_agent, reasoning_agent
from ..services.persistence_service import persistence_service
import json
import os

router = APIRouter()

@router.post("/run", response_model=SimulationResponse)
async def run_code(request: SimulationRequest):
    """
    Executes code without affecting game state (Test Run).
    """
    result = simulation_engine.execute_code(request.code, request.language)
    return SimulationResponse(execution=result)

@router.post("/submit", response_model=Reward)
async def submit_attempt(request: SimulationRequest, hints_used: int = 0):
    """
    Executes code and, if successful, processes rewards and progression.
    Now uses REAL persistence.
    """
    # 1. Load State (Real Persistence)
    # In a full auth system, user_id comes from token. Defaulting to demo_user.
    user_id = "demo_user"
    current_state = persistence_service.load_state(user_id)
    
    # 2. STRICT Prerequisite Check (Orchestrator Authority)
    # If the user hasn't unlocked this lesson (or its prereqs), block execution/reward.
    # Note: We might allow "Sandbox" execution, but definitely not "Progress" if prereqs failed.
    # For now, we strict block or just disable rewards. Let's strict fail to enforce syllabus.
    if not orchestrator.check_prerequisites(current_state, request.lesson_id):
        # We can return a failure Reward or raise HTTP 403. 
        # Returning Reward with 0 XP and error message is better for UI.
        return Reward(xp=0, diamonds=0, level_up=False, new_level=current_state.level, message="Locked! Prerequisites not met.")

    # 3. Simulate (Runtime)
    exec_result = simulation_engine.execute_code(request.code, request.language)
    
    # 4. Orchestrator Computes Metrics (Determinism)
    metrics = orchestrator.calculate_metrics(exec_result, hints_used)
    
    # 5. AI Analysis (Advisory)
    ai_advice = None
    try:
        # Agent A: Evidence (Embed code + metrics)
        evidence = embedding_agent.compute_evidence(request.code, context=metrics)
        
        # Agent B: Reasoning (Evaluate evidence + metrics)
        reasoning = reasoning_agent.evaluate_learner(evidence, metrics, [])
        
        ai_advice = reasoning.dict()
    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        ai_advice = None
 
    # 6. Orchestrator Decides (Authoritative Rules)
    reward = orchestrator.process_attempt(current_state, exec_result, hints_used, ai_advice)
    
    # 7. Persist Updates
    if reward.xp > 0: # Only save if state likely changed (or checking level up)
        # Apply updates to state object
        current_state.total_xp += reward.xp
        current_state.diamonds += reward.diamonds
        if reward.level_up:
            current_state.level = reward.new_level
        
        if exec_result.success:
             if request.lesson_id not in current_state.completed_lessons:
                 current_state.completed_lessons.append(request.lesson_id)

        persistence_service.save_state(current_state)
    
    return reward

@router.get("/puzzle/{component_id}/{lesson_id}")
async def get_puzzle(component_id: str, lesson_id: str):
    """
    Fetches puzzle data from backend (Real Data Source).
    """
    # Simple JSON file lookup for prototype "Real Data"
    try:
        with open("backend/data/puzzles.json", "r") as f:
            puzzles = json.load(f)
        
        # Try exact match first, then component fallback
        puzzle_key = f"{component_id}-{lesson_id}" # e.g. ram-1
        if puzzle_key in puzzles:
            return puzzles[puzzle_key]
        elif lesson_id in puzzles:
             return puzzles[lesson_id]
        else:
             # Fallback generative or default
             return {
                 "id": puzzle_key,
                 "instruction": f"Solve the task for {component_id} lesson {lesson_id}",
                 "template": "# Write code here",
                 "hints": ["Check documentation"]
             }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/hint", response_model=TeachResponse)
async def get_ai_hint(request: ReasoningRequest):
    """
    Get advisory hints from AI.
    """
    evidence = embedding_agent.compute_evidence(code="") 
    return reasoning_agent.evaluate_learner(evidence, request.execution_metrics, [])

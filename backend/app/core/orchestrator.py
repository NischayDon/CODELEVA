from typing import Dict, Any, List
from ..models.orchestrator import GameState, Reward
from ..models.simulation import ExecutionResult
from ..core.syllabus.loader import global_syllabus

class Orchestrator:
    def __init__(self):
        # In a real app, this would load from DB
        self._xp_table = [100 * i for i in range(1, 101)] # Simple linear-ish table

    def check_prerequisites(self, current_state: GameState, lesson_id: str) -> bool:
        """
        Enforces dataset-driven prerequisites.
        """
        completed = set(current_state.completed_lessons)
        return global_syllabus.validate_flow(completed, lesson_id)
        
    def calculate_metrics(self, result: ExecutionResult, hints_used: int) -> Dict[str, Any]:
        """
        Computes base metrics from simulation result for AI consumption.
        """
        return {
            "success": result.success,
            "error_count": len(result.errors) if result.errors else 0,
            "hints_used": hints_used,
            "time_ms": 1000 # Placeholder: Frontend should send start/end time
        }

    def process_attempt(self, current_state: GameState, result: ExecutionResult, hints_used: int, ai_advice: Dict[str, Any] = None) -> Reward:
        """
        The core authoritative logic for rewards.
        Accepts optional AI advice to influence difficulty scaling (but not base rewards).
        """
        # Strict Check (Double enforce)
        # In a real flow, check_prerequisites should be called BEFORE execution, but we enforce here too?
        # Maybe not strictly needed here if API does it, but safer.
        # But this function takes a result, implies execution happened. 
        # So we assume check happened at start. 
        
        if not result.success:
            return Reward(xp=0, diamonds=0, level_up=False, new_level=current_state.level, message="Execution failed. Fix the errors to earn rewards!")

        # 1. Base XP Calculation
        # Dynamic difficulty influenced by AI advice
        base_xp = 50 
        
        if ai_advice:
            # "Reasoning System recommends: Difficulty Adjustment"
            # If AI suggests difficulty increase (+), we might give a small "Mastery Bonus" 
            # If AI suggests decrease (-), we keep standard XP (never penalize for AI suggesting ease)
            # Enforce clamp for safety (-0.5 to 0.5)
            diff_adj = max(-0.5, min(0.5, float(ai_advice.get("suggested_difficulty_adjustment", 0))))
            if diff_adj > 0:
                base_xp += int(diff_adj * 50) # Bonus for high mastery attempt 
        
        # 2. Penalties
        hint_penalty = hints_used * 5
        final_xp = max(5, base_xp - hint_penalty)

        # 3. Diamonds (Code Gems)
        # Earn diamonds only on first completion or high efficiency?
        # For prototype: fixed amount
        diamonds = 10 if hints_used == 0 else 2

        # 4. Progression Check
        new_total_xp = current_state.total_xp + final_xp
        new_level = self._calculate_level(new_total_xp)
        
        level_up = new_level > current_state.level
        
        message = "Puzzle Solved!" if not level_up else f"Puzzle Solved! Level Up to {new_level}!"
        
        if ai_advice and "advice" in ai_advice:
             # Append AI advice to message for visibility in this prototype
             message += f" [AI Tip: {ai_advice['advice']}]"

        return Reward(
            xp=final_xp,
            diamonds=diamonds,
            level_up=level_up,
            new_level=new_level if level_up else current_state.level,
            message=message
        )

    def _calculate_level(self, total_xp: int) -> int:
        for level, threshold in enumerate(self._xp_table, 1):
            if total_xp < threshold:
                return level
        return len(self._xp_table)

orchestrator = Orchestrator()

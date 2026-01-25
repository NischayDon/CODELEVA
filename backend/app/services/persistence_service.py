import json
import os
from threading import Lock
from ..models.orchestrator import GameState

DATA_FILE = "backend/data/gamestate.json"
os.makedirs("backend/data", exist_ok=True)

class PersistenceService:
    def __init__(self):
        self._lock = Lock()
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(DATA_FILE):
             # Initialize with default structure list or object?
             # For this app, let's assume single user "demo_user" for now, or map of users.
             # Current frontend sends user_id.
             with open(DATA_FILE, "w") as f:
                 json.dump({}, f)

    def load_state(self, user_id: str) -> GameState:
        with self._lock:
            try:
                with open(DATA_FILE, "r") as f:
                    data = json.load(f)
                    user_data = data.get(user_id)
                    
                    if user_data:
                        return GameState(**user_data)
                    else:
                        # Create new user state
                        return GameState(
                            user_id=user_id,
                            level=1,
                            total_xp=0,
                            diamonds=0,
                            completed_lessons=[]
                        )
            except Exception as e:
                print(f"Error loading state: {e}")
                # Fallback
                return GameState(user_id=user_id, level=1, total_xp=0, diamonds=0, completed_lessons=[])

    def save_state(self, state: GameState):
        with self._lock:
            try:
                # Read all
                with open(DATA_FILE, "r") as f:
                    data = json.load(f)
                
                # Update user
                data[state.user_id] = state.dict()
                
                # Write back
                with open(DATA_FILE, "w") as f:
                    json.dump(data, f, indent=2)
            except Exception as e:
                print(f"Error saving state: {e}")

persistence_service = PersistenceService()

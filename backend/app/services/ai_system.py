import os
import httpx
import json
from typing import List, Dict, Any, Optional
from ..models.ai import EmbeddingRequest, EmbeddingResponse, TeachResponse, ReasoningRequest

# Configuration for AI Services (Microservice Architecture)
# Points to the isolated 'ai_service' FastAPI app
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8002")

EMBEDDING_API_URL = f"{AI_SERVICE_URL}/embed"
REASONING_API_URL = f"{AI_SERVICE_URL}/generate"

# Models are now managed by the Microservice, client doesn't need to specify IDs
# But we can pass metadata if needed.

class EmbeddingAgent:
    """
    Agent A: The Evidence Collector.
    Role: Pure analysis. No decision making.
    Connects to Qwen3-VL-Embedding-8B.
    """
    def compute_evidence(self, code: str, context: Optional[Dict[str, Any]] = None) -> EmbeddingResponse:
        # Real Implementation: Call Inference API
        try:
            # Payload matches 'ai_service.main.EmbedRequest'
            payload = {
                "code": code,
                "metadata": context or {}
            }
            
            with httpx.Client(timeout=10.0) as client:
                response = client.post(EMBEDDING_API_URL, json=payload)
                response.raise_for_status()
                data = response.json()
                
                return EmbeddingResponse(
                    similarity_score=data.get("similarity_score", 0.0),
                    mastery_confidence=data.get("mastery_confidence", 0.0),
                    detected_concepts=data.get("detected_concepts", [])
                )
        except Exception as e:
            print(f"[EmbeddingAgent] Connection Failed: {e}")
            # Fallback for safety (as per Architecture rules)
            return EmbeddingResponse(
                similarity_score=0.0,
                mastery_confidence=0.0,
                detected_concepts=[]
            )

class ReasoningAgent:
    """
    Agent B: The Pedagogue.
    Role: Evaluate evidence and recommend teaching strategy.
    Connects to Qwen2.5-7B-Instruct.
    """
    def evaluate_learner(self, evidence: EmbeddingResponse, metrics: Dict[str, Any], history: List[Any]) -> TeachResponse:
        try:
            # Payload matches 'ai_service.main.GenerateRequest'
            payload = {
                "evidence": evidence.dict(),
                "metrics": metrics,
                "history": history
            }
            
            with httpx.Client(timeout=30.0) as client: # Longer timeout for reasoning
                response = client.post(REASONING_API_URL, json=payload)
                response.raise_for_status()
                data = response.json()
                
                return TeachResponse(**data)
                
        except Exception as e:
            print(f"[ReasoningAgent] Inference Failed: {e}")
            return TeachResponse(
                advice="Excellent work. Proceed.",
                suggested_difficulty_adjustment=0.0,
                next_step_recommendation="next_lesson"
            )

    def _construct_prompt(self, evidence: EmbeddingResponse, metrics: Dict[str, Any]) -> str:
        return f"""
        Analyze student performance.
        Metrics: {json.dumps(metrics)}
        Evidence: Confidence {evidence.mastery_confidence}
        
        Return JSON with:
        - advice (string)
        - difficulty_adjustment (float between -0.5 and 0.5)
        - next_step (string)
        """

# Instantiate Agents
embedding_agent = EmbeddingAgent()
reasoning_agent = ReasoningAgent()


from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from .core.embedding import embedding_system, EmbeddingOutput
from .core.reasoning import reasoning_system, TeachResponse
from typing import Dict, Any, List

app = FastAPI(title="CodeLeva AI Microservice")

class EmbedRequest(BaseModel):
    code: str
    metadata: Dict[str, Any] = {}

class GenerateRequest(BaseModel):
    evidence: Dict[str, Any]
    metrics: Dict[str, Any]
    history: List[Any] = []

@app.on_event("startup")
async def startup_event():
    # Lazy load models on startup? Or maybe on first request to speed up dev?
    # CodeLeva Spec says: "Load Qwen..."
    # We trigger load in background to not block startup
    # embedding_system.load_model()
    # reasoning_system.load_model()
    pass

@app.post("/load_models")
async def load_models(background_tasks: BackgroundTasks):
    """
    Trigger model loading manually to manage memory.
    """
    background_tasks.add_task(embedding_system.load_model)
    background_tasks.add_task(reasoning_system.load_model)
    return {"status": "Model loading triggered"}

@app.post("/embed", response_model=EmbeddingOutput)
async def embed(request: EmbedRequest):
    return embedding_system.analyze_code(request.code)

@app.post("/generate", response_model=TeachResponse)
async def generate(request: GenerateRequest):
    return reasoning_system.generate_advice(request.evidence, request.metrics)

@app.get("/health")
async def health():
    return {"status": "AI Service Online", "gpu": embedding_system.device == "cuda"}

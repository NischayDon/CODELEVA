from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CodeLeva Backend",
    description="Authoritative backend for CodeLeva game logic, simulation, and AI orchestration.",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite Frontend
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.app.api.endpoints import router as api_router

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "CodeLeva Backend is running", "status": "nominal"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "codeleva-backend"}

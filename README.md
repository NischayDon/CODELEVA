# CodeLeva Quest

**CodeLeva Quest** is an immersive 3D educational game where players build a virtual PC while learning programming concepts in **Python** and **C++**. Each hardware component corresponds to a computer science topic (e.g., RAM = Variables, CPU = Functions).

## Features
- **3D PC Building Simulation**: Drag and drop components into a gaming cabinet.
- **Dual Language Learning**: Switch between Python and C++ seamlessly.
- **Adaptive AI Tutor**: "Leva" provides hints and difficulty adjustments using a local LLM.
- **Authorized Gameplay**: Progression is validated by a backend orchestrator.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Three.js (React Three Fiber), TailwindCSS, Shadcn UI.
- **Backend**: FastAPI (Python), Uvicorn.
- **AI Service**: Local LLM integration (Qwen2.5 / Qwen2-VL) via HuggingFace Transformers.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/NischayDon/CODELEVA.git
    cd CODELEVA
    ```

2.  **Run the Development Environment**:
    We have provided a helper script to launch all 3 microservices (Frontend, Backend, AI Service).
    ```powershell
    # Windows (PowerShell)
    .\start_dev.ps1
    ```

3.  **Manual Start**:
    - **Frontend**: `npm run dev` (Port 8080)
    - **Backend**: `python run_server.py` (Port 8001)
    - **AI Service**: `uvicorn ai_service.main:app --port 8002` (Port 8002)

## Architecture
This project follows a "Frontend as Visual Shell" architecture. All game logic, progression, and rewards are authoritative on the Backend. The AI Service provides advisory input but cannot alter game state directly.

## Credits
Built by the CodeLeva Team.

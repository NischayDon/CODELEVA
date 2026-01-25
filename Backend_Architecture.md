# CodeLeva Backend_Architecture.md

## 1. Backend Purpose
The backend of CodeLeva is the authoritative brain of the application.

**Responsibilities:**
- Deterministic game logic
- Simulation execution
- Reward calculation
- Progression control
- AI orchestration
- Data persistence

**Explicit Exclusions (The Backend DOES NOT):**
- Render UI
- Handle direct user interactions
- Perform visual state management

## 2. Technology Stack
- **Language**: Python
- **Framework**: FastAPI (API services)
- **Server**: Uvicorn (ASGI serving)
- **Data Exchange**: Structured JSON schemas
- **AI**: Local LLM inference services
- **Curriculum**: Dataset-backed syllabus storage

## 3. Core Components

### A. Orchestrator (Authoritative Control Layer)
**Role**: Central authority for all gameplay outcomes.
**Responsibilities**:
- Compute base rewards (XP, diamonds)
- Enforce difficulty scaling and progression rules
- Validate prerequisite completion
- Control tier transitions

**Rules**:
- Only this component can modify XP, Diamonds, Difficulty, and Level progression.
- AI systems may advise but NEVER decide.

### B. Simulation Engine
**Role**: Executes player-submitted code against the virtual system model.
**Responsibilities**:
- Run code in a sandboxed environment
- Simulate hardware constraints (Power, Thermal, Performance)
- Return structured results (Success/Failure, Metrics, Error states)

**Rules**:
- No AI involvement
- Deterministic execution only

### C. AI Service Layer (Advisory Only)
Split into two subcomponents:

#### 1. Embedding System
**Purpose**: Provide evidence for skill assessment.
**Responsibilities**:
- Embed player code, error logs, time taken, hint usage, syllabus concepts
- Return similarity scores, concept mastery confidence, learning pace indicators

**Rules**:
- No decision-making
- No content generation
- Evidence only

#### 2. Reasoning System
**Purpose**: Evaluate learner skill and pedagogy.
**Responsibilities**:
- Analyze reward trends, performance metrics, embedding evidence
- Recommend difficulty adjustments, teaching style, hint density

**Rules**:
- Structured JSON output only
- No direct game state mutation

## 4. Dataset-Driven Syllabus Management
**Datasets**: CS50, Open-source university curricula, Python docs/PEPs, C++ Guidelines.
**Responsibilities**:
- Build a syllabus graph (Nodes=concepts, Edges=prerequisites)
- Tag difficulty tiers and validate progression order

**Rules**:
- Never skip prerequisites
- Never invent syllabus topics
- Never allow AI to override dataset structure

## 5. API Endpoints
**Primary Endpoints**:
- `/simulate`: Runs code and returns results
- `/orchestrate`: Processes level completion
- `/generate`: Reasoning system (advisory)
- `/embed`: Embedding system (evidence)

All endpoints must accept and return structured JSON and be stateless (except for persistence).

## 6. Runtime Execution Flow
1. Frontend submits code
2. Simulation Engine executes
3. Orchestrator computes base metrics
4. Embedding System gathers evidence
5. Reasoning System evaluates skill
6. Orchestrator applies rules
7. Backend responds with results

## 7. Persistence Layer
Stores: Player progress, XP & rewards, Level completion history, Syllabus mastery states.
**Rules**: Backend owns persistence; Frontend cannot modify stored data directly.

## 8. Error Handling & Safety
- Sandbox all code execution
- Enforce time and memory limits
- Fail safely on AI errors (default to deterministic rules)

## 9. Critical Invariants
- Do not move AI decisions into simulation
- Do not allow AI to modify rewards
- Do not hardcode syllabus logic
- Do not merge embedding and reasoning responsibilities

**Mental Model**: The backend is the brain and referee. It enforces rules and uses AI as an advisor—never as a judge.

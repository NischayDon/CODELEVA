# CodeLeva AI_Architecture.md

## 1. Purpose
The AI layer exists to analyze learner behavior, evaluate skill, and provide adaptive guidance. **CRITICAL**: The AI layer is **ADVISORY ONLY**. It must **NEVER**:
- Control rewards
- Modify progression
- Skip prerequisites
- Override deterministic rules

## 2. Architecture: Multi-Agent System

### A. Orchestrator (The Boss)
- **Type**: Deterministic, Rule-Based System (Not AI)
- **Role**: Central authority.
- **Workflow**:
    1. Calls AI systems for analysis.
    2. Receives recommendations.
    3. Applies final decisions based on deterministic rules.

### B. Embedding System (Evidence Agent)
- **Model**: **Qwen3-VL-Embedding-8B**
- **Role**: Embedding System (Evidence & Curriculum Memory).
- **Why this model**: High-quality semantic embeddings, supports code/text/visuals.
- **Input**: Player code, error logs, time taken, hint usage, syllabus concepts.
- **Output**: Structured Evidence (Similarity scores, mastery confidence, learning pace).
- **Rules**:
    - **NO** decision making.
    - **NO** text generation.
    - Strictly non-generative.

### C. Reasoning System (Evaluator Agent)
- **Model**: **Qwen2.5-7B-Instruct**
- **Role**: Skill Evaluation & Pedagogy.
- **Why this model**: Strong instruction-following, reliable JSON, good reasoning/latency balance.
- **Input**: Reward trends, metrics, Embedding Evidence.
- **Output**: Structured Recommendations (Difficulty +/-/hold, Teaching style, Hint density).
- **Rules**:
    - JSON output only.
    - **NO** state mutation.
    - **NO** direct reward assignment.

### D. Advanced Reasoning System (Planned / Scaled)
- **Model**: **Qwen2.5-32B-Instruct**
- **Role**: Mentor AI (Deeper Pedagogy).
- **Why this model**: Deeper reasoning, better long-context, higher-quality feedback.
- **Usage**: Advanced explanations, complex diagnostics, long-term analysis.
- **Constraint**: Deployed only when sufficient GPU/NPU resources are available.

## 3. Dataset-Driven Intelligence
AI operates strictly within the boundaries of:
- CS50 & Open University Curricula
- Python/C++ Official Docs

**Constraint**: AI cannot invent topics or skip prerequisites.

## 4. Execution Flow
1. Orchestrator requests analysis.
2. Embedding System generates evidence from raw data.
3. Reasoning System evaluates evidence + metrics -> outputs recommendations.
4. Orchestrator receives recommendations -> applies difficulty/guidance rules deterministically.

## 5. Failure Safety
- **Embedding Fail**: Return neutral evidence.
- **Reasoning Fail**: Default to "Hold" difficulty.
- **Principle**: AI errors must never break gameplay.

## 6. Mental Model
AI Observes. AI Advises. The Orchestrator Decides.
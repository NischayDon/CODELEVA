# CodeLeva Frontend_Architecture.md

## 1. Core Principle: Frontend as Visual Shell
The Frontend is a **Visual Shell** and **Input Terminal**. It possesses **ZERO** gameplay authority.

**Responsibilities:**
- Render the current `GameState` provided by the Backend.
- Capture user input (Code, Clicks) and forward to Backend.
- Display "Visual Feedback" (Animations, Particles) based on Backend results.
- Display static educational content (Text, Diagrams).

## 2. Technology Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with `shadcn-ui`)
- **State Management**: Zustand (Synced with Backend)
- **Editor**: Monaco Editor (React wrapper)

## 3. Explicit Prohibitions (The Frontend MUST NOT):
- **Calculate XP or Level Ups**: Never write `xp += 10`. Only `xp = backend.xp`.
- **Determine Success/Failure**: Never validate code locally (except basic syntax linting).
- **Unlock Content**: Never toggle `isUnlocked` based on local logic. Always read from Backend state.
- **Store Authoritative State**: `localStorage` is for cache/preferences ONLY, not progress.

## 4. State Management (Zustand)
The `gameStore` should act as a **Reflection** of the Backend State.
- **Actions**: Should distinctively separate `OptimisticUI` (visuals) from `StateCommit` (backend response).
- **Updates**: Primary updates come from `BackendService` responses.

## 5. Architectural Flow
1. **User Action**: User clicks "Submit".
2. **API Call**: Frontend calls `POST /submit`.
3. **Optimistic UI**: Show "Processing..." spinner.
4. **Backend Response**: Received `{ success, tokens, xp, new_state }`.
5. **State Update**: `store.setState(new_state)`.
6. **Render**: UI updates to reflect new state.

## 6. Components & Alignment
- **Layout**: Sidebar (Modules), Main (Coding/Game), Overlay (Tutorial/AI).
- **Consistency**: All UI components must use Design System tokens (Colors, Spacing) defined in `index.css`/Tailwind config.
- **Lighting**: RGB effects are purely visual decorators controlled by the "Success" state from Backend.

## 7. Mental Model
The Frontend is a generic monitor connected to a remote computer (The Backend). If the Backend is off, the Frontend shows nothing but a connection error.

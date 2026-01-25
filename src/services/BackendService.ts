import { PCComponent } from '@/store/gameStore';

const API_BASE_URL = 'http://localhost:8001/api/v1';

export interface ValidationResult {
    success: boolean;
    message: string;
    rewards?: {
        xp: number;
        gems: number;
        levelUp: boolean;
        newLevel: number;
    };
}

export interface CodePuzzle {
    id: string;
    instruction: string;
    template: string;
    hints: string[];
}

export class BackendService {
    /**
     * Fetches the puzzle for a specific component and lesson.
     * Currently, the backend doesn't store puzzle content (it's in the frontend dataset),
     * so we will keep puzzle retrieval local or move it to backend later.
     * 
     * Per architecture, backend manages syllabus/progression, but frontend likely holds static assets.
     * However, let's assume we maintain the existing pattern where Frontend holds Puzzle Data for now,
     * OR we ask Backend. The Backend Architecture says "Dataset-Driven Syllabus Management".
     * For this implementation step, we will focus on *Execution* and *Progression*.
     * 
     * We will Mock the puzzle fetch here strictly to keep the frontend working, 
     * as the backend `get_puzzle` endpoint wasn't explicitly implemented in the previous step 
     * (only run/submit were).
     */
    static async getPuzzle(componentType: string, lessonIndex: number, language: 'python' | 'cpp'): Promise<CodePuzzle | null> {
        try {
            // Real Backend Call
            // Note: LessonIndex is assumed to map to an ID. 
            // In a real app we might need a mapping lookup.
            // For now, constructing id like "ram-1"
            const lessonId = `${componentType}-${lessonIndex + 1}`; // 1-based index in JSON

            const response = await fetch(`${API_BASE_URL}/puzzle/${componentType}/${lessonId}`);
            if (!response.ok) return null;

            const data = await response.json();
            return {
                id: data.id,
                instruction: data.instruction,
                template: data.template,
                hints: data.hints
            };
        } catch (error) {
            console.error('Failed to fetch puzzle:', error);
            return null;
        }
    }

    static async validateAttempt(
        componentType: string,
        lessonIndex: number,
        code: string,
        hintsUsed: number
    ): Promise<ValidationResult> {
        try {
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: 'python', // Should be dynamic
                    component_id: componentType, // Simplified
                    lesson_id: String(lessonIndex)
                })
            });

            if (!response.ok) {
                throw new Error('Backend error');
            }

            const reward = await response.json();

            return {
                success: reward.xp > 0, // Heuristic: if we got XP, we succeeded
                message: reward.message,
                rewards: {
                    xp: reward.xp,
                    gems: reward.diamonds,
                    levelUp: reward.level_up,
                    newLevel: reward.new_level
                }
            };
        } catch (error) {
            console.error('API Call Failed:', error);
            return {
                success: false,
                message: "Connection to Backend Failed. Is the server running?"
            };
        }
    }
}

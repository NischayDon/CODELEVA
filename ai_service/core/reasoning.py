from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import json
from pydantic import BaseModel
from typing import List, Dict, Any

# Schema
class TeachResponse(BaseModel):
    advice: str
    suggested_difficulty_adjustment: float
    next_step_recommendation: str

class ReasoningSystem:
    def __init__(self, model_id: str = "Qwen/Qwen2.5-7B-Instruct"):
        self.model_id = model_id
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None

    def load_model(self):
        print(f"Loading Reasoning Model: {self.model_id} on {self.device}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_id, trust_remote_code=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_id, 
                trust_remote_code=True, 
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            ).to(self.device)
            print("Reasoning Model Loaded Successfully.")
        except Exception as e:
            print(f"Failed to load reasoning model: {e}")
            self.model = "MOCK"

    def generate_advice(self, evidence: Dict, metrics: Dict) -> TeachResponse:
        system_prompt = """You are CodeLeva AI, a programming tutor.
        Analyze the student's performance based on the provided metrics and evidence.
        Output strictly valid JSON with the following keys:
        - advice: A helpful hint or encouragement (string).
        - suggested_difficulty_adjustment: A float between -0.5 (make easier) and 0.5 (make harder).
        - next_step_recommendation: One of ["review", "retry", "next_lesson", "challenge"].
        
        Do NOT output markdown. Do NOT output explanation. JSON only.
        """
        
        user_prompt = f"""
        Evidence: {json.dumps(evidence)}
        Metrics: {json.dumps(metrics)}
        """
        
        if self.model == "MOCK" or self.model is None:
            # Fallback logic if model weights missing
            return TeachResponse(
                advice="Excellent progress! (Model not loaded, using fallback)",
                suggested_difficulty_adjustment=0.1,
                next_step_recommendation="next_lesson"
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.device)
        
        generated_ids = self.model.generate(
            model_inputs.input_ids,
            max_new_tokens=256,
            temperature=0.2, # Deterministic-ish
            do_sample=True
        )
        
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]
        
        response_text = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        # Parse JSON
        try:
            # Clean possible markdown ```json ... ``` wrapper
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_text)
            return TeachResponse(**data)
        except Exception as e:
            print(f"Failed to parse AI JSON: {response_text}")
            return TeachResponse(
                advice="Keep going!",
                suggested_difficulty_adjustment=0.0,
                next_step_recommendation="next_lesson"
            )

reasoning_system = ReasoningSystem()

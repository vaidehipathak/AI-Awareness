import os
import json
import sys
from openai import OpenAI

# Z-KATT V2 - Ollama Edition
class ZKATT_V2_Pipeline:
    def __init__(self, base_url="http://localhost:11434/v1", api_key="ollama", model_name="ai-awareness-core-finetuned"):
        print(f"Initializing Z-KATT Pipeline via Ollama ({base_url})...")
        
        try:
            # Initialize OpenAI Client pointing to local Ollama server
            self.client = OpenAI(base_url=base_url, api_key=api_key)
            self.model_name = model_name
            
            # Test connection with retries
            import time
            max_retries = 5
            for attempt in range(max_retries):
                try:
                    print(f"DEBUG: Checking Ollama Models List (Attempt {attempt+1}/{max_retries})...")
                    models = self.client.models.list()
                    print(f"DEBUG: Ollama Models found: {len(models.data)}")
                    print("Successfully connected to Ollama Server!")
                    break
                except Exception as ex:
                    if attempt == max_retries - 1:
                        # Re-raise on final failure
                        raise ex
                    print(f"Ollama not ready yet ({ex}). Retrying in 3s...")
                    time.sleep(3)
        except Exception as e:
            print(f"Error connecting to Ollama: {e}")
            print("Please ensure Ollama is running ('ollama serve') and model is pulled.")
            raise e

        # Load Prompts
        self.prompts = {}
        prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
        print(f"DEBUG: Loading prompts from {prompt_dir}")
        if os.path.exists(prompt_dir):
            for filename in os.listdir(prompt_dir):
                if filename.endswith(".txt"):
                    name = filename.replace(".txt", "")
                    try:
                        with open(os.path.join(prompt_dir, filename), "r", encoding="utf-8") as f:
                            self.prompts[name] = f.read()
                            print(f"DEBUG: Loaded prompt '{name}'")
                    except Exception as e:
                        print(f"ERROR: Failed to load prompt {filename}: {e}")
                        raise e

    def _generate(self, system_prompt, user_input, max_new_tokens=500):
        # Merging system prompt into user message to bypass LM Studio restriction
        # "Only user and assistant roles are supported"
        messages = [
            {"role": "user", "content": f"System:\n{system_prompt}\n\nUser Input:\n{user_input}"}
        ]
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=max_new_tokens,
                # Optimize for Low VRAM (6GB Card)
                # num_ctx: 2048 saves ~250-500MB VRAM compared to 4096
                # num_gpu: 99 requests full offloading if space permits
                extra_body={"options": {"num_ctx": 2048, "num_gpu": 99}}
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating text: {e}"

    def step_1_interpret_intent(self, user_text):
        print("\n--- Step 1: Intent Interpretation ---")
        prompt = self.prompts.get("intent_interpretation", "")
        response = self._generate(prompt, user_text, max_new_tokens=200)
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            return json.loads(response)
        except json.JSONDecodeError:
            print("Warning: Could not parse JSON from Step 1. Using raw output.")
            return {"raw_intent": response}

    def step_2_generate_twin(self, user_text, intent_profile):
        print("\n--- Step 2: Synthetic Twin Generation ---")
        prompt = self.prompts.get("synthetic_twin_generator", "")
        input_data = f"User Input: {user_text}\nIntent Profile: {json.dumps(intent_profile, indent=2)}"
        return self._generate(prompt, input_data, max_new_tokens=1000)

    def step_3_adversarial_attack(self, synthetic_twin):
        print("\n--- Step 3: Adversarial Simulation ---")
        prompt = self.prompts.get("adversarial_attack", "")
        return self._generate(prompt, synthetic_twin, max_new_tokens=800)

    def step_4_analyze_delta(self, original_twin, attacked_twin):
        print("\n--- Step 4: Vulnerability Delta Analysis ---")
        prompt = self.prompts.get("vulnerability_analyzer", "")
        input_data = f"Original Twin:\n{original_twin}\n\nAttacked Twin:\n{attacked_twin}"
        return self._generate(prompt, input_data, max_new_tokens=500)

    def run(self, user_description):
        print(f"Starting Z-KATT V2 Process for: '{user_description}'")
        
        # Step 1
        intent_profile = self.step_1_interpret_intent(user_description)
        print("Intent Profile:", json.dumps(intent_profile, indent=2))
        
        # Step 2
        synthetic_twin = self.step_2_generate_twin(user_description, intent_profile)
        print("\nSynthetic Twin:\n", synthetic_twin)
        
        # Step 3
        attacked_result = self.step_3_adversarial_attack(synthetic_twin)
        print("\nAdversarial Result:\n", attacked_result)
        
        # Step 4
        analysis = self.step_4_analyze_delta(synthetic_twin, attacked_result)
        print("\nFinal Analysis:\n", analysis)

        # Step 5: Visual Rendering
        print("\n--- Step 5: Visual Rendering (PDF) ---")
        from renderer import render_to_pdf
        # Passing intent_profile to select the correct visual template (medical, financial, etc.)
        pdf_path = render_to_pdf(synthetic_twin, "twin_original", intent_profile)
        attack_pdf_path = render_to_pdf(attacked_result, "twin_attacked", intent_profile)
        
        return {
            "intent": intent_profile,
            "synthetic_twin": synthetic_twin,
            "attacked_result": attacked_result,
            "analysis": analysis,
            "pdf_path": pdf_path,
            "attack_pdf_path": attack_pdf_path
        }

if __name__ == "__main__":
    try:
        pipeline = ZKATT_V2_Pipeline()
        # user_input = "A standard medical prescription for antibiotics with a doctor's signature and hospital header."
        user_input = "Bank Statement for Bank of India savings account. High value transactions." 
        pipeline.run(user_input)
    except Exception as e:
        print(f"Pipeline failed: {e}")

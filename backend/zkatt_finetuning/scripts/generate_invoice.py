from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Ensure CUDA is available
if not torch.cuda.is_available():
    print("Warning: CUDA is not available. This script may run very slowly on CPU.")

model_id = "meta-llama/Llama-2-7b-chat-hf"

try:
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        device_map="auto",
        load_in_4bit=True
    )

    prompt = """
    Generate a fake medical invoice.

    Sensitivity:
    - PII: High
    - Layout: Standard
    - Includes signature: Yes
    """

    inputs = tokenizer(prompt, return_tensors="pt")
    if torch.cuda.is_available():
        inputs = inputs.to("cuda")
        
    out = model.generate(**inputs, max_new_tokens=500)
    print(tokenizer.decode(out[0], skip_special_tokens=True))

except Exception as e:
    print(f"An error occurred: {e}")

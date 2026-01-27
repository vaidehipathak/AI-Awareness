import os
import json
import torch
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, prepare_model_for_kbit_training, get_peft_model
from trl import SFTTrainer

# Configuration
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3" # Using Mistral for production-grade finetuning
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "training_data.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "zkatt_adapter")

def load_data():
    print(f"Loading data from {DATA_PATH}...")
    with open(DATA_PATH, "r") as f:
        data = json.load(f)
    
    # Format for instruction tuning
    formatted_data = []
    for item in data:
        text = f"User: {item['input']}\nAssistant: {item['output']}"
        formatted_data.append({"text": text})
        
    return Dataset.from_list(formatted_data)

def train():
    print(f"Starting QLoRA training for {MODEL_ID}...")
    
    # 1. Quantization Config (4-bit)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    )

    # 2. Load Model
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    model.config.use_cache = False
    model = prepare_model_for_kbit_training(model)

    # 3. LoRA Config
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "v_proj"] # Target attention layers
    )
    model = get_peft_model(model, peft_config)
    
    # 4. Load Data
    dataset = load_data()
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=1, # Low batch size for low VRAM
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=1,
        max_steps=10, # Short run for demonstration
        optim="paged_adamw_8bit",
        fp16=True,
    )

    # 6. Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=512,
        tokenizer=tokenizer,
        args=training_args,
    )

    # 7. Train
    print("Training started...")
    trainer.train()
    print(f"Training complete! Adapter saved to {OUTPUT_DIR}")
    
    # Save adapter
    trainer.save_model(OUTPUT_DIR)

if __name__ == "__main__":
    train()

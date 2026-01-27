import os
import json
import subprocess
import sys

# Install required packages
print("Installing required packages for LoRA finetuning...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "peft", "transformers", "torch", "bitsandbytes"])

print("Starting LoRA finetuning for ai-awareness-core model...")

# Create finetuning config
config = {
    "model_name_or_path": "mistralai/Mistral-7B-Instruct-v0.1",
    "output_dir": "./lora_adapter",
    "overwrite_output_dir": True,
    "num_train_epochs": 3,
    "per_device_train_batch_size": 4,
    "save_steps": 10,
    "save_total_limit": 2,
    "learning_rate": 5e-4,
    "bf16": False,
    "logging_steps": 10,
    "max_seq_length": 512,
    "packing": False,
    "lora_rank": 16,
    "lora_alpha": 32,
    "lora_dropout": 0.05,
}

with open("finetuning_config.json", "w") as f:
    json.dump(config, f, indent=2)

print("Config created: finetuning_config.json")

# Create the actual finetuning script
finetuning_script = '''
import json
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import get_peft_model, LoraConfig, TaskType
import torch

# Load config
with open("finetuning_config.json") as f:
    config = json.load(f)

print("Loading model and tokenizer...")
model_name = config["model_name_or_path"]

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Load the base model
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="auto",
    load_in_8bit=True if torch.cuda.is_available() else False
)

# Setup LoRA
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=config["lora_rank"],
    lora_alpha=config["lora_alpha"],
    lora_dropout=config["lora_dropout"],
    bias="none",
    target_modules=["q_proj", "v_proj"],
)

model = get_peft_model(model, peft_config)

# Load training data
print("Loading training data...")
dataset = load_dataset("json", data_files="training_data.jsonl", split="train")

def format_data(example):
    text = f"Instruction: {example['instruction']}\\nInput: {example['input']}\\nOutput: {example['output']}"
    return {"text": text}

dataset = dataset.map(format_data)

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=config["max_seq_length"])

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Training arguments
training_args = TrainingArguments(
    output_dir=config["output_dir"],
    overwrite_output_dir=config["overwrite_output_dir"],
    num_train_epochs=config["num_train_epochs"],
    per_device_train_batch_size=config["per_device_train_batch_size"],
    save_steps=config["save_steps"],
    save_total_limit=config["save_total_limit"],
    learning_rate=config["learning_rate"],
    logging_steps=config["logging_steps"],
)

# Train
print("Starting training...")
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    tokenizer=tokenizer,
)

trainer.train()

# Save adapter
print("Saving LoRA adapter...")
model.save_pretrained(config["output_dir"])
tokenizer.save_pretrained(config["output_dir"])

print(f"✓ Finetuning complete! Adapter saved to {config['output_dir']}")
'''

with open("run_finetuning.py", "w") as f:
    f.write(finetuning_script)

print("Finetuning script created: run_finetuning.py")
print("\nNote: Full HuggingFace model finetuning requires significant resources.")
print("For demo purposes, creating a lighter alternative...\n")

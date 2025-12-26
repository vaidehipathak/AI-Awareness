import torch
from transformers import AutoImageProcessor, ViTForImageClassification
from PIL import Image
import io

MODEL_NAME = "AashishKumar/AIvisionGuard-v2"

# Global variables to prevent reloading every time
processor = None
model = None

def get_resources():
    global processor, model
    if model is None or processor is None:
        print(f"🚀 Loading AI Guard Vision (ViT)...")
        processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
        model = ViTForImageClassification.from_pretrained(MODEL_NAME)
    return processor, model

def detect_ai_generated(file_path):
    try:
        proc, mod = get_resources()
        
        # 1. Load and Convert Image
        image = Image.open(file_path).convert('RGB')
        
        # 2. Preprocess (Resizes to 224x224 automatically)
        inputs = proc(image, return_tensors="pt")

        # 3. Inference
        with torch.no_grad():
            outputs = mod(**inputs)
            logits = outputs.logits
            # Convert logits to probabilities (0.0 to 1.0)
            probs = torch.nn.functional.softmax(logits, dim=-1)
            
        # 4. Get results
        # Label 0/1 depends on model config, usually 'fake' and 'real'
        top_prob, top_idx = torch.max(probs, dim=-1)
        
        label = mod.config.id2label[top_idx.item()]
        confidence = top_prob.item() # This is a decimal (e.g., 0.92)

        print(f"🎯 ViT Decision: {label} ({confidence*100:.2f}%)")

        # Logic for your Awareness Platform
        is_ai = "fake" in label.lower() or "artif" in label.lower()

        return {
            "is_ai": is_ai,
            "confidence": confidence * 100, # We send 0-100 for the router to handle
            "label": "AI Generated" if is_ai else "Real Image",
            "message": "ViT Architecture detected synthetic patterns." if is_ai else "Image appears to be a natural photograph."
        }
    except Exception as e:
        print(f"❌ Detector Error: {str(e)}")
        return {"is_ai": False, "confidence": 0, "message": f"Error: {str(e)}"}
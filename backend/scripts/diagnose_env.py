import os
import sys
import shutil
import subprocess
import platform

def log_status(name, ok, msg=""):
    color = "\033[92m" if ok else "\033[91m"
    reset = "\033[0m"
    icon = "✅" if ok else "❌"
    print(f"{icon} {color}{name.upper():<15}{reset}: {msg}")

def check_poppler():
    # Poppler Check
    poppler_roots = [r"C:\poppler", r"C:\Program Files\poppler", r"C:\Program Files (x86)\poppler"]
    found_bin = None
    for root in poppler_roots:
        for b in ["Library\\bin", "bin", ""]:
            p = os.path.join(root, b)
            if os.path.exists(os.path.join(p, "pdftoppm.exe")):
                found_bin = p
                break
        if found_bin: break
    
    if found_bin:
        log_status("Poppler", True, f"Found at {found_bin}")
    else:
        log_status("Poppler", False, "Missing pdftoppm.exe! OCR will fail. Please download binaries from https://github.com/oschwartz10612/poppler-windows/releases")

def check_tesseract():
    t_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(t_path):
        log_status("Tesseract", True, "Found at Program Files")
    else:
        # Check PATH
        path_check = shutil.which("tesseract")
        if path_check:
            log_status("Tesseract", True, f"Found in PATH: {path_check}")
        else:
            log_status("Tesseract", False, "Missing tesseract.exe! OCR will fail.")

def check_env():
    env_path = os.path.join(os.path.dirname(__file__), "../.env")
    if os.path.exists(env_path):
        log_status("Env File", True, "backend/.env exists")
        with open(env_path, 'r') as f:
            content = f.read()
            if "GROQ_API_KEY=" in content:
                log_status("Groq Key", True, "Found in .env")
            else:
                log_status("Groq Key", False, "Missing in .env! (System will fallback to Ollama)")
    else:
        log_status("Env File", False, "backend/.env missing!")

def check_python_deps():
    deps = ["pdfplumber", "pdf2image", "pytesseract", "groq", "django"]
    for d in deps:
        try:
            __import__(d)
            log_status(f"Lib: {d}", True)
        except ImportError:
            log_status(f"Lib: {d}", False, "Missing! Run: pip install -r requirements.txt")

if __name__ == "__main__":
    print("\n" + "="*40)
    print("AI-AWARENESS SYSTEM DIAGNOSTICS")
    print("="*40)
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version.split()[0]}")
    print("-"*40)
    
    check_poppler()
    check_tesseract()
    check_env()
    check_python_deps()
    
    print("="*40 + "\n")

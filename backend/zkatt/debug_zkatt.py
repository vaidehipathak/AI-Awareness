import os
import sys

# 1. Setup Path (Same as views.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
zkatt_dir = os.path.join(parent_dir, 'zkatt_finetuning')
sys.path.append(zkatt_dir)

print(f"DEBUG: Checking import path: {zkatt_dir}")
print(f"DEBUG: Path exists? {os.path.exists(zkatt_dir)}")

try:
    from pipeline_v2 import ZKATT_V2_Pipeline
    print("SUCCESS: pipeline_v2 imported successfully.")
except ImportError as e:
    print(f"CRITICAL ERROR: Failed to import pipeline_v2. {e}")
    sys.exit(1)

# 2. Test Connection
try:
    print("DEBUG: Attempting to initialize Pipeline (Connect to LM Studio)...")
    pipeline = ZKATT_V2_Pipeline()
    print("SUCCESS: Pipeline initialized (Connection established).")

    # 3. Test Full Execution
    print("\nDEBUG: Running Test Simulation (Prompt: 'Bank Statement')...")
    try:
        result = pipeline.run("Bank Statement for Bank of India savings account with suspicious transactions.")
        print("\nSUCCESS: Pipeline Execution Complete!")
        print(f"Risk Score: {result.get('analysis', {}).get('overall_risk_score', 'N/A')}")
    except Exception as e:
        import traceback
        print(f"\nCRITICAL ERROR during Pipeline Execution:\n{e}")
        traceback.print_exc()
        sys.exit(1)

except Exception as e:
    print(f"CRITICAL ERROR: Failed to connect to LM Studio. {e}")
    # Additional generic tips
    import socket
    try:
        s = socket.create_connection(("localhost", 1234), timeout=2)
        print("DEBUG: Socket connection to localhost:1234 SUCCESS.")
        s.close()
    except:
        print("DEBUG: Socket connection to localhost:1234 FAILED. Ensure LM Studio is running on Port 1234.")
    
    sys.exit(1)

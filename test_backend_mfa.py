# Removed APIClient import
import requests
import json

BASE_URL = "http://localhost:9000/auth"

# 1. Register Admin
email = "backend_test_admin_fixed@example.com"
password = "SecurePass123!"

session = requests.Session()

# Register
resp = session.post(f"{BASE_URL}/register/", json={
    "email": email,
    "username": "backend_test_admin_fixed",
    "password": password,
    "password_confirm": password,
    "role": "ADMIN"
})
if resp.status_code == 201:
    print("User registered.")
    user_id = resp.json()['user_id']
# If already exists, login to get ID
else:
    print(f"User check failed/exists. Status: {resp.status_code}, Body: {resp.text}")
    print("User might exist, logging in to check...")
    resp = session.post(f"{BASE_URL}/login/", json={"email": email, "password": password})
    if 'user_id' in resp.json():
        user_id = resp.json()['user_id']
    else:
        # Maybe already enrolled?
         pass

# Login to get enrollment challenge
resp = session.post(f"{BASE_URL}/login/", json={"email": email, "password": password})
print(f"Login Response: {resp.json()}")

if resp.json().get('requires_enrollment'):
    print("Enrollment required. Proceeding...")
    # Enroll
    resp = session.post(f"{BASE_URL}/otp/enroll/", json={
        "user_id": user_id, 
        "password": password
    })
    print(f"Enroll response keys: {resp.json().keys()}")
    
    data = resp.json()
    secret = data['secret']
    backup_codes = data['backup_codes']
    print(f"Backup Codes received: {len(backup_codes)}")
    
    import pyotp
    import time
    time.sleep(1)
    totp = pyotp.TOTP(secret)
    code = totp.now()
    
    # Verify using 'otp' field (CORRECT)
    resp = session.post(f"{BASE_URL}/otp/verify/", json={
        "user_id": user_id,
        "otp": code
    })
    print(f"Verify (otp) Response: {resp.status_code}")

    # Verify using 'otp_token' field (INCORRECT - simulating Frontend)
    # We need to trigger enrollment again or just check verify endpoint error
    # But verify updates state.
    
    # Let's try to Verify using Backup Code
    backup_code = backup_codes[0]
    print(f"Testing Backup Code: {backup_code}")
    
    # We need a new session or temp_token? 
    # If we just verified, we got tokens.
    # Let's login again to trigger MFA challenge
    resp = session.post(f"{BASE_URL}/login/", json={"email": email, "password": password})
    if resp.json().get('requires_otp'):
        temp_token = resp.json()['temp_token']
        print("Got temp_token for challenge.")
        
        # Send backup_code
        resp = session.post(f"{BASE_URL}/otp/verify/", json={
            "temp_token": temp_token,
            "backup_code": backup_code
        })
        print(f"Verify (backup_code) Response: {resp.status_code}")
        if resp.status_code == 200:
             print("✅ Backup code verification successful!")
        else:
             print(f"❌ Backup code failed: {resp.text}")

else:
    print("User already enrolled? Login to test backup code.")
    # Check if requires_otp
    if resp.json().get('requires_otp'):
         # We don't have backup codes if we didn't just enroll...
         # We can't test backup codes easily without re-enrolling or peeking DB.
         print("Skipping backup code test as we don't have fresh codes.")

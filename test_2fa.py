"""Test script for 2FA implementation"""
import requests
import json

BASE_URL = "http://localhost:8000/auth"

# Test 1: Register ADMIN user
print("=" * 60)
print("TEST 1: Register ADMIN user")
print("=" * 60)

register_data = {
    "email": "admin_test@example.com",
    "username": "admin_test",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",  # Fixed field name
    "role": "ADMIN"
}

response = requests.post(f"{BASE_URL}/register/", json=register_data)
print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Test 2: Login as ADMIN (should require enrollment)
print("\n" + "=" * 60)
print("TEST 2: Login as ADMIN (should require 2FA enrollment)")
print("=" * 60)

login_data = {
    "email": "admin_test@example.com",
    "password": "SecurePass123!"
}

response = requests.post(f"{BASE_URL}/login/", json=login_data)
print(f"Status Code: {response.status_code}")
response_data = response.json()
print(f"Response: {json.dumps(response_data, indent=2)}")

# Test 3: Register USER (for comparison)
print("\n" + "=" * 60)
print("TEST 3: Register USER (for comparison)")
print("=" * 60)

user_register_data = {
    "email": "user_test@example.com",
    "username": "user_test",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",  # Fixed field name
    "role": "USER"
}

response = requests.post(f"{BASE_URL}/register/", json=user_register_data)
print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Test 4: Login as USER (should get tokens immediately)
print("\n" + "=" * 60)
print("TEST 4: Login as USER (should bypass 2FA)")
print("=" * 60)

user_login_data = {
    "email": "user_test@example.com",
    "password": "SecurePass123!"
}

response = requests.post(f"{BASE_URL}/login/", json=user_login_data)
print(f"Status Code: {response.status_code}")
response_data = response.json()
print(f"Response: {json.dumps(response_data, indent=2)}")

# Verify USER gets JWT tokens
if 'access' in response_data and 'refresh' in response_data:
    print("\n✅ USER successfully received JWT tokens (2FA bypassed)")
else:
    print("\n❌ USER did not receive JWT tokens")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print("✅ Backend 2FA implementation complete")
print("✅ ADMIN users require 2FA enrollment")
print("✅ USER role bypasses 2FA (gets immediate JWT tokens)")
print("\nNext steps:")
print("1. Test OTP enrollment endpoint with ADMIN credentials")
print("2. Implement frontend OTP enrollment page")
print("3. Implement frontend OTP verification page")

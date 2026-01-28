
import requests
import json

try:
    response = requests.post(
        "http://localhost:8000/api/zkatt/simulate",
        json={"description": "test attack"},
        headers={"Content-Type": "application/json"}
    )
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Request Failed: {e}")

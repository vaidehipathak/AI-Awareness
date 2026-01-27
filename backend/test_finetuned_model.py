#!/usr/bin/env python3
"""
Test script for finetuned ai-awareness-core model
"""

import requests
import json

def test_finetuned_model():
    """Test the finetuned model with various security analysis queries"""
    
    ollama_url = "http://localhost:11434/api/generate"
    model_name = "ai-awareness-core-finetuned"
    
    test_cases = [
        {
            "title": "SQL Injection Detection",
            "prompt": "Analyze this Python code for security vulnerabilities: query = f'SELECT * FROM users WHERE id = {user_id}'"
        },
        {
            "title": "PII Detection",
            "prompt": "Identify personally identifiable information in this text: My email is john@example.com and my phone number is 555-123-4567"
        },
        {
            "title": "General Security Advice",
            "prompt": "What are best practices for storing API keys securely?"
        }
    ]
    
    print("=" * 70)
    print(f"Testing Finetuned Model: {model_name}")
    print("=" * 70)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n[Test {i}] {test['title']}")
        print("-" * 70)
        print(f"Query: {test['prompt']}\n")
        
        try:
            response = requests.post(
                ollama_url,
                json={
                    "model": model_name,
                    "prompt": test['prompt'],
                    "stream": False,
                    "temperature": 0.3
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"Response:\n{result['response']}")
                print("\n✓ Success")
            else:
                print(f"✗ Error: {response.status_code}")
                print(response.text)
        
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("Test Complete!")
    print("=" * 70)

if __name__ == "__main__":
    test_finetuned_model()

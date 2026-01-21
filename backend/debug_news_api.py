import requests
import json

API_KEY = "9da7c3728fa940d3b50541c9cd5ca6c9"
# Switched to NewsAPI.org endpoint
URL = "https://newsapi.org/v2/everything"

params = {
    "q": "artificial intelligence",  # Query
    "apiKey": API_KEY,
    "language": "en",
    "sortBy": "publishedAt",
    "pageSize": 5
}

try:
    print(f"Testing NewsAPI.org Key: {API_KEY[:5]}...")
    response = requests.get(URL, params=params, timeout=15)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Response Keys:", data.keys())
        
        if 'articles' in data:
            print(f"Found {len(data['articles'])} articles.")
            if len(data['articles']) > 0:
                first = data['articles'][0]
                print(f"First article title: {first.get('title')}")
                print(f"Source: {first.get('source', {}).get('name')}")
        else:
            print("WARNING: 'articles' key missing in response.")
            print("Full Response Snippet:", str(data)[:500])
    else:
        print("Error Response:", response.text)

except Exception as e:
    print(f"Request Failed: {e}")

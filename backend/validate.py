import requests
import json
import time

BASE_URL = 'http://127.0.0.1:5000'

def test_backend():
    print(f"Testing backend at {BASE_URL}...")
    
    # 1. Initialize Demo Data
    try:
        print("1. Initializing Demo Data...")
        resp = requests.post(f"{BASE_URL}/api/init-demo")
        print(f"Status: {resp.status_code}, Response: {resp.text}")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    # 2. Get Solutions
    try:
        print("\n2. Getting Solutions...")
        resp = requests.get(f"{BASE_URL}/api/solutions")
        solutions = resp.json()
        print(f"Found {len(solutions)} solutions.")
        if len(solutions) > 0:
            print(f"First solution: {solutions[0]['name']}")
    except Exception as e:
        print(f"Failed: {e}")

    # 3. Test Comparison/Scoring
    try:
        print("\n3. Testing Comparison Logic...")
        resp = requests.get(f"{BASE_URL}/api/compare")
        result = resp.json()
        rankings = result.get('rankings', [])
        print(f"Rankings generated for {len(rankings)} solutions.")
        for r in rankings:
            print(f"- {r['solutionName']}: {r['overallScore']}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    try:
        test_backend()
    except requests.exceptions.ConnectionError:
        print("Waiting for server to start...")
        time.sleep(2)
        test_backend()

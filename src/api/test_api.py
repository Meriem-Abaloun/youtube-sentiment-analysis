import requests

# Test du endpoint health
response = requests.get("http://localhost:8000/health")
print("Health check:", response.json())

# Test des prédictions
test_comments = {
    "comments": [
        "I love this video, it's amazing!",
        "This is okay, nothing special",
        "I hate this content, it's terrible"
    ]
}

response = requests.post("http://localhost:8000/predict_batch", json=test_comments)
print("Predictions:", response.json())
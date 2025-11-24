import pandas as pd
import requests
import os

os.makedirs('data/raw', exist_ok=True)

url = "https://raw.githubusercontent.com/Himanshu-1703/reddit-sentiment-analysis/refs/heads/main/data/reddit.csv"

response = requests.get(url)
with open('data/raw/reddit.csv', 'wb') as f:
    f.write(response.content)

df = pd.read_csv('data/raw/reddit.csv')
print(f"Downloaded {len(df)} comments")

# Distribution des labels
print("Distribution des labels:")
label_counts = df['category'].value_counts().sort_index()
for label, count in label_counts.items():
    sentiment = "Négatif" if label == -1 else "Neutre" if label == 0 else "Positif"
    percentage = (count / len(df)) * 100
    print(f"  {sentiment} ({label}): {count} commentaires ({percentage:.1f}%)")

print(f"Dataset sauvegardé dans: data/raw/reddit.csv")
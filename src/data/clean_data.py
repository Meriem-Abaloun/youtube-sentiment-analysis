import pandas as pd
import re
import os

# Charge les données
df = pd.read_csv('data/raw/reddit.csv')

# Vérifie la taille minimale
if len(df) < 1000:
    print(f"ERREUR: Dataset trop petit ({len(df)} commentaires)")
    exit()

# Vérifie 300 commentaires par classe
label_counts = df['category'].value_counts()
for label, count in label_counts.items():
    if count < 300:
        print(f"ERREUR: Classe {label} a seulement {count} commentaires")
        exit()

def clean_text(text):
    """Nettoie le texte"""
    if pd.isna(text):
        return ""
    text = str(text)
    text = re.sub(r'http\S+', '', text)  # URLs
    text = re.sub(r'@\w+', '', text)     # Mentions
    text = re.sub(r'[^\w\s]', ' ', text) # Caractères spéciaux
    text = re.sub(r'\s+', ' ', text)     # Espaces multiples
    return text.strip()

# Nettoie et renomme les colonnes
df['text'] = df['clean_comment'].apply(clean_text)
df['label'] = df['category']
df = df[df['text'].str.len() > 0]

# Analyse exploratoire
print("=== ANALYSE EXPLORATOIRE ===")
print(f"Commentaires après nettoyage: {len(df)}")

# Distribution des classes
label_counts = df['label'].value_counts().sort_index()
print("\nDistribution des classes:")
for label, count in label_counts.items():
    percentage = (count / len(df)) * 100
    sentiment = "Négatif" if label == -1 else "Neutre" if label == 0 else "Positif"
    print(f"  {sentiment} ({label}): {count} ({percentage:.1f}%)")

# Vérifie le déséquilibre
max_count = label_counts.max()
min_count = label_counts.min()
imbalance_ratio = max_count / min_count
print(f"Ratio de déséquilibre: {imbalance_ratio:.2f}")

if imbalance_ratio > 2:
    print("Déséquilibre détecté - application de l'undersampling")
    min_samples = label_counts.min()
    balanced_dfs = []
    for label in df['label'].unique():
        label_df = df[df['label'] == label]
        if len(label_df) > min_samples:
            label_df = label_df.sample(min_samples, random_state=42)
        balanced_dfs.append(label_df)
    df = pd.concat(balanced_dfs)
    print(f"Dataset équilibré: {len(df)} commentaires")

# Sauvegarde avec le bon format
os.makedirs('data/processed', exist_ok=True)
df[['text', 'label']].to_csv('data/processed/cleaned_data.csv', index=False)

print(f"\nDonnées sauvegardées: data/processed/cleaned_data.csv")
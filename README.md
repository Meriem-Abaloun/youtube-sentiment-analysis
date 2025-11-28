# YouTube Sentiment Analysis

## Description du Projet
Système MLOps complet pour l'analyse automatique des sentiments des commentaires YouTube. Ce projet permet aux créateurs de contenu d'analyser en temps réel les retours de leur audience grâce à une extension Chrome intuitive connectée à une API cloud.

## Contexte et Problématique
Les créateurs YouTube reçoivent des centaines de commentaires quotidiennement. L'analyse manuelle est :
- Chronophage et peu scalable
- Subjective et biaisée
- Difficile à quantifier pour des décisions stratégiques

## Solution Proposée
Développement d'un système MLOps complet avec :
- Extension Chrome pour l'interface utilisateur
- API REST FastAPI pour le backend
- Modèle de Machine Learning pour la classification
- Déploiement cloud sur Hugging Face Spaces

## Architecture Technique

### Stack Technologique
- **Frontend** : Extension Chrome (JavaScript, HTML, CSS)
- **Backend** : FastAPI, Python 3.10
- **Machine Learning** : scikit-learn, TF-IDF, Regression Logistique
- **Déploiement** : Docker, Hugging Face Spaces
- **Versioning** : Git, GitHub

### Flux de Données
1. L'utilisateur visite une vidéo YouTube
2. L'extension Chrome extrait les commentaires
3. Les données sont envoyées à l'API cloud
4. Le modèle ML analyse les sentiments
5. Les résultats sont affichés avec visualisations

## Installation et Utilisation

### Prérequis
- Compte Hugging Face
- Compte GitHub
- Navigateur Chrome
- Python 3.10+

### Installation de l'Extension Chrome
1. Télécharger le dossier `chrome-extension`
2. Ouvrir `chrome://extensions/`
3. Activer le "Mode développeur"
4. Cliquer "Charger l'extension non empaquetée"
5. Sélectionner le dossier `chrome-extension`

### Installation Locale (Développement)
```bash
# Cloner le repository
git clone https://github.com/Meriem-Abaloun/youtube-sentiment-analysis.git
cd youtube-sentiment-analysis

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer l'API locale
python src/api/api.py
```

## Entraînement du Modèle
```bash
# Télécharger et préparer les données
python src/data/download_data.py
python src/data/clean_data.py

# Entraîner le modèle
python src/models/train_model.py
```
## API Documentation
### Base URL
Production : https://meriabl-youtube-sentiment-analysis.hf.space

Local : http://localhost:8000

### Endpoints
GET /health
Vérifie le statut de l'API et du modèle.

#### Response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

#### POST /predict
Analyse les sentiments d'un batch de commentaires.

#### Request:
```json
{
  "comments": [
    "J'adore cette vidéo !",
    "Contenu moyen",
    "Je n'aime pas du tout"
  ]
}
```
#### Response:
```json
{
  "predictions": [
    {
      "text": "J'adore cette vidéo !",
      "sentiment": 1,
      "confidence": 0.95
    }
  ],
  "statistics": {
    "positive": 1,
    "neutral": 1,
    "negative": 1,
    "total": 3
  }
}
```

## Performance du Modèle
### Métriques
Accuracy : 85.2%

F1-score macro : 0.83

Temps d'inférence : < 50ms pour 50 commentaires

Précision par classe :

Positif (1) : 87%

Neutre (0) : 82%

Négatif (-1) : 86%

### Dataset
Source : Reddit Sentiment Analysis

Taille : 5,000+ commentaires

Distribution : Équilibrée entre les trois classes

Prétraitement : Nettoyage URLs, mentions, caractères spéciaux

### Structure du Projet
```text
youtube-sentiment-analysis/
├── src/                    # Code source
│   ├── data/              # Pipeline de données
│   │   ├── download_data.py
│   │   └── clean_data.py
│   ├── models/            # Entraînement ML
│   │   └── train_model.py
│   └── api/               # Application FastAPI
│       ├── api.py
│       └── test_api.py
├── chrome-extension/       # Extension Chrome
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   └── content.js
├── models/                 # Modèles entraînés
│   ├── sentiment_model.pkl
│   └── tfidf_vectorizer.pkl
├── data/                   # Données
│   ├── raw/               # Données brutes
│   └── processed/         # Données nettoyées
├── app_api.py             # API production
├── requirements.txt       # Dépendances Python
├── Dockerfile            # Configuration Docker
├── .dockerignore         # Fichiers ignorés par Docker
└── README.md             # Documentation
```
## Fonctionnalités de l'Extension Chrome
### Extraction des Commentaires
Détection automatique des commentaires YouTube

Support des pages dynamiques (infinite scroll)

Limite à 100 commentaires pour les performances

### Interface Utilisateur
Statistiques en temps réel : Pourcentages et graphiques

Liste des commentaires : Avec sentiment et confiance

Filtres : Par sentiment (positif/neutre/négatif)

Mode sombre/clair : Préférence sauvegardée

Export : Copie des résultats et export CSV

### Gestion d'Erreurs
Connexion API interrompue

Aucun commentaire trouvé

Pages YouTube non supportées

### Déploiement
#### Hugging Face Spaces
L'API est déployée sur Hugging Face Spaces avec Docker :

URL : https://meriabl-youtube-sentiment-analysis.hf.space

SDK : Docker

Port : 7860

Build : Automatique sur push

### Docker
```bash
# Build l'image
docker build -t youtube-sentiment-api .

# Lancer le conteneur
docker run -p 7860:7860 youtube-sentiment-api
```
### Développement
### Variables d'Environnement
```bash
API_HOST=0.0.0.0
API_PORT=7860
```
### Tests
```bash
# Tester l'API locale
python src/api/test_api.py

# Tester l'extension
# Aller sur une vidéo YouTube et cliquer sur l'extension

```
## Résultats et Impact
### Pour les Créateurs de Contenu
Analyse quantitative des retours audience

Détection de tendances dans les commentaires

Prise de décision data-driven pour le contenu

Gain de temps sur l'analyse manuelle

### Performance du Système
Temps de réponse : < 2 secondes end-to-end

Scalabilité : Support de batchs de 50+ commentaires

Disponibilité : 24/7 sur cloud

### Difficultés Rencontrées et Solutions
### Défi 1 : Compatibilité Python 3.13
Problème : scikit-learn incompatible avec Python 3.13
Solution : Utilisation de Python 3.10 et version stable de scikit-learn

### Défi 2 : Extraction des Commentaires YouTube
Problème : Structure DOM complexe et dynamique
Solution : Multiple CSS selectors et détection scroll

### Défi 3 : Déploiement Hugging Face
Problème : Build Docker échoue
Solution : Optimisation Dockerfile et gestion des layers

### Défi 4 : Communication Extension-API
Problème : Erreurs CORS et mixed content
Solution : Configuration CORS et HTTPS obligatoire

## Améliorations Futures
### Court Terme
Support des réponses aux commentaires (threads)

Historique des analyses

Export PDF des rapports

### Moyen Terme
Analyse des émotions (joie, colère, tristesse)

Détection de langues multiples

Intégration YouTube API officielle

### Long Terme
Tableau de bord analytics

Alertes sentiments négatifs

Recommandations de contenu

## Contribution
Fork le projet

Créer une branche feature (git checkout -b feature/NouvelleFonctionnalite)

Commit les changements (git commit -m 'Ajouter NouvelleFonctionnalite')

Push sur la branche (git push origin feature/NouvelleFonctionnalite)

Ouvrir une Pull Request

## Licence
Ce projet est distribué sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Auteur
Meriem Abaloun

GitHub: @Meriem-Abaloun

Hugging Face: @meriabl

## Remerciements
Hugging Face pour l'hébergement gratuit des modèles

FastAPI pour le framework backend performant

Scikit-learn pour les outils de machine learning

Google Chrome pour l'API extensions











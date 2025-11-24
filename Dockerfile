# Image légère
FROM python:3.10-slim

# Met à jour et nettoie le cache pour réduire la taille
RUN apt-get update && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie uniquement requirements d'abord (optimisation cache)
COPY requirements.txt .

# Installation des dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Crée le dossier models avant la copie
RUN mkdir -p models

# Copie des modèles (layer séparé)
COPY models/sentiment_model.pkl models/
COPY models/tfidf_vectorizer.pkl models/

# Copie du code (dernier layer - change souvent)
COPY app_api.py .

# Port Hugging Face
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:7860/health')" || exit 1

# Utilise un user non-root pour la sécurité
RUN useradd -m -u 1000 user
USER user

# Commande de démarrage
CMD ["python", "app_api.py"]
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="YouTube Sentiment Analysis",
    description="API pour analyser les sentiments des commentaires YouTube",
    version="1.0.0"
)

# CORS pour Hugging Face
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charge les modèles au démarrage
try:
    model = joblib.load('models/sentiment_model.pkl')
    vectorizer = joblib.load('models/tfidf_vectorizer.pkl')
    MODEL_LOADED = True
except Exception as e:
    MODEL_LOADED = False
    print(f"Erreur chargement modèle: {e}")

class CommentBatch(BaseModel):
    comments: List[str]

@app.get("/")
async def root():
    return {
        "message": "YouTube Sentiment Analysis API",
        "status": "online",
        "model_loaded": MODEL_LOADED
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if MODEL_LOADED else "error",
        "model_loaded": MODEL_LOADED
    }

@app.post("/predict")
async def predict_batch(batch: CommentBatch):
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Modèle non chargé")
    
    if not batch.comments:
        raise HTTPException(status_code=400, detail="Aucun commentaire fourni")
    
    try:
        # Vectorisation
        X = vectorizer.transform(batch.comments)
        
        # Prédictions
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)
        confidences = np.max(probabilities, axis=1)
        
        # Statistiques
        stats = {
            "positive": int(np.sum(predictions == 1)),
            "neutral": int(np.sum(predictions == 0)),
            "negative": int(np.sum(predictions == -1)),
            "total": len(predictions)
        }
        
        # Résultats détaillés
        results = []
        for i, comment in enumerate(batch.comments):
            results.append({
                "text": comment[:500],  # Limite la longueur
                "sentiment": int(predictions[i]),
                "confidence": float(confidences[i])
            })
        
        return {
            "predictions": results,
            "statistics": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
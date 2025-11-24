from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

# Charge le modèle et le vectoriseur
model = joblib.load('models/sentiment_model.pkl')
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

app = FastAPI()

# Autorise les requêtes depuis l'extension Chrome
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommentBatch(BaseModel):
    comments: List[str]

class PredictionResult(BaseModel):
    sentiment: int
    confidence: float

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict_batch")
async def predict_batch(batch: CommentBatch):
    if not batch.comments:
        raise HTTPException(status_code=400, detail="Aucun commentaire fourni")
    
    # Vectorise les commentaires
    X = vectorizer.transform(batch.comments)
    
    # Prédictions
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)
    
    # Calcul des confiances
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
            "text": comment,
            "sentiment": int(predictions[i]),
            "confidence": float(confidences[i])
        })
    
    return {
        "predictions": results,
        "statistics": stats
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
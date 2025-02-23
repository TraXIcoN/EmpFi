from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from .smart_prompt import SmartPredictor
import sys
import os

# Add parent directory to path to allow importing news
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from API_scripts.Prediction.news import MarketNewsAnalyzer

# Configure logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
predictor = SmartPredictor()
news_analyzer = MarketNewsAnalyzer(
    serp_api_key='1bd32a071e4b1917199118bbe0b40830885f299e6a50d12a1a7f67583845eed2',
    openai_api_key='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'
)

@app.on_event("startup")
async def startup_event():
    """Initialize vector store on startup"""
    predictor.initialize_vectors()

class PredictionRequest(BaseModel):
    company: str
    portfolio_value: float
    volatility: float
    beta: float
    market_cap: float
    timeframe: str = "1month"
    additional_context: Optional[str] = None

@app.post("/predict")
async def predict_investment(request: PredictionRequest):
    try:
        result = await predictor.predict(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/similar-scenarios/{company}")
async def get_similar_scenarios(company: str):
    """Get historical similar scenarios for a company"""
    try:
        scenarios = predictor.vector_store.find_similar_scenarios({"company": company})
        return {"scenarios": scenarios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
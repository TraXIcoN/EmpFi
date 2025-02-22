from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from smart_prompt import SmartPredictor

app = FastAPI()
predictor = SmartPredictor()

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
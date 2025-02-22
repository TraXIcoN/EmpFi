from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from datetime import datetime

app = FastAPI()

class PredictionRequest(BaseModel):
    company: str
    portfolio_value: float
    volatility: float
    beta: float
    market_cap: float
    additional_context: str = None

@app.post("/predict")
async def predict_portfolio(request: PredictionRequest):
    try:
        # Format the prompt
        prompt = f"""Analyze and predict the future performance for:
        Company: {request.company}
        Current Portfolio Value: {request.portfolio_value}
        Volatility: {request.volatility}
        Beta: {request.beta}
        Market Cap: {request.market_cap}
        
        Additional Context: {request.additional_context or 'None provided'}

        Provide a detailed analysis and prediction."""
        
        # Get prediction from fine-tuned model
        response = openai.ChatCompletion.create(
            model="your-fine-tuned-model-id",
            messages=[
                {"role": "system", "content": "You are a financial analyst expert at predicting investment portfolio performance."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # Parse and structure the response
        prediction = response.choices[0].message.content
        
        return {
            "prediction": prediction,
            "confidence": "medium",  # You could add confidence scoring
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

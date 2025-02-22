from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from model_management import ModelManager
import openai
import json
from fine_tune import fine_tune_model

app = FastAPI(
    title="Investment Portfolio Prediction API",
    description="API for predicting investment portfolio performance using fine-tuned GPT models"
)

model_manager = ModelManager()

class PredictionRequest(BaseModel):
    company: str = Field(..., description="Company name")
    portfolio_value: float = Field(..., description="Current portfolio value")
    volatility: float = Field(..., ge=0, le=1, description="Current volatility (0-1)")
    beta: float = Field(..., description="Market beta")
    market_cap: float = Field(..., gt=0, description="Market capitalization")
    additional_context: Optional[str] = Field(None, description="Any additional context for analysis")
    timeframe: str = Field("1month", description="Prediction timeframe (1month, 3months, 6months, 1year)")

class PredictionResponse(BaseModel):
    prediction: Dict[str, Any]
    confidence_score: float
    model_id: str
    timestamp: datetime
    metadata: Dict[str, Any]

def format_prompt(request: PredictionRequest) -> str:
    return f"""Analyze and predict the future performance for:
Company: {request.company}
Current Portfolio Value: ${request.portfolio_value:,.2f}
Volatility: {request.volatility:.2f}
Beta: {request.beta:.2f}
Market Cap: ${request.market_cap:,.2f}
Timeframe: {request.timeframe}

Additional Context: {request.additional_context or 'None provided'}

Please provide:
1. Predicted portfolio value range
2. Key factors influencing the prediction
3. Risk assessment
4. Confidence level in the prediction
5. Recommended actions"""

def parse_gpt_response(response_text: str) -> Dict[str, Any]:
    """Parse the GPT response into structured data"""
    try:
        # Add basic parsing logic - you might want to enhance this
        lines = response_text.split('\n')
        parsed = {
            'prediction_text': response_text,
            'structured_data': {
                'predicted_value': None,
                'risk_level': None,
                'confidence': None,
                'recommendations': []
            }
        }
        
        # Extract numerical predictions if present
        import re
        value_match = re.search(r'\$?([\d,]+\.?\d*)', response_text)
        if value_match:
            parsed['structured_data']['predicted_value'] = float(value_match.group(1).replace(',', ''))
            
        return parsed
    except Exception as e:
        return {'prediction_text': response_text, 'parsing_error': str(e)}

@app.post("/predict", response_model=PredictionResponse)
async def predict_portfolio(request: PredictionRequest):
    try:
        # Get current model ID
        model_id = model_manager.get_current_model()
        if not model_id:
            raise HTTPException(
                status_code=503,
                detail="No fine-tuned model available. Please train a model first."
            )
        
        # Make prediction
        response = openai.ChatCompletion.create(
            model=model_id,
            messages=[
                {
                    "role": "system",
                    "content": "You are a financial analyst expert at predicting investment portfolio performance. "
                              "Provide detailed, data-driven predictions with specific numerical values and confidence levels."
                },
                {
                    "role": "user",
                    "content": format_prompt(request)
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse response
        prediction_text = response.choices[0].message.content
        parsed_prediction = parse_gpt_response(prediction_text)
        
        # Calculate basic confidence score (you might want to enhance this)
        confidence_score = response.choices[0].finish_reason == "stop" and 0.8 or 0.5
        
        return PredictionResponse(
            prediction=parsed_prediction,
            confidence_score=confidence_score,
            model_id=model_id,
            timestamp=datetime.now(),
            metadata={
                "request_params": request.dict(),
                "model_version": model_manager.get_model_details(model_id),
                "response_tokens": response.usage.total_tokens
            }
        )
        
    except openai.error.OpenAIError as e:
        raise HTTPException(
            status_code=503,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/model/status")
async def get_model_status():
    """Get current model status and details"""
    try:
        model_id = model_manager.get_current_model()
        if not model_id:
            return {"status": "no_model", "message": "No fine-tuned model available"}
        
        model_details = model_manager.get_model_details(model_id)
        return {
            "status": "active",
            "model_id": model_id,
            "details": model_details
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching model status: {str(e)}"
        )

@app.post("/model/refresh")
async def refresh_model():
    """Trigger model refresh/retraining"""
    try:
        new_model_id = fine_tune_model()
        if new_model_id:
            return {
                "status": "success",
                "message": "Model refreshed successfully",
                "new_model_id": new_model_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Model refresh failed"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error refreshing model: {str(e)}"
        )

@app.post("/model/update")
async def update_model_with_new_data():
    """Add new training data and update the existing model"""
    try:
        current_model = model_manager.get_current_model()
        if not current_model:
            raise HTTPException(status_code=404, detail="No existing model found")
        
        # Prepare new training data
        new_examples = prepare_new_training_data()  # You'll need to implement this
        
        # Start fine-tuning from existing model
        new_model_id = openai.FineTuningJob.create(
            training_file=new_examples,
            model=current_model,  # Use current model as starting point
            hyperparameters={
                "n_epochs": 1,  # Fewer epochs needed for updating
                "learning_rate_multiplier": 0.05  # Lower learning rate for fine-tuning
            }
        )
        
        return {"status": "success", "new_model_id": new_model_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
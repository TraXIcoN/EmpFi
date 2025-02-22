import openai
from typing import Dict, Any
import pandas as pd
import json
from vector_store import VectorStore, OptimizedVectorStore
from datetime import datetime

class SmartPredictor:
    def __init__(self):
        self.vector_store = OptimizedVectorStore()
        self.base_model = "gpt-3.5-turbo"
        
    def initialize_vectors(self):
        """Initialize with optimized storage"""
        df = pd.read_csv('investment_portfolio_timeseries.csv')
        self.vector_store.store_market_data(df)
        self.vector_store.optimize_storage()
    
    def create_smart_prompt(self, request_data: Dict[str, Any]) -> str:
        # Find similar historical scenarios
        similar_scenarios = self.vector_store.find_similar_scenarios(request_data)
        
        # Create prompt with dynamic examples
        prompt = f"""You are a financial analyst expert. Analyze this investment scenario:

Current Scenario:
Company: {request_data['company']}
Current Portfolio Value: ${request_data['portfolio_value']:,.2f}
Volatility: {request_data['volatility']:.2f}
Beta: {request_data['beta']:.2f}
Market Cap: ${request_data['market_cap']:,.2f}

Historical Similar Scenarios:
"""
        
        # Add similar scenarios
        for i, scenario in enumerate(similar_scenarios, 1):
            data = scenario['data']
            prompt += f"""
{i}. Historical Case {i}:
Company: {data['company']}
Initial Portfolio Value: ${data['portfolio_value']:,.2f}
Volatility: {data['volatility']:.2f}
Beta: {data['beta']:.2f}
Outcome after {request_data.get('timeframe', '1month')}: ${data['future_value']:,.2f}
Key Factors: {data.get('key_factors', 'Market conditions similar to current scenario')}
"""

        prompt += f"""
Based on these similar historical scenarios and current market conditions, provide:
1. Predicted value range for next {request_data.get('timeframe', '1month')}
2. Key factors influencing this prediction
3. Risk assessment (Low/Medium/High) with reasoning
4. Confidence level based on similarity to historical cases
5. Recommended actions with specific thresholds

Format your response in JSON structure with the following keys:
- predicted_range: [min, max]
- key_factors: []
- risk_assessment: {}
- confidence_level: float
- recommendations: []
"""

        return prompt

    async def predict(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using vector similarity and smart prompt"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.base_model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a financial analyst expert providing JSON-formatted predictions based on historical market patterns."
                    },
                    {
                        "role": "user", 
                        "content": self.create_smart_prompt(request_data)
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            prediction = json.loads(response.choices[0].message.content)
            
            # Store this prediction for future reference
            self.vector_store.vectors.insert_one({
                "type": "prediction",
                "request": request_data,
                "prediction": prediction,
                "timestamp": datetime.now(),
                "model_version": self.base_model
            })
            
            return {
                "prediction": prediction,
                "similar_scenarios_count": 5,
                "cost_tokens": response.usage.total_tokens,
                "estimated_cost": (response.usage.total_tokens * 0.002) / 1000
            }
            
        except Exception as e:
            return {"error": str(e)} 
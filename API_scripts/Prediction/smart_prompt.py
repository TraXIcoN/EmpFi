import openai
from typing import Dict, Any
import pandas as pd
import json
from .vector_store import VectorStore, OptimizedVectorStore
from datetime import datetime
from .mongo_setup import MongoDBManager
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("OpenAI API key not found in environment variables")

class SmartPredictor:
    def __init__(self):
        self.vector_store = OptimizedVectorStore()
        self.base_model = "gpt-3.5-turbo"
        self.db_manager = MongoDBManager()
        
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
- risk_assessment: JSON()
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

class MarketAnalyzer:
    def __init__(self):
        try:
            # Initialize without OpenAI key check
            self.db_manager = MongoDBManager()
            self.base_model = "gpt-4-turbo-preview"
            logger.info("MarketAnalyzer initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing MarketAnalyzer: {e}")
            raise

    def get_historical_context(self, date_range: Dict[str, datetime]) -> str:
        """Get relevant market data for a specific time period"""
        try:
            # Query MongoDB for the time period
            market_data = self.db_manager.market_data.find({
                "date": {
                    "$gte": date_range.get("start"),
                    "$lte": date_range.get("end")
                }
            })
            
            # Aggregate key metrics
            metrics = []
            for data in market_data:
                metrics.append(f"""
                Company: {data['company']}
                Portfolio Value: ${data['metrics']['portfolio_value']:,.2f}
                Volatility: {data['metrics']['volatility']:.3f}
                Beta: {data['metrics']['beta']:.3f}
                Market Cap: ${data['metrics']['market_cap']:,.2f}
                Date: {data['date'].strftime('%Y-%m-%d')}
                """)
            
            return "\n".join(metrics[:10])  # Limit to top 10 entries for context
        except Exception as e:
            print(f"Error getting historical context: {e}")
            return ""

    async def analyze_scenario(self, query: str) -> Dict[str, Any]:
        """Generate AI insights based on historical data and hypothetical scenarios"""
        try:
            logger.info(f"Starting analysis for query: {query}")
            
            # Get historical context
            historical_context = self.get_historical_context({
                "start": datetime(1990, 1, 1),
                "end": datetime(2024, 2, 1)
            })

            system_prompt = """You are a financial market expert analyst. Analyze market scenarios 
            using historical data and provide detailed insights about potential market impacts.
            
            Structure your response in this format:
            {
                "market_impact": "Detailed analysis of overall market impact",
                "sector_analysis": {
                    "tech": "Impact on technology sector",
                    "defense": "Impact on defense sector",
                    "manufacturing": "Impact on manufacturing",
                    "supply_chain": "Impact on global supply chains"
                },
                "risk_assessment": {
                    "level": "HIGH/MEDIUM/LOW",
                    "factors": ["List", "of", "key", "risk", "factors"],
                    "explanation": "Detailed risk explanation"
                },
                "investment_recommendations": {
                    "safe_havens": ["List", "of", "safer", "investments"],
                    "opportunities": ["Potential", "growth", "areas"],
                    "avoid": ["Sectors", "to", "avoid"]
                },
                "timeline_impact": {
                    "short_term": "0-6 months impact",
                    "medium_term": "6-18 months impact",
                    "long_term": "18+ months impact"
                }
            }"""

            user_prompt = f"""
            Query: {query}

            Historical Market Data Context:
            {historical_context}

            Consider:
            1. Historical market behavior during geopolitical conflicts
            2. Supply chain disruptions
            3. Technology sector dependencies
            4. Global trade impact
            5. Currency market implications
            
            Provide a detailed analysis with specific focus on market metrics and investment strategies.
            """

            response = await openai.ChatCompletion.acreate(
                model=self.base_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={ "type": "json" }
            )

            analysis = response.choices[0].message.content

            # Store the analysis
            self.db_manager.predictions.insert_one({
                "query": query,
                "analysis": analysis,
                "timestamp": datetime.now(),
                "model": self.base_model
            })

            return {
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "query": query
            }

        except Exception as e:
            logger.error(f"Error in scenario analysis: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "query": query
            }

    def get_similar_historical_scenarios(self, query: str) -> list:
        """Find similar historical market scenarios"""
        try:
            similar_scenarios = self.db_manager.market_data.find({}).limit(5)
            return list(similar_scenarios)
        except Exception as e:
            print(f"Error finding similar scenarios: {e}")
            return [] 
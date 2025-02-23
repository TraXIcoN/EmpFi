import openai
from typing import Dict, Any, List
import pandas as pd
import json
from API_scripts.Prediction.vector_store import VectorStore, OptimizedVectorStore
from API_scripts.Prediction.mongo_setup import MongoDBManager
from datetime import datetime
import os
import logging
from bson import json_util
import spacy
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("OpenAI API key not found in environment variables")

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

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

    async def get_similar_historical_scenarios(self, query: str) -> list:
        """Find similar market scenarios based on query parameters"""
        try:
            # Process the query with spaCy
            doc = nlp(query.lower())
            
            # Extract key terms and entities
            query_terms = {
                "companies": set(),
                "metrics": set(),
                "market_conditions": set(),
                "timeframe": set()
            }
            
            # Define category keywords
            categories = {
                "metrics": {"volatility", "beta", "price", "value", "market cap", "volume", "growth", "interest", "rates"},
                "market_conditions": {"bull", "bear", "trend", "correction", "crash", "rally", "recession", "fed", "federal reserve"},
                "timeframe": {"day", "week", "month", "year", "quarter", "short term", "long term"}
            }
            
            # Categorize query terms
            for token in doc:
                term = token.text.lower()
                # Check for company names (entities)
                if token.ent_type_ in ["ORG"]:
                    query_terms["companies"].add(term)
                # Check for metrics
                elif term in categories["metrics"]:
                    query_terms["metrics"].add(term)
                # Check for market conditions
                elif term in categories["market_conditions"]:
                    query_terms["market_conditions"].add(term)
                # Check for timeframe
                elif term in categories["timeframe"]:
                    query_terms["timeframe"].add(term)
            
            # Build MongoDB query
            query_conditions = []
            
            # Company filter
            if query_terms["companies"]:
                query_conditions.append({
                    "company": {"$regex": f".*{'|'.join(query_terms['companies'])}.*", "$options": "i"}
                })
            
            # Market conditions filter
            if query_terms["market_conditions"]:
                query_conditions.append({
                    "key_factors": {"$regex": f".*{'|'.join(query_terms['market_conditions'])}.*", "$options": "i"}
                })
            
            # Metrics filter
            if query_terms["metrics"]:
                for metric in query_terms["metrics"]:
                    if metric == "volatility":
                        query_conditions.append({"volatility": {"$exists": True}})
                    elif metric == "beta":
                        query_conditions.append({"beta": {"$exists": True}})
                    elif metric == "market cap":
                        query_conditions.append({"market_cap": {"$exists": True}})
            
            # Construct final query
            mongo_query = {"$or": query_conditions} if query_conditions else {}
            
            # Define sort criteria
            sort_criteria = [("timestamp", -1)]  # Most recent first
            
            # Project only needed fields
            projection = {
                "company": 1,
                "portfolio_value": 1,
                "volatility": 1,
                "beta": 1,
                "market_cap": 1,
                "key_factors": 1,
                "timestamp": 1,
                "future_value": 1,
                "prediction": 1
            }
            
            # Execute query
            cursor = self.db_manager.market_data.find(
                mongo_query,
                projection
            ).sort(sort_criteria).limit(10)
            
            # Process results
            results = []
            for doc in cursor:
                relevance_score = self._calculate_market_relevance(doc, query_terms)
                formatted_doc = {
                    "company": doc.get("company", "Unknown"),
                    "metrics": {
                        "portfolio_value": doc.get("portfolio_value"),
                        "volatility": doc.get("volatility"),
                        "beta": doc.get("beta"),
                        "market_cap": doc.get("market_cap")
                    },
                    "key_factors": doc.get("key_factors", []),
                    "timestamp": doc.get("timestamp", "").strftime("%Y-%m-%d") if doc.get("timestamp") else "",
                    "future_value": doc.get("future_value"),
                    "prediction": doc.get("prediction", {}),
                    "relevance_score": relevance_score
                }
                results.append(formatted_doc)
            
            # Sort by relevance score
            results.sort(key=lambda x: x["relevance_score"], reverse=True)
            
            return json_util.loads(json_util.dumps(results))
        
        except Exception as e:
            logger.error(f"Error finding similar market scenarios: {e}")
            return []

    def _calculate_market_relevance(self, document: Dict, query_terms: Dict) -> float:
        """Calculate market scenario relevance score"""
        try:
            score = 0.0
            
            # Company name match
            if query_terms["companies"]:
                company_name = document.get("company", "").lower()
                for company in query_terms["companies"]:
                    if company in company_name:
                        score += 2.0
            
            # Market conditions match
            if query_terms["market_conditions"] and document.get("key_factors"):
                factors = " ".join(document["key_factors"]).lower()
                for condition in query_terms["market_conditions"]:
                    if condition in factors:
                        score += 1.5
            
            # Metrics match
            if query_terms["metrics"]:
                for metric in query_terms["metrics"]:
                    if metric in document and document[metric] is not None:
                        score += 1.0
            
            # Recency bonus
            if document.get("timestamp"):
                days_old = (datetime.now() - document["timestamp"]).days
                recency_score = max(0, 1 - (days_old / 365))  # Bonus decreases with age
                score += recency_score
            
            # Normalize score
            max_possible_score = (
                2.0 * len(query_terms["companies"]) +  # Company matches
                1.5 * len(query_terms["market_conditions"]) +  # Market condition matches
                1.0 * len(query_terms["metrics"]) +  # Metrics matches
                1.0  # Recency bonus
            )
            
            return score / max_possible_score if max_possible_score > 0 else 0.0
        
        except Exception as e:
            logger.error(f"Error calculating market relevance score: {e}")
            return 0.0

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
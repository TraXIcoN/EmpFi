from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import sys
import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from pymongo import MongoClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from the root .env file
env_path = Path(__file__).parents[1] / '.env'
load_dotenv(dotenv_path=env_path)

# Fix imports by using absolute imports
from API_scripts.Prediction.smart_prompt import MarketAnalyzer
from API_scripts.news import MarketNewsAnalyzer

app = FastAPI()
analyzer = MarketAnalyzer()
news_analyzer = MarketNewsAnalyzer(
    serp_api_key=os.getenv('SERP_API_KEY'),
    openai_api_key=os.getenv('OPENAI_API_KEY')
)

# MongoDB connection
mongodb_uri = os.getenv('MONGODB_URI', "mongodb+srv://abhiadi:Maroofidiot21@empfi.sro5d.mongodb.net/?retryWrites=true&w=majority&appName=EmpFi")
client = MongoClient(mongodb_uri)
db = client['census_data']
collection = db['county_data']

class ScenarioQuery(BaseModel):
    query: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class NewsRequest(BaseModel):
    keywords: Optional[List[str]] = Field(default=['economy', 'market', 'stocks', 'federal reserve'])

class CensusQuery(BaseModel):
    year: Optional[int] = None
    state: Optional[str] = None
    metric: Optional[str] = Field(
        default="total_population",
        description="Metric to display (e.g., total_population, median_household_income)"
    )

@app.post("/analyze-scenario")
async def analyze_scenario(scenario: ScenarioQuery):
    try:
        logger.info(f"Received query: {scenario.query}")
        result = await analyzer.analyze_scenario(scenario.query)
        return result
    except Exception as e:
        logger.error(f"Error in analyze_scenario: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/market-news")
async def get_market_news(request: NewsRequest):
    """Get market news analysis with custom keywords"""
    try:
        logger.info(f"Fetching market news for keywords: {request.keywords}")
        market_report = news_analyzer.get_market_analysis()
        return market_report
    except Exception as e:
        logger.error(f"Market news error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market-news/latest")
async def get_latest_market_news():
    """Get latest market news analysis with default keywords"""
    try:
        logger.info("Fetching latest market news")
        market_report = news_analyzer.get_market_analysis()
        return market_report
    except Exception as e:
        logger.error(f"Latest market news error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/census/counties")
async def get_county_data(year: Optional[int] = None, state: Optional[str] = None, metric: str = "total_population"):
    """Get census data for all counties for map visualization"""
    try:
        # Build query
        query = {}
        if year:
            query["year"] = year
        if state:
            query["state"] = state

        # Define which fields to return
        projection = {
            "county_name": 1,
            "state": 1,
            "year": 1,
            "fips": 1,
        }

        # Add the requested metric to projection
        if metric.startswith("demographics."):
            projection["demographics"] = 1
        elif metric.startswith("economics."):
            projection["economics"] = 1
        elif metric.startswith("housing."):
            projection["housing"] = 1
        elif metric.startswith("median_age."):
            projection["median_age"] = 1
        else:
            projection[metric] = 1

        # Fetch data from MongoDB
        counties = list(collection.find(query, projection))
        
        # Format response
        response = []
        for county in counties:
            # Get metric value based on path
            metric_value = county
            for key in metric.split('.'):
                metric_value = metric_value.get(key, {})

            response.append({
                "fips": f"{county['fips']['state_fips']}{county['fips']['county_fips']}",
                "county_name": county["county_name"],
                "state": county["state"],
                "year": county["year"],
                "value": metric_value if not isinstance(metric_value, dict) else None
            })

        return response

    except Exception as e:
        logger.error(f"Error fetching county data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/census/metrics")
async def get_available_metrics():
    """Get list of available metrics for visualization"""
    return {
        "metrics": [
            "total_population",
            "demographics.white",
            "demographics.black",
            "demographics.native",
            "demographics.asian",
            "demographics.hispanic",
            "economics.median_household_income",
            "economics.median_family_income",
            "economics.poverty_count",
            "housing.median_value",
            "housing.median_rent",
            "housing.total_units",
            "housing.occupied_units",
            "median_age.total",
            "median_age.male",
            "median_age.female"
        ]
    }

@app.get("/census/years")
async def get_available_years():
    """Get list of available years in the database"""
    try:
        years = collection.distinct("year")
        return {"years": sorted(years)}
    except Exception as e:
        logger.error(f"Error fetching years: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/census/states")
async def get_available_states():
    """Get list of available states in the database"""
    try:
        states = collection.distinct("state")
        return {"states": sorted(states)}
    except Exception as e:
        logger.error(f"Error fetching states: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

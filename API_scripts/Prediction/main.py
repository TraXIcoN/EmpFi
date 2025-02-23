from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import sys
import os
import logging
from dotenv import load_dotenv
from pathlib import Path

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

class ScenarioQuery(BaseModel):
    query: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class NewsRequest(BaseModel):
    keywords: Optional[List[str]] = Field(default=['economy', 'market', 'stocks', 'federal reserve'])

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

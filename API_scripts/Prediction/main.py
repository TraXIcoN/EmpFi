from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .smart_prompt import MarketAnalyzer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
analyzer = MarketAnalyzer()

class ScenarioQuery(BaseModel):
    query: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

@app.post("/analyze-scenario")
async def analyze_scenario(scenario: ScenarioQuery):
    try:
        logger.info(f"Received query: {scenario.query}")
        logger.info(f"Start date: {scenario.start_date}")
        logger.info(f"End date: {scenario.end_date}")
        
        result = await analyzer.analyze_scenario(scenario.query)
        logger.info(f"Analysis result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error in analyze_scenario: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/historical-context/{date}")
async def get_historical_context(date: str):
    try:
        logger.info(f"Getting historical context for date: {date}")
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        context = analyzer.get_historical_context({
            "start": date_obj,
            "end": date_obj
        })
        return {"context": context}
    except Exception as e:
        logger.error(f"Error in get_historical_context: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

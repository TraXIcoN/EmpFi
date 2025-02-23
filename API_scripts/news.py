import requests
from datetime import datetime
import json
import openai
import time
import os
import logging
from typing import Dict, List
from serpapi import GoogleSearch

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MarketNewsAnalyzer:
    def __init__(self, serp_api_key, openai_api_key):
        logger.info("Initializing MarketNewsAnalyzer")
        self.serp_api_key = serp_api_key
        openai.api_key = openai_api_key
        self.last_update = None
        self.cache = None
        self.UPDATE_INTERVAL = 3600  # 1 hour in seconds
        logger.debug(f"Update interval set to {self.UPDATE_INTERVAL} seconds")

    def get_market_analysis(self) -> Dict:
        """Get market analysis, using cache if within update interval"""
        logger.info("Getting market analysis")
        current_time = time.time()
        
        if (self.last_update is None or 
            current_time - self.last_update > self.UPDATE_INTERVAL or
            self.cache is None):
            logger.debug("Cache expired or not initialized, fetching new data")
            self.cache = self.fetch_market_news()
            self.last_update = current_time
        else:
            logger.debug("Using cached data")
            
        return self.cache

    def fetch_market_news(self, keywords=['economy', 'market', 'stocks', 'federal reserve']):
        logger.info("Fetching market news")
        logger.debug(f"Using keywords: {keywords}")
        articles = []
        
        for keyword in keywords:
            logger.debug(f"Searching for keyword: {keyword}")
            search_params = {
                "engine": "google_news",
                "q": f"{keyword} news",
                "gl": "us",
                "hl": "en",
                "api_key": self.serp_api_key
            }
            
            try:
                logger.debug("Making SerpAPI request")
                search = GoogleSearch(search_params)
                results = search.get_dict()
                
                if 'news_results' in results:
                    logger.debug(f"Found {len(results['news_results'])} articles for {keyword}")
                    for article in results['news_results'][:5]:
                        articles.append({
                            'title': article['title'],
                            'description': article.get('snippet', ''),
                            'source': article['source']['name'],
                            'url': article['link'],
                            'date': article.get('date', '')
                        })
                else:
                    logger.warning(f"No news results found for keyword: {keyword}")
            except Exception as e:
                logger.error(f"Error fetching news for keyword {keyword}: {str(e)}")

        logger.info(f"Total articles collected: {len(articles)}")
        
        # Get AI analysis of the articles
        try:
            logger.debug("Getting AI analysis")
            ai_analysis = self._get_ai_analysis(articles)
            
            # Combine with timestamp and raw articles
            report = {
                'timestamp': datetime.now().isoformat(),
                'raw_articles': articles[:5],  # Keep top 5 raw articles
                **ai_analysis  # Include all AI analysis
            }
            
            logger.debug("Market news report generated successfully")
            return report
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._generate_fallback_analysis()

    def _get_ai_analysis(self, articles: List[Dict]) -> Dict:
        """Get AI analysis of market news using OpenAI"""
        logger.info("Starting AI analysis")
        
        # Prepare context for OpenAI
        article_summaries = "\n".join([
            f"Title: {article['title']}\nDescription: {article['description']}\nSource: {article['source']}\nDate: {article['date']}\n"
            for article in articles[:5]
        ])
        logger.debug(f"Prepared summaries for {len(articles[:5])} articles")

        prompt = f"""
        Based on these recent market news articles:
        {article_summaries}

        Provide a detailed market analysis in the following JSON format:
        {{
            "active_alerts": [
                {{
                    "level": "HIGH/MEDIUM/LOW",
                    "title": "brief alert title",
                    "description": "detailed description",
                    "sector": "affected sector"
                }}
            ],
            "portfolio_analysis": {{
                "recommended_allocations": [
                    {{
                        "asset_name": "asset category",
                        "allocation_percentage": number,
                        "reasoning": "brief explanation"
                    }}
                ]
            }},
            "risk_analysis": {{
                "risk_level": "High/Moderate-High/Moderate/Low",
                "market_conditions": "detailed analysis",
                "key_factors": ["factor1", "factor2"]
            }},
            "market_trends": [
                {{
                    "trend_name": "name of trend",
                    "description": "detailed description",
                    "impact": "potential market impact"
                }}
            ],
            "historical_comparison": {{
                "similar_period": "historical period",
                "similarities": ["similarity1", "similarity2"],
                "differences": ["difference1", "difference2"],
                "key_lessons": ["lesson1", "lesson2"]
            }},
            "recommended_actions": ["action1", "action2", "action3"]
        }}
        """

        try:
            logger.debug("Making OpenAI API request")
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a financial analyst expert providing detailed market analysis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            logger.debug("Successfully received OpenAI response")
            return json.loads(response.choices[0].message.content)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response: {str(e)}")
            return self._generate_fallback_analysis()
        except Exception as e:
            logger.error(f"Error in OpenAI request: {str(e)}")
            return self._generate_fallback_analysis()

    def _generate_fallback_analysis(self):
        """Generate fallback analysis in case of API failure"""
        logger.warning("Generating fallback analysis due to error")
        return {
            'active_alerts': [],
            'portfolio_analysis': {
                'recommended_allocations': []
            },
            'risk_analysis': {
                'risk_level': 'Moderate',
                'market_conditions': 'Analysis temporarily unavailable',
                'key_factors': []
            },
            'market_trends': [],
            'historical_comparison': {
                'similarities': [],
                'differences': [],
                'key_lessons': []
            },
            'recommended_actions': ['Monitor market conditions', 'Maintain current positions']
        }

# Usage
if __name__ == "__main__":
    logger.info("Starting MarketNewsAnalyzer script")
    try:
        # Using API keys directly for testing
        SERP_API_KEY = '1bd32a071e4b1917199118bbe0b40830885f299e6a50d12a1a7f67583845eed2'
        OPENAI_API_KEY = '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'
        
        analyzer = MarketNewsAnalyzer(SERP_API_KEY, OPENAI_API_KEY)
        logger.info("Fetching market analysis")
        market_report = analyzer.get_market_analysis()
        print(json.dumps(market_report, indent=2))
        logger.info("Script completed successfully")
        
    except Exception as e:
        logger.error(f"Script failed with error: {str(e)}")

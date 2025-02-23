import requests
from datetime import datetime
import json

class MarketNewsAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://newsapi.org/v2/everything'
    
    def fetch_market_news(self, keywords=['economy', 'market', 'stocks', 'federal reserve']):
        alerts = []
        market_trends = []
        
        for keyword in keywords:
            params = {
                'q': keyword,
                'apiKey': self.api_key,
                'sortBy': 'publishedAt',
                'language': 'en',
                'pageSize': 10
            }
            
            response = requests.get(self.base_url, params=params)
            if response.status_code == 200:
                news_data = response.json()
                
                # Process articles for alerts and trends
                for article in news_data['articles']:
                    # Analyze article sentiment and importance
                    alert_level = self._analyze_importance(article['title'], article['description'])
                    if alert_level:
                        alerts.append({
                            'level': alert_level,
                            'timestamp': article['publishedAt'],
                            'title': article['title'],
                            'description': article['description'],
                            'url': article['url']
                        })
                    
                    # Extract market trends
                    trend = self._extract_market_trend(article)
                    if trend:
                        market_trends.append(trend)
        
        return self._format_market_report(alerts, market_trends)
    
    def _analyze_importance(self, title, description):
        # Simple keyword-based importance analysis
        high_priority = ['crash', 'surge', 'crisis', 'emergency', 'volatile']
        medium_priority = ['increase', 'decrease', 'change', 'federal reserve']
        
        text = (title + ' ' + description).lower()
        
        if any(word in text for word in high_priority):
            return 'HIGH'
        elif any(word in text for word in medium_priority):
            return 'MEDIUM'
        return 'LOW'
    
    def _extract_market_trend(self, article):
        # Extract relevant market trends from article
        if any(keyword in article['title'].lower() for keyword in ['trend', 'market', 'economy']):
            return {
                'title': article['title'],
                'timestamp': article['publishedAt'],
                'analysis': article['description']
            }
        return None
    
    def _format_market_report(self, alerts, trends):
        report = {
            'timestamp': datetime.now().isoformat(),
            'active_alerts': alerts[:5],  # Top 5 alerts
            'market_trends': trends[:3],  # Top 3 trends
            'risk_analysis': {
                'updated': datetime.now().isoformat(),
                'risk_level': self._calculate_risk_level(alerts),
                'recommendations': self._generate_recommendations(alerts, trends)
            }
        }
        return report

    def _calculate_risk_level(self, alerts):
        high_alerts = sum(1 for alert in alerts if alert['level'] == 'HIGH')
        medium_alerts = sum(1 for alert in alerts if alert['level'] == 'MEDIUM')
        
        if high_alerts >= 2:
            return 'High'
        elif high_alerts == 1 or medium_alerts >= 2:
            return 'Moderate-High'
        elif medium_alerts == 1:
            return 'Moderate'
        return 'Low'
    
    def _generate_recommendations(self, alerts, trends):
        # Simple recommendation generation based on alerts and trends
        recommendations = []
        if any(alert['level'] == 'HIGH' for alert in alerts):
            recommendations.append('Consider increasing cash reserves')
            recommendations.append('Review hedge positions')
        if len(alerts) >= 3:
            recommendations.append('Monitor market volatility closely')
        return recommendations

# Usage
if __name__ == "__main__":
    API_KEY = '1bd32a071e4b1917199118bbe0b40830885f299e6a50d12a1a7f67583845eed2'
    analyzer = MarketNewsAnalyzer(API_KEY)
    market_report = analyzer.fetch_market_news()
    print(json.dumps(market_report, indent=2))

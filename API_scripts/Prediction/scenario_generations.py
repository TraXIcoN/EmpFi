from API_scripts.Prediction.smart_prompt import MarketAnalyzer
from API_scripts.Prediction.mongo_setup import MongoDBManager
import random
from datetime import datetime
import logging
import string
from openai import OpenAI
import time

logger = logging.getLogger(__name__)

class ScenarioGenerator:
    def __init__(self):
        self.analyzer = MarketAnalyzer()
        self.db_manager = MongoDBManager()

        self.templates = {
            "market_crashes": [
                "What if there's a {severity} market crash in {sector} sector during {year}?",
                "How would a {percentage}% drop in {index} affect global markets in {year}?",
                "What happens if {country}'s stock market crashes by {percentage}% in {year}?",
            ],
            "tech_disruption": [
                "What if {tech_company} revolutionizes {industry} with {innovation} in {year}?",
                "How would {tech_trend} adoption affect traditional {sector} companies in {year}?",
                "What happens when {company} achieves breakthrough in {tech_field} in {year}?",
            ],
            "regulatory": [
                "What if SEC implements {regulation} for {sector} in {year}?",
                "How would {country}'s new {policy_type} policy affect {industry} stocks in {year}?",
                "What happens if {regulatory_body} bans {financial_instrument} trading in {year}?",
            ],
            "geopolitical": [
                "What if {country1} sanctions {country2}'s {industry} sector in {year}?",
                "How would {military_action} between {country1} and {country2} affect {commodity} prices?",
                "What happens if {country} restricts {resource} exports in {year}?",
            ],
            "economic_policy": [
                "What if Fed changes {monetary_policy} by {percentage}% in {year}?",
                "How would {country}'s {economic_strategy} affect global markets in {year}?",
                "What happens when {central_bank} implements {policy_change} in {year}?",
            ],
            "corporate_events": [
                "What if {company} {corporate_action} {company2} for ${amount}B in {year}?",
                "How would {company}'s {business_event} affect its stock price in {year}?",
                "What happens if {ceo} leaves {company} in {year}?",
            ],
            "social_trends": [
                "What if {social_movement} leads to boycott of {industry} in {year}?",
                "How would {demographic_trend} affect {consumer_sector} stocks in {year}?",
                "What happens when {social_change} becomes mainstream in {year}?",
            ],
            "innovation_impact": [
                "What if {innovation} replaces {traditional_method} in {industry} by {year}?",
                "How would widespread adoption of {technology} affect {sector} stocks?",
                "What happens if {company} patents revolutionary {tech_field} technology?",
            ],
            "resource_crisis": [
                "What if {resource} shortage affects {industry} production in {year}?",
                "How would {commodity} price reaching ${amount} affect markets in {year}?",
                "What happens if {country} discovers massive {resource} reserves in {year}?",
            ],
            "financial_innovation": [
                "What if {defi_protocol} becomes bigger than {traditional_bank} in {year}?",
                "How would {crypto} reaching ${amount}K affect traditional markets?",
                "What happens when {country} launches {cbdc_name} in {year}?",
            ]
        }

        # Complete variables dictionary with all needed values
        self.variables = {
            # Existing variables
            "severity": ["minor", "moderate", "severe", "catastrophic"],
            "sector": ["tech", "finance", "healthcare", "energy", "defense"],
            "percentage": [10, 20, 30, 40, 50],
            "index": ["S&P 500", "NASDAQ", "Dow Jones"],
            "country": ["USA", "China", "Russia", "India", "Japan"],
            "country1": ["USA", "China", "Russia", "India", "Japan"],
            "country2": ["UK", "Germany", "France", "Brazil", "Canada"],
            "tech_company": ["Apple", "Google", "Microsoft", "Amazon", "Meta"],
            "company": ["Apple", "Microsoft", "Amazon", "Google", "Meta"],
            "company2": ["Tesla", "Netflix", "Nvidia", "Intel", "AMD"],
            "innovation": ["quantum computing", "AI", "blockchain", "biotech"],
            "tech_trend": ["AI", "blockchain", "metaverse", "quantum"],
            "industry": ["technology", "finance", "healthcare", "energy"],
            "technology": ["AI", "blockchain", "quantum computing", "5G"],
            
            # Adding missing variables that caused errors
            "central_bank": ["Federal Reserve", "ECB", "Bank of Japan", "People's Bank of China"],
            "crypto": ["Bitcoin", "Ethereum", "Solana", "Cardano"],
            "commodity": ["oil", "gold", "natural gas", "copper", "lithium"],
            "policy_type": ["monetary", "fiscal", "regulatory", "trade"],
            "resource": ["semiconductors", "rare earth metals", "lithium", "water"],
            "traditional_method": ["cash payments", "traditional banking", "fossil fuels"],
            "demographic_trend": ["aging population", "urbanization", "remote work"],
            "corporate_action": ["merges with", "acquires", "partners with"],
            "military_action": ["military conflict", "trade sanctions", "cyber attack"],
            "tech_field": ["artificial intelligence", "quantum computing", "biotechnology"],
            "cbdc_name": ["Digital Dollar", "Digital Yuan", "Digital Euro"],
            "social_change": ["remote work", "digital transformation", "sustainable living"],
            "monetary_policy": ["interest rates", "quantitative easing", "reserve requirements"],
            "defi_protocol": ["Uniswap", "Aave", "Compound", "MakerDAO"],
            "regulation": ["strict oversight", "deregulation", "new compliance rules"],
            "economic_strategy": ["protectionism", "free trade", "digital economy"],
            "year": range(2024, 2051)
        }

    def generate_scenario(self):
        """Generate a random scenario"""
        category = random.choice(list(self.templates.keys()))
        template = random.choice(self.templates[category])
        
        # Fill in template variables
        variables = {}
        for var in [v[1] for v in string.Formatter().parse(template) if v[1]]:
            if var in self.variables:
                variables[var] = random.choice(self.variables[var])
                if var == "country2":  # Ensure different countries
                    while variables[var] == variables.get("country1", ""):
                        variables[var] = random.choice(self.variables["country"])

        query = template.format(**variables)
        
        return {
            "query": query,
            "category": category,
            "prediction_date": datetime.now(),
            "scenario_date": datetime(variables.get("year", 2030), 
                                   random.randint(1, 12), 
                                   random.randint(1, 28))
        }

    def analyze_scenario(self, query: str):
        """Generate AI insights for a scenario - now synchronous"""
        try:
            client = OpenAI()
            
            system_prompt = """You are a financial and geopolitical expert. Provide brief, focused analysis of market impacts 
            for hypothetical scenarios. Keep responses under 500 characters. Focus on:
            1. Direct market impact
            2. Key sectors affected
            3. Investment implications
            Format as JSON with structure:
            {
                "impact": "brief market impact description",
                "key_sectors": ["sector1", "sector2"],
                "recommendation": "brief investment advice"
            }"""

            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Scenario: {query}"}
                ],
                temperature=0.7,
                max_tokens=250,
                response_format={ "type": "json_object" }
            )

            return {
                "analysis": response.choices[0].message.content,
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

    def generate_and_store_scenarios(self, count: int = 100):
        """Generate and store scenarios - now synchronous"""
        logger.info(f"Starting to generate {count} scenarios...")

        for i in range(count):
            try:
                scenario = self.generate_scenario()
                result = self.analyze_scenario(scenario["query"])  # No more await

                # Store in MongoDB
                self.db_manager.predictions.insert_one({
                    "query": scenario["query"],
                    "category": scenario["category"],
                    "prediction_date": datetime.now(),
                    "scenario_date": scenario["scenario_date"],
                    "analysis": result["analysis"],
                    "created_at": datetime.now()
                })

                if i % 10 == 0:
                    logger.info(f"Generated {i} scenarios...")

                # Sleep to avoid rate limits
                time.sleep(2)

            except Exception as e:
                logger.error(f"Error generating scenario {i}: {e}")
                continue

        logger.info("Scenario generation complete!")

if __name__ == "__main__":
    generator = ScenarioGenerator()
    generator.generate_and_store_scenarios(1000)

from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class MongoDBManager:
    def __init__(self, uri="mongodb+srv://abhiadi:Maroofidiot21@empfi.sro5d.mongodb.net/?retryWrites=true&w=majority&appName=EmpFi"):
        self.client = MongoClient(uri)
        self.db = self.client['empfi_db']
        
        # Collections
        self.market_data = self.db['market_data']
        self.vectors = self.db['vectors']
        self.predictions = self.db['predictions']
        self.metadata = self.db['metadata']
        
        # Initialize collections and indexes
        self._setup_collections()
    
    def _setup_collections(self):
        """Setup collections with proper indexes"""

        # 1. Market Data Collection
        self.market_data.create_index([
            ("company", ASCENDING),
            ("date", DESCENDING)
        ])
        
        # 2. Vectors Collection (for embeddings)
        self.vectors.create_index([
            ("company", ASCENDING),
            ("date", DESCENDING)
        ])
        # Note: 2dsphere might not be the best for high-dimensional vectors
        # Instead, use a compound index
        self.vectors.create_index([
            ("company", ASCENDING),
            ("vector", ASCENDING)
        ])
        
        # 3. Predictions Collection
        self.predictions.create_index([
            ("company", ASCENDING),
            ("timestamp", DESCENDING)
        ])
    
    def store_initial_data(self, df):
        """Store initial market data"""
        # Convert date column to datetime if it's not already
        df['date'] = pd.to_datetime(df['date'])
        
        # Process in batches to avoid memory issues
        batch_size = 1000
        for start in range(0, len(df), batch_size):
            batch = df.iloc[start:start + batch_size]
            
            market_docs = []
            for _, row in batch.iterrows():
                doc = {
                    "company": row['company'],
                    "state_fips": int(row['state_fips']),
                    "county_fips": row['county_fips'],
                    "date": row['date'],
                    "metrics": {
                        "portfolio_value": float(row['portfolio_value']),
                        "volatility": float(row['volatility']),
                        "beta": float(row['beta']),
                        "market_cap": float(row['market_cap'])
                    },
                    "created_at": datetime.now()
                }
                market_docs.append(doc)
            
            if market_docs:
                self.market_data.insert_many(market_docs)
            
            print(f"Processed {start + len(batch)} records")
    
    def store_vector(self, company: str, date: datetime, vector: list, data: dict):
        """Store vector embedding"""
        vector_doc = {
            "company": company,
            "date": date,
            "vector": vector,
            "original_data": data,
            "created_at": datetime.now()
        }
        self.vectors.insert_one(vector_doc)
    
    def store_prediction(self, request: dict, prediction: dict, model_id: str):
        """Store prediction results"""
        prediction_doc = {
            "company": request['company'],
            "request_data": request,
            "prediction": prediction,
            "model_id": model_id,
            "timestamp": datetime.now()
        }
        self.predictions.insert_one(prediction_doc)
    
    def get_similar_scenarios(self, vector: list, limit: int = 5):
        """Find similar scenarios using vector similarity"""
        pipeline = [
            {
                "$addFields": {
                    "similarity": {
                        "$reduce": {
                            "input": {"$range": [0, {"$size": "$vector"}]},
                            "initialValue": 0,
                            "in": {
                                "$add": [
                                    "$$value",
                                    {"$multiply": [
                                        {"$arrayElemAt": ["$vector", "$$this"]},
                                        {"$arrayElemAt": [vector, "$$this"]}
                                    ]}
                                ]
                            }
                        }
                    }
                }
            },
            {"$sort": {"similarity": -1}},
            {"$limit": limit}
        ]
        
        return list(self.vectors.aggregate(pipeline))
    
    def get_company_history(self, company: str, start_date: datetime = None):
        """Get historical data for a company"""
        query = {"company": company}
        if start_date:
            query["date"] = {"$gte": start_date}
            
        return list(self.market_data.find(
            query,
            sort=[("date", ASCENDING)]
        ))
    
    def cleanup_old_data(self, days_to_keep: int = 365):
        """Clean up old predictions"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        self.predictions.delete_many({
            "timestamp": {"$lt": cutoff_date}
        })
from pymongo import MongoClient
import numpy as np
import openai
import pandas as pd
from typing import List, Dict
from datetime import datetime, timedelta
import os
from .mongo_setup import MongoDBManager

openai.api_key = os.getenv('OPENAI_API_KEY')

class VectorStore:
    def __init__(self):
        self.client = MongoClient('mongodb+srv://abhiadi:Maroofidiot21@empfi.sro5d.mongodb.net/?retryWrites=true&w=majority&appName=EmpFi')
        self.db = self.client['investment_db']
        self.vectors = self.db['market_vectors']
        self.embeddings_cache = {}
        
        # Create indexes for vector search
        self.vectors.create_index([("vector", "2dsphere")])
        self.vectors.create_index([("company", 1)])
        
    def compute_embedding(self, text: str) -> List[float]:
        """Compute embedding for text using OpenAI"""
        if text in self.embeddings_cache:
            return self.embeddings_cache[text]
            
        embedding = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text
        )['data'][0]['embedding']
        self.embeddings_cache[text] = embedding
        return embedding
    
    def store_market_data(self, df: pd.DataFrame):
        """Store market data with embeddings"""
        for _, row in df.iterrows():
            # Create context string for embedding
            context = f"""Company: {row['company']}
            Portfolio Value: {row['portfolio_value']}
            Volatility: {row['volatility']}
            Beta: {row['beta']}
            Market Cap: {row['market_cap']}
            Date: {row['date']}"""
            
            # Compute embedding
            vector = self.compute_embedding(context)
            
            # Store in MongoDB
            self.vectors.insert_one({
                "company": row['company'],
                "date": row['date'],
                "vector": vector,
                "data": row.to_dict(),
                "created_at": datetime.now()
            })
    
    def find_similar_scenarios(self, query_data: Dict, limit: int = 5) -> List[Dict]:
        """Find similar market scenarios"""
        query_context = f"""Company: {query_data['company']}
        Portfolio Value: {query_data['portfolio_value']}
        Volatility: {query_data['volatility']}
        Beta: {query_data['beta']}
        Market Cap: {query_data['market_cap']}"""
        
        query_vector = self.compute_embedding(query_context)
        
        # Find similar vectors
        similar = self.vectors.aggregate([
            {
                "$search": {
                    "knnBeta": {
                        "vector": query_vector,
                        "path": "vector",
                        "k": limit
                    }
                }
            }
        ])
        
        return list(similar)

class OptimizedVectorStore:
    def __init__(self):
        self.client = MongoClient('mongodb+srv://abhiadi:Maroofidiot21@empfi.sro5d.mongodb.net/?retryWrites=true&w=majority&appName=EmpFi')
        self.db = self.client['investment_db']
        self.vectors = self.db['market_vectors']
        
    def store_market_data(self, df: pd.DataFrame):
        """Store optimized market data with embeddings"""
        # 1. Temporal sampling (monthly instead of daily)
        df['date'] = pd.to_datetime(df['date'])
        monthly_data = df.groupby([
            'company', 
            pd.Grouper(key='date', freq='M')
        ]).agg({
            'portfolio_value': 'mean',
            'volatility': 'mean',
            'beta': 'mean',
            'market_cap': 'mean'
        }).reset_index()
        
        # 2. Company sampling (focus on larger companies)
        company_importance = monthly_data.groupby('company')['market_cap'].mean()
        top_companies = company_importance.nlargest(1000).index
        
        # 3. Store only significant patterns
        for company in top_companies:
            company_data = monthly_data[monthly_data['company'] == company]
            
            # Store one vector per quarter for normal periods
            normal_periods = company_data.resample('Q', on='date').mean()
            
            # Store monthly data for volatile periods
            volatile_periods = company_data[
                company_data['volatility'] > company_data['volatility'].quantile(0.8)
            ]
            
            for _, row in pd.concat([normal_periods, volatile_periods]).iterrows():
                context = f"""Company: {company}
                Portfolio Value: {row['portfolio_value']}
                Volatility: {row['volatility']}
                Beta: {row['beta']}
                Market Cap: {row['market_cap']}"""
                
                vector = self.compute_embedding(context)
                
                self.vectors.insert_one({
                    "company": company,
                    "date": row['date'],
                    "vector": vector,
                    "data": row.to_dict(),
                    "created_at": datetime.now()
                })

    def optimize_storage(self):
        """Create optimized indexes and compress data"""
        # 1. Create indexes
        self.vectors.create_index([("company", 1)])
        self.vectors.create_index([("date", 1)])

        # 2. Enable compression
        self.db.command({"collMod": "market_vectors",
                        "storageEngine": {
                            "wiredTiger": {"configString": "block_compressor=zlib"}
                        }})
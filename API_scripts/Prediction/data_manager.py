from mongo_setup import MongoDBManager
import pandas as pd
from vector_store import VectorStore

def initialize_database():
    # Initialize MongoDB manager and VectorStore
    db_manager = MongoDBManager()
    vector_store = VectorStore()
    
    # Load your CSV data
    df = pd.read_csv('investment_portfolio_timeseries.csv')
    
    # Store initial data
    print("Storing market data...")
    db_manager.store_initial_data(df)
    
    # Create and store vectors for initial data
    print("Creating vectors...")
    for company in df['company'].unique():
        company_data = df[df['company'] == company]
        # Process monthly data to save space
        monthly_data = company_data.resample('M', on='date').mean()
        
        for _, row in monthly_data.iterrows():
            # Create context for embedding
            context = f"""Company: {company}
            Portfolio Value: {row['portfolio_value']}
            Volatility: {row['volatility']}
            Beta: {row['beta']}
            Market Cap: {row['market_cap']}"""
            
            # Get embedding using VectorStore
            vector = vector_store.get_embedding(context)
            
            db_manager.store_vector(
                company=company,
                date=row.name,
                vector=vector,
                data=row.to_dict()
            )
    
    print("Database initialization complete!")
    return db_manager

if __name__ == "__main__":
    initialize_database()
from mongo_setup import MongoDBManager
import pandas as pd
from vector_store import VectorStore

def initialize_database():
    # Initialize MongoDB manager and VectorStore
    db_manager = MongoDBManager()
    vector_store = VectorStore()
    
    try:
        # Load your CSV data
        print("Loading CSV data...")
        df = pd.read_csv('investment_portfolio_timeseries.csv')
        df['date'] = pd.to_datetime(df['date'])
        
        # Fill NaN values appropriately
        try:
            df['state_fips'] = df['state_fips'].fillna(0).astype(int)
            df['county_fips'] = df['county_fips'].fillna(0).astype(int)
            df['portfolio_value'] = df['portfolio_value'].fillna(0)
            df['volatility'] = df['volatility'].fillna(0)
            df['beta'] = df['beta'].fillna(0)
            df['market_cap'] = df['market_cap'].fillna(0)
        except Exception as e:
            print(f"Warning: Error in data cleaning but continuing: {e}")
        
        # Resample to weekly data first
        print("Resampling to weekly data...")
        try:
            weekly_df = df.groupby(['company'], include_groups=False).apply(
                lambda x: x.set_index('date').resample('W-FRI').agg({
                    'state_fips': 'first',
                    'county_fips': 'first',
                    'portfolio_value': 'mean',
                    'volatility': 'mean',
                    'beta': 'mean',
                    'market_cap': 'mean'
                })
            ).reset_index()
            
            # Fix column names after resampling
            weekly_df = weekly_df.rename(columns={'level_0': 'company'})
        except Exception as e:
            print(f"Warning: Error in resampling but using original data: {e}")
            weekly_df = df.copy()
        
        print("Starting data storage...")
        print(f"Total records to process: {len(weekly_df)}")
        
        # Store initial data
        print("Storing market data...")
        try:
            db_manager.store_initial_data(weekly_df)
        except Exception as e:
            print(f"Warning: Error storing initial data but continuing: {e}")
        
        # Create and store vectors for initial data
        print("Creating vectors...")
        errors_count = 0
        success_count = 0
        
        for company in weekly_df['company'].unique():
            try:
                company_data = weekly_df[weekly_df['company'] == company]
                
                for _, row in company_data.iterrows():
                    try:
                        # Skip if all metrics are zero
                        if (row['portfolio_value'] == 0 and 
                            row['volatility'] == 0 and 
                            row['beta'] == 0 and 
                            row['market_cap'] == 0):
                            continue
                        
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
                            date=row['date'],
                            vector=vector,
                            data=row.to_dict()
                        )
                        success_count += 1
                        
                        if success_count % 100 == 0:
                            print(f"Successfully processed {success_count} records")
                            
                    except Exception as e:
                        errors_count += 1
                        print(f"Warning: Error processing row for {company}, skipping: {e}")
                        continue
                
                print(f"Processed company: {company}")
                
            except Exception as e:
                print(f"Warning: Error processing company {company}, skipping: {e}")
                errors_count += 1
                continue
        
        print(f"\nProcessing complete!")
        print(f"Successfully processed: {success_count} records")
        print(f"Errors encountered: {errors_count} records")
        return db_manager
        
    except Exception as e:
        print(f"Critical error during database initialization: {e}")
        print("DataFrame info:")
        print(weekly_df.info())
        print("\nFirst few rows:")
        print(weekly_df.head())
        return None

if __name__ == "__main__":
    db_manager = MongoDBManager()
    
    # First optimize existing data
    print("Optimizing storage...")
    try:
        db_manager.optimize_storage()
    except Exception as e:
        print(f"Warning: Error during optimization but continuing: {e}")
    
    # Then initialize with weekly data
    initialize_database()
from pymongo import MongoClient
import pandas as pd
import logging
from typing import List, Dict
import os

class CensusDataAggregator:
    def __init__(self, mongodb_uri: str = "mongodb+srv://abhiadi:Maroofidiot21@empfi.sro5d.mongodb.net/?retryWrites=true&w=majority&appName=EmpFi"):
        """Initialize the aggregator with MongoDB connection"""
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['census_data']
        self.collection = self.db['county_data']
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def create_indexes(self):
        """Create indexes for faster querying"""
        try:
            # Create indexes for common query fields
            self.collection.create_index([("year", 1)])
            self.collection.create_index([("state_fips", 1)])
            self.collection.create_index([("county_fips", 1)])
            self.collection.create_index([("county_name", 1)])
            self.collection.create_index([("total_population", 1)])
            self.collection.create_index([("median_age", 1)])
            self.collection.create_index([("median_household_income", 1)])
            
            self.logger.info("Successfully created indexes")
        except Exception as e:
            self.logger.error(f"Error creating indexes: {str(e)}")

    def process_csv_file(self, file_path: str) -> List[Dict]:
        """Process a single CSV file and return structured documents"""
        try:
            df = pd.read_csv(file_path)
            
            # Extract year from filename
            year = file_path.split('_')[-1].split('.')[0]
            
            documents = []
            for _, row in df.iterrows():
                # Parse county name and state
                county_name_full = row[0].strip('"')
                county_state = county_name_full.split(', ')
                
                document = {
                    "county_name": county_state[0],
                    "state": county_state[1],
                    "year": int(year),
                    "total_population": float(row[1]),
                    "median_age": {
                        "total": float(row[2]),
                        "male": float(row[3]),
                        "female": float(row[4])
                    },
                    "demographics": {
                        "white": float(row[5]),
                        "black": float(row[6]),
                        "native": float(row[7]),
                        "asian": float(row[8]),
                        "hispanic": float(row[9])
                    },
                    "economics": {
                        "median_household_income": float(row[10]),
                        "median_family_income": float(row[11]),
                        "poverty_count": float(row[12])
                    },
                    "housing": {
                        "total_units": float(row[13]),
                        "occupied_units": float(row[14]),
                        "owner_occupied": float(row[15]),
                        "renter_occupied": float(row[16]),
                        "median_value": float(row[17]),
                        "median_rent": float(row[18])
                    },
                    "fips": {
                        "state_fips": row[-3],
                        "county_fips": row[-2]
                    }
                }
                documents.append(document)
            
            return documents
            
        except Exception as e:
            self.logger.error(f"Error processing file {file_path}: {str(e)}")
            return []

    def aggregate_census_data(self, data_directory: str):
        """Aggregate all census CSV files from the directory"""
        try:
            # Get all CSV files matching the pattern census_data_county_<year>.csv
            csv_files = [f for f in os.listdir(data_directory) 
                        if f.startswith('census_data_county_') and f.endswith('.csv')]
            
            for csv_file in csv_files:
                file_path = os.path.join(data_directory, csv_file)
                self.logger.info(f"Processing {csv_file}")
                
                # Process file and get documents
                documents = self.process_csv_file(file_path)
                
                if documents:
                    # Insert documents in bulk
                    self.collection.insert_many(documents)
                    self.logger.info(f"Successfully inserted {len(documents)} documents from {csv_file}")
            
            # Create indexes after inserting all documents
            self.create_indexes()
            
        except Exception as e:
            self.logger.error(f"Error in aggregate_census_data: {str(e)}")

if __name__ == "__main__":
    # Initialize aggregator
    aggregator = CensusDataAggregator()

    # Aggregate data from census CSV files
    data_directory = "DataCollection/census_data_csv"
    aggregator.aggregate_census_data(data_directory)
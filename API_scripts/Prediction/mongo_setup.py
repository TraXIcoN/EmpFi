from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class MongoDBManager:
    def __init__(self, uri="mongodb+srv://abhiadi:Maroofidiot21@empfi.sro5d.mongodb.net/?retryWrites=true&w=majority&appName=EmpFi"):
        try:
            self.client = MongoClient(uri)
            self.db = self.client['empfi_db']  # Using empfi_db as database name
            
            # Collections
            self.market_data = self.db['market_data']
            self.vectors = self.db['vectors']
            self.predictions = self.db['predictions']
            
            # Initialize collections and indexes
            self._setup_collections()
            logger.info("MongoDB connection established successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def _setup_collections(self):
        """Setup collections with proper indexes"""
        try:
            # Market Data Collection
            self.market_data.create_index([
                ("company", ASCENDING),
                ("date", DESCENDING)
            ])
            
            # Vectors Collection
            self.vectors.create_index([
                ("company", ASCENDING),
                ("date", DESCENDING)
            ])
            
            # Predictions Collection
            self.predictions.create_index([
                ("timestamp", DESCENDING)
            ])
            
            logger.info("Collections and indexes set up successfully")
            
        except Exception as e:
            logger.error(f"Error setting up collections: {e}")
            raise

    def get_historical_context(self, date_range):
        """Get market data for a specific time period"""
        try:
            return self.market_data.find({
                "date": {
                    "$gte": date_range["start"],
                    "$lte": date_range["end"]
                }
            }).sort("date", DESCENDING).limit(10)
        except Exception as e:
            logger.error(f"Error fetching historical context: {e}")
            return []

    def store_prediction(self, prediction_data):
        """Store a new prediction"""
        try:
            result = self.predictions.insert_one({
                **prediction_data,
                "timestamp": datetime.now()
            })
            logger.info(f"Stored prediction with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error storing prediction: {e}")
            raise

    def get_recent_predictions(self, limit=10):
        """Get recent predictions"""
        try:
            return self.predictions.find().sort(
                "timestamp", DESCENDING
            ).limit(limit)
        except Exception as e:
            logger.error(f"Error fetching recent predictions: {e}")
            return []

    def store_market_data(self, data):
        """Store new market data"""
        try:
            if isinstance(data, dict):
                result = self.market_data.insert_one(data)
            else:  # Assuming it's a list
                result = self.market_data.insert_many(data)
            logger.info("Successfully stored market data")
            return result
        except Exception as e:
            logger.error(f"Error storing market data: {e}")
            raise

    def get_database_size_gb(self):
        """Get database size in GB"""
        try:
            stats = self.db.command("dbStats")
            return stats["dataSize"] / (1024 * 1024 * 1024)
        except Exception as e:
            logger.error(f"Error getting database size: {e}")
            return 0
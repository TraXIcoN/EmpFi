import os
from dotenv import load_dotenv
from fredapi import Fred

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment variable
api_key = os.getenv('FRED_API_KEY')

# Initialize the Fred API client
fred = Fred(api_key=api_key)

# Example usage: Get GDP data
gdp = fred.get_series('GDP')
print(gdp)

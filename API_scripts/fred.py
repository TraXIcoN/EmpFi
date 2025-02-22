import os
from dotenv import load_dotenv
from fredapi import Fred
import pandas as pd
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment variable
api_key = os.getenv('FRED_API_KEY')

# Initialize the Fred API client
fred = Fred(api_key=api_key)

# Example usage: Get GDP data
gdp = fred.get_series('GDP')
print(gdp)

def get_national_inflation():
    """
    Get national inflation data (CPI) from the earliest available date
    Returns CPI-U (All Urban Consumers) which is the most commonly used measure
    """
    # CPIAUCSL is the seasonally adjusted CPI for all urban consumers
    cpi_national = fred.get_series('CPIAUCSL')
    return cpi_national

def get_regional_inflation():
    """
    Get regional CPI data from the earliest available date
    """
    # Complete list of regional CPI series (both seasonally adjusted and non-adjusted)
    regional_codes = {
        'Northeast': ['CUURA101SA0', 'CUUSA101SA0'],  # Urban CPI and All Items
        'Midwest': ['CUURA200SA0', 'CUUSA200SA0'],
        'South': ['CUURA300SA0', 'CUUSA300SA0'],
        'West': ['CUURA400SA0', 'CUUSA400SA0']
    }
    
    regional_data = {}
    for region, codes in regional_codes.items():
        try:
            # Try to get seasonally adjusted data first
            regional_data[region] = fred.get_series(codes[0])
        except:
            try:
                # Fall back to non-seasonally adjusted if needed
                regional_data[region] = fred.get_series(codes[1])
            except:
                print(f"Could not fetch data for {region}")
    
    return regional_data

def get_all_metro_inflation():
    """
    Get CPI data for all available metropolitan areas
    """
    # Complete list of metropolitan area CPI series
    metro_codes = {
        'Atlanta': 'CUURA319SA0',
        'Baltimore': 'CUURA311SA0',
        'Boston': 'CUURA103SA0',
        'Chicago': 'CUURA207SA0',
        'Dallas': 'CUURA316SA0',
        'Denver': 'CUURA433SA0',
        'Detroit': 'CUURA208SA0',
        'Houston': 'CUURA318SA0',
        'Los_Angeles': 'CUURA421SA0',
        'Miami': 'CUURA320SA0',
        'Minneapolis': 'CUURA211SA0',
        'New_York': 'CUURA101SA0',
        'Philadelphia': 'CUURA102SA0',
        'Phoenix': 'CUURA429SA0',
        'San_Diego': 'CUURA424SA0',
        'San_Francisco': 'CUURA422SA0',
        'Seattle': 'CUURA423SA0',
        'St_Louis': 'CUURA209SA0',
        'Tampa': 'CUURA321SA0',
        'Washington_DC': 'CUURA311SA0',
        # Adding non-seasonally adjusted series codes as alternatives
        'Anchorage': 'CUUSA427SA0',
        'Cincinnati': 'CUUSA210SA0',
        'Cleveland': 'CUUSA210SA0',
        'Honolulu': 'CUUSA426SA0',
        'Kansas_City': 'CUUSA213SA0',
        'Milwaukee': 'CUUSA212SA0',
        'Pittsburgh': 'CUUSA104SA0',
        'Portland': 'CUUSA425SA0',
        'San_Jose': 'CUUSA422SA0'
    }
    
    metro_data = {}
    failed_metros = []
    
    for metro, code in metro_codes.items():
        try:
            # Try to get the data with original code
            data = fred.get_series(code)
            # If successful, store the data
            if not data.empty:
                metro_data[metro] = data
            else:
                # Try non-seasonally adjusted version if seasonal adjustment fails
                alt_code = code.replace('CUURA', 'CUUSA')
                data = fred.get_series(alt_code)
                if not data.empty:
                    metro_data[metro] = data
                else:
                    failed_metros.append(metro)
        except:
            failed_metros.append(metro)
    
    if failed_metros:
        print(f"Could not fetch data for the following metros: {', '.join(failed_metros)}")
    
    return metro_data

def get_employment_data():
    """
    Get comprehensive employment data
    """
    employment_codes = {
        'Total_Nonfarm_Employment': 'PAYEMS',  # Total Nonfarm Payrolls
        'Unemployment_Rate': 'UNRATE',  # Unemployment Rate
        'Labor_Force_Participation': 'CIVPART',  # Labor Force Participation Rate
        'Initial_Jobless_Claims': 'ICSA',  # Initial Claims
        'Job_Openings': 'JTSJOL',  # Job Openings
        'Quits_Rate': 'JTSQUR',  # Quits Rate
        'Average_Hourly_Earnings': 'CES0500000003',  # Average Hourly Earnings
        'Employment_Population_Ratio': 'EMRATIO',  # Employment-Population Ratio
        'Part_Time_Employment': 'LNS12600000',  # Part-time Workers
        'Government_Employment': 'CES9000000001'  # Government Employment
    }
    
    return fetch_series_dict(employment_codes, 'employment')

def get_inflation_indicators():
    """
    Get comprehensive inflation and price indicators
    """
    inflation_codes = {
        'CPI_All_Items': 'CPIAUCSL',  # Consumer Price Index
        'Core_CPI': 'CPILFESL',  # Core CPI (excluding food and energy)
        'PPI': 'PPIACO',  # Producer Price Index
        'PCE_Price_Index': 'PCEPI',  # Personal Consumption Expenditures Price Index
        'Core_PCE': 'PCEPILFE',  # Core PCE Price Index
        'Import_Price_Index': 'IR',  # Import Price Index
        'Export_Price_Index': 'IQ',  # Export Price Index
        'GDP_Deflator': 'GDPDEF',  # GDP Deflator
        'Wage_Growth': 'CES0500000003',  # Average Hourly Earnings
        'Trimmed_Mean_PCE': 'PCETRIM12M159SFRBDAL'  # Trimmed Mean PCE Inflation Rate
    }
    
    return fetch_series_dict(inflation_codes, 'inflation')

def get_interest_rates():
    """
    Get comprehensive interest rate data
    """
    interest_codes = {
        'Federal_Funds_Rate': 'FEDFUNDS',  # Federal Funds Rate
        'Treasury_3M': 'DTB3',  # 3-Month Treasury Bill
        'Treasury_2Y': 'DGS2',  # 2-Year Treasury
        'Treasury_10Y': 'DGS10',  # 10-Year Treasury
        'Treasury_30Y': 'DGS30',  # 30-Year Treasury
        'LIBOR_3M': 'USD3MTD156N',  # 3-Month LIBOR
        'Prime_Rate': 'DPRIME',  # Bank Prime Loan Rate
        'Mortgage_30Y': 'MORTGAGE30US',  # 30-Year Fixed Mortgage Rate
        'Corporate_AAA': 'AAA',  # Moody's AAA Corporate Bond
        'Corporate_BAA': 'BAA'  # Moody's BAA Corporate Bond
    }
    
    return fetch_series_dict(interest_codes, 'interest_rates')

def get_gdp_components():
    """
    Get GDP and its components
    """
    gdp_codes = {
        'Real_GDP': 'GDPC1',  # Real GDP
        'Nominal_GDP': 'GDP',  # Nominal GDP
        'Personal_Consumption': 'PCE',  # Personal Consumption Expenditures
        'Private_Investment': 'GPDI',  # Gross Private Domestic Investment
        'Government_Spending': 'GCE',  # Government Consumption Expenditures
        'Exports': 'EXPGS',  # Exports of Goods and Services
        'Imports': 'IMPGS',  # Imports of Goods and Services
        'GDP_Per_Capita': 'A939RX0Q048SBEA',  # Real GDP Per Capita
        'GDI': 'GDI',  # Gross Domestic Income
        'Corporate_Profits': 'CP'  # Corporate Profits
    }
    
    return fetch_series_dict(gdp_codes, 'gdp')

def get_international_data():
    """
    Get international economic indicators
    """
    international_codes = {
        'USD_EUR': 'DEXUSEU',  # USD/EUR Exchange Rate
        'USD_GBP': 'DEXUSUK',  # USD/GBP Exchange Rate
        'USD_JPY': 'DEXJPUS',  # USD/JPY Exchange Rate
        'Trade_Balance': 'BOPGSTB',  # Trade Balance
        'Foreign_Holdings': 'FDHBFIN',  # Foreign Holdings of Treasury Securities
        'Global_Growth': 'NYGDPMKTPCDWLD',  # World GDP Growth
        'Oil_Prices': 'DCOILWTICO',  # WTI Crude Oil Price
        'Gold_Price': 'GOLDAMGBD228NLBM',  # Gold Fixing Price
        'Global_Trade': 'BOPTEXP',  # Global Trade Volume
        'Foreign_Direct_Investment': 'ROWFDNQ027S'  # Foreign Direct Investment
    }
    
    return fetch_series_dict(international_codes, 'international')

def get_financial_indicators():
    """
    Get financial market indicators
    """
    financial_codes = {
        'SP500': 'SP500',  # S&P 500
        'NASDAQ': 'NASDAQCOM',  # NASDAQ Composite
        'VIX': 'VIXCLS',  # VIX Volatility Index
        'M1': 'M1SL',  # M1 Money Supply
        'M2': 'M2SL',  # M2 Money Supply
        'Bank_Credit': 'TOTBKCR',  # Total Bank Credit
        'Consumer_Credit': 'TOTALSL',  # Total Consumer Credit
        'Household_Debt': 'TDSP',  # Household Debt Service Payments
        'Fed_Assets': 'WALCL',  # Federal Reserve Total Assets
        'Margin_Debt': 'BOGZ1FL663067003Q'  # Margin Accounts at Broker-Dealers
    }
    
    return fetch_series_dict(financial_codes, 'financial')

def fetch_series_dict(series_dict, category):
    """
    Helper function to fetch multiple series and handle errors
    """
    data = {}
    failed_series = []
    
    for name, code in series_dict.items():
        try:
            series = fred.get_series(code)
            if not series.empty:
                data[name] = series
            else:
                failed_series.append(name)
        except:
            failed_series.append(name)
    
    if failed_series:
        print(f"Could not fetch the following {category} series: {', '.join(failed_series)}")
    
    return data

def save_to_csv(data_dict, filename):
    """
    Save the time series data to CSV files with metadata
    """
    if not data_dict:
        print(f"No data to save for {filename}")
        return
    
    df = pd.DataFrame(data_dict)
    
    # Add metadata
    metadata = {
        'created_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'number_of_series': len(data_dict),
        'date_range': f"{df.index.min()} to {df.index.max()}",
        'frequency': 'Mixed - See FRED documentation'
    }
    
    # Save metadata to a separate file
    pd.Series(metadata).to_csv(f'{filename}_metadata.csv')
    
    # Save data
    df.to_csv(f'{filename}.csv')
    return df

if __name__ == "__main__":
    # Initialize FRED API
    load_dotenv()
    api_key = os.getenv('FRED_API_KEY')
    fred = Fred(api_key=api_key)
    
    print("Starting comprehensive economic data collection...")
    
    # Collect all datasets
    datasets = {
        'employment': get_employment_data(),
        'inflation': get_inflation_indicators(),
        'interest_rates': get_interest_rates(),
        'gdp': get_gdp_components(),
        'international': get_international_data(),
        'financial': get_financial_indicators()
    }
    
    # Save all datasets
    print("\nSaving datasets to CSV files...")
    for name, data in datasets.items():
        print(f"Processing {name} data...")
        save_to_csv(data, name)
    
    print("\nData collection complete. Check the CSV files for results.")

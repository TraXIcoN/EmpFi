import pandas as pd
import os
from census import Census
from us import states
from datetime import datetime
import numpy as np

# Get the absolute path to the project root directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Your API key
api_key = "bc4cbdcf3840d2071a7672fe69f0773eaaf424c1"

# Initialize Census client
c = Census(api_key)

# Define year ranges for different datasets
YEARS = {
    # 'sf1': [2010],  # Summary File 1 (2010 Census)
    'sf3': [2000],  # Summary File 3 (2000 Census)
    # 'pop': range(2000, 2023)  # Population Estimates
}

# Define variables for each dataset
VARIABLES = {
    'sf1': {
        'NAME': 'Geographic Area Name',
        'P001001': 'Total Population',
        'P003001': 'Total Race Population',
        'P003002': 'White Alone',
        'P003003': 'Black or African American Alone',
        'P003004': 'American Indian and Alaska Native Alone',
        'P003005': 'Asian Alone',
        'P012001': 'Total Population by Sex by Age',
        'H001001': 'Total Housing Units',
        'H003001': 'Total Occupied Housing Units',
        'H003002': 'Occupied Housing Units',
        'H003003': 'Vacant Housing Units'
    },
    'sf3': {
        'NAME': 'Geographic Area Name',
        'P037001': 'Total Population 25 and Over',
        'P037015': "Bachelor's Degree",
        'P037016': "Master's Degree",
        'P037017': 'Professional Degree',
        'P037018': 'Doctorate Degree',
        'P043001': 'Total Workers 16 and Over',
        'P043002': 'Car, Truck, or Van - Drove Alone',
        'P043003': 'Car, Truck, or Van - Carpooled',
        'P043004': 'Public Transportation'
    },
    'pop': {
        'NAME': 'Geographic Area Name',
        'POP': 'Population Estimate',
        'BIRTHS': 'Births',
        'DEATHS': 'Deaths',
        'NETMIG': 'Net Migration',
        'NPOPCHG': 'Net Population Change',
        'NATURALINC': 'Natural Increase',
        'INTERNATIONALMIG': 'International Migration',
        'DOMESTICMIG': 'Domestic Migration'
    }
}

def fetch_census_dataset(dataset, year):
    try:
        print(f"\nFetching {dataset} data for year {year}...")
        all_data = {}
        variables = list(VARIABLES[dataset].keys())
        
        # 1. National level data
        print("Fetching national level data...")
        try:
            if dataset == 'pop':
                national_data = c.get(dataset, year, variables, {'for': 'us:*'})
            elif dataset == 'sf1':
                national_data = c.sf1.get(variables, {'for': 'us:*'}, year=year)
            elif dataset == 'sf3':
                national_data = c.sf3.get(variables, {'for': 'us:*'}, year=year)
            all_data['national'] = pd.DataFrame(national_data)
        except Exception as e:
            print(f"Error fetching national data: {str(e)}")
        
        # 2. State level data
        print("Fetching state level data...")
        try:
            if dataset == 'pop':
                state_data = c.get(dataset, year, variables, {'for': 'state:*'})
            elif dataset == 'sf1':
                state_data = c.sf1.get(variables, {'for': 'state:*'}, year=year)
            elif dataset == 'sf3':
                state_data = c.sf3.get(variables, {'for': 'state:*'}, year=year)
            all_data['state'] = pd.DataFrame(state_data)
        except Exception as e:
            print(f"Error fetching state data: {str(e)}")
        
        # 3. County level data
        print("Fetching county level data...")
        county_data = []
        for state in states.STATES:
            try:
                if dataset == 'pop':
                    counties = c.get(dataset, year, variables, 
                                  {'for': 'county:*', 'in': f'state:{state.fips}'})
                elif dataset == 'sf1':
                    counties = c.sf1.get(variables, 
                                       {'for': 'county:*', 'in': f'state:{state.fips}'}, 
                                       year=year)
                elif dataset == 'sf3':
                    counties = c.sf3.get(variables, 
                                       {'for': 'county:*', 'in': f'state:{state.fips}'}, 
                                       year=year)
                county_data.extend(counties)
            except Exception as e:
                print(f"Error fetching county data for state {state.name}: {str(e)}")
        
        if county_data:
            all_data['county'] = pd.DataFrame(county_data)
        
        return all_data

    except Exception as e:
        print(f"Error fetching {dataset} data for year {year}: {str(e)}")
        return None

def process_and_save_data(data_dict, year, dataset, output_dir):
    if data_dict is None:
        return
    
    for level, df in data_dict.items():
        # Convert year to datetime
        df['year'] = pd.to_datetime(f"{year}-12-31")
        
        # Ensure 'NAME' column exists
        if 'NAME' not in df.columns:
            if level == 'national':
                df['NAME'] = 'United States'
            elif level == 'state':
                df['NAME'] = df['state'].map(lambda x: states.lookup(x).name)
            elif level == 'county':
                df['NAME'] = df.apply(lambda x: f"{states.lookup(x['state']).name} - {x['county']}", axis=1)
        
        # Add variable descriptions and convert to numeric
        new_columns = {}
        for col in df.columns:
            if col in VARIABLES[dataset]:
                new_col = f"{col}_{VARIABLES[dataset][col]}"
                new_columns[col] = new_col
                if col != 'NAME':
                    df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Rename columns
        df = df.rename(columns=new_columns)
        
        # Save to CSV
        csv_filename = os.path.join(output_dir, f"{dataset}_data_{level}_{year}.csv")
        df.to_csv(csv_filename, index=False)
        print(f"Data saved as '{csv_filename}'")

def create_time_series_datasets(output_dir, dataset):
    for level in ['national', 'state', 'county']:
        print(f"\nProcessing {dataset} {level} level time series...")
        all_files = [f for f in os.listdir(output_dir) if f.startswith(f"{dataset}_data_{level}_")]
        
        if all_files:
            dfs = []
            for file in all_files:
                df = pd.read_csv(os.path.join(output_dir, file))
                df['year'] = pd.to_datetime(df['year'])
                dfs.append(df)
            
            # Combine all years
            combined_df = pd.concat(dfs, ignore_index=True)
            
            # Sort by geography and year
            sort_cols = ['year'] if level == 'national' else ['NAME', 'year']
            combined_df = combined_df.sort_values(sort_cols)
            
            # Set up grouping
            combined_df['group'] = 'USA' if level == 'national' else combined_df['NAME']
            
            # Create time series features
            numeric_cols = combined_df.select_dtypes(include=[np.number]).columns
            
            # Pre-allocate new columns
            new_cols = {}
            for col in numeric_cols:
                if col != 'year':
                    grouped = combined_df.groupby('group')[col]
                    new_cols[f'{col}_YoY_Change'] = grouped.pct_change()
                    new_cols[f'{col}_3Y_MA'] = grouped.rolling(window=3, min_periods=1).mean()
                    new_cols[f'{col}_5Y_MA'] = grouped.rolling(window=5, min_periods=1).mean()
            
            # Add all new columns at once
            combined_df = pd.concat([combined_df, pd.DataFrame(new_cols)], axis=1)
            
            # Save time series datasets
            base_filename = os.path.join(output_dir, f"{dataset}_data_{level}")
            combined_df.to_csv(f"{base_filename}_time_series.csv", index=False)
            print(f"Time series data saved as '{base_filename}_time_series.csv'")
            
            # Save temporal aggregations
            yearly_agg = combined_df.groupby(['group', 'year'])[numeric_cols].mean().reset_index()
            yearly_agg.to_csv(f"{base_filename}_yearly_agg.csv", index=False)
            
            if len(dfs) >= 5:  # Only create rolling averages if we have enough years
                rolling_5y = combined_df.groupby('group')[numeric_cols].rolling(window=5, min_periods=1).mean().reset_index()
                rolling_5y.to_csv(f"{base_filename}_5y_rolling.csv", index=False)

# Main execution
print("Starting census data collection...")

# Create output directory
output_dir = os.path.join(base_dir, "DataCollection", "census_data_csv")
os.makedirs(output_dir, exist_ok=True)

# Fetch data for each dataset and year
for dataset, years in YEARS.items():
    print(f"\nCollecting {dataset} data...")
    for year in years:
        data_dict = fetch_census_dataset(dataset, year)
        process_and_save_data(data_dict, year, dataset, output_dir)
    
    # Create time series datasets for datasets with multiple years
    if len(years) > 1:
        create_time_series_datasets(output_dir, dataset)

print("\nCensus data collection completed!")


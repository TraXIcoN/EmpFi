import requests
import pandas as pd
import os

# Your API key
api_key = "bc4cbdcf3840d2071a7672fe69f0773eaaf424c1"

def fetch_variables(endpoint):
    # Define the endpoint for variables
    variables_endpoint = f"{endpoint}/variables.json"
    
    # Make the request
    response = requests.get(variables_endpoint)
    
    # Check if the request was successful
    if response.status_code == 200:
        variables_data = response.json()
        return variables_data['variables']
    else:
        print(f"Error fetching variables from {variables_endpoint}: {response.status_code} - {response.text}")
        return None

def fetch_census_data(endpoint, variables):
    # Construct the 'get' parameter with the specified variables
    get_param = ','.join(variables)
    
    params = {
        "get": get_param,         # All specified variables
        "for": "state:*",         # Example geography: all states
        "key": api_key            # Your API key
    }

    # Make the request
    response = requests.get(endpoint, params=params)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()

        # Convert the data to a Pandas DataFrame
        df = pd.DataFrame(data[1:], columns=data[0])  # First row as header
        
        return df
    else:
        print(f"Error fetching census data from {endpoint}: {response.status_code} - {response.text}")
        return None

# Main execution
with open('DataCollection/api_base_urls.txt', 'r') as file:
    urls = file.readlines()

# Example variable mapping for different datasets
variable_mapping = {
    "http://api.census.gov/data/2023/acs/acs5": ["YEAR", "B01001_001E"],  # Example variables for ACS 5
    "http://api.census.gov/data/2022/cps/basic": ["YEAR", "B23001_001E"],  # Example variables for CPS Basic
    # Add more mappings as needed for other datasets
}

# Create a directory to save CSV files if it doesn't exist
output_dir = 'census_data_csv'
os.makedirs(output_dir, exist_ok=True)

# Loop through each URL and fetch data
for url in urls:
    url = url.strip()
    if url in variable_mapping:
        variables = variable_mapping[url]
        df = fetch_census_data(url, variables)
        if df is not None:
            # Generate a filename based on the URL or dataset name
            dataset_name = url.split('/')[-2]  # Extract dataset name from URL
            csv_filename = os.path.join(output_dir, f"{dataset_name}.csv")
            
            # Save the DataFrame to a CSV file
            df.to_csv(csv_filename, index=False)
            print(f"Data fetched from {url} and saved as '{csv_filename}'.")

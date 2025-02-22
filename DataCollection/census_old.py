import requests
import pandas as pd
import os
import json

# Get the absolute path to the project root directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
variables_path = os.path.join(base_dir, "DataCollection", "variables_data")

# Your API key
api_key = "bc4cbdcf3840d2071a7672fe69f0773eaaf424c1"

def create_variable_mapping(variable_output_file):
    variable_mapping = {}
    
    with open(variable_output_file, 'r') as file:
        for line in file:
            parts = line.split(" fetched from ")
            if len(parts) == 2:
                url = parts[1].split(" and saved as ")[0].strip()
                json_file = parts[1].split("saved as '")[1].strip().rstrip("'.").replace("variables_data_new", "variables_data")
                # Convert to absolute path
                json_file_path = os.path.join(base_dir, "DataCollection", json_file)
                if os.path.exists(json_file_path):
                    variable_mapping[url] = json_file_path
                else:
                    print(f"Skipping {url} - JSON file not found: {json_file_path}")
    
    return variable_mapping

def fetch_variables(json_file_path):
    try:
        with open(json_file_path, 'r') as file:
            variables_data = json.load(file)
            variables_string = ','.join(list(variables_data.keys()))
            print(f"Variables found in {json_file_path}: {variables_string}")
            return variables_string
    except FileNotFoundError:
        print(f"Error: The file {json_file_path} does not exist.")
        return None
    except json.JSONDecodeError:
        print(f"Error: The file {json_file_path} is not a valid JSON.")
        return None

def fetch_census_data(endpoint, json_file_path):
    print(f"\nProcessing URL: {endpoint}")
    print(f"Using variables file: {json_file_path}")
    
    get_param = fetch_variables(json_file_path)

    if get_param is None:
        print(f"No variables found in {json_file_path}")
        return None

    full_url = f"{endpoint}?get={get_param}&for=state:*&key={api_key}"
    print(f"Making request to: {full_url}")
    
    try:
        response = requests.get(full_url)
        response.raise_for_status()
        
        data = response.json()
        df = pd.DataFrame(data[1:], columns=data[0])
        print(f"Successfully fetched data with {len(df)} rows")
        return df
    except requests.exceptions.RequestException as e:
        print(f"Error fetching census data: {str(e)}")
        return None

# Main execution
print("Starting census data collection...")

# Create output directory with absolute path
output_dir = os.path.join(base_dir, "DataCollection", "census_data_csv")
os.makedirs(output_dir, exist_ok=True)

# Use absolute path for api_base_urls.txt
urls_file = os.path.join(base_dir, "DataCollection", "api_base_urls.txt")
with open(urls_file, 'r') as file:
    urls = file.readlines()

print(f"\nCreating variable mapping...")
variable_output_file = os.path.join(base_dir, "DataCollection", "variable_output.txt")
variable_mapping = create_variable_mapping(variable_output_file)
print(f"Found {len(variable_mapping)} valid variable mappings")

for url in urls:
    url = url.strip()
    if url in variable_mapping:
        json_file_path = variable_mapping[url]
        df = fetch_census_data(url, json_file_path)
        if df is not None:
            dataset_name = url.split('/')[-2]
            csv_filename = os.path.join(output_dir, f"{dataset_name}.csv")
            df.to_csv(csv_filename, index=False)
            print(f"Data saved as '{csv_filename}'")
    else:
        print(f"\nSkipping URL (no valid mapping): {url}")

print("\nCensus data collection completed!")


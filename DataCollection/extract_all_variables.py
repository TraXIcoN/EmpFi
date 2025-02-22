import requests
import os
import json

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

# Create a directory to save variable data if it doesn't exist
output_dir = 'variables_data_new'
os.makedirs(output_dir, exist_ok=True)

# Main execution
with open('api_base_urls.txt', 'r') as file:
    urls = file.readlines()

# Loop through each URL and fetch variables
for url in urls:
    url = url.strip()
    variables = fetch_variables(url)
    if variables is not None:
        # Save the variables to a JSON file
        dataset_name = url.split('/')[-2]  # Extract dataset name from URL
        json_filename = os.path.join(output_dir, f"{dataset_name}_variables.json")
        
        with open(json_filename, 'w') as json_file:
            json.dump(variables, json_file, indent=4)
        
        print(f"Variables fetched from {url} and saved as '{json_filename}'.")
# ... existing imports ...
from bs4 import BeautifulSoup

# Load your HTML content from a file
with open('data.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

# Find all rows in the table
rows = soup.find_all('tr')

# Extract the API Base URLs
api_base_urls = []
for row in rows:
    cells = row.find_all('td')
    if len(cells) > 11:  # Ensure there are enough cells
        api_base_url = cells[11].get_text(strip=True)  # 12th cell contains the API Base URL
        api_base_urls.append(api_base_url)  # Store the URL in the list

# Write the URLs to a text file
with open('api_base_urls.txt', 'w', encoding='utf-8') as file:
    for url in api_base_urls:
        file.write(url + '\n')  # Write each URL on a new line

# Output the result
if api_base_urls:
    print("API Base URLs extracted and saved to 'api_base_urls.txt'.")
else:
    print("No API Base URLs found.")
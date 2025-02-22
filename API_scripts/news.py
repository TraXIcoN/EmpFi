import requests

url = 'https://newsapi.org/v2/everything?q=economy&apiKey=your-api-key'
response = requests.get(url)
news = response.json()
print(news['articles'])

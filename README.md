# EmpFi

This repository is for hacklytics 2025.

# Backend Branch of the Repository

This is the backend branch of our repository, consisting of various technologies including AWS, Python, MongoDB, and Redis. This branch is designed to handle data processing, storage, and API interactions for our application.

## Folder Structure

- **Data_Collection**: This folder is dedicated to storing historical data. It contains scripts and resources for collecting and managing data over time.

- **API_Scripts**: This folder includes scripts that interact with external APIs. For example, it contains scripts for fetching news data and performing sentiment analysis. These scripts utilize various APIs to gather relevant information for our application.

### Technologies Used

- **AWS**: For cloud services and hosting.
- **Python**: The primary programming language used for backend development.
- **MongoDB**: A NoSQL database used for storing data.
- **Redis**: An in-memory data structure store used for caching and real-time data processing.

### Script Execution

The script `challenge_optimized.py` contains functions for computing storefront impressions and visualizing results. To prevent automatic execution when imported, the main execution code is wrapped in an `if __name__ == "__main__":` block. This allows the functions to be imported without running the script automatically.

from datetime import time
import pandas as pd
import json
import openai
import os
from sklearn.model_selection import train_test_split
from datetime import datetime
from model_management import ModelManager

def prepare_training_data():
    # Load your generated data
    df = pd.read_csv('investment_portfolio_timeseries.csv')
    
    # Convert data into training examples
    training_examples = []

    # Group by company and location to create historical context
    for (company, state, county), group in df.groupby(['company', 'state_fips', 'county_fips']):
        # Sort by date
        group = group.sort_values('date')

        # Create sliding windows of historical data
        window_size = 12  # 12 months of history
        for i in range(len(group) - window_size):
            history = group.iloc[i:i+window_size]
            future = group.iloc[i+window_size]
            
            # Create prompt
            prompt = f"""Given the following 12-month history for {company} in state {state}, county {county}:
            Portfolio Values: {list(history['portfolio_value'])}
            Volatility: {list(history['volatility'])}
            Market Cap: {list(history['market_cap'])}
            Beta: {list(history['beta'])}
            
            What will be the portfolio value in the next month?"""
            
            # Create completion (actual outcome)
            completion = f"Based on the historical data and market conditions, the portfolio value will be {future['portfolio_value']:.2f}"
            
            training_examples.append({
                "messages": [
                    {"role": "system", "content": "You are a financial analyst expert at predicting investment portfolio performance."},
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": completion}
                ]
            })
    
    return training_examples

def save_training_file():
    examples = prepare_training_data()
    
    # Save in JSONL format required by OpenAI
    with open('training_data.jsonl', 'w') as f:
        for example in examples:
            f.write(json.dumps(example) + '\n')
    
    # Upload training file to OpenAI
    training_file = openai.File.create(
        file=open('training_data.jsonl', 'rb'),
        purpose='fine-tune'
    )
    
    return training_file.id

def start_fine_tuning(file_id):
    # Start fine-tuning job
    fine_tune_job = openai.FineTuningJob.create(
        training_file=file_id,
        model="gpt-3.5-turbo",  # or "gpt-4" if you have access
        hyperparameters={
            "n_epochs": 3,
            "batch_size": 4,
            "learning_rate_multiplier": 0.1
        }
    )
    
    return fine_tune_job.id

def create_evaluation_set():
    # Create separate evaluation examples
    eval_examples = []
    df = pd.read_csv('../../investment_portfolio_timeseries.csv')
    
    # Use last 3 months of data for evaluation
    latest_data = df[df['date'] >= df['date'].max() - pd.Timedelta(days=90)]
    
    for _, row in latest_data.iterrows():
        eval_examples.append({
            "prompt": f"Predict the performance of {row['company']} given current portfolio value: {row['portfolio_value']}, volatility: {row['volatility']}, beta: {row['beta']}",
            "ideal_completion": f"Portfolio value prediction: {row['portfolio_value']}"
        })
    
    return eval_examples

def test_fine_tuned_model(model_id):
    # Test the fine-tuned model
    response = openai.ChatCompletion.create(
        model=model_id,
        messages=[
            {"role": "system", "content": "You are a financial analyst expert at predicting investment portfolio performance."},
            {"role": "user", "content": "Given TechGrowth Fund with current portfolio value of 150, volatility of 0.2, and beta of 1.1, what will be the likely portfolio value next month?"}
        ]
    )
    
    return response.choices[0].message.content

def fine_tune_model():
    model_manager = ModelManager()
    
    # Check if we already have a fine-tuned model
    if model_manager.get_current_model():
        print(f"Using existing fine-tuned model: {model_manager.get_current_model()}")
        return model_manager.get_current_model()
    
    # Otherwise, proceed with fine-tuning
    try:
        # Prepare and upload training data
        file_id = save_training_file()
        print(f"Training file uploaded with ID: {file_id}")
        
        # Start fine-tuning
        job_id = start_fine_tuning(file_id)
        print(f"Fine-tuning job started with ID: {job_id}")
        
        # Monitor fine-tuning progress
        while True:
            job = openai.FineTuningJob.retrieve(job_id)
            print(f"Status: {job.status}")
            if job.status in ['succeeded', 'failed']:
                break
            time.sleep(60)
        
        if job.status == 'succeeded':
            model_id = job.fine_tuned_model
            # Register the new model
            model_manager.register_model(
                model_id,
                training_details={
                    'file_id': file_id,
                    'job_id': job_id,
                    'training_date': datetime.now().isoformat()
                }
            )
            
            # Test the model
            test_result = test_fine_tuned_model(model_id)
            print(f"Test prediction: {test_result}")
            
            return model_id
        else:
            raise Exception("Fine-tuning failed")
            
    except Exception as e:
        print(f"Error during fine-tuning: {str(e)}")
        return None

if __name__ == "__main__":
    openai.api_key = os.getenv('OPENAI_API_KEY')
    fine_tune_model()

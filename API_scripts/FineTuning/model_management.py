import json
import os
from datetime import datetime

class ModelManager:
    def __init__(self, config_path='config/model_config.json'):
        self.config_path = config_path
        self.config = self.load_config()

    def load_config(self):
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                return json.load(f)
        return {
            'models': [],
            'current_model': None
        }

    def save_config(self):
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)

    def register_model(self, model_id, training_details=None, parent_model=None):
        model_info = {
            'model_id': model_id,
            'created_at': datetime.now().isoformat(),
            'training_details': training_details,
            'status': 'active',
            'parent_model': parent_model,
            'version': len(self.config['models']) + 1
        }
        self.config['models'].append(model_info)
        self.config['current_model'] = model_id
        self.save_config()
        return model_id

    def get_current_model(self):
        return self.config.get('current_model')

    def get_model_details(self, model_id):
        for model in self.config['models']:
            if model['model_id'] == model_id:
                return model
        return None

    def get_model_history(self):
        """Get the evolution of models over time"""
        return [{
            'version': model['version'],
            'model_id': model['model_id'],
            'created_at': model['created_at'],
            'training_details': model['training_details']
        } for model in self.config['models']]

# Update your fine_tune.py to use ModelManager
def main():
    model_manager = ModelManager()
    
    # If we already have a fine-tuned model, we can use it
    if model_manager.get_current_model():
        print(f"Using existing fine-tuned model: {model_manager.get_current_model()}")
        return model_manager.get_current_model()
    
    # Otherwise, proceed with fine-tuning
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    file_id = save_training_file()
    print(f"Training file uploaded with ID: {file_id}")
    
    job_id = start_fine_tuning(file_id)
    print(f"Fine-tuning job started with ID: {job_id}")
    
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
        return model_id
    else:
        raise Exception("Fine-tuning failed")

# Update your API to use ModelManager

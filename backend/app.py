from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
import numpy as np
from PIL import Image
import io
import os
from datetime import datetime
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
MODEL_PATH = os.getenv('MODEL_PATH', 'models/DenseNet-121.pth')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Disease classes (update based on your model)
DISEASE_CLASSES = [
    'Healthy',
    'Cutting Weevil',
    'Gall Midge',
    'Sooty Mould'
]

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Load PyTorch model
model = None
if os.path.exists(MODEL_PATH):
    try:
        # Initialize DenseNet-121 architecture
        model = models.densenet121(pretrained=False)
        num_features = model.classifier.in_features
        model.classifier = nn.Linear(num_features, len(DISEASE_CLASSES))
        
        # Load weights
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model = model.to(device)
        model.eval()
        print(f"Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        model = None
else:
    print(f"Warning: Model not found at {MODEL_PATH}")

# Define image transformations for PyTorch
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def preprocess_image(image_bytes):
    """Preprocess image for PyTorch model prediction"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB')
        img_tensor = transform(img)
        img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension
        return img_tensor
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def get_weather_data(latitude, longitude):
    """Fetch weather data from OpenWeatherMap API"""
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'description': data['weather'][0]['description'],
            'wind_speed': data['wind']['speed']
        }
    except Exception as e:
        print(f"Error fetching weather data: {str(e)}")
        return None

def get_region_from_coordinates(latitude, longitude):
    """Get region name using reverse geocoding (Nominatim)"""
    try:
        url = f"https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': latitude,
            'lon': longitude,
            'format': 'json'
        }
        headers = {
            'User-Agent': 'MangoDiseasePredictionApp/1.0'
        }
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        address = data.get('address', {})
        region = address.get('state', address.get('region', 'Unknown'))
        country = address.get('country', '')
        
        return f"{region}, {country}" if country else region
    except Exception as e:
        print(f"Error in reverse geocoding: {str(e)}")
        return "Unknown Region"

def get_season(month):
    """Determine season based on month (India-centric)"""
    if month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    elif month in [10, 11]:
        return "Post-Monsoon"
    else:  # 12, 1, 2
        return "Winter"

def get_pest_alerts(region, season, disease):
    """Get pest risk alerts from database"""
    try:
        current_month = datetime.now().month
        
        # Query pest_risk table
        response = supabase.table('pest_risk').select('*').execute()
        
        alerts = []
        for risk in response.data:
            # Check if current month falls within risk period
            if risk['start_month'] <= current_month <= risk['end_month']:
                if region.lower() in risk['region'].lower():
                    alerts.append({
                        'disease': risk['disease'],
                        'severity': risk['severity'],
                        'description': risk['description']
                    })
        
        return alerts
    except Exception as e:
        print(f"Error fetching pest alerts: {str(e)}")
        return []

def save_prediction_to_db(prediction_data):
    """Save prediction data to Supabase"""
    try:
        response = supabase.table('predictions').insert(prediction_data).execute()
        return response.data
    except Exception as e:
        print(f"Error saving to database: {str(e)}")
        return None

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'message': 'Mango Disease Prediction API',
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Get metadata
        latitude = float(request.form.get('latitude', 0))
        longitude = float(request.form.get('longitude', 0))
        
        # Read image
        image_bytes = file.read()
        
        # Preprocess and predict
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        processed_image = preprocess_image(image_bytes)
        processed_image = processed_image.to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(processed_image)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            predictions = probabilities.cpu().numpy()[0]
        
        # Get prediction results
        predicted_class_idx = np.argmax(predictions)
        confidence = float(predictions[predicted_class_idx]) * 100
        disease = DISEASE_CLASSES[predicted_class_idx]
        
        # Get weather data
        weather = get_weather_data(latitude, longitude)
        temperature = weather['temperature'] if weather else None
        humidity = weather['humidity'] if weather else None
        
        # Get region
        region = get_region_from_coordinates(latitude, longitude)
        
        # Determine season
        current_month = datetime.now().month
        season = get_season(current_month)
        
        # Get pest alerts
        alerts = get_pest_alerts(region, season, disease)
        alert_message = ""
        if alerts:
            high_severity_alerts = [a for a in alerts if a['severity'] == 'High']
            if high_severity_alerts:
                alert_message = f"High risk of {high_severity_alerts[0]['disease']} outbreak in {region} during {season}."
        
        # Prepare database record
        timestamp = datetime.utcnow().isoformat()
        prediction_data = {
            'disease': disease,
            'confidence': confidence,
            'latitude': latitude,
            'longitude': longitude,
            'region': region,
            'temperature': temperature,
            'humidity': humidity,
            'season': season,
            'timestamp': timestamp
        }
        
        # Save to database
        save_prediction_to_db(prediction_data)
        
        # Prepare response
        response_data = {
            'class': disease,
            'confidence': round(confidence, 2),
            'region': region,
            'temperature': temperature,
            'humidity': humidity,
            'season': season,
            'alert': alert_message if alert_message else None,
            'all_predictions': {
                DISEASE_CLASSES[i]: round(float(predictions[i]) * 100, 2) 
                for i in range(len(DISEASE_CLASSES))
            },
            'timestamp': timestamp
        }
        
        return jsonify(response_data), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/alerts', methods=['GET'])
def get_alerts():
    """Get pest alerts for a specific region"""
    try:
        region = request.args.get('region', '')
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        
        # Get region from coordinates if not provided
        if not region and latitude and longitude:
            region = get_region_from_coordinates(latitude, longitude)
        
        if not region:
            return jsonify({'error': 'Region or coordinates required'}), 400
        
        # Get current season
        current_month = datetime.now().month
        season = get_season(current_month)
        
        # Get alerts
        alerts = get_pest_alerts(region, season, None)
        
        return jsonify({
            'region': region,
            'season': season,
            'month': current_month,
            'alerts': alerts,
            'count': len(alerts)
        }), 200
        
    except Exception as e:
        print(f"Error fetching alerts: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get prediction statistics"""
    try:
        # Get recent predictions
        response = supabase.table('predictions')\
            .select('*')\
            .order('timestamp', desc=True)\
            .limit(100)\
            .execute()
        
        predictions = response.data
        
        # Calculate statistics
        total_predictions = len(predictions)
        disease_counts = {}
        
        for pred in predictions:
            disease = pred.get('disease', 'Unknown')
            disease_counts[disease] = disease_counts.get(disease, 0) + 1
        
        return jsonify({
            'total_predictions': total_predictions,
            'disease_distribution': disease_counts,
            'recent_predictions': predictions[:10]
        }), 200
        
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

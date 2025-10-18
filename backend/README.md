# Backend README

## Flask API for Mango Disease Detection

This is the backend API that powers the Mango Disease Detection mobile application.

## Setup Instructions

1. **Install Python Dependencies**:

```bash
pip install -r requirements.txt
```

2. **Configure Environment Variables**:
   Create a `.env` file with the following:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
OPENWEATHER_API_KEY=your_openweathermap_api_key
MODEL_PATH=models/mango_disease_model.h5
PORT=5000
```

3. **Set Up Supabase Database**:

- Create a Supabase project at https://supabase.com
- Go to the SQL Editor
- Run the SQL script from `database/schema.sql`

4. **Add Your ML Model**:

- Place your trained TensorFlow/Keras model at `models/mango_disease_model.h5`
- The model should accept 224x224 RGB images
- Output should be 8 classes (Healthy + 7 diseases)

5. **Run the Server**:

```bash
python app.py
```

The API will start at `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /
```

### Predict Disease

```
POST /predict
Content-Type: multipart/form-data

Parameters:
- file: Image file (required)
- latitude: GPS latitude (optional)
- longitude: GPS longitude (optional)
```

### Get Alerts

```
GET /alerts?region=Tamil Nadu, India
or
GET /alerts?latitude=12.84&longitude=80.15
```

### Get Statistics

```
GET /stats
```

## Docker Deployment

Build the image:

```bash
docker build -t mango-disease-api .
```

Run the container:

```bash
docker run -p 5000:5000 --env-file .env mango-disease-api
```

## Model Requirements

Your model should:

- Accept input shape: (224, 224, 3)
- Output 8 classes in this order:
  1. Healthy
  2. Anthracnose
  3. Bacterial Canker
  4. Cutting Weevil
  5. Die Back
  6. Gall Midge
  7. Powdery Mildew
  8. Sooty Mould

## External APIs

- **OpenWeatherMap**: Get a free API key at https://openweathermap.org/api
- **Nominatim**: Free reverse geocoding (no API key required)
- **Supabase**: Database and backend services

## Testing

Test the prediction endpoint:

```bash
curl -X POST -F "file=@test_image.jpg" -F "latitude=12.84" -F "longitude=80.15" http://localhost:5000/predict
```

## Production Deployment

Recommended platforms:

- Render
- Railway
- Heroku
- AWS ECS
- Azure App Service

Make sure to:

1. Set environment variables
2. Upload your ML model
3. Configure CORS for your mobile app domain
4. Use HTTPS in production

# 🥭 Mango Disease Detection App

A comprehensive mobile application for detecting mango leaf diseases using Machine Learning, integrated with real-time weather data, geolocation, and seasonal pest risk alerts.

## 📋 Overview

This project consists of two main components:

1. **Mobile App** (React Native with Expo) - User-facing mobile application
2. **Backend API** (Flask + TensorFlow) - ML model inference and data management

## ✨ Features

- 📸 **Disease Detection**: Upload or capture mango leaf images for instant disease diagnosis
- 📍 **Location-Based Insights**: Automatically detect user location for region-specific analysis
- 🌦️ **Weather Integration**: Fetch real-time temperature and humidity data
- 🗓️ **Seasonal Alerts**: Receive pest outbreak warnings based on region and season
- 💾 **Data Logging**: All predictions stored in Supabase with comprehensive metadata
- 📊 **Analytics Dashboard**: View prediction statistics and trends
- 🔔 **Pest Risk Alerts**: Region-specific disease risk notifications

## 🏗️ System Architecture

```
┌─────────────────────────────┐
│     React Native App         │
│ ─────────────────────────── │
│ 📸 Capture/Upload Image      │
│ 📍 Get Location + Weather     │
│ 🌦️ Display Prediction + Alert│
│ 🧾 Sends Data → Flask API     │
└──────────────┬────────────────┘
               │  (HTTPS POST)
               ▼
┌────────────────────────────────────┐
│         Flask Backend               │
│────────────────────────────────────│
│ 🔹 Receives image + metadata        │
│ 🔹 Runs ML inference (TF/Keras)     │
│ 🔹 Fetches weather info (API)       │
│ 🔹 Stores record → Supabase         │
│ 🔹 Returns prediction + alerts      │
└──────────────┬──────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌─────────────┐   ┌──────────────┐
│ ML Model    │   │ Supabase DB  │
│ (TensorFlow)│   │ (PostgreSQL) │
└─────────────┘   └──────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.10+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- OpenWeatherMap API key

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

5. Configure environment variables in `.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
OPENWEATHER_API_KEY=your_openweathermap_api_key
MODEL_PATH=models/mango_disease_model.h5
PORT=5000
```

6. Set up the database:

   - Create a new Supabase project
   - Run the SQL script in `backend/database/schema.sql` in the Supabase SQL Editor

7. Add your trained ML model:

   - Place your trained model file at `backend/models/mango_disease_model.h5`
   - Ensure it's a TensorFlow/Keras model that accepts 224x224 RGB images

8. Run the Flask server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Mobile App Setup

1. Navigate to the mobile app directory:

```bash
cd mobile-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url:5000
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_api_key
```

5. Start the Expo development server:

```bash
npx expo start
```

6. Run on your device:
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 📱 Mobile App Structure

```
mobile-app/
├── App.js                 # Main app component with navigation
├── screens/
│   ├── HomeScreen.js      # Disease detection screen
│   ├── AlertsScreen.js    # Pest alerts and prevention tips
│   └── StatsScreen.js     # Analytics dashboard
├── services/
│   └── api.js             # API and location service utilities
└── app.json               # Expo configuration
```

## 🔧 Backend Structure

```
backend/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── database/
│   └── schema.sql        # Database schema
└── models/
    └── [your_model.h5]   # ML model file (not included)
```

## 🗄️ Database Schema

### `predictions` Table

- `id`: Unique identifier
- `disease`: Predicted disease name
- `confidence`: Prediction confidence (0-100)
- `latitude`, `longitude`: GPS coordinates
- `region`: Derived location name
- `temperature`, `humidity`: Weather data
- `season`: Current season
- `timestamp`: Prediction timestamp

### `pest_risk` Table

- `id`: Unique identifier
- `disease`: Disease/pest name
- `region`: Affected region
- `start_month`, `end_month`: Risk period
- `description`: Prevention/treatment info
- `severity`: Low/Medium/High

## 🌐 API Endpoints

### `POST /predict`

Upload an image for disease prediction

```json
{
  "file": "<image file>",
  "latitude": 12.84,
  "longitude": 80.15
}
```

### `GET /alerts`

Get pest risk alerts for a region

```
?region=Tamil Nadu, India
or
?latitude=12.84&longitude=80.15
```

### `GET /stats`

Get prediction statistics and analytics

### `GET /`

Health check endpoint

## 🧪 Disease Classes

The model currently detects the following conditions:

- Healthy
- Anthracnose
- Bacterial Canker
- Cutting Weevil
- Die Back
- Gall Midge
- Powdery Mildew
- Sooty Mould

## 🚢 Deployment

### Backend Deployment (Docker)

1. Build the Docker image:

```bash
cd backend
docker build -t mango-disease-api .
```

2. Run the container:

```bash
docker run -p 5000:5000 --env-file .env mango-disease-api
```

### Recommended Platforms

- **Backend**: Render, Railway, Azure App Service, AWS ECS
- **Database**: Supabase (hosted PostgreSQL)
- **Mobile App**: EAS Build for production apps

## 📊 External APIs Used

- **OpenWeatherMap**: Weather data (temperature, humidity)
- **Nominatim (OpenStreetMap)**: Reverse geocoding for location names
- **Supabase**: Database and backend services

## 🔐 Environment Variables

See `.env.example` files in both `backend/` and `mobile-app/` directories for required configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- TensorFlow/Keras for ML framework
- Expo for React Native development platform
- Supabase for database infrastructure
- OpenWeatherMap for weather data

## 📧 Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Note**: This app requires a trained ML model file (`mango_disease_model.h5`). Please ensure you have a properly trained model before deploying.

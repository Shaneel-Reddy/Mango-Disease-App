# Mango Disease Detection App - Frontend

A React Native (Expo) mobile application for detecting mango leaf diseases using Machine Learning.

## 🎯 Features

- **Disease Detection**: Upload or capture mango leaf images for instant disease detection
- **Weather Integration**: Real-time weather data with location-based insights
- **Pest Alerts**: Regional pest and disease risk alerts based on season and location
- **Analytics Dashboard**: Track history and statistics of disease predictions
- **Offline Support**: Basic functionality even without internet connection

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Navigation**: Expo Router (File-based routing)
- **State Management**: React Query (@tanstack/react-query)
- **APIs**:
  - Flask Backend for ML predictions
  - OpenWeatherMap for weather data
  - Expo Location for GPS services

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo Go app on your mobile device (iOS/Android)
- Or iOS Simulator / Android Emulator

### Setup Steps

1. **Clone and navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root of the frontend directory:

   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_URL:5000
   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
   ```

   - Get your OpenWeatherMap API key from: https://openweathermap.org/api
   - Replace `YOUR_BACKEND_URL` with your Flask backend URL

4. **Start the development server**:

   ```bash
   npm start
   ```

   Or with specific platforms:

   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   npm run web      # For Web
   ```

5. **Scan QR code**: Open Expo Go app and scan the QR code displayed in the terminal

## 📱 App Structure

```
frontend/
├── app/                      # Screens (Expo Router)
│   ├── _layout.tsx          # Tab navigation layout
│   ├── index.tsx            # Home screen - Disease detection
│   ├── alerts.tsx           # Pest & disease alerts
│   └── stats.tsx            # Analytics & statistics
│
├── components/              # Reusable components
│   ├── ImageUploader.tsx    # Camera/gallery image picker
│   ├── PredictionCard.tsx   # Disease prediction results
│   ├── WeatherCard.tsx      # Weather information display
│   ├── AlertCard.tsx        # Alert item component
│   ├── LoadingIndicator.tsx # Loading spinner
│   └── AppProviders.tsx     # React Query provider
│
├── services/                # API and service layer
│   ├── api.ts              # Backend API calls
│   ├── weather.ts          # Weather API integration
│   └── location.ts         # Location services
│
├── constants/               # App configuration
│   ├── config.ts           # Environment config
│   └── colors.ts           # Theme colors
│
└── assets/                  # Images and static files
```

## 🎨 Design System

### Color Palette

- **Primary**: `#FBBF24` (Mango Yellow) - Main theme color
- **Accent**: `#047857` (Deep Green) - Secondary actions
- **Background**: `#F9FAFB` (Light Gray) - App background

### Confidence Indicators

- 🟢 **High** (>85%): Green - Confident prediction
- 🟡 **Medium** (60-85%): Yellow - Moderate confidence
- 🔴 **Low** (<60%): Red - Low confidence

## 🔧 Configuration

### Permissions

The app requires the following permissions:

- **Camera**: To capture mango leaf images
- **Photo Library**: To select images from gallery
- **Location**: For weather data and regional alerts

These are automatically configured in `app.json`.

### Backend Integration

Update the API URL in `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000
```

**Note**:

- For local testing on a physical device, use your computer's IP address (not localhost)
- For emulator, you can use `http://10.0.2.2:5000` (Android) or `http://localhost:5000` (iOS)

## 📡 API Endpoints Used

### Backend API

- `POST /predict` - Disease prediction from image
- `GET /alerts?latitude=<lat>&longitude=<lon>` - Get regional alerts
- `GET /stats` - Get analytics and statistics

### External APIs

- OpenWeatherMap API - Real-time weather data

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler errors**:

   ```bash
   npx expo start --clear
   ```

2. **Module not found errors**:

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Location not working**:

   - Ensure location permissions are granted
   - Check device location services are enabled

4. **API connection issues**:
   - Verify backend is running
   - Check API_URL in `.env`
   - For physical device, use IP address not localhost

## 📝 Development Notes

- Uses TypeScript for type safety
- Follows Expo Router conventions
- Components use NativeWind for styling
- API calls wrapped in try-catch with error handling
- Pull-to-refresh implemented on all screens

---

Built with ❤️ using React Native and Expo

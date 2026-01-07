# Frontend Setup Guide

This guide helps you reinstall the frontend dependencies after deletion to save space. You can safely delete the `node_modules` directory and reinstall later using these steps.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Expo CLI (install globally: `npm install -g @expo/cli`)

## Reinstallation Steps

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the frontend directory with:

   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_URL:5000
   ```

   Replace `YOUR_BACKEND_URL` with your actual backend server address (e.g., `http://localhost:5000` for local development).

4. **Start the Expo development server**:
   ```bash
   npm start
   ```
   Or use Expo CLI directly:
   ```bash
   expo start
   ```

## Running on Different Platforms

- **iOS Simulator**: Press `i` in the Expo CLI
- **Android Emulator**: Press `a` in the Expo CLI
- **Physical Device**: Scan the QR code with the Expo Go app
- **Web**: Press `w` in the Expo CLI

## Additional Commands

- **Android build**: `npm run android`
- **iOS build**: `npm run ios`
- **Web build**: `npm run web`
- **Linting**: `npm run lint`
- **Reset project**: `npm run reset-project`

## Notes

- The app uses Expo SDK 54 and React Native 0.81.4
- Ensure your backend is running before starting the frontend
- For production builds, follow Expo's deployment guides</content>
  <parameter name="filePath">/Users/shaneel/Dev/Research Paper/Mango-Disease-App/frontend/setup.md

import { Platform } from "react-native";

// IMPORTANT: Replace with your laptop's actual IP address from the same WiFi network
// To find your IP: Run 'ipconfig getifaddr en0' on macOS or 'ipconfig' on Windows
const LAPTOP_IP = "192.168.1.2"; // Your laptop's local network IP

const getBaseUrl = () => {
  // For Expo Go on physical device, always use laptop's IP
  if (Platform.OS === "android") {
    // 10.0.2.2 only works for Android emulator, not physical device
    return `http://${LAPTOP_IP}:5001`;
  }
  if (Platform.OS === "ios") {
    // localhost only works for iOS simulator, not physical device
    return `http://${LAPTOP_IP}:5001`;
  }
  return `http://${LAPTOP_IP}:5001`; // For LAN / physical device
};

export const API_URL = getBaseUrl();

export const CONFIG = {
  API_URL,
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || "",
  DEFAULT_LOCATION: {
    latitude: 12.84,
    longitude: 80.15,
  },
  CONFIDENCE_THRESHOLDS: {
    HIGH: 85,
    MEDIUM: 60,
  },
};

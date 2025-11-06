import { Platform } from "react-native";

const LAPTOP_IP = "10.124.155.163"; 

const getBaseUrl = () => {
  if (Platform.OS === "android") {
    return `http://${LAPTOP_IP}:5001`;
  }
  if (Platform.OS === "ios") {
    return `http://${LAPTOP_IP}:5001`;
  }
  return `http://${LAPTOP_IP}:5001`; 
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

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
export const OPENWEATHER_API_KEY =
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || "";

export const CONFIG = {
  API_URL,
  OPENWEATHER_API_KEY,
  // Default location (can be overridden by user's location)
  DEFAULT_LOCATION: {
    latitude: 12.84,
    longitude: 80.15,
  },
  // Prediction confidence thresholds
  CONFIDENCE_THRESHOLDS: {
    HIGH: 85,
    MEDIUM: 60,
  },
};

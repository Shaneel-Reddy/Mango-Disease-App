import axios from "axios";
import { CONFIG } from "@/constants/config";

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 60000, // 60 seconds timeout for image uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const url = `${config.baseURL || ""}${config.url || ""}`;
    console.log("Making API request to:", url);
    console.log("Request config:", {
      method: config.method,
      headers: config.headers,
      timeout: config.timeout,
    });
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("API response received:", response.status);
    return response;
  },
  (error) => {
    console.error("API Error Details:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      },
    });
    return Promise.reject(error);
  }
);

export interface PredictionResponse {
  class: string; // Disease class name
  confidence: number;
  region: string;
  temperature?: number;
  humidity?: number;
  season: string;
  alert?: string | null;
  all_predictions: Record<string, number>;
  timestamp: string;
}

export interface Alert {
  disease: string;
  severity: string; // "High", "Medium", "Low"
  description: string;
}

export interface StatsResponse {
  total_predictions: number;
  disease_distribution: Record<string, number>;
  recent_predictions: Array<{
    disease: string;
    confidence: number;
    timestamp: string;
    region: string;
    temperature?: number;
    humidity?: number;
  }>;
}

// Test API connectivity
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing API connection to:", CONFIG.API_URL);
    const response = await api.get("/", { timeout: 10000 });
    console.log("Connection test successful:", response.status);
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const predictDisease = async (
  imageUri: string,
  latitude: number,
  longitude: number
): Promise<PredictionResponse> => {
  try {
    console.log("Starting disease prediction...");
    console.log("Image URI:", imageUri);
    console.log("Location:", { latitude, longitude });

    // First test the connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error(
        "Cannot connect to the prediction server. Please check if the backend is running."
      );
    }

    const formData = new FormData();

    // Append the image file
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "mango_leaf.jpg",
    } as any);

    // Append location data
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());

    console.log("Sending prediction request...");
    const response = await api.post("/predict", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for image upload
    });

    console.log("Prediction successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error predicting disease:", error);

    // Provide more specific error messages
    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("Network Error")
    ) {
      throw new Error(
        "Cannot connect to the server. Please ensure the backend is running and your device is connected to the same network."
      );
    } else if (error.code === "ENOTFOUND") {
      throw new Error(
        "Server not found. Please check the API URL configuration."
      );
    } else if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.error || "Invalid image or request data."
      );
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred. Please try again.");
    } else if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timed out. Please check your internet connection and try again."
      );
    } else {
      throw new Error(
        `Failed to analyze image: ${error.message || "Unknown error"}`
      );
    }
  }
};

export const getAlerts = async (
  latitude: number,
  longitude: number
): Promise<{
  region: string;
  season: string;
  month: number;
  alerts: Alert[];
  count: number;
}> => {
  try {
    const response = await api.get("/alerts", {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw new Error("Failed to fetch alerts. Please try again.");
  }
};

export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response = await api.get("/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw new Error("Failed to fetch statistics. Please try again.");
  }
};

export default api;

import axios from "axios";
import { CONFIG } from "@/constants/config";

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 30000, // 30 seconds timeout for image uploads
});

export interface PredictionResponse {
  disease: string;
  confidence: number;
  treatment?: string;
  severity?: "low" | "medium" | "high";
  weather?: {
    temperature: number;
    humidity: number;
  };
}

export interface Alert {
  id: string;
  disease: string;
  severity: "low" | "medium" | "high";
  description: string;
  prevention: string;
  treatment: string;
  startMonth: number;
  endMonth: number;
  region: string;
}

export interface StatsResponse {
  totalPredictions: number;
  mostCommonDisease: string;
  diseaseFrequency: Record<string, number>;
  recentPredictions: Array<{
    id: string;
    disease: string;
    confidence: number;
    date: string;
    location: string;
  }>;
  weatherCorrelation?: Record<string, number>;
}

export const predictDisease = async (
  imageUri: string,
  latitude: number,
  longitude: number
): Promise<PredictionResponse> => {
  try {
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

    const response = await api.post("/predict", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error predicting disease:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

export const getAlerts = async (
  latitude: number,
  longitude: number
): Promise<Alert[]> => {
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

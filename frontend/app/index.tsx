import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import ImageUploader from "@/components/ImageUploader";
import PredictionCard from "@/components/PredictionCard";
import WeatherCard from "@/components/WeatherCard";
import LoadingIndicator from "@/components/LoadingIndicator";

import {
  getLocation,
  formatLocation,
  type LocationData,
} from "@/services/location";
import { getWeather, type WeatherData } from "@/services/weather";
import { predictDisease, type PredictionResponse } from "@/services/api";
import { COLORS } from "@/constants/colors";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocationAndWeather = async () => {
    try {
      const locationData = await getLocation();
      setLocation(locationData);

      const weatherData = await getWeather(
        locationData.latitude,
        locationData.longitude
      );
      setWeather(weatherData);
    } catch (error) {
      console.error("Error loading location/weather:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your location or weather data. Some features may be limited.",
        [{ text: "OK" }]
      );
    }
  };

  const handleImageSelected = async (imageUri: string) => {
    if (!location) {
      Alert.alert(
        "Location Required",
        "Please enable location services for accurate disease detection.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const result = await predictDisease(
        imageUri,
        location.latitude,
        location.longitude
      );
      setPrediction(result);

      // Update weather if it's included in the prediction response
      if (result.weather) {
        setWeather({
          ...weather!,
          temperature: result.weather.temperature,
          humidity: result.weather.humidity,
        });
      }
    } catch (error) {
      console.error("Error predicting disease:", error);
      Alert.alert(
        "Analysis Failed",
        "Failed to analyze the image. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocationAndWeather();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLocationAndWeather();
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      <StatusBar style="light" />

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View className="mt-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Mango Care
          </Text>
          <Text className="text-gray-600 text-base leading-6">
            Upload or capture a photo of a mango leaf to detect diseases and get
            treatment recommendations.
          </Text>
        </View>

        {/* Weather Card */}
        {weather && (
          <View className="mb-6">
            <WeatherCard
              weather={weather}
              location={location ? formatLocation(location) : undefined}
            />
          </View>
        )}

        {/* Image Uploader */}
        <View className="mb-6">
          <ImageUploader
            onImageSelected={handleImageSelected}
            loading={loading}
          />
        </View>

        {/* Loading State */}
        {loading && (
          <View className="py-8">
            <LoadingIndicator />
            <Text className="text-center text-gray-600 mt-4">
              Analyzing your mango leaf image...
            </Text>
          </View>
        )}

        {/* Prediction Results */}
        {prediction && !loading && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Analysis Results
            </Text>
            <PredictionCard prediction={prediction} />
          </View>
        )}

        {/* Tips Section */}
        {!loading && !prediction && (
          <View className="bg-white rounded-lg p-6 shadow-md border border-gray-100 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              📷 Photography Tips
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-700 text-sm">
                • Ensure good lighting - natural daylight works best
              </Text>
              <Text className="text-gray-700 text-sm">
                • Fill the frame with the leaf for better accuracy
              </Text>
              <Text className="text-gray-700 text-sm">
                • Keep the camera steady and focus on the leaf
              </Text>
              <Text className="text-gray-700 text-sm">
                • Show any visible spots, discoloration, or damage
              </Text>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        {location && (
          <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              📍 Your Location
            </Text>
            <Text className="text-gray-600 text-sm">
              {formatLocation(location)}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Lat: {location.latitude.toFixed(4)}, Lon:{" "}
              {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
      if (result.temperature !== undefined && result.humidity !== undefined) {
        setWeather({
          ...weather!,
          temperature: result.temperature,
          humidity: result.humidity,
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
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section with Gradient Accent */}
        <View className="mt-8 mb-8">
          <View className="flex-row items-center mb-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="text-3xl">🥭</Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-3xl font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Mango Care
              </Text>
              <Text className="text-sm" style={{ color: COLORS.secondary }}>
                AI-Powered Leaf Analysis
              </Text>
            </View>
          </View>
          <Text
            className="text-base leading-6 mt-2"
            style={{ color: COLORS.textSecondary }}
          >
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
          <View className="py-10">
            <LoadingIndicator />
            <Text
              className="text-center mt-5 text-base font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Analyzing your mango leaf image...
            </Text>
            <Text
              className="text-center mt-2 text-sm"
              style={{ color: COLORS.textLight }}
            >
              This may take a few moments
            </Text>
          </View>
        )}

        {/* Prediction Results */}
        {prediction && !loading && (
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${COLORS.secondary}20` }}
              >
                <Text className="text-2xl">🔬</Text>
              </View>
              <Text
                className="text-xl font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Analysis Results
              </Text>
            </View>
            <PredictionCard prediction={prediction} />
          </View>
        )}

        {/* Tips Section */}
        {!loading && !prediction && (
          <View
            className="rounded-3xl p-6 shadow-md mb-6"
            style={{
              backgroundColor: COLORS.white,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${COLORS.primary}20` }}
              >
                <Text className="text-2xl">📷</Text>
              </View>
              <Text
                className="text-xl font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Photography Tips
              </Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row items-start mb-3">
                <View
                  className="w-2 h-2 rounded-full mt-2 mr-3"
                  style={{ backgroundColor: COLORS.secondary }}
                />
                <Text
                  className="flex-1 text-sm leading-6"
                  style={{ color: COLORS.textSecondary }}
                >
                  Ensure good lighting - natural daylight works best
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <View
                  className="w-2 h-2 rounded-full mt-2 mr-3"
                  style={{ backgroundColor: COLORS.secondary }}
                />
                <Text
                  className="flex-1 text-sm leading-6"
                  style={{ color: COLORS.textSecondary }}
                >
                  Fill the frame with the leaf for better accuracy
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <View
                  className="w-2 h-2 rounded-full mt-2 mr-3"
                  style={{ backgroundColor: COLORS.secondary }}
                />
                <Text
                  className="flex-1 text-sm leading-6"
                  style={{ color: COLORS.textSecondary }}
                >
                  Keep the camera steady and focus on the leaf
                </Text>
              </View>
              <View className="flex-row items-start">
                <View
                  className="w-2 h-2 rounded-full mt-2 mr-3"
                  style={{ backgroundColor: COLORS.secondary }}
                />
                <Text
                  className="flex-1 text-sm leading-6"
                  style={{ color: COLORS.textSecondary }}
                >
                  Show any visible spots, discoloration, or damage
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats / Location Card */}
        {location && (
          <View
            className="rounded-3xl p-5 shadow-md mb-6"
            style={{
              backgroundColor: COLORS.white,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${COLORS.accent}20` }}
              >
                <Text className="text-2xl">📍</Text>
              </View>
              <Text
                className="text-xl font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Your Location
              </Text>
            </View>
            <Text
              className="text-base mb-2"
              style={{ color: COLORS.textSecondary }}
            >
              {formatLocation(location)}
            </Text>
            <Text className="text-xs" style={{ color: COLORS.textLight }}>
              Lat: {location.latitude.toFixed(4)}, Lon:{" "}
              {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

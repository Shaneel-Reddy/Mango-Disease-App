import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

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

const { width } = Dimensions.get("window");

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(50)).current;

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

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideInAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />

      {/* Animated Header Background */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          opacity: scrollY.interpolate({
            inputRange: [0, 150],
            outputRange: [1, 0],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 150],
                outputRange: [0, -50],
                extrapolate: "clamp",
              }),
            },
          ],
          zIndex: 0,
        }}
      >
        <LinearGradient
          colors={[
            `${COLORS.primary}15`,
            `${COLORS.secondary}10`,
            "transparent",
          ]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Header Section */}
        <Animated.View
          style={{
            opacity: fadeInAnim,
            transform: [{ translateY: slideInAnim }],
            paddingHorizontal: 20,
          }}
        >
          <View className="mt-6 mb-8">
            {/* App Icon & Title */}
            <View className="flex-row items-center mb-4">
              <View
                className="rounded-2xl items-center justify-center shadow-lg"
                style={{
                  backgroundColor: COLORS.white,
                  width: 64,
                  height: 64,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text className="text-4xl">🥭</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className="text-4xl font-extrabold tracking-tight"
                  style={{ color: COLORS.textPrimary }}
                >
                  Mango Care
                </Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className="w-1.5 h-1.5 rounded-full mr-2"
                    style={{ backgroundColor: COLORS.secondary }}
                  />
                  <Text
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: COLORS.secondary }}
                  >
                    AI-Powered Diagnostics
                  </Text>
                </View>
              </View>
            </View>

            {/* Tagline */}
            <View
              className="rounded-2xl p-4 mt-2"
              style={{
                backgroundColor: `${COLORS.primary}08`,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.primary,
              }}
            >
              <Text
                className="text-base leading-6 font-medium"
                style={{ color: COLORS.textSecondary }}
              >
                Detect mango leaf diseases instantly with AI-powered analysis.
                Get expert recommendations and real-time environmental insights.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Section Divider */}
        <View className="mb-6 px-20">
          <View
            style={{
              height: 1,
              backgroundColor: `${COLORS.primary}15`,
            }}
          />
        </View>

        {/* Weather Card with Enhanced Styling */}
        {weather && (
          <Animated.View
            className="mb-6 px-5"
            style={{
              opacity: fadeInAnim,
              transform: [{ translateY: slideInAnim }],
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                style={{ backgroundColor: `${COLORS.accent}20` }}
              >
                <Text className="text-xl">☀️</Text>
              </View>
              <Text
                className="text-lg font-bold tracking-tight"
                style={{ color: COLORS.textPrimary }}
              >
                Current Conditions
              </Text>
            </View>
            <WeatherCard
              weather={weather}
              location={location ? formatLocation(location) : undefined}
            />
          </Animated.View>
        )}

        {/* Image Uploader Section */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-2"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <Text className="text-xl">📸</Text>
            </View>
            <Text
              className="text-lg font-bold tracking-tight"
              style={{ color: COLORS.textPrimary }}
            >
              Upload or Capture
            </Text>
          </View>
          <ImageUploader
            onImageSelected={handleImageSelected}
            loading={loading}
          />
        </View>

        {/* Loading State with Shimmer Effect */}
        {loading && (
          <View className="px-5 py-12">
            <View className="items-center">
              <LoadingIndicator />
              <Text
                className="text-center mt-6 text-lg font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Analyzing Leaf Sample
              </Text>
              <Text
                className="text-center mt-2 text-sm font-medium"
                style={{ color: COLORS.textSecondary }}
              >
                Our AI is examining the image...
              </Text>
              <View className="flex-row items-center mt-4">
                <View
                  className="w-2 h-2 rounded-full mx-1"
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View
                  className="w-2 h-2 rounded-full mx-1"
                  style={{ backgroundColor: COLORS.secondary }}
                />
                <View
                  className="w-2 h-2 rounded-full mx-1"
                  style={{ backgroundColor: COLORS.accent }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Prediction Results Section */}
        {prediction && !loading && (
          <View className="px-5 mb-6">
            {/* Section Header with Badge */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3 shadow-sm"
                  style={{
                    backgroundColor: COLORS.white,
                    shadowColor: COLORS.secondary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text className="text-2xl">🔬</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xl font-extrabold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    Diagnosis Results
                  </Text>
                  <Text
                    className="text-xs font-medium mt-0.5"
                    style={{ color: COLORS.textLight }}
                  >
                    AI-powered analysis complete
                  </Text>
                </View>
              </View>
            </View>
            <PredictionCard prediction={prediction} />
          </View>
        )}

        {/* Photography Tips Section - Enhanced Design */}
        {!loading && !prediction && (
          <View className="px-5 mb-6">
            <View
              className="rounded-3xl overflow-hidden shadow-lg"
              style={{
                backgroundColor: COLORS.white,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {/* Card Header with Gradient */}
              <LinearGradient
                colors={[`${COLORS.primary}12`, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 16,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-sm"
                    style={{
                      backgroundColor: COLORS.white,
                      shadowColor: COLORS.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text className="text-2xl">📷</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xl font-extrabold"
                      style={{ color: COLORS.textPrimary }}
                    >
                      Photography Guide
                    </Text>
                    <Text
                      className="text-xs font-medium mt-0.5"
                      style={{ color: COLORS.textLight }}
                    >
                      Tips for best results
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Tips List */}
              <View className="px-5 pb-6">
                {[
                  {
                    icon: "💡",
                    text: "Use natural daylight for optimal clarity and color accuracy",
                  },
                  {
                    icon: "🎯",
                    text: "Fill the entire frame with the leaf for precise detection",
                  },
                  {
                    icon: "📐",
                    text: "Hold steady and ensure the leaf is in sharp focus",
                  },
                  {
                    icon: "🔍",
                    text: "Capture any visible spots, discoloration, or damage clearly",
                  },
                ].map((tip, index) => (
                  <View
                    key={index}
                    className="flex-row items-start mt-4"
                    style={{
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingVertical: 12,
                      backgroundColor: `${COLORS.secondary}05`,
                      borderRadius: 12,
                      borderLeftWidth: 3,
                      borderLeftColor:
                        index % 2 === 0 ? COLORS.primary : COLORS.secondary,
                    }}
                  >
                    <Text className="text-xl mr-3">{tip.icon}</Text>
                    <Text
                      className="flex-1 text-sm leading-6 font-medium"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {tip.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Location Card - Modern Design */}
        {location && (
          <View className="px-5 mb-6">
            <View
              className="rounded-3xl overflow-hidden shadow-lg"
              style={{
                backgroundColor: COLORS.white,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={[`${COLORS.accent}12`, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 20 }}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-sm"
                    style={{
                      backgroundColor: COLORS.white,
                      shadowColor: COLORS.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text className="text-2xl">📍</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xl font-extrabold"
                      style={{ color: COLORS.textPrimary }}
                    >
                      Your Location
                    </Text>
                    <Text
                      className="text-xs font-medium mt-0.5"
                      style={{ color: COLORS.textLight }}
                    >
                      Current detection area
                    </Text>
                  </View>
                </View>

                <View
                  className="rounded-xl p-4 mt-2"
                  style={{
                    backgroundColor: COLORS.white,
                    borderWidth: 1,
                    borderColor: `${COLORS.accent}20`,
                  }}
                >
                  <Text
                    className="text-base font-bold mb-2"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {formatLocation(location)}
                  </Text>
                  <View className="flex-row items-center">
                    <View
                      className="px-2 py-1 rounded-md mr-2"
                      style={{ backgroundColor: `${COLORS.primary}10` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: COLORS.primary }}
                      >
                        Lat: {location.latitude.toFixed(4)}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-md"
                      style={{ backgroundColor: `${COLORS.secondary}10` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: COLORS.secondary }}
                      >
                        Lon: {location.longitude.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Footer Branding */}
        <View className="items-center mt-4 mb-8 px-5">
          <View
            className="flex-row items-center rounded-full px-5 py-3"
            style={{ backgroundColor: `${COLORS.primary}08` }}
          >
            <Text className="text-lg mr-2">🌿</Text>
            <Text
              className="text-xs font-semibold tracking-wider"
              style={{ color: COLORS.textLight }}
            >
              POWERED BY AI • BUILT FOR FARMERS
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

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
import LoadingIndicator from "@/components/LoadingIndicator";

import {
  getLocation,
  formatLocation,
  type LocationData,
} from "@/services/location";
import { getWeather, type WeatherData } from "@/services/weather";
import { predictDisease, type PredictionResponse } from "@/services/api";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

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

  // Staggered animations for weather metric cards
  const weatherAnim1 = useRef(new Animated.Value(0)).current;
  const weatherAnim2 = useRef(new Animated.Value(0)).current;
  const weatherAnim3 = useRef(new Animated.Value(0)).current;

  // Subtle bounce for uploader container
  const uploaderAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(uploaderAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Trigger stagger when weather becomes available
  useEffect(() => {
    if (!weather) return;
    Animated.stagger(120, [
      Animated.timing(weatherAnim1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(weatherAnim2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(weatherAnim3, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [weather]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />

      {/* Animated Header Background - Mango Gradient */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          opacity: scrollY.interpolate({
            inputRange: [0, 250],
            outputRange: [1, 0],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 250],
                outputRange: [0, -80],
                extrapolate: "clamp",
              }),
            },
            {
              scale: scrollY.interpolate({
                inputRange: [0, 250],
                outputRange: [1, 1.1],
                extrapolate: "clamp",
              }),
            },
          ],
          zIndex: 0,
        }}
      >
        <LinearGradient
          colors={[
            `${COLORS.primary}18`,
            `${COLORS.accent}12`,
            `${COLORS.secondary}08`,
            "transparent",
          ]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
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
            marginTop: 16,
            marginBottom: 28,
          }}
        >
          {/* Tagline Card with Premium Design */}
          <Animated.View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 20,
              padding: 20,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: 1,
              borderColor: `${COLORS.primary}15`,
              transform: [{ translateY: weatherAnim3 }], // Smooth animation continuity
            }}
          >
            {/* Gradient Border Accent */}
            <LinearGradient
              colors={[
                `${COLORS.primary}20`,
                `${COLORS.accent}15`,
                `${COLORS.secondary}10`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-3xl"
              style={{ opacity: 0.6 }}
            />

            {/* Tagline Text */}
            <View className="px-4">
              <Text
                className="text-center text-[15px] font-semibold leading-6 tracking-wide"
                style={{
                  color: COLORS.textPrimary,
                  lineHeight: 22,
                  letterSpacing: 0.3,
                }}
              >
                Detect mango leaf diseases instantly with{" "}
                <Text
                  className="font-extrabold"
                  style={{ color: COLORS.primary }}
                >
                  AI-powered analysis
                </Text>
                . Get expert recommendations and real-time environmental
                insights.
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Weather Stats - 3 Cards Horizontal */}
        {weather && (
          <Animated.View
            style={{
              opacity: fadeInAnim,
              transform: [{ translateY: slideInAnim }],
              marginBottom: 28,
            }}
          >
            {/* Section Header with Icon */}
            {/* Section Header with Premium Design */}
            <Animated.View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: 20,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: `${COLORS.primary}15`,
                transform: [{ translateY: weatherAnim1 }], // First animation for section start
                marginBottom: 24,
              }}
            >
              <View className="flex-row items-center justify-center">
                {/* Title */}
                <Text
                  className="text-2xl font-extrabold"
                  style={{ color: COLORS.textPrimary }}
                >
                  Local Conditions
                </Text>
              </View>
            </Animated.View>

            <View
              className="flex-row justify-between mt-6 mb-6"
              style={{ gap: 12 }}
            >
              {/* Temperature Card */}
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: `${COLORS.primary}15`,
                  transform: [{ translateY: weatherAnim1 }],
                }}
              >
                <Ionicons name="thermometer" size={24} color={COLORS.primary} />
                <Text
                  className="text-lg font-semibold mb-2 text-center"
                  style={{ color: COLORS.textSecondary }}
                >
                  Temperature
                </Text>
                <Text
                  className="text-2xl font-extrabold text-center"
                  style={{ color: COLORS.primary }}
                >
                  {weather.temperature.toFixed(1)}°C
                </Text>
              </Animated.View>

              {/* Humidity Card */}
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  shadowColor: COLORS.secondary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: `${COLORS.secondary}15`,
                  transform: [{ translateY: weatherAnim2 }],
                }}
              >
                <Ionicons name="water" size={24} color={COLORS.secondary} />

                <Text
                  className="text-lg font-semibold mb-2 text-center"
                  style={{ color: COLORS.textSecondary }}
                >
                  Humidity
                </Text>
                <Text
                  className="text-2xl font-extrabold text-center"
                  style={{ color: COLORS.secondary }}
                >
                  {weather.humidity.toFixed(1)}%
                </Text>
              </Animated.View>

              {/* Leaf Wetness Card */}
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  shadowColor: "#64B5F6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: "#64B5F630",
                  transform: [{ translateY: weatherAnim3 }],
                }}
              >
                <Ionicons name="leaf" size={24} color="#64B5F6" />

                <Text
                  className="text-lg font-semibold mb-2 text-center"
                  style={{ color: COLORS.textSecondary }}
                >
                  Leaf Wetness
                </Text>
                <Text
                  className="text-2xl font-extrabold text-center"
                  style={{ color: "#64B5F6" }}
                >
                  Dry
                </Text>
              </Animated.View>
            </View>

            {/* Location Info Card */}
            {location && (
              <Animated.View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: `${COLORS.primary}15`,
                  transform: [{ translateY: weatherAnim3 }], // Reuse last animation for smooth flow
                  marginTop: 20,
                }}
              >
                {/* Location Header */}
                <View className="flex-row items-center mb-6 ">
                  <LinearGradient
                    colors={[`${COLORS.primary}20`, `${COLORS.primary}10`]}
                    className="rounded-full p-3 mr-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  ></LinearGradient>
                  <View className="flex-1">
                    <Text
                      className="text-xl font-extrabold"
                      style={{ color: COLORS.textPrimary }}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={14}
                        color={COLORS.primary}
                      />{" "}
                      {formatLocation(location)}
                    </Text>
                    <Text
                      className="text-sm font-semibold mt-1"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Current Position
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View
                  className="h-0.5 mb-6"
                  style={{ backgroundColor: `${COLORS.primary}15` }}
                />

                {/* Coordinates - 2 Cards in Row */}
                <View className="flex-row" style={{ gap: 12 }}>
                  {/* Latitude Card */}
                  <Animated.View
                    style={{
                      flex: 1,
                      backgroundColor: `${COLORS.white}95`,
                      borderRadius: 16,
                      padding: 26,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: `${COLORS.primary}20`,
                      minHeight: 72,
                      justifyContent: "center",
                      shadowColor: COLORS.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 4,
                      transform: [{ translateY: weatherAnim1 }],
                    }}
                  >
                    <Ionicons
                      name="navigate"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text
                      className="text-xs font-semibold mb-2 text-center"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Latitude
                    </Text>
                    <Text
                      className="text-lg font-extrabold text-center"
                      style={{ color: COLORS.primary }}
                    >
                      {location.latitude.toFixed(3)}°
                    </Text>
                  </Animated.View>

                  {/* Longitude Card */}
                  <Animated.View
                    style={{
                      flex: 1,
                      backgroundColor: `${COLORS.white}95`,
                      borderRadius: 16,
                      padding: 26,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: `${COLORS.primary}20`,
                      minHeight: 72,
                      justifyContent: "center",
                      shadowColor: COLORS.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 4,
                      transform: [{ translateY: weatherAnim2 }],
                    }}
                  >
                    <Ionicons
                      name="navigate-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text
                      className="text-xs font-semibold mb-2 text-center"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Longitude
                    </Text>
                    <Text
                      className="text-lg font-extrabold text-center"
                      style={{ color: COLORS.primary }}
                    >
                      {location.longitude.toFixed(3)}°
                    </Text>
                  </Animated.View>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Image Uploader Section - Enhanced with Animation */}
        <Animated.View
          className="mb-6"
          style={{
            opacity: fadeInAnim,
            transform: [
              {
                scale: uploaderAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }}
        >
          <View className="flex-row items-center mb-4">
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="camera" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text
              className="text-2xl font-extrabold"
              style={{ color: COLORS.textPrimary }}
            >
              Analyze Leaf
            </Text>
          </View>

          {/* Dashed container with helper text */}
          <View
            className="rounded-2xl p-4"
            style={{
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: `${COLORS.primary}50`,
              backgroundColor: `${COLORS.lightCream}60`,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="image" size={18} color={COLORS.accent} />
              <Text
                className="ml-2 text-sm font-semibold"
                style={{ color: COLORS.textSecondary, opacity: 0.9 }}
              >
                Tap to capture or upload leaf photo
              </Text>
            </View>
            <ImageUploader
              onImageSelected={handleImageSelected}
              loading={loading}
            />
          </View>
        </Animated.View>

        {/* Loading State with Shimmer Effect */}
        {loading && (
          <View className="mb-6">
            <LoadingIndicator />
          </View>
        )}

        {/* Prediction Results Section - Enhanced with Slide-in Animation */}
        {prediction && !loading && (
          <Animated.View
            className="mb-6"
            style={{
              opacity: fadeInAnim,
              transform: [
                {
                  translateX: fadeInAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            {/* Gradient Header */}
            <LinearGradient
              colors={[COLORS.secondary, `${COLORS.secondary}CC`]}
              className="rounded-2xl p-4 mb-4 flex-row items-center"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                shadowColor: COLORS.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${COLORS.white}30` }}
              >
                <Ionicons name="analytics" size={24} color={COLORS.white} />
              </View>
              <Text className="text-2xl font-extrabold text-white flex-1">
                Analysis Complete
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={COLORS.white}
              />
            </LinearGradient>
            <PredictionCard prediction={prediction} />
          </Animated.View>
        )}

        {/* Photography Tips Section - Gradient card with numbered bullets */}
        {!loading && !prediction && (
          <Animated.View
            className="mb-6"
            style={{
              opacity: fadeInAnim,
              transform: [{ translateY: slideInAnim }],
            }}
          >
            {/* Section Header */}
            <View className="flex-row items-center mb-3">
              <Text
                className="text-xl font-extrabold"
                style={{ color: COLORS.textPrimary }}
              >
                Photography Tips
              </Text>
            </View>

            {/* Tips Card */}
            <LinearGradient
              colors={[`${COLORS.primary}10`, `${COLORS.accent}0D`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl"
            >
              <View
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: COLORS.card,
                  borderWidth: 1,
                  borderColor: "#EDEDED",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                {[
                  "Use natural, even lighting. Avoid harsh shadows.",
                  "Ensure the leaf is in sharp focus against a plain background.",
                  "Capture a clear, high-resolution image of the affected area.",
                ].map((tip, index, arr) => (
                  <View key={index}>
                    <View className="flex-row items-start mb-4">
                      {/* Numbered badge */}

                      <Text className="text-black font-extrabold text-sm">
                        {index + 1}. {tip}
                      </Text>
                      {/* Text */}
                      <Text
                        className="text-base leading-7 flex-1"
                        style={{
                          color: COLORS.textSecondary,
                          fontWeight: "600",
                          letterSpacing: 0.3,
                        }}
                      ></Text>
                    </View>
                    {/* Divider between items */}
                    {index < arr.length - 1 && (
                      <View
                        className="h-px mb-4"
                        style={{ backgroundColor: "#EFEFEF" }}
                      />
                    )}
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Footer Branding - Enhanced with soft glow */}
        <Animated.View
          className="items-center mt-10 mb-6"
          style={{
            opacity: fadeInAnim,
          }}
        >
          <LinearGradient
            colors={[
              `${COLORS.primary}12`,
              `${COLORS.accent}08`,
              `${COLORS.lightCream}`,
            ]}
            className="rounded-full px-8 py-5 items-center"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1.5,
              borderColor: `${COLORS.primary}30`,
              minWidth: 220,
            }}
          >
            <Text
              className="text-lg font-extrabold"
              style={{ color: COLORS.textPrimary }}
            >
              🥭 MangoCare
            </Text>
          </LinearGradient>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

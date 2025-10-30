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
import { CONFIG } from "@/constants/config";
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
import remediesData from "@/constants/remedies.json";

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
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= CONFIG.CONFIDENCE_THRESHOLDS.HIGH) return COLORS.high;
    if (confidence >= CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM) return COLORS.medium;
    return COLORS.low;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= CONFIG.CONFIDENCE_THRESHOLDS.HIGH)
      return "High Confidence";
    if (confidence >= CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM)
      return "Medium Confidence";
    return "Low Confidence";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= CONFIG.CONFIDENCE_THRESHOLDS.HIGH)
      return "checkmark-circle";
    if (confidence >= CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM) return "warning";
    return "alert-circle";
  };

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

        {/* Image Uploader Section - Premium Card */}
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
          {/* Section Header */}
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
              marginBottom: 24,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Text
                className="text-2xl font-extrabold ml-3"
                style={{ color: COLORS.textPrimary }}
              >
                <Ionicons name="camera" size={18} color={COLORS.primary} />{" "}
                Analyze Leaf
              </Text>
            </View>
          </Animated.View>

          {/* Upload Button Card */}
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: 1,
              borderColor: `${COLORS.primary}15`,
            }}
          >
            <ImageUploader
              onImageSelected={handleImageSelected}
              loading={loading}
            />
          </View>
        </Animated.View>

        {/* Loading State */}
        {loading && (
          <View className="mb-6">
            <LoadingIndicator />
          </View>
        )}

        {/* Prediction Results Section - Consistent with Weather Cards */}
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
            {/* Results Header Card */}
            <Animated.View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: 20,
                shadowColor: COLORS.secondary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: `${COLORS.secondary}15`,
                marginBottom: 24,
                marginTop: 12,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className="text-2xl font-extrabold ml-3"
                  style={{ color: COLORS.textPrimary }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.secondary}
                  />
                  Analysis Complete
                </Text>
              </View>
            </Animated.View>

            {/* Disease Detection & Confidence - 2 Cards in Row */}
            <View className="flex-row mb-6" style={{ gap: 12 }}>
              {/* Disease Card */}
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
                }}
              >
                <Ionicons name="medical" size={24} color={COLORS.secondary} />
                <Text
                  className="text-lg font-semibold mb-2 text-center mt-2"
                  style={{ color: COLORS.textSecondary }}
                >
                  Detected Disease
                </Text>
                <Text
                  className="text-base font-extrabold text-center"
                  style={{ color: COLORS.secondary }}
                  numberOfLines={2}
                >
                  {prediction.class}
                </Text>
              </Animated.View>

              {/* Confidence Card */}
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  shadowColor: getConfidenceColor(prediction.confidence),
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: `${getConfidenceColor(prediction.confidence)}15`,
                }}
              >
                <Ionicons
                  name={getConfidenceIcon(prediction.confidence)}
                  size={24}
                  color={getConfidenceColor(prediction.confidence)}
                />
                <Text
                  className="text-lg font-semibold mb-2 text-center mt-2"
                  style={{ color: COLORS.textSecondary }}
                >
                  Confidence
                </Text>
                <Text
                  className="text-2xl font-extrabold text-center"
                  style={{ color: getConfidenceColor(prediction.confidence) }}
                >
                  {Math.round(prediction.confidence)}%
                </Text>
              </Animated.View>
            </View>

            {/* Status Alert Card */}
            {prediction.alert && (
              <Animated.View
                className="mb-6"
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: COLORS.severityHigh,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: `${COLORS.severityHigh}15`,
                }}
              >
                <View className="flex-row items-center mb-4">
                  <Ionicons
                    name="warning"
                    size={24}
                    color={COLORS.severityHigh}
                  />
                  <Text
                    className="text-xl font-extrabold ml-3"
                    style={{ color: COLORS.textPrimary }}
                  >
                    Alert
                  </Text>
                </View>
                <Text
                  className="text-sm leading-6"
                  style={{ color: COLORS.textSecondary }}
                >
                  {prediction.alert}
                </Text>
              </Animated.View>
            )}

            {/* Environment Details - Section Header */}
            {(prediction.region ||
              prediction.season ||
              prediction.temperature !== undefined ||
              prediction.humidity !== undefined) && (
              <>
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
                    marginBottom: 24,
                    marginTop: 12,
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="leaf" size={28} color={COLORS.primary} />
                    <Text
                      className="text-2xl font-extrabold ml-3"
                      style={{ color: COLORS.textPrimary }}
                    >
                      Environment Data
                    </Text>
                  </View>
                </Animated.View>

                {/* Environment Cards - 2x2 Grid */}
                <View className="mb-6">
                  {/* Row 1 */}
                  {(prediction.region || prediction.season) && (
                    <View className="flex-row mb-4" style={{ gap: 12 }}>
                      {prediction.region && (
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
                          }}
                        >
                          <Ionicons
                            name="location"
                            size={24}
                            color={COLORS.secondary}
                          />
                          <Text
                            className="text-lg font-semibold mb-2 text-center mt-2"
                            style={{ color: COLORS.textSecondary }}
                          >
                            Region
                          </Text>
                          <Text
                            className="text-base font-extrabold text-center"
                            style={{ color: COLORS.secondary }}
                          >
                            {prediction.region}
                          </Text>
                        </Animated.View>
                      )}

                      {prediction.season && (
                        <Animated.View
                          style={{
                            flex: 1,
                            backgroundColor: COLORS.white,
                            borderRadius: 16,
                            padding: 20,
                            alignItems: "center",
                            shadowColor: COLORS.accent,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.12,
                            shadowRadius: 20,
                            elevation: 8,
                            borderWidth: 1,
                            borderColor: `${COLORS.accent}15`,
                          }}
                        >
                          <Ionicons
                            name="calendar"
                            size={24}
                            color={COLORS.accent}
                          />
                          <Text
                            className="text-lg font-semibold mb-2 text-center mt-2"
                            style={{ color: COLORS.textSecondary }}
                          >
                            Season
                          </Text>
                          <Text
                            className="text-base font-extrabold text-center"
                            style={{ color: COLORS.accent }}
                          >
                            {prediction.season}
                          </Text>
                        </Animated.View>
                      )}
                    </View>
                  )}

                  {/* Row 2 */}
                  {(prediction.temperature !== undefined ||
                    prediction.humidity !== undefined) && (
                    <View className="flex-row" style={{ gap: 12 }}>
                      {prediction.temperature !== undefined && (
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
                          }}
                        >
                          <Ionicons
                            name="thermometer"
                            size={24}
                            color={COLORS.primary}
                          />
                          <Text
                            className="text-lg font-semibold mb-2 text-center mt-2"
                            style={{ color: COLORS.textSecondary }}
                          >
                            Temperature
                          </Text>
                          <Text
                            className="text-2xl font-extrabold text-center"
                            style={{ color: COLORS.primary }}
                          >
                            {prediction.temperature.toFixed(1)}°C
                          </Text>
                        </Animated.View>
                      )}

                      {prediction.humidity !== undefined && (
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
                          }}
                        >
                          <Ionicons
                            name="water"
                            size={24}
                            color={COLORS.secondary}
                          />
                          <Text
                            className="text-lg font-semibold mb-2 text-center mt-2"
                            style={{ color: COLORS.textSecondary }}
                          >
                            Humidity
                          </Text>
                          <Text
                            className="text-2xl font-extrabold text-center"
                            style={{ color: COLORS.secondary }}
                          >
                            {prediction.humidity.toFixed(1)}%
                          </Text>
                        </Animated.View>
                      )}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* All Predictions Section */}
            {prediction.all_predictions &&
              Object.keys(prediction.all_predictions).length > 1 && (
                <>
                  <Animated.View
                    style={{
                      backgroundColor: COLORS.white,
                      borderRadius: 20,
                      padding: 20,
                      shadowColor: COLORS.accent,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.12,
                      shadowRadius: 20,
                      elevation: 8,
                      borderWidth: 1,
                      borderColor: `${COLORS.accent}15`,
                      marginBottom: 24,
                      marginTop: 12,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="bar-chart"
                        size={28}
                        color={COLORS.accent}
                      />
                      <Text
                        className="text-2xl font-extrabold ml-3"
                        style={{ color: COLORS.textPrimary }}
                      >
                        All Probabilities
                      </Text>
                    </View>
                  </Animated.View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                    contentContainerStyle={{ paddingHorizontal: 2 }}
                  >
                    {Object.entries(prediction.all_predictions)
                      .sort((a, b) => b[1] - a[1])
                      .map(([disease, prob], index) => (
                        <Animated.View
                          key={disease}
                          className="mr-4"
                          style={{
                            minWidth: 140,
                            backgroundColor: COLORS.white,
                            borderRadius: 16,
                            padding: 20,
                            alignItems: "center",
                            shadowColor: COLORS.accent,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.12,
                            shadowRadius: 20,
                            elevation: 8,
                            borderWidth: 1,
                            borderColor: `${COLORS.accent}15`,
                            marginRight: 12,
                          }}
                        >
                          <Text
                            className="text-sm font-semibold mb-3 text-center"
                            style={{ color: COLORS.textSecondary }}
                            numberOfLines={2}
                          >
                            {disease}
                          </Text>
                          <Text
                            className="text-2xl font-extrabold text-center"
                            style={{ color: COLORS.accent }}
                          >
                            {prob.toFixed(0)}%
                          </Text>
                          <View
                            className="rounded-full h-2 mt-3 overflow-hidden w-full"
                            style={{ backgroundColor: `${COLORS.accent}10` }}
                          >
                            <View
                              style={{
                                height: 8,
                                width: `${Math.min(prob, 100)}%`,
                                backgroundColor: COLORS.accent,
                                borderRadius: 999,
                              }}
                            />
                          </View>
                        </Animated.View>
                      ))}
                  </ScrollView>
                </>
              )}

            {/* Remedies Section */}
            {prediction.class &&
              remediesData[
                prediction.class.toUpperCase() as keyof typeof remediesData
              ] && (
                <>
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
                      marginBottom: 24,
                      marginTop: 12,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="medical"
                        size={28}
                        color={COLORS.primary}
                      />
                      <Text
                        className="text-2xl font-extrabold ml-3"
                        style={{ color: COLORS.textPrimary }}
                      >
                        Recommended Remedies
                      </Text>
                    </View>
                  </Animated.View>

                  <View className="mb-6">
                    {/* Organic Measures */}
                    {remediesData[
                      prediction.class.toUpperCase() as keyof typeof remediesData
                    ]["Organic Measures"] && (
                      <Animated.View
                        style={{
                          backgroundColor: COLORS.white,
                          borderRadius: 20,
                          padding: 20,
                          shadowColor: "#4CAF50",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.12,
                          shadowRadius: 20,
                          elevation: 8,
                          borderWidth: 1,
                          borderColor: "#4CAF5015",
                          marginBottom: 16,
                        }}
                      >
                        <View className="flex-row items-center mb-4">
                          <Ionicons name="leaf" size={24} color="#4CAF50" />
                          <Text
                            className="text-xl font-extrabold ml-3"
                            style={{ color: COLORS.textPrimary }}
                          >
                            Organic Measures
                          </Text>
                        </View>

                        <View className="space-y-3">
                          {Object.entries(
                            remediesData[
                              prediction.class.toUpperCase() as keyof typeof remediesData
                            ]["Organic Measures"]
                          ).map(([key, value], index) => (
                            <View
                              key={index}
                              style={{
                                backgroundColor: "#4CAF5008",
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 8,
                                borderLeftWidth: 4,
                                borderLeftColor: "#4CAF50",
                              }}
                            >
                              <Text
                                className="text-base font-extrabold mb-2"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {key}
                              </Text>
                              <Text
                                className="text-sm leading-5 font-medium"
                                style={{ color: COLORS.textSecondary }}
                              >
                                {value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </Animated.View>
                    )}

                    {/* Chemical Measures */}
                    {remediesData[
                      prediction.class.toUpperCase() as keyof typeof remediesData
                    ]["Chemical Measures"] && (
                      <Animated.View
                        style={{
                          backgroundColor: COLORS.white,
                          borderRadius: 20,
                          padding: 20,
                          shadowColor: "#FF9800",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.12,
                          shadowRadius: 20,
                          elevation: 8,
                          borderWidth: 1,
                          borderColor: "#FF980015",
                          marginBottom: 16,
                        }}
                      >
                        <View className="flex-row items-center mb-4">
                          <Ionicons name="flask" size={24} color="#FF9800" />
                          <Text
                            className="text-xl font-extrabold ml-3"
                            style={{ color: COLORS.textPrimary }}
                          >
                            Chemical Measures
                          </Text>
                        </View>

                        <View className="space-y-3">
                          {Object.entries(
                            remediesData[
                              prediction.class.toUpperCase() as keyof typeof remediesData
                            ]["Chemical Measures"]
                          ).map(([key, value], index) => (
                            <View
                              key={index}
                              style={{
                                backgroundColor: "#FF980008",
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 8,
                                borderLeftWidth: 4,
                                borderLeftColor: "#FF9800",
                              }}
                            >
                              <Text
                                className="text-base font-extrabold mb-2"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {key}
                              </Text>
                              <Text
                                className="text-sm leading-5 font-medium"
                                style={{ color: COLORS.textSecondary }}
                              >
                                {value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </Animated.View>
                    )}

                    {/* Important Note */}
                    <Animated.View
                      style={{
                        backgroundColor: `${COLORS.primary}10`,
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        borderWidth: 1,
                        borderColor: `${COLORS.primary}30`,
                      }}
                    >
                      <Ionicons
                        name="information-circle"
                        size={24}
                        color={COLORS.primary}
                        style={{ marginRight: 12, marginTop: 2 }}
                      />
                      <View className="flex-1">
                        <Text
                          className="text-sm font-extrabold mb-1"
                          style={{ color: COLORS.primary }}
                        >
                          Important Note
                        </Text>
                        <Text
                          className="text-sm leading-5 font-medium"
                          style={{ color: COLORS.textSecondary }}
                        >
                          Always consult with agricultural experts before
                          applying chemical treatments. Follow recommended
                          dosages and safety precautions.
                        </Text>
                      </View>
                    </Animated.View>
                  </View>
                </>
              )}
          </Animated.View>
        )}

        {/* Photography Tips Section */}
        {!loading && !prediction && (
          <Animated.View
            className="mb-6"
            style={{
              opacity: fadeInAnim,
              transform: [{ translateY: slideInAnim }],
              marginTop: 12,
            }}
          >
            {/* Section Header Card */}
            <Animated.View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: 20,
                shadowColor: COLORS.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: `${COLORS.accent}15`,
                marginBottom: 24,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className="text-2xl font-extrabold ml-3"
                  style={{ color: COLORS.textPrimary }}
                >
                  <Ionicons name="bulb" size={18} color={COLORS.accent} />{" "}
                  Photography Tips
                </Text>
              </View>
            </Animated.View>

            {/* Tips Cards - Vertical Stack */}
            <View className="space-y-3">
              {[
                {
                  icon: "sunny",
                  title: "Use Natural Lighting",
                  description:
                    "Ensure good lighting conditions and avoid harsh shadows",
                },
                {
                  icon: "scan",
                  title: "Focus on the Leaf",
                  description:
                    "Ensure the leaf is in sharp focus against a plain background",
                },
                {
                  icon: "image",
                  title: "High Resolution",
                  description:
                    "Capture a clear, high-resolution image of the affected area",
                },
              ].map((tip, index) => (
                <Animated.View
                  key={index}
                  style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 16,
                    padding: 18,
                    flexDirection: "row",
                    shadowColor: COLORS.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: `${COLORS.accent}15`,
                    marginBottom: 8,
                  }}
                >
                  {/* Icon Container */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name={tip.icon as any}
                      size={18}
                      color={COLORS.accent}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text
                      className="text-base font-extrabold mb-1"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {tip.title}
                    </Text>
                    <Text
                      className="text-sm leading-5 font-medium"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {tip.description}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Footer Branding - Enhanced Footer Feel */}
        <Animated.View
          style={{
            marginTop: 40,
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* Brand Name */}
          <Text
            className="text-lg font-extrabold mb-1"
            style={{ color: COLORS.textPrimary }}
          >
            MangoCare 🥭
          </Text>

          {/* Tagline */}
          <Text
            className="text-sm text-center font-medium"
            style={{ color: COLORS.textSecondary, maxWidth: 280 }}
          >
            Your friendly companion for plant health. Capture, detect, and care
            for your plants with ease!
          </Text>

          {/* Decorative Emoji Line */}
          <Text className="mt-2 text-base" style={{ color: COLORS.primary }}>
            🌱🍃🍂🍁🌿
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

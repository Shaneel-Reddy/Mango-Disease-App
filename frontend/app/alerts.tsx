import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AlertCard from "@/components/AlertCard";
import EnvironmentalAlertCard from "@/components/EnvironmentalAlertCard";
import LoadingIndicator from "@/components/LoadingIndicator";

import {
  getLocation,
  formatLocation,
  type LocationData,
} from "@/services/location";
import { getAlerts, type Alert as AlertType } from "@/services/api";
import { getWeather, type WeatherData } from "@/services/weather";
import {
  analyzeEnvironmentalConditions,
  getEnvironmentalStatus,
  type EnvironmentalAlert,
} from "@/services/alertAnalysis";
import { COLORS } from "@/constants/colors";

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [environmentalAlerts, setEnvironmentalAlerts] = useState<
    EnvironmentalAlert[]
  >([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(50)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      setError(null);

      // Get location first
      const locationData = await getLocation();
      setLocation(locationData);

      // Fetch weather data
      const weatherData = await getWeather(
        locationData.latitude,
        locationData.longitude
      );
      setWeather(weatherData);

      // Fetch seasonal alerts for the location
      const alertsResponse = await getAlerts(
        locationData.latitude,
        locationData.longitude
      );
      setAlerts(alertsResponse.alerts || []);

      // Analyze environmental conditions for real-time alerts
      const envAlerts = analyzeEnvironmentalConditions(
        weatherData.temperature,
        weatherData.humidity,
        locationData.latitude
      );
      setEnvironmentalAlerts(envAlerts);
    } catch (err) {
      console.error("Error loading alerts:", err);
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getAlertStats = () => {
    // Combine both environmental and seasonal alerts
    const allAlerts = [
      ...environmentalAlerts,
      ...alerts.map((a) => ({ severity: a.severity })),
    ];

    const high = allAlerts.filter((alert) => alert.severity === "high").length;
    const medium = allAlerts.filter(
      (alert) => alert.severity === "medium"
    ).length;
    const low = allAlerts.filter((alert) => alert.severity === "low").length;

    return { high, medium, low, total: allAlerts.length };
  };

  const getEnvironmentalStatusInfo = () => {
    if (!weather) return null;
    return getEnvironmentalStatus(weather.temperature, weather.humidity);
  };

  useEffect(() => {
    loadData();

    // Entrance animations
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

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: COLORS.background }}
      >
        <StatusBar style="dark" />
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: COLORS.background }}
      >
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons
            name="warning-outline"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text
            className="text-xl font-semibold mt-4 text-center"
            style={{ color: COLORS.textPrimary }}
          >
            Unable to Load Alerts
          </Text>
          <Text
            className="text-center mt-2 leading-6"
            style={{ color: COLORS.textSecondary }}
          >
            {error}
          </Text>
          <Text
            className="text-sm text-center mt-4"
            style={{ color: COLORS.textLight }}
          >
            Pull down to refresh or check your internet connection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getAlertStats();
  const envStatus = getEnvironmentalStatusInfo();

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
          ],
          zIndex: 0,
        }}
      >
        <LinearGradient
          colors={[
            `${COLORS.severityHigh}12`,
            `${COLORS.severityMedium}10`,
            `${COLORS.severityLow}08`,
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
        {/* Hero Header */}
        <Animated.View
          style={{
            opacity: fadeInAnim,
            transform: [{ translateY: slideInAnim }],
            marginTop: 16,
            marginBottom: 28,
          }}
        >
          <View
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
            }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="notifications" size={24} color={COLORS.primary} />
              <Text
                className="text-2xl font-extrabold ml-3"
                style={{ color: COLORS.textPrimary }}
              >
                Disease Alerts
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Location Info */}
        {location && (
          <Animated.View
            style={{
              opacity: fadeInAnim,
              marginBottom: 20,
            }}
          >
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: COLORS.white,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 6,
                borderWidth: 1,
                borderColor: `${COLORS.primary}15`,
              }}
            >
              <View className="flex-row items-center">
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <Text
                  className="ml-2 font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {formatLocation(location)}
                </Text>
              </View>
              <Text
                className="text-sm mt-1"
                style={{ color: COLORS.textSecondary }}
              >
                Showing alerts for your current region
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Weather & Environmental Status */}
        {weather && envStatus && (
          <Animated.View
            style={{
              opacity: fadeInAnim,
              marginBottom: 24,
            }}
          >
            {/* Weather Cards Row */}
            <View className="flex-row mb-4" style={{ gap: 12 }}>
              <View
                className="flex-1 rounded-2xl p-4 items-center"
                style={{
                  backgroundColor: COLORS.white,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: `${COLORS.primary}15`,
                }}
              >
                <Ionicons name="thermometer" size={24} color={COLORS.primary} />
                <Text
                  className="text-2xl font-bold mt-2"
                  style={{ color: COLORS.textPrimary }}
                >
                  {weather.temperature}°C
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: COLORS.textSecondary }}
                >
                  Temperature
                </Text>
              </View>

              <View
                className="flex-1 rounded-2xl p-4 items-center"
                style={{
                  backgroundColor: COLORS.white,
                  shadowColor: COLORS.secondary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: `${COLORS.secondary}15`,
                }}
              >
                <Ionicons name="water" size={24} color={COLORS.secondary} />
                <Text
                  className="text-2xl font-bold mt-2"
                  style={{ color: COLORS.textPrimary }}
                >
                  {weather.humidity}%
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: COLORS.textSecondary }}
                >
                  Humidity
                </Text>
              </View>
            </View>

            {/* Environmental Status Card */}
            <View
              className="rounded-2xl p-5"
              style={{
                backgroundColor:
                  envStatus.status === "critical"
                    ? `${COLORS.severityHigh}15`
                    : envStatus.status === "warning"
                      ? `${COLORS.severityMedium}15`
                      : `${COLORS.accent}15`,
                borderWidth: 2,
                borderColor:
                  envStatus.status === "critical"
                    ? `${COLORS.severityHigh}40`
                    : envStatus.status === "warning"
                      ? `${COLORS.severityMedium}40`
                      : `${COLORS.accent}40`,
              }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name={
                    envStatus.status === "critical"
                      ? "alert-circle"
                      : envStatus.status === "warning"
                        ? "warning"
                        : "checkmark-circle"
                  }
                  size={24}
                  color={
                    envStatus.status === "critical"
                      ? COLORS.severityHigh
                      : envStatus.status === "warning"
                        ? COLORS.severityMedium
                        : COLORS.accent
                  }
                />
                <Text
                  className="ml-2 font-bold text-base"
                  style={{
                    color:
                      envStatus.status === "critical"
                        ? COLORS.severityHigh
                        : envStatus.status === "warning"
                          ? COLORS.severityMedium
                          : COLORS.accent,
                  }}
                >
                  {envStatus.status === "critical"
                    ? "⚠️ Critical Conditions"
                    : envStatus.status === "warning"
                      ? "⚡ Warning Conditions"
                      : "✅ Optimal Conditions"}
                </Text>
              </View>
              <Text className="text-sm" style={{ color: COLORS.textPrimary }}>
                {envStatus.message}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Alert Summary */}
        <Animated.View
          style={{
            opacity: fadeInAnim,
            marginBottom: 24,
          }}
        >
          <View
            className="rounded-2xl p-5"
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
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: COLORS.textPrimary }}
            >
              📊 Alert Summary
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text
                  className="text-3xl font-bold"
                  style={{ color: COLORS.severityHigh }}
                >
                  {stats.high}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: COLORS.textSecondary }}
                >
                  High Risk
                </Text>
              </View>

              <View className="items-center flex-1">
                <Text
                  className="text-3xl font-bold"
                  style={{ color: COLORS.severityMedium }}
                >
                  {stats.medium}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: COLORS.textSecondary }}
                >
                  Medium Risk
                </Text>
              </View>

              <View className="items-center flex-1">
                <Text
                  className="text-3xl font-bold"
                  style={{ color: COLORS.severityLow }}
                >
                  {stats.low}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: COLORS.textSecondary }}
                >
                  Low Risk
                </Text>
              </View>

              <View className="items-center flex-1">
                <Text
                  className="text-3xl font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {stats.total}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: COLORS.textSecondary }}
                >
                  Total
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Environmental Alerts Section */}
        {environmentalAlerts.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeInAnim,
              marginBottom: 24,
            }}
          >
            <View
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
                marginBottom: 16,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="warning"
                  size={20}
                  color={COLORS.severityHigh}
                />
                <Text
                  className="text-xl font-extrabold ml-2"
                  style={{ color: COLORS.textPrimary }}
                >
                  🌡️ Real-Time Environmental Alerts
                </Text>
              </View>
              <Text
                className="text-center text-sm mt-2"
                style={{ color: COLORS.textSecondary }}
              >
                Based on current weather conditions
              </Text>
            </View>

            {environmentalAlerts.map((alert, index) => (
              <EnvironmentalAlertCard key={`env-${index}`} alert={alert} />
            ))}
          </Animated.View>
        )}

        {/* Seasonal Alerts Section */}
        {alerts.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeInAnim,
              marginBottom: 24,
            }}
          >
            <View
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
                marginBottom: 16,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text
                  className="text-xl font-extrabold ml-2"
                  style={{ color: COLORS.textPrimary }}
                >
                  � Seasonal Alerts
                </Text>
              </View>
              <Text
                className="text-center text-sm mt-2"
                style={{ color: COLORS.textSecondary }}
              >
                Region-specific seasonal disease patterns
              </Text>
            </View>

            {alerts
              .sort((a, b) => {
                const severityOrder: Record<string, number> = {
                  high: 3,
                  medium: 2,
                  low: 1,
                };
                return (
                  (severityOrder[b.severity] || 0) -
                  (severityOrder[a.severity] || 0)
                );
              })
              .map((alert, index) => (
                <AlertCard key={`seasonal-${index}`} alert={alert} />
              ))}
          </Animated.View>
        )}

        {/* No Alerts State */}
        {environmentalAlerts.length === 0 && alerts.length === 0 && (
          <Animated.View
            style={{
              opacity: fadeInAnim,
              alignItems: "center",
              paddingVertical: 48,
            }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={80}
              color={COLORS.accent}
            />
            <Text
              className="text-2xl font-bold mt-4 text-center"
              style={{ color: COLORS.textPrimary }}
            >
              No Active Alerts
            </Text>
            <Text
              className="text-center mt-3 leading-6 px-8"
              style={{ color: COLORS.textSecondary }}
            >
              Great news! There are currently no pest or disease alerts for your
              region.
            </Text>
            <Text
              className="text-sm text-center mt-4 px-8"
              style={{ color: COLORS.textLight }}
            >
              Keep monitoring your mango trees regularly for early detection.
            </Text>
          </Animated.View>
        )}

        {/* Information Section */}
        <Animated.View
          style={{
            opacity: fadeInAnim,
            marginBottom: 24,
          }}
        >
          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: `${COLORS.primary}10`,
              borderWidth: 1,
              borderColor: `${COLORS.primary}20`,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="information-circle"
                size={22}
                color={COLORS.primary}
              />
              <Text
                className="ml-2 font-bold text-base"
                style={{ color: COLORS.textPrimary }}
              >
                About These Alerts
              </Text>
            </View>
            <Text
              className="text-sm leading-6"
              style={{ color: COLORS.textPrimary }}
            >
              These alerts combine real-time environmental analysis with
              seasonal patterns and regional disease outbreaks. Environmental
              alerts are based on current weather conditions, while seasonal
              alerts follow known disease patterns for your region. Regular
              monitoring and preventive measures can help protect your mango
              trees from potential threats.
            </Text>
          </View>
        </Animated.View>

        {/* Last Updated */}
        <View className="items-center pb-6">
          <Text className="text-xs" style={{ color: COLORS.textLight }}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Footer */}
        <Animated.View
          style={{
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text
            className="text-lg font-extrabold mb-1"
            style={{ color: COLORS.textPrimary }}
          >
            MangoCare 🥭
          </Text>
          <Text
            className="text-sm text-center font-medium"
            style={{ color: COLORS.textSecondary, maxWidth: 280 }}
          >
            Protecting your mango orchard with intelligent disease monitoring
          </Text>
          <Text className="mt-2 text-base" style={{ color: COLORS.primary }}>
            🌱🍃🍂🍁🌿
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

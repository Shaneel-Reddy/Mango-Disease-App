import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, RefreshControl, Animated } from "react-native";
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

// Unified card style
const CARD_STYLE = {
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
};

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

    // Animate
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
      {/* Animated background */}
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 18,
        }}
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
        {/* Hero Header Card */}
        <Animated.View
          style={{
            opacity: fadeInAnim,
            transform: [{ translateY: slideInAnim }],
          }}
        >
          <View style={CARD_STYLE}>
            <LinearGradient
              colors={[
                `${COLORS.primary}20`,
                `${COLORS.accent}15`,
                `${COLORS.secondary}10`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                borderRadius: 20,
                opacity: 0.3,
                zIndex: 0,
              }}
            />
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Ionicons
                  name="notifications"
                  size={26}
                  color={COLORS.primary}
                />
                <Text
                  style={{
                    marginLeft: 12,
                    fontWeight: "bold",
                    fontSize: 22,
                    color: COLORS.textPrimary,
                  }}
                >
                  Disease Alerts
                </Text>
              </View>
              {location && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Ionicons name="location" size={18} color={COLORS.primary} />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontWeight: "500",
                      fontSize: 14,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {formatLocation(location)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Weather & Environmental Status Card */}
        {weather && envStatus && (
          <Animated.View style={{ opacity: fadeInAnim }}>
            <View style={CARD_STYLE}>
              <LinearGradient
                colors={[
                  `${COLORS.primary}15`,
                  `${COLORS.secondary}10`,
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                  opacity: 0.12,
                  zIndex: 0,
                }}
              />
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: COLORS.textPrimary,
                  }}
                >
                  🌤️ Current Conditions
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                {/* Temperature */}
                <View
                  style={{
                    flex: 1,
                    marginRight: 10,
                    alignItems: "center",
                    backgroundColor: COLORS.white,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: `${COLORS.accent}15`,
                    elevation: 4,
                    shadowColor: COLORS.accent,
                    shadowOpacity: 0.08,
                  }}
                >
                  <Ionicons
                    name="thermometer"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                    Temperature
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: COLORS.textPrimary,
                    }}
                  >
                    {weather.temperature}°C
                  </Text>
                </View>
                {/* Humidity */}
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    alignItems: "center",
                    backgroundColor: COLORS.white,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: `${COLORS.secondary}15`,
                    elevation: 4,
                    shadowColor: COLORS.secondary,
                    shadowOpacity: 0.08,
                  }}
                >
                  <Ionicons name="water" size={22} color={COLORS.secondary} />
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                    Humidity
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: COLORS.textPrimary,
                    }}
                  >
                    {weather.humidity}%
                  </Text>
                </View>
              </View>
              {/* Environmental Status */}
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: `${COLORS.accent}15`,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
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
                  style={{
                    marginLeft: 10,
                    fontWeight: "bold",
                    fontSize: 16,
                    color:
                      envStatus.status === "critical"
                        ? COLORS.severityHigh
                        : envStatus.status === "warning"
                          ? COLORS.severityMedium
                          : COLORS.accent,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {envStatus.status === "critical"
                    ? "⚠️ Critical Conditions"
                    : envStatus.status === "warning"
                      ? "⚡ Warning Conditions"
                      : "✅ Optimal Conditions"}
                </Text>
              </View>
              <Text style={{ marginTop: 6, color: COLORS.textPrimary }}>
                {envStatus.message}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Alert Summary Card */}
        <Animated.View style={{ opacity: fadeInAnim }}>
          <View style={CARD_STYLE}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name="bar-chart" size={22} color={COLORS.primary} />
              <Text
                style={{
                  marginLeft: 10,
                  fontWeight: "bold",
                  fontSize: 18,
                  color: COLORS.textPrimary,
                }}
              >
                📊 Alert Summary
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* Stats */}
              {[
                ["High", stats.high, COLORS.severityHigh],
                ["Medium", stats.medium, COLORS.severityMedium],
                ["Low", stats.low, COLORS.severityLow],
                ["Total", stats.total, COLORS.textPrimary],
              ].map(([label, value, color], idx) => (
                <View
                  style={{ alignItems: "center", flex: 1 }}
                  key={String(label)}
                >
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "bold",
                      color: String(color),
                    }}
                  >
                    {value}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                    {label} Risk
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Environmental Alerts */}
        {environmentalAlerts.length > 0 && (
          <Animated.View style={{ opacity: fadeInAnim }}>
            <View style={CARD_STYLE}>
              <LinearGradient
                colors={[
                  `${COLORS.severityHigh}20`,
                  `${COLORS.accent}15`,
                  `${COLORS.secondary}10`,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                  opacity: 0.15,
                  zIndex: 0,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name="warning"
                  size={20}
                  color={COLORS.severityHigh}
                />
                <Text
                  style={{
                    marginLeft: 7,
                    fontSize: 17,
                    fontWeight: "bold",
                    color: COLORS.textPrimary,
                  }}
                >
                  🌡️ Real-Time Environmental Alerts
                </Text>
              </View>
              <Text
                style={{
                  marginBottom: 10,
                  color: COLORS.textSecondary,
                  textAlign: "center",
                }}
              >
                Based on current weather conditions
              </Text>
              {environmentalAlerts.map((alert, idx) => (
                <EnvironmentalAlertCard key={`env-${idx}`} alert={alert} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Seasonal Alerts Section */}
        {alerts.length > 0 && (
          <Animated.View style={{ opacity: fadeInAnim }}>
            <View style={CARD_STYLE}>
              <LinearGradient
                colors={[
                  `${COLORS.primary}20`,
                  `${COLORS.accent}15`,
                  `${COLORS.secondary}10`,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                  opacity: 0.12,
                  zIndex: 0,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text
                  style={{
                    marginLeft: 7,
                    fontSize: 17,
                    fontWeight: "bold",
                    color: COLORS.textPrimary,
                  }}
                >
                  📅 Seasonal Alerts
                </Text>
              </View>
              <Text
                style={{
                  marginBottom: 10,
                  color: COLORS.textSecondary,
                  textAlign: "center",
                }}
              >
                Region-specific seasonal disease patterns
              </Text>
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
                .map((alert, idx) => (
                  <AlertCard key={`seasonal-${idx}`} alert={alert} />
                ))}
            </View>
          </Animated.View>
        )}

        {/* No Alerts Message Card */}
        {environmentalAlerts.length === 0 && alerts.length === 0 && (
          <Animated.View style={{ opacity: fadeInAnim }}>
            <View
              style={{
                ...CARD_STYLE,
                alignItems: "center",
                padding: 28,
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={80}
                color={COLORS.accent}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginTop: 18,
                  color: COLORS.textPrimary,
                  textAlign: "center",
                }}
              >
                No Active Alerts
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  color: COLORS.textSecondary,
                  textAlign: "center",
                }}
              >
                Great news! There are currently no pest or disease alerts for
                your region.
              </Text>
              <Text
                style={{
                  marginTop: 13,
                  fontSize: 13,
                  color: COLORS.textLight,
                  textAlign: "center",
                }}
              >
                Keep monitoring your mango trees regularly for early detection.
              </Text>
            </View>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

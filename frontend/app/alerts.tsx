import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import AlertCard from "@/components/AlertCard";
import LoadingIndicator from "@/components/LoadingIndicator";

import {
  getLocation,
  formatLocation,
  type LocationData,
} from "@/services/location";
import { getAlerts, type Alert as AlertType } from "@/services/api";
import { COLORS } from "@/constants/colors";

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);

      // Get location first
      const locationData = await getLocation();
      setLocation(locationData);

      // Fetch alerts for the location
      const alertsData = await getAlerts(
        locationData.latitude,
        locationData.longitude
      );
      setAlerts(alertsData);
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
    const high = alerts.filter((alert) => alert.severity === "high").length;
    const medium = alerts.filter((alert) => alert.severity === "medium").length;
    const low = alerts.filter((alert) => alert.severity === "low").length;

    return { high, medium, low, total: alerts.length };
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: COLORS.background }}
      >
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
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons
            name="warning-outline"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            Unable to Load Alerts
          </Text>
          <Text className="text-gray-600 text-center mt-2 leading-6">
            {error}
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-4">
            Pull down to refresh or check your internet connection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getAlertStats();

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
        {/* Location Info */}
        {location && (
          <View className="mt-6 mb-4 bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text className="ml-2 text-gray-900 font-medium">
                {formatLocation(location)}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm mt-1">
              Showing alerts for your current region
            </Text>
          </View>
        )}

        {/* Alert Summary */}
        <View className="mb-6 bg-white rounded-lg p-4 shadow-md border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            📊 Alert Summary
          </Text>

          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text
                className="text-2xl font-bold"
                style={{ color: COLORS.severityHigh }}
              >
                {stats.high}
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                High Risk
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text
                className="text-2xl font-bold"
                style={{ color: COLORS.severityMedium }}
              >
                {stats.medium}
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Medium Risk
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text
                className="text-2xl font-bold"
                style={{ color: COLORS.severityLow }}
              >
                {stats.low}
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Low Risk
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {stats.total}
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Total Alerts
              </Text>
            </View>
          </View>
        </View>

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              🚨 Active Alerts
            </Text>

            {/* Sort alerts by severity */}
            {alerts
              .sort((a, b) => {
                const severityOrder = { high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color={COLORS.accent}
            />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
              No Active Alerts
            </Text>
            <Text className="text-gray-600 text-center mt-2 leading-6">
              Great news! There are currently no pest or disease alerts for your
              region.
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-4">
              Keep monitoring your mango trees regularly for early detection.
            </Text>
          </View>
        )}

        {/* Information Section */}
        <View className="bg-blue-50 rounded-lg p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="information-circle"
              size={20}
              color={COLORS.primary}
            />
            <Text className="ml-2 font-semibold text-gray-800">
              About These Alerts
            </Text>
          </View>
          <Text className="text-gray-700 text-sm leading-5">
            These alerts are based on seasonal patterns, weather conditions, and
            regional disease outbreaks. Regular monitoring and preventive
            measures can help protect your mango trees from potential threats.
          </Text>
        </View>

        {/* Last Updated */}
        <View className="items-center pb-6">
          <Text className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

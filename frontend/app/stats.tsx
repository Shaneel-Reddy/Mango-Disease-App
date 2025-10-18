import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import LoadingIndicator from "@/components/LoadingIndicator";

import { getStats, type StatsResponse } from "@/services/api";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setError(null);
      const statsData = await getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const renderPredictionItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold text-gray-900">
          {item.disease}
        </Text>
        <Text className="text-sm text-gray-500">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="analytics" size={14} color={COLORS.primary} />
          <Text className="ml-1 text-sm text-gray-600">
            {Math.round(item.confidence)}% confidence
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="location" size={14} color={COLORS.textSecondary} />
          <Text className="ml-1 text-sm text-gray-600">{item.location}</Text>
        </View>
      </View>
    </View>
  );

  const renderDiseaseFrequency = () => {
    if (!stats?.diseaseFrequency) return null;

    const diseases = Object.entries(stats.diseaseFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 diseases

    const maxValue = Math.max(...Object.values(stats.diseaseFrequency));

    return (
      <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          📊 Disease Frequency
        </Text>

        {diseases.map(([disease, count], index) => {
          const percentage = (count / maxValue) * 100;

          return (
            <View key={disease} className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-medium text-gray-800">
                  {disease}
                </Text>
                <Text className="text-sm text-gray-600">{count} cases</Text>
              </View>

              <View className="bg-gray-200 rounded-full h-2">
                <View
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor:
                      index === 0
                        ? COLORS.severityHigh
                        : index === 1
                        ? COLORS.severityMedium
                        : COLORS.primary,
                    width: `${percentage}%`,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

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
            name="bar-chart-outline"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            Unable to Load Statistics
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
        {/* Overview Cards */}
        <View className="mt-6 mb-6">
          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 flex-1 mr-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">
                    {stats?.totalPredictions || 0}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Scans</Text>
                </View>
                <Ionicons name="camera" size={24} color={COLORS.primary} />
              </View>
            </View>

            <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 flex-1 ml-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-gray-900 numberOfLines={1}">
                    {stats?.mostCommonDisease || "N/A"}
                  </Text>
                  <Text className="text-sm text-gray-600">Most Common</Text>
                </View>
                <Ionicons name="trending-up" size={24} color={COLORS.accent} />
              </View>
            </View>
          </View>
        </View>

        {/* Disease Frequency Chart */}
        {renderDiseaseFrequency()}

        {/* Recent Predictions */}
        {stats?.recentPredictions && stats.recentPredictions.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              📋 Recent Predictions
            </Text>

            <FlatList
              data={stats.recentPredictions.slice(0, 10)} // Show last 10
              renderItem={renderPredictionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Weather Correlation */}
        {stats?.weatherCorrelation && (
          <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              🌤️ Weather Correlation
            </Text>

            {Object.entries(stats.weatherCorrelation).map(
              ([condition, correlation]) => (
                <View
                  key={condition}
                  className="flex-row items-center justify-between mb-2"
                >
                  <Text className="text-sm text-gray-700 capitalize">
                    {condition} Weather
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color:
                        correlation > 0.5
                          ? COLORS.severityHigh
                          : correlation > 0.3
                          ? COLORS.severityMedium
                          : COLORS.severityLow,
                    }}
                  >
                    {(correlation * 100).toFixed(0)}% correlation
                  </Text>
                </View>
              )
            )}

            <Text className="text-xs text-gray-500 mt-3">
              Shows how weather conditions correlate with disease occurrence
            </Text>
          </View>
        )}

        {/* Tips Section */}
        <View className="bg-green-50 rounded-lg p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb" size={20} color={COLORS.accent} />
            <Text className="ml-2 font-semibold text-gray-800">
              Analytics Insights
            </Text>
          </View>
          <Text className="text-gray-700 text-sm leading-5">
            Regular monitoring helps in early detection. Higher scan frequency
            during weather changes can help prevent disease outbreaks in your
            mango orchard.
          </Text>
        </View>

        {/* Empty State */}
        {(!stats || stats.totalPredictions === 0) && (
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons
              name="analytics-outline"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
              No Data Available
            </Text>
            <Text className="text-gray-600 text-center mt-2 leading-6">
              Start scanning mango leaves to see your analytics and statistics
              here.
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-4">
              Use the Detect tab to analyze your first mango leaf!
            </Text>
          </View>
        )}

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

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { Alert } from "@/services/api";

interface AlertCardProps {
  alert: Alert;
}

export default function AlertCard({ alert }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return COLORS.severityHigh;
      case "medium":
        return COLORS.severityMedium;
      case "low":
        return COLORS.severityLow;
      default:
        return COLORS.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return "alert-circle";
      case "medium":
        return "warning";
      case "low":
        return "information-circle";
      default:
        return "information-circle";
    }
  };

  const getSeasonalEmoji = (month: number) => {
    if (month >= 3 && month <= 5) return "🌦️"; // Summer
    if (month >= 6 && month <= 8) return "🌧️"; // Monsoon
    if (month >= 9 && month <= 11) return "🍂"; // Autumn
    return "❄️"; // Winter
  };

  const getMonthName = (month: number) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1] || "";
  };

  const severityColor = getSeverityColor(alert.severity);

  return (
    <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100 mb-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-lg mr-2">
            {getSeasonalEmoji(alert.startMonth)}
          </Text>
          <Text className="text-lg font-bold text-gray-900 flex-1">
            {alert.disease}
          </Text>
        </View>

        <View
          className="px-3 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: `${severityColor}20` }}
        >
          <Ionicons
            name={getSeverityIcon(alert.severity)}
            size={14}
            color={severityColor}
          />
          <Text
            className="ml-1 font-semibold text-xs uppercase"
            style={{ color: severityColor }}
          >
            {alert.severity}
          </Text>
        </View>
      </View>

      {/* Duration */}
      <View className="flex-row items-center mb-3">
        <Ionicons
          name="calendar-outline"
          size={14}
          color={COLORS.textSecondary}
        />
        <Text className="ml-2 text-gray-600 text-sm">
          Active: {getMonthName(alert.startMonth)} -{" "}
          {getMonthName(alert.endMonth)}
        </Text>
      </View>

      {/* Description */}
      <Text className="text-gray-700 text-sm mb-3 leading-5">
        {alert.description}
      </Text>

      {/* Prevention */}
      <View className="bg-green-50 rounded-lg p-3 mb-3">
        <View className="flex-row items-center mb-2">
          <Ionicons name="shield-checkmark" size={14} color={COLORS.accent} />
          <Text className="ml-2 font-semibold text-gray-800 text-sm">
            Prevention
          </Text>
        </View>
        <Text className="text-gray-700 text-sm leading-4">
          {alert.prevention}
        </Text>
      </View>

      {/* Treatment */}
      {alert.treatment && (
        <View className="bg-blue-50 rounded-lg p-3">
          <View className="flex-row items-center mb-2">
            <Ionicons name="medical" size={14} color={COLORS.primary} />
            <Text className="ml-2 font-semibold text-gray-800 text-sm">
              Treatment
            </Text>
          </View>
          <Text className="text-gray-700 text-sm leading-4">
            {alert.treatment}
          </Text>
        </View>
      )}

      {/* Region */}
      {alert.region && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <Ionicons name="location" size={12} color={COLORS.textLight} />
          <Text className="ml-1 text-gray-500 text-xs">
            Region: {alert.region}
          </Text>
        </View>
      )}
    </View>
  );
}

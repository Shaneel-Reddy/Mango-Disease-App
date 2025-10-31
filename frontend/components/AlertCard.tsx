import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

  const severityColor = getSeverityColor(alert.severity);

  return (
    <View className="mb-4">
      {/* Header Card - Disease Name and Severity */}
      <View
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: COLORS.white,
          shadowColor: severityColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 8,
          borderWidth: 1,
          borderColor: `${severityColor}20`,
        }}
      >
        {/* Gradient Background Accent */}
        <LinearGradient
          colors={[`${severityColor}08`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />

        <View className="p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-lg font-bold flex-1 mr-3"
              style={{ color: COLORS.textPrimary }}
            >
              {alert.disease}
            </Text>

            <View
              className="px-3 py-2 rounded-xl flex-row items-center"
              style={{ backgroundColor: `${severityColor}20` }}
            >
              <Ionicons
                name={getSeverityIcon(alert.severity)}
                size={16}
                color={severityColor}
              />
              <Text
                className="ml-1.5 font-bold text-xs uppercase"
                style={{ color: severityColor }}
              >
                {alert.severity}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View
            className="rounded-xl p-4"
            style={{
              backgroundColor: `${COLORS.primary}08`,
              borderLeftWidth: 3,
              borderLeftColor: severityColor,
            }}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <Text
                className="ml-2 font-bold text-sm"
                style={{ color: COLORS.textPrimary }}
              >
                Alert Details
              </Text>
            </View>
            <Text
              className="text-sm leading-6 font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              {alert.description}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";
import { EnvironmentalAlert } from "@/services/alertAnalysis";

interface EnvironmentalAlertCardProps {
  alert: EnvironmentalAlert;
}

export default function EnvironmentalAlertCard({
  alert,
}: EnvironmentalAlertCardProps) {
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

  const getDiseaseIcon = (disease: string): any => {
    if (disease.includes("Sooty Mould") || disease.includes("Gall Midge"))
      return "bug";
    if (disease.includes("Anthracnose")) return "water";
    if (disease.includes("Powdery Mildew")) return "snow";
    if (disease.includes("Weevil")) return "bug-outline";
    if (disease.includes("Hopper")) return "bug";
    if (disease.includes("Bacterial")) return "flask";
    if (disease.includes("Rot")) return "warning-outline";
    return "leaf";
  };

  const severityColor = getSeverityColor(alert.severity);

  return (
    <View
      className="rounded-3xl overflow-hidden mb-4"
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
        {/* Header with Disease Name and Severity */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center flex-1 mr-3">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${severityColor}15` }}
            >
              <Ionicons
                name={getDiseaseIcon(alert.disease)}
                size={24}
                color={severityColor}
              />
            </View>
            <View className="flex-1 ml-3">
              <Text
                className="text-lg font-bold"
                style={{ color: COLORS.textPrimary }}
                numberOfLines={2}
              >
                {alert.disease}
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: COLORS.textSecondary }}
              >
                {alert.conditions.season} • {alert.confidence}% confidence
              </Text>
            </View>
          </View>

          {/* Severity Badge */}
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

        {/* Environmental Conditions */}
        <View
          className="flex-row rounded-2xl p-3 mb-4"
          style={{ backgroundColor: `${COLORS.primary}08` }}
        >
          <View className="flex-1 items-center">
            <Ionicons name="thermometer" size={20} color={COLORS.primary} />
            <Text
              className="text-lg font-bold mt-1"
              style={{ color: COLORS.textPrimary }}
            >
              {alert.conditions.temperature}°C
            </Text>
            <Text className="text-xs" style={{ color: COLORS.textSecondary }}>
              Temperature
            </Text>
          </View>

          <View
            className="w-px mx-2"
            style={{ backgroundColor: `${COLORS.primary}20` }}
          />

          <View className="flex-1 items-center">
            <Ionicons name="water" size={20} color={COLORS.secondary} />
            <Text
              className="text-lg font-bold mt-1"
              style={{ color: COLORS.textPrimary }}
            >
              {alert.conditions.humidity}%
            </Text>
            <Text className="text-xs" style={{ color: COLORS.textSecondary }}>
              Humidity
            </Text>
          </View>

          <View
            className="w-px mx-2"
            style={{ backgroundColor: `${COLORS.primary}20` }}
          />

          <View className="flex-1 items-center">
            <Ionicons
              name={alert.conditions.inMonsoon ? "rainy" : "sunny"}
              size={20}
              color={alert.conditions.inMonsoon ? "#64B5F6" : "#FFB74D"}
            />
            <Text
              className="text-xs font-bold mt-1"
              style={{ color: COLORS.textPrimary }}
            >
              {alert.conditions.inMonsoon ? "Monsoon" : "Dry"}
            </Text>
            <Text className="text-xs" style={{ color: COLORS.textSecondary }}>
              Season
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="information-circle"
              size={18}
              color={COLORS.primary}
            />
            <Text
              className="ml-2 font-bold text-sm"
              style={{ color: COLORS.textPrimary }}
            >
              What's Happening
            </Text>
          </View>
          <Text
            className="text-sm leading-6"
            style={{ color: COLORS.textSecondary }}
          >
            {alert.description}
          </Text>
        </View>

        {/* Remedial Plan */}
        <View
          className="rounded-2xl p-4"
          style={{
            backgroundColor: `${COLORS.accent}10`,
            borderWidth: 1,
            borderColor: `${COLORS.accent}20`,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield-checkmark" size={20} color={COLORS.accent} />
            <Text
              className="ml-2 font-bold text-base"
              style={{ color: COLORS.textPrimary }}
            >
              Action Plan
            </Text>
          </View>

          {/* Parse and display remedial steps */}
          {alert.remedialPlan.split("\n").map((step, index) => {
            const trimmedStep = step.trim();
            if (!trimmedStep) return null;

            return (
              <View key={index} className="flex-row mb-2.5">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: `${COLORS.accent}20` }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: COLORS.accent }}
                  >
                    {trimmedStep.startsWith("•") ? "•" : index + 1}
                  </Text>
                </View>
                <Text
                  className="flex-1 text-sm leading-5"
                  style={{ color: COLORS.textPrimary }}
                >
                  {trimmedStep.replace(/^[•\-]\s*/, "")}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Confidence Indicator */}
        <View className="mt-4 flex-row items-center justify-center">
          <View
            className="h-2 flex-1 rounded-full overflow-hidden"
            style={{ backgroundColor: `${COLORS.primary}15` }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${alert.confidence}%`,
                backgroundColor: severityColor,
              }}
            />
          </View>
          <Text
            className="ml-3 text-xs font-semibold"
            style={{ color: COLORS.textSecondary }}
          >
            {alert.confidence}% Match
          </Text>
        </View>
      </View>
    </View>
  );
}

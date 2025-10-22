import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONFIG } from "@/constants/config";
import { COLORS } from "@/constants/colors";
import { PredictionResponse } from "@/services/api";

interface PredictionCardProps {
  prediction: PredictionResponse;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
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

  const confidenceColor = getConfidenceColor(prediction.confidence);

  return (
    <View
      className="bg-white rounded-3xl p-6 shadow-lg"
      style={{
        elevation: 6,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      {/* Disease Name and Confidence Badge */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 mr-3">
          <Text
            className="text-2xl font-bold"
            style={{ color: COLORS.textPrimary }}
          >
            {prediction.class}
          </Text>
        </View>
        <View
          className="px-4 py-2 rounded-full flex-row items-center"
          style={{ backgroundColor: `${confidenceColor}20` }}
        >
          <Ionicons
            name={getConfidenceIcon(prediction.confidence)}
            size={18}
            color={confidenceColor}
          />
          <Text
            className="ml-2 font-bold text-base"
            style={{ color: confidenceColor }}
          >
            {Math.round(prediction.confidence)}%
          </Text>
        </View>
      </View>

      {/* Confidence Level with Progress Bar */}
      <View className="mb-5">
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: COLORS.textSecondary }}
        >
          {getConfidenceText(prediction.confidence)}
        </Text>
        <View className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <View
            className="h-3 rounded-full"
            style={{
              backgroundColor: confidenceColor,
              width: `${prediction.confidence}%`,
            }}
          />
        </View>
      </View>

      {/* Treatment Information */}
      {prediction.alert && (
        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: `${COLORS.severityHigh}10` }}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.severityHigh }}
            >
              <Ionicons name="warning" size={18} color={COLORS.textWhite} />
            </View>
            <Text
              className="ml-3 font-bold text-base"
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
        </View>
      )}

      {/* Location & Environment Info */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: COLORS.lightCream }}
      >
        <View className="space-y-3">
          {/* Region */}
          <View className="flex-row items-center">
            <Ionicons name="location" size={18} color={COLORS.secondary} />
            <Text
              className="ml-3 text-sm"
              style={{ color: COLORS.textSecondary }}
            >
              Region:{" "}
              <Text
                className="font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {prediction.region}
              </Text>
            </Text>
          </View>

          {/* Season */}
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={18} color={COLORS.secondary} />
            <Text
              className="ml-3 text-sm"
              style={{ color: COLORS.textSecondary }}
            >
              Season:{" "}
              <Text
                className="font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {prediction.season}
              </Text>
            </Text>
          </View>

          {/* Temperature */}
          {prediction.temperature !== undefined && (
            <View className="flex-row items-center">
              <Ionicons name="thermometer" size={18} color={COLORS.secondary} />
              <Text
                className="ml-3 text-sm"
                style={{ color: COLORS.textSecondary }}
              >
                Temperature:{" "}
                <Text
                  className="font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {prediction.temperature.toFixed(1)}°C
                </Text>
              </Text>
            </View>
          )}

          {/* Humidity */}
          {prediction.humidity !== undefined && (
            <View className="flex-row items-center">
              <Ionicons name="water" size={18} color={COLORS.secondary} />
              <Text
                className="ml-3 text-sm"
                style={{ color: COLORS.textSecondary }}
              >
                Humidity:{" "}
                <Text
                  className="font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {prediction.humidity}%
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* All Predictions */}
      {prediction.all_predictions && (
        <View
          className="pt-4 border-t"
          style={{ borderTopColor: COLORS.border }}
        >
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: COLORS.textPrimary }}
          >
            All Disease Probabilities:
          </Text>
          {Object.entries(prediction.all_predictions)
            .sort((a, b) => b[1] - a[1])
            .map(([disease, prob]) => (
              <View key={disease} className="mb-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-xs"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {disease}
                  </Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {prob.toFixed(1)}%
                  </Text>
                </View>
                <View className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor:
                        prob >= 50 ? COLORS.secondary : COLORS.border,
                      width: `${prob}%`,
                    }}
                  />
                </View>
              </View>
            ))}
        </View>
      )}
    </View>
  );
}

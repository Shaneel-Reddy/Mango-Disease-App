import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      className="rounded-3xl overflow-hidden"
      style={{
        shadowColor: confidenceColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: COLORS.white,
      }}
    >
      {/* Gradient Top Border */}
      <LinearGradient
        colors={[confidenceColor, `${confidenceColor}AA`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4 }}
      />

      <View className="p-6">
        {/* Disease Name and Confidence Badge */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-1 mr-3">
            <Text
              className="text-xs font-bold mb-1"
              style={{ color: COLORS.textSecondary }}
            >
              DETECTED DISEASE
            </Text>
            <Text
              className="text-2xl font-extrabold"
              style={{ color: COLORS.textPrimary }}
            >
              {prediction.class}
            </Text>
          </View>
          <View
            className="px-5 py-3 rounded-2xl flex-row items-center"
            style={{
              backgroundColor: `${confidenceColor}20`,
              borderWidth: 2,
              borderColor: `${confidenceColor}40`,
            }}
          >
            <Ionicons
              name={getConfidenceIcon(prediction.confidence)}
              size={20}
              color={confidenceColor}
            />
            <Text
              className="ml-2 font-extrabold text-lg"
              style={{ color: confidenceColor }}
            >
              {Math.round(prediction.confidence)}%
            </Text>
          </View>
        </View>

        {/* Confidence Level with Enhanced Progress Bar */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-sm font-bold"
              style={{ color: COLORS.textSecondary }}
            >
              {getConfidenceText(prediction.confidence)}
            </Text>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={confidenceColor}
            />
          </View>
          <View
            className="rounded-full h-3 overflow-hidden"
            style={{ backgroundColor: `${confidenceColor}15` }}
          >
            <LinearGradient
              colors={[confidenceColor, `${confidenceColor}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 12,
                width: `${prediction.confidence}%`,
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        {/* Treatment Information */}
        {prediction.alert && (
          <View
            className="rounded-2xl p-5 mb-5"
            style={{
              backgroundColor: `${COLORS.severityHigh}10`,
              borderWidth: 1,
              borderColor: `${COLORS.severityHigh}30`,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: COLORS.severityHigh }}
              >
                <Ionicons name="warning" size={20} color={COLORS.textWhite} />
              </View>
              <Text
                className="ml-3 font-extrabold text-base"
                style={{ color: COLORS.textPrimary }}
              >
                ⚠️ Alert
              </Text>
            </View>
            <Text
              className="text-sm leading-6 font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              {prediction.alert}
            </Text>
          </View>
        )}

        {/* Location & Environment Info */}
        <View
          className="rounded-2xl p-5 mb-5"
          style={{
            backgroundColor: `${COLORS.lightCream}`,
            borderWidth: 1,
            borderColor: `${COLORS.primary}20`,
          }}
        >
          <View className="mb-1">
            <Text
              className="text-xs font-bold mb-3"
              style={{ color: COLORS.textSecondary }}
            >
              ENVIRONMENT DETAILS
            </Text>
          </View>
          {/* Region */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: `${COLORS.secondary}20` }}
            >
              <Ionicons name="location" size={16} color={COLORS.secondary} />
            </View>
            <Text
              className="ml-3 text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Region:{" "}
              <Text
                className="font-extrabold"
                style={{ color: COLORS.textPrimary }}
              >
                {prediction.region}
              </Text>
            </Text>
          </View>

          {/* Season */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: `${COLORS.secondary}20` }}
            >
              <Ionicons name="calendar" size={16} color={COLORS.secondary} />
            </View>
            <Text
              className="ml-3 text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Season:{" "}
              <Text
                className="font-extrabold"
                style={{ color: COLORS.textPrimary }}
              >
                {prediction.season}
              </Text>
            </Text>
          </View>

          {/* Temperature */}
          {prediction.temperature !== undefined && (
            <View className="flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}20` }}
              >
                <Ionicons name="thermometer" size={16} color={COLORS.primary} />
              </View>
              <Text
                className="ml-3 text-sm font-medium"
                style={{ color: COLORS.textSecondary }}
              >
                Temperature:{" "}
                <Text
                  className="font-extrabold"
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
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${COLORS.secondary}20` }}
              >
                <Ionicons name="water" size={16} color={COLORS.secondary} />
              </View>
              <Text
                className="ml-3 text-sm font-medium"
                style={{ color: COLORS.textSecondary }}
              >
                Humidity:{" "}
                <Text
                  className="font-extrabold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {prediction.humidity}%
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* All Predictions */}
        {prediction.all_predictions && (
          <View
            className="pt-5 mt-5"
            style={{
              borderTopWidth: 1,
              borderTopColor: `${COLORS.primary}20`,
            }}
          >
            <Text
              className="text-xs font-bold mb-4"
              style={{ color: COLORS.textSecondary }}
            >
              ALL DISEASE PROBABILITIES
            </Text>
            {Object.entries(prediction.all_predictions)
              .sort((a, b) => b[1] - a[1])
              .map(([disease, prob]) => (
                <View key={disease} className="mb-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {disease}
                    </Text>
                    <Text
                      className="text-xs font-extrabold"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {prob.toFixed(1)}%
                    </Text>
                  </View>
                  <View
                    className="rounded-full h-2 overflow-hidden"
                    style={{ backgroundColor: `${COLORS.secondary}10` }}
                  >
                    <LinearGradient
                      colors={
                        prob >= 50
                          ? [COLORS.secondary, `${COLORS.secondary}CC`]
                          : [`${COLORS.border}`, `${COLORS.border}CC`]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: 8,
                        width: `${prob}%`,
                        borderRadius: 999,
                      }}
                    />
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </View>
  );
}

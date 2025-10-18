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
            {prediction.disease}
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
      {prediction.treatment && (
        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: COLORS.lightCream }}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.secondary }}
            >
              <Ionicons name="medical" size={18} color={COLORS.textWhite} />
            </View>
            <Text
              className="ml-3 font-bold text-base"
              style={{ color: COLORS.textPrimary }}
            >
              Recommended Treatment
            </Text>
          </View>
          <Text
            className="text-sm leading-6"
            style={{ color: COLORS.textSecondary }}
          >
            {prediction.treatment}
          </Text>
        </View>
      )}

      {/* Severity Level */}
      {prediction.severity && (
        <View
          className="flex-row items-center pt-4 border-t"
          style={{ borderTopColor: COLORS.border }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{
              backgroundColor:
                prediction.severity === "high"
                  ? `${COLORS.severityHigh}20`
                  : prediction.severity === "medium"
                    ? `${COLORS.severityMedium}20`
                    : `${COLORS.severityLow}20`,
            }}
          >
            <Ionicons
              name="alert"
              size={18}
              color={
                prediction.severity === "high"
                  ? COLORS.severityHigh
                  : prediction.severity === "medium"
                    ? COLORS.severityMedium
                    : COLORS.severityLow
              }
            />
          </View>
          <Text
            className="ml-3 text-sm"
            style={{ color: COLORS.textSecondary }}
          >
            Severity:{" "}
            <Text
              className="font-bold capitalize"
              style={{ color: COLORS.textPrimary }}
            >
              {prediction.severity}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

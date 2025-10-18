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
    <View className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
      {/* Disease Name and Confidence */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900 flex-1">
          {prediction.disease}
        </Text>
        <View
          className="px-3 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: `${confidenceColor}20` }}
        >
          <Ionicons
            name={getConfidenceIcon(prediction.confidence)}
            size={16}
            color={confidenceColor}
          />
          <Text
            className="ml-1 font-semibold text-sm"
            style={{ color: confidenceColor }}
          >
            {Math.round(prediction.confidence)}%
          </Text>
        </View>
      </View>

      {/* Confidence Level */}
      <View className="mb-4">
        <Text className="text-gray-600 text-sm mb-2">
          {getConfidenceText(prediction.confidence)}
        </Text>
        <View className="bg-gray-200 rounded-full h-2">
          <View
            className="h-2 rounded-full"
            style={{
              backgroundColor: confidenceColor,
              width: `${prediction.confidence}%`,
            }}
          />
        </View>
      </View>

      {/* Treatment Information */}
      {prediction.treatment && (
        <View className="bg-blue-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="medical" size={16} color={COLORS.accent} />
            <Text className="ml-2 font-semibold text-gray-800">
              Recommended Treatment
            </Text>
          </View>
          <Text className="text-gray-700 text-sm leading-5">
            {prediction.treatment}
          </Text>
        </View>
      )}

      {/* Severity Level */}
      {prediction.severity && (
        <View className="flex-row items-center">
          <Ionicons
            name="alert"
            size={16}
            color={
              prediction.severity === "high"
                ? COLORS.severityHigh
                : prediction.severity === "medium"
                ? COLORS.severityMedium
                : COLORS.severityLow
            }
          />
          <Text className="ml-2 text-gray-600 text-sm">
            Severity:{" "}
            <Text className="font-semibold capitalize">
              {prediction.severity}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

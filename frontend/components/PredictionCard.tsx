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
        backgroundColor: COLORS.white,
        shadowColor: confidenceColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: `${confidenceColor}15`,
      }}
    >
      {/* Premium Gradient Top Border */}
      <LinearGradient
        colors={[
          confidenceColor,
          `${confidenceColor}80`,
          `${confidenceColor}40`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 6 }}
        className="rounded-t-3xl"
      />

      <View className="p-6">
        {/* 1. Disease Header Card */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: `${COLORS.white}95`,
            borderWidth: 1,
            borderColor: `${confidenceColor}15`,
            shadowColor: confidenceColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={[`${confidenceColor}20`, `${confidenceColor}10`]}
              className="rounded-2xl p-3 mr-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={getConfidenceIcon(prediction.confidence)}
                size={24}
                color={confidenceColor}
              />
            </LinearGradient>
            <View className="flex-1">
              <Text
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: COLORS.textSecondary }}
              >
                Detected Disease
              </Text>
              <Text
                className="text-xl font-extrabold"
                style={{ color: COLORS.textPrimary }}
              >
                {prediction.class}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Confidence Metrics Card */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: `${COLORS.white}95`,
            borderWidth: 1,
            borderColor: `${confidenceColor}15`,
            shadowColor: confidenceColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: COLORS.textSecondary }}
              >
                {getConfidenceText(prediction.confidence)}
              </Text>
              <Text
                className="text-3xl font-extrabold"
                style={{ color: confidenceColor }}
              >
                {Math.round(prediction.confidence)}%
              </Text>
            </View>
            <LinearGradient
              colors={[`${confidenceColor}25`, `${confidenceColor}15`]}
              className="rounded-2xl p-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={confidenceColor}
              />
            </LinearGradient>
          </View>

          {/* Progress Bar */}
          <View
            className="rounded-full h-3 overflow-hidden"
            style={{ backgroundColor: `${confidenceColor}10` }}
          >
            <LinearGradient
              colors={[
                confidenceColor,
                `${confidenceColor}CC`,
                confidenceColor,
              ]}
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

        {/* 3. Alert Card */}
        {prediction.alert && (
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: `${COLORS.white}95`,
              borderWidth: 1,
              borderColor: `${COLORS.severityHigh}20`,
              shadowColor: COLORS.severityHigh,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={[
                  `${COLORS.severityHigh}20`,
                  `${COLORS.severityHigh}10`,
                ]}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="warning"
                  size={20}
                  color={COLORS.severityHigh}
                />
              </LinearGradient>
              <View className="flex-1">
                <Text
                  className="font-extrabold text-base"
                  style={{ color: COLORS.textPrimary }}
                >
                  ⚠️ Alert
                </Text>
              </View>
            </View>
            <Text
              className="text-sm leading-6 font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              {prediction.alert}
            </Text>
          </View>
        )}

        {/* 4. Environment Details Card */}
        {(prediction.region ||
          prediction.season ||
          prediction.temperature !== undefined ||
          prediction.humidity !== undefined) && (
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: `${COLORS.white}95`,
              borderWidth: 1,
              borderColor: `${COLORS.primary}15`,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text
              className="text-xs font-bold mb-6 uppercase tracking-wide"
              style={{ color: COLORS.textSecondary }}
            >
              Environment Details
            </Text>

            <View className="space-y-5">
              {prediction.region && (
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={[`${COLORS.secondary}20`, `${COLORS.secondary}10`]}
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name="location"
                      size={20}
                      color={COLORS.secondary}
                    />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Region
                    </Text>
                    <Text
                      className="font-extrabold mt-1"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {prediction.region}
                    </Text>
                  </View>
                </View>
              )}

              {prediction.season && (
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={[`${COLORS.secondary}20`, `${COLORS.secondary}10`]}
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={COLORS.secondary}
                    />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Season
                    </Text>
                    <Text
                      className="font-extrabold mt-1"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {prediction.season}
                    </Text>
                  </View>
                </View>
              )}

              {prediction.temperature !== undefined && (
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={[`${COLORS.primary}20`, `${COLORS.primary}10`]}
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name="thermometer"
                      size={20}
                      color={COLORS.primary}
                    />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Temperature
                    </Text>
                    <Text
                      className="font-extrabold mt-1"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {prediction.temperature.toFixed(1)}°C
                    </Text>
                  </View>
                </View>
              )}

              {prediction.humidity !== undefined && (
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={[`${COLORS.secondary}20`, `${COLORS.secondary}10`]}
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="water" size={20} color={COLORS.secondary} />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Humidity
                    </Text>
                    <Text
                      className="font-extrabold mt-1"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {prediction.humidity}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 5. All Predictions Cards */}
        {prediction.all_predictions &&
          Object.keys(prediction.all_predictions).length > 1 && (
            <View
              className="pt-6"
              style={{
                borderTopWidth: 1,
                borderTopColor: `${COLORS.primary}15`,
              }}
            >
              <Text
                className="text-xs font-bold mb-6 uppercase tracking-wide"
                style={{ color: COLORS.textSecondary }}
              >
                All Disease Probabilities
              </Text>
              <View className="space-y-4">
                {Object.entries(prediction.all_predictions)
                  .sort((a, b) => b[1] - a[1])
                  .map(([disease, prob]) => (
                    <View
                      key={disease}
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor: `${COLORS.white}95`,
                        borderWidth: 1,
                        borderColor: `${COLORS.secondary}15`,
                        shadowColor: COLORS.secondary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 10,
                        elevation: 3,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-sm font-semibold flex-1"
                          style={{ color: COLORS.textSecondary }}
                          numberOfLines={1}
                        >
                          {disease}
                        </Text>
                        <View className="ml-4 w-24 items-end">
                          <Text
                            className="text-sm font-extrabold mb-3"
                            style={{ color: COLORS.textPrimary }}
                          >
                            {prob.toFixed(1)}%
                          </Text>
                          <View
                            className="rounded-full h-2 overflow-hidden w-full"
                            style={{ backgroundColor: `${COLORS.secondary}10` }}
                          >
                            <LinearGradient
                              colors={
                                prob >= 50
                                  ? [COLORS.secondary, `${COLORS.secondary}CC`]
                                  : [`${COLORS.border}80`, `${COLORS.border}CC`]
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={{
                                height: 8,
                                width: `${Math.min(prob, 100)}%`,
                                borderRadius: 999,
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}
      </View>
    </View>
  );
}

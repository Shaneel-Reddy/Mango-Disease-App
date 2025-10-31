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
    <View style={{ marginBottom: 24 }}>
      {/* Disease & Severity Card */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          shadowColor: severityColor,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 7,
          borderWidth: 1,
          borderColor: `${severityColor}20`,
          marginBottom: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <LinearGradient
          colors={[`${severityColor}12`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            opacity: 0.2,
            zIndex: 0,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 18,
            zIndex: 1,
          }}
        >
          
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: COLORS.textPrimary,
                marginBottom: 2,
                flexWrap: "wrap",
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {alert.disease}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
              {alert.conditions.season} &bull; {alert.confidence}% confidence
            </Text>
          </View>
          {/* Severity Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: `${severityColor}20`,
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 14,
              marginLeft: 12,
            }}
          >
            <Ionicons
              name={getSeverityIcon(alert.severity)}
              size={16}
              color={severityColor}
            />
            <Text
              style={{
                marginLeft: 5,
                fontWeight: "bold",
                fontSize: 12,
                color: severityColor,
                textTransform: "uppercase",
              }}
            >
              {alert.severity}
            </Text>
          </View>
        </View>
      </View>

      {/* Environmental Conditions Card */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
          elevation: 6,
          borderWidth: 1,
          borderColor: `${COLORS.primary}15`,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[`${COLORS.primary}08`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            opacity: 0.1,
            zIndex: 0,
          }}
        />
        <View style={{ padding: 15, zIndex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              marginBottom: 8,
              color: COLORS.textPrimary,
            }}
          >
            🌡️ Current Conditions
          </Text>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: `${COLORS.primary}08`,
              borderRadius: 16,
              paddingVertical: 8,
              paddingHorizontal: 4,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Temperature */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons name="thermometer" size={21} color={COLORS.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: COLORS.textPrimary,
                }}
              >
                {alert.conditions.temperature}°C
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
                Temperature
              </Text>
            </View>
            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: `${COLORS.primary}22`,
                marginHorizontal: 9,
              }}
            />
            {/* Humidity */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons name="water" size={21} color={COLORS.secondary} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: COLORS.textPrimary,
                }}
              >
                {alert.conditions.humidity}%
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
                Humidity
              </Text>
            </View>
            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: `${COLORS.primary}22`,
                marginHorizontal: 9,
              }}
            />
            {/* Season */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons
                name={alert.conditions.inMonsoon ? "rainy" : "sunny"}
                size={21}
                color={alert.conditions.inMonsoon ? "#64B5F6" : "#FFB74D"}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: COLORS.textPrimary,
                }}
              >
                {alert.conditions.inMonsoon ? "Monsoon" : "Dry"}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
                Season
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* What's Happening Card */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
          elevation: 6,
          borderWidth: 1,
          borderColor: `${COLORS.primary}15`,
          marginBottom: 16,
        }}
      >
        <LinearGradient
          colors={[`${COLORS.primary}07`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            opacity: 0.12,
            zIndex: 0,
          }}
        />
        <View style={{ padding: 15, zIndex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 31,
                height: 31,
                borderRadius: 15,
                backgroundColor: `${COLORS.primary}12`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="information-circle"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <Text
              style={{
                marginLeft: 10,
                fontWeight: "bold",
                fontSize: 15,
                color: COLORS.textPrimary,
              }}
            >
              What's Happening
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            {alert.description}
          </Text>
        </View>
      </View>

      {/* Action Plan Card */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.09,
          shadowRadius: 12,
          elevation: 6,
          borderWidth: 1,
          borderColor: `${COLORS.accent}14`,
        }}
      >
        <LinearGradient
          colors={[`${COLORS.accent}09`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            opacity: 0.15,
            zIndex: 0,
          }}
        />
        <View style={{ padding: 15, zIndex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="shield-checkmark" size={18} color={COLORS.accent} />
            <Text
              style={{
                marginLeft: 10,
                fontWeight: "bold",
                fontSize: 15,
                color: COLORS.textPrimary,
              }}
            >
              Action Plan
            </Text>
          </View>
          <View>
            {alert.remedialPlan.split("\n").map((step, index) => {
              const trimmedStep = step.trim();
              if (!trimmedStep) return null;
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: `${COLORS.accent}08`,
                    borderLeftWidth: 3,
                    borderLeftColor: COLORS.accent,
                    padding: 10,
                    borderRadius: 14,
                    marginBottom: 8,
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.textPrimary,
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}
                  >
                    {trimmedStep.replace(/^[•\-]\s*/, "")}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

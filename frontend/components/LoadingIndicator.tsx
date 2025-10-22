import React from "react";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/colors";

interface LoadingIndicatorProps {
  size?: "small" | "large";
  color?: string;
}

export default function LoadingIndicator({
  size = "large",
  color = COLORS.primary,
}: LoadingIndicatorProps) {
  return (
    <View className="flex-1 justify-center items-center py-8">
      <View
        className="rounded-3xl p-8"
        style={{
          backgroundColor: `${COLORS.lightCream}`,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 6,
          borderWidth: 1,
          borderColor: `${COLORS.primary}20`,
        }}
      >
        <ActivityIndicator size={size} color={color} />
      </View>
    </View>
  );
}

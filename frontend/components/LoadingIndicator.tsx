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
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { WeatherData, getWeatherIcon } from "@/services/weather";

interface WeatherCardProps {
  weather: WeatherData;
  location?: string;
}

export default function WeatherCard({ weather, location }: WeatherCardProps) {
  return (
    <View className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons
            name="location-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text className="ml-1 text-gray-600 text-sm">
            {location || "Current Location"}
          </Text>
        </View>
        <Text className="text-2xl">{getWeatherIcon(weather.icon)}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">
            {weather.temperature}°C
          </Text>
          <Text className="text-gray-600 text-sm capitalize">
            {weather.description}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            Feels like {weather.feelsLike}°C
          </Text>
        </View>

        <View className="flex-row space-x-4">
          <View className="items-center">
            <Ionicons name="water-outline" size={20} color={COLORS.primary} />
            <Text className="text-xs text-gray-600 mt-1">
              {weather.humidity}%
            </Text>
            <Text className="text-xs text-gray-500">Humidity</Text>
          </View>

          <View className="items-center">
            <Ionicons
              name="speedometer-outline"
              size={20}
              color={COLORS.accent}
            />
            <Text className="text-xs text-gray-600 mt-1">
              {weather.pressure}
            </Text>
            <Text className="text-xs text-gray-500">hPa</Text>
          </View>

          {weather.windSpeed > 0 && (
            <View className="items-center">
              <Ionicons
                name="leaf-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text className="text-xs text-gray-600 mt-1">
                {weather.windSpeed}
              </Text>
              <Text className="text-xs text-gray-500">m/s</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

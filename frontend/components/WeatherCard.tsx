import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";
import { WeatherData, getWeatherIcon } from "@/services/weather";

interface WeatherCardProps {
  weather: WeatherData;
  location?: string;
}

export default function WeatherCard({ weather, location }: WeatherCardProps) {
  return (
    <View
      className="rounded-3xl overflow-hidden shadow-lg"
      style={{ elevation: 4 }}
    >
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5"
      >
        {/* Location Header */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="location" size={18} color={COLORS.textWhite} />
          <Text className="ml-2 text-white font-medium text-sm opacity-90">
            {location || "Current Location"}
          </Text>
        </View>

        {/* Main Weather Info */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-5xl font-bold text-white mb-1">
              {weather.temperature}°
            </Text>
            <Text className="text-white text-base capitalize opacity-90 font-medium">
              {weather.description}
            </Text>
            <Text className="text-white text-sm mt-1 opacity-75">
              Feels like {weather.feelsLike}°C
            </Text>
          </View>

          <View className="bg-white/20 rounded-full w-20 h-20 items-center justify-center">
            <Text className="text-5xl">{getWeatherIcon(weather.icon)}</Text>
          </View>
        </View>

        {/* Weather Stats */}
        <View className="flex-row justify-between pt-4 border-t border-white/20">
          <View className="items-center flex-1">
            <View className="bg-white/20 rounded-full p-2 mb-2">
              <Ionicons name="water" size={20} color={COLORS.textWhite} />
            </View>
            <Text className="text-white font-semibold text-base">
              {weather.humidity}%
            </Text>
            <Text className="text-white text-xs opacity-75">Humidity</Text>
          </View>

          <View className="items-center flex-1">
            <View className="bg-white/20 rounded-full p-2 mb-2">
              <Ionicons name="speedometer" size={20} color={COLORS.textWhite} />
            </View>
            <Text className="text-white font-semibold text-base">
              {weather.pressure}
            </Text>
            <Text className="text-white text-xs opacity-75">hPa</Text>
          </View>

          {weather.windSpeed > 0 && (
            <View className="items-center flex-1">
              <View className="bg-white/20 rounded-full p-2 mb-2">
                <Ionicons name="leaf" size={20} color={COLORS.textWhite} />
              </View>
              <Text className="text-white font-semibold text-base">
                {weather.windSpeed}
              </Text>
              <Text className="text-white text-xs opacity-75">m/s</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

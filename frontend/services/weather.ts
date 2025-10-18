import { CONFIG } from "@/constants/config";

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  feelsLike: number;
  pressure: number;
  windSpeed: number;
}

export const getWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw new Error("Failed to fetch weather data. Please try again.");
  }
};

export const getWeatherIcon = (iconCode: string): string => {
  // Map OpenWeatherMap icon codes to appropriate emoji or symbols
  const iconMap: Record<string, string> = {
    "01d": "☀️", // clear sky day
    "01n": "🌙", // clear sky night
    "02d": "🌤️", // few clouds day
    "02n": "☁️", // few clouds night
    "03d": "☁️", // scattered clouds
    "03n": "☁️",
    "04d": "☁️", // broken clouds
    "04n": "☁️",
    "09d": "🌧️", // shower rain
    "09n": "🌧️",
    "10d": "🌦️", // rain day
    "10n": "🌧️", // rain night
    "11d": "⛈️", // thunderstorm
    "11n": "⛈️",
    "13d": "❄️", // snow
    "13n": "❄️",
    "50d": "🌫️", // mist
    "50n": "🌫️",
  };

  return iconMap[iconCode] || "🌤️";
};

import * as Location from "expo-location";

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

export const getLocation = async (): Promise<LocationData> => {
  try {
    // Request permission to access location
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Reverse geocode to get address
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addressComponent = reverseGeocode[0];
        return {
          latitude,
          longitude,
          address: `${addressComponent.street || ""} ${
            addressComponent.streetNumber || ""
          }`.trim(),
          city: addressComponent.city || addressComponent.subregion || "",
          region: addressComponent.region || "",
          country: addressComponent.country || "",
        };
      }
    } catch (geocodeError) {
      console.warn("Reverse geocoding failed:", geocodeError);
    }

    return { latitude, longitude };
  } catch (error) {
    console.error("Error getting location:", error);
    throw new Error("Failed to get location. Please enable location services.");
  }
};

export const formatLocation = (location: LocationData): string => {
  if (location.city && location.region) {
    return `${location.city}, ${location.region}`;
  }
  if (location.city) {
    return location.city;
  }
  if (location.region) {
    return location.region;
  }
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
};

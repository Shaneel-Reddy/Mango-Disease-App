import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface ImageUploaderProps {
  onImageSelected: (imageUri: string) => void;
  loading?: boolean;
}

export default function ImageUploader({
  onImageSelected,
  loading,
}: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and photo library permissions to continue.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const processImage = async (imageUri: string) => {
    try {
      // Resize and compress image for faster upload
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }], // Resize to max width of 800px
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setSelectedImage(manipulatedImage.uri);
      onImageSelected(manipulatedImage.uri);
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    }
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickImage = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Select Image",
      "Choose how you want to select a mango leaf image",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <View className="w-full">
      {selectedImage ? (
        <View className="relative">
          {/* Selected Image */}
          <View
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 10,
              borderWidth: 1,
              borderColor: `${COLORS.primary}40`,
            }}
          >
            <Image
              source={{ uri: selectedImage }}
              className="w-full"
              style={{ height: 320 }}
              resizeMode="cover"
            />
          </View>

          {/* Loading Overlay */}
          {loading && (
            <View
              className="absolute inset-0 rounded-3xl justify-center items-center"
              style={{ backgroundColor: `${COLORS.overlay}CC` }} // subtle overlay
            >
              <View
                className="rounded-2xl px-8 py-6 items-center"
                style={{
                  backgroundColor: `${COLORS.white}F0`,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                  className="mt-4 font-extrabold text-base"
                  style={{ color: COLORS.textPrimary }}
                >
                  Analyzing Image...
                </Text>
                <Text
                  className="mt-1 font-medium text-sm"
                  style={{ color: COLORS.textSecondary }}
                >
                  Please wait
                </Text>
              </View>
            </View>
          )}

          {/* Edit / Change Image Button */}
          {!loading && (
            <TouchableOpacity
              onPress={showImageOptions}
              className="absolute top-4 right-4 rounded-full p-3.5"
              style={{
                backgroundColor: COLORS.white,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 6,
                borderWidth: 1.5,
                borderColor: `${COLORS.primary}30`,
              }}
            >
              <Ionicons name="camera" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="w-full">
          {/* Two Action Buttons */}
          <View className="flex-row mb-4" style={{ gap: 12 }}>
            {/* Camera Button */}
            <TouchableOpacity
              onPress={takePhoto}
              disabled={loading}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: `${COLORS.primary}15`,
              }}
            >
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{
                  backgroundColor: `${COLORS.primary}15`,
                }}
              >
                <Ionicons name="camera" size={28} color={COLORS.primary} />
              </View>
              <Text
                className="text-base font-extrabold text-center"
                style={{ color: COLORS.textPrimary }}
              >
                Camera
              </Text>
              <Text
                className="text-xs font-semibold text-center mt-2"
                style={{ color: COLORS.textSecondary }}
              >
                Take a photo
              </Text>
            </TouchableOpacity>

            {/* Gallery Button */}
            <TouchableOpacity
              onPress={pickImage}
              disabled={loading}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                shadowColor: COLORS.secondary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: `${COLORS.secondary}15`,
              }}
            >
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{
                  backgroundColor: `${COLORS.secondary}15`,
                }}
              >
                <Ionicons name="images" size={28} color={COLORS.secondary} />
              </View>
              <Text
                className="text-base font-extrabold text-center"
                style={{ color: COLORS.textPrimary }}
              >
                Gallery
              </Text>
              <Text
                className="text-xs font-semibold text-center mt-2"
                style={{ color: COLORS.textSecondary }}
              >
                Choose from library
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedImage && !loading && (
        <TouchableOpacity
          onPress={() => onImageSelected(selectedImage)}
          activeOpacity={0.7}
          className="mt-5"
          style={{
            backgroundColor: COLORS.secondary,
            borderRadius: 16,
            paddingVertical: 18,
            paddingHorizontal: 24,
            shadowColor: COLORS.secondary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: `${COLORS.secondary}20`,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Text
              className="text-lg font-extrabold mx-3"
              style={{ color: COLORS.white }}
            >
              <Ionicons name="analytics" size={14} color={COLORS.white} />{" "}
              Analyze Disease
              <Ionicons
                name="arrow-forward-circle"
                size={14}
                color={COLORS.white}
              />
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

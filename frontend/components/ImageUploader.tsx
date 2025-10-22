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
          <View
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
              borderWidth: 2,
              borderColor: `${COLORS.primary}40`,
            }}
          >
            <Image
              source={{ uri: selectedImage }}
              className="w-full"
              style={{ height: 300 }}
              resizeMode="cover"
            />
          </View>
          {loading && (
            <View
              className="absolute inset-0 rounded-3xl justify-center items-center"
              style={{ backgroundColor: `${COLORS.overlay}E6` }}
            >
              <View
                className="rounded-3xl p-8 items-center"
                style={{
                  backgroundColor: `${COLORS.white}F5`,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                  className="mt-4 font-extrabold text-base"
                  style={{ color: COLORS.textPrimary }}
                >
                  Analyzing image...
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
                borderWidth: 2,
                borderColor: `${COLORS.primary}30`,
              }}
            >
              <Ionicons name="camera" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={showImageOptions}
          className="w-full rounded-3xl justify-center items-center overflow-hidden"
          style={{
            borderWidth: 3,
            borderStyle: "dashed",
            borderColor: COLORS.primary,
            backgroundColor: `${COLORS.lightCream}`,
            minHeight: 280,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 4,
          }}
          disabled={loading}
        >
          <View className="items-center px-6 py-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-5"
              style={{
                backgroundColor: `${COLORS.primary}25`,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="camera" size={48} color={COLORS.primary} />
            </View>
            <Text
              className="text-2xl font-extrabold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Capture or Upload
            </Text>
            <Text
              className="text-base text-center leading-6 font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Tap to capture or upload a leaf photo
            </Text>
            <View
              className="mt-4 rounded-full px-5 py-2"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: COLORS.primary }}
              >
                📸 Get Started
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {selectedImage && !loading && (
        <TouchableOpacity
          onPress={() => onImageSelected(selectedImage)}
          activeOpacity={0.8}
          style={{
            width: 360,
            height: 50,
            backgroundColor: COLORS.secondary,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Left Icon */}
            <Ionicons
              name="leaf"
              size={22}
              color={COLORS.textWhite}
              style={{ marginRight: 8 }}
            />

            {/* Text */}
            <Text
              style={{
                color: COLORS.textWhite,
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              Detect Disease
            </Text>

            {/* Right Icon */}
            <Ionicons
              name="arrow-forward"
              size={22}
              color={COLORS.textWhite}
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
          <Image
            source={{ uri: selectedImage }}
            className="w-full h-64 rounded-lg"
            resizeMode="cover"
          />
          {loading && (
            <View className="absolute inset-0 bg-black/50 rounded-lg justify-center items-center">
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text className="text-white mt-2 font-medium">
                Analyzing image...
              </Text>
            </View>
          )}
          {!loading && (
            <TouchableOpacity
              onPress={showImageOptions}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-2"
            >
              <Ionicons name="camera" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={showImageOptions}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg justify-center items-center bg-gray-50"
          disabled={loading}
        >
          <Ionicons
            name="camera-outline"
            size={48}
            color={COLORS.textSecondary}
          />
          <Text className="text-lg font-medium text-gray-600 mt-4">
            Capture or Upload Image
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-4">
            Take a clear photo of a mango leaf for disease detection
          </Text>
        </TouchableOpacity>
      )}

      {selectedImage && !loading && (
        <TouchableOpacity
          onPress={() => onImageSelected(selectedImage)}
          className="mt-4 bg-primary rounded-lg py-4 px-6 flex-row items-center justify-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Ionicons name="leaf" size={20} color={COLORS.white} />
          <Text className="text-white font-semibold ml-2 text-lg">
            Detect Disease
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

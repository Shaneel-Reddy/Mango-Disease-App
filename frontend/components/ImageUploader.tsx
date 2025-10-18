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
          <View
            className="rounded-3xl overflow-hidden shadow-lg"
            style={{ elevation: 4 }}
          >
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-72"
              resizeMode="cover"
            />
          </View>
          {loading && (
            <View
              className="absolute inset-0 rounded-3xl justify-center items-center"
              style={{ backgroundColor: COLORS.overlay }}
            >
              <View className="bg-white/90 rounded-3xl p-6 items-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                  className="mt-3 font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  Analyzing image...
                </Text>
              </View>
            </View>
          )}
          {!loading && (
            <TouchableOpacity
              onPress={showImageOptions}
              className="absolute top-4 right-4 rounded-full p-3 shadow-md"
              style={{ backgroundColor: COLORS.white, elevation: 4 }}
            >
              <Ionicons name="camera" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={showImageOptions}
          className="w-full h-72 rounded-3xl justify-center items-center shadow-md"
          style={{
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: COLORS.primary,
            backgroundColor: COLORS.lightCream,
            elevation: 2,
          }}
          disabled={loading}
        >
          <View className="items-center px-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <Ionicons name="camera" size={40} color={COLORS.primary} />
            </View>
            <Text
              className="text-xl font-bold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Capture or Upload Image
            </Text>
            <Text
              className="text-sm text-center leading-5"
              style={{ color: COLORS.textSecondary }}
            >
              Take a clear photo of a mango leaf for disease detection
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {selectedImage && !loading && (
        <TouchableOpacity
          onPress={() => onImageSelected(selectedImage)}
          className="mt-5 rounded-full py-4 px-6 flex-row items-center justify-center shadow-lg"
          style={{
            backgroundColor: COLORS.secondary,
            elevation: 4,
          }}
        >
          <Ionicons name="leaf" size={22} color={COLORS.textWhite} />
          <Text className="text-white font-bold ml-3 text-lg">
            Detect Disease
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

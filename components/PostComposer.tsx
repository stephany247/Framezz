// components/PostComposer.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Image as RNImage,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { uploadToCloudinary } from "@/utils/upload";
import CropSheet from "./CropSheet";

type MediaItem = { uri: string; originalUri?: string; kind: "image" | "video" };

export default function PostComposer() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const createPost = useMutation(api.posts.createPost);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  async function pickMedia() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your media library."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!res.canceled && res.assets?.length) {
        const asset = res.assets[0];
        const kind = /\.(mp4|mov|m4v|webm)$/i.test(asset.uri ?? "")
          ? "video"
          : "image";
        setMediaItems((s) => [
          ...s,
          { uri: asset.uri, originalUri: asset.uri, kind },
        ]);
      }
    } catch (e) {
      console.error("pickMedia error", e);
      Alert.alert("Error", "Could not open media picker.");
    }
  }

  function removeMedia(index: number) {
    setMediaItems((s) => s.filter((_, i) => i !== index));
  }

  function getImageSize(
    uri: string
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      RNImage.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (err) => reject(err)
      );
    });
  }

  function resetImageAtIndex(index: number) {
    setMediaItems((prev) => {
      const copy = [...prev];
      const item = copy[index];
      if (item && item.originalUri)
        copy[index] = { ...item, uri: item.originalUri };
      return copy;
    });
  }

  async function cropImageAtIndex(
    index: number,
    ratioW: number,
    ratioH: number
  ) {
    const item = mediaItems[index];
    if (!item || item.kind !== "image") {
      Alert.alert("Crop not available", "Only images can be cropped.");
      return;
    }

    try {
      const src = item.uri.startsWith("file://")
        ? (item.originalUri ?? item.uri)
        : item.uri;
      const { width, height } = await getImageSize(src);

      const targetAspect = ratioW / ratioH;
      const srcAspect = width / height;

      let cropWidth = width;
      let cropHeight = height;
      let originX = 0;
      let originY = 0;

      if (srcAspect > targetAspect) {
        cropHeight = height;
        cropWidth = Math.round(height * targetAspect);
        originX = Math.round((width - cropWidth) / 2);
      } else {
        cropWidth = width;
        cropHeight = Math.round(width / targetAspect);
        originY = Math.round((height - cropHeight) / 2);
      }

      const manipulated = await ImageManipulator.manipulateAsync(
        src,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setMediaItems((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          uri: manipulated.uri,
          originalUri: copy[index].originalUri ?? copy[index].uri,
        };
        return copy;
      });

      setCropModalVisible(false);
      setCropTargetIndex(null);
    } catch (e) {
      console.warn("crop failed", e);
      Alert.alert("Crop failed", "Could not crop image.");
    }
  }

  async function submit() {
    if (mediaItems.length === 0) {
      Alert.alert("Add at least one image or video.");
      return;
    }

    setUploading(true);
    try {
      const media: { url: string; kind: "image" | "video" }[] = [];
      for (const item of mediaItems) {
        const normalized = item.uri.startsWith("file://")
          ? item.uri
          : `file://${item.uri}`;
        const url = await uploadToCloudinary(normalized);
        media.push({ url, kind: item.kind });
      }

      await createPost({ media, caption: caption || undefined });
      setCaption("");
      setMediaItems([]);
      Alert.alert("Success", "Post created.");
    } catch (e) {
      console.error("submit error", e);
      Alert.alert("Failed to create post", String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="w-full"
    >
      <View className="bg-gray-900 rounded-lg p-4">
        <Text className="text-lg text-gray-100 mb-2">Post Caption</Text>

        <TextInput
          placeholder="Add a caption..."
          placeholderTextColor="#9CA3AF"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={3}
          className="bg-gray-700 text-white rounded-md p-3 mb-6"
        />

        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={pickMedia}
            activeOpacity={0.8}
            className="flex-row items-center bg-sky-500 px-4 py-2 rounded-md"
          >
            <Ionicons name="images" size={18} color="#fff" />
            <Text className="text-white ml-2">Add photo / video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setCaption("");
              setMediaItems([]);
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-3 py-2"
          >
            <Ionicons name="trash-outline" size={18} color="#F87171" />
            <Text className="text-red-400 ml-2">Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {mediaItems.length === 0 ? (
            <View className="w-full items-center justify-center py-8">
              <Text className="text-gray-300 text-lg font-medium">
                No media selected.
              </Text>
            </View>
          ) : (
            mediaItems.map((m, idx) => (
              <View key={idx} className="mr-3">
                <Image
                  source={{ uri: m.uri }}
                  className="w-32 h-32 rounded-md"
                  style={{ resizeMode: "cover" }}
                />

                <Pressable
                  onPress={() => removeMedia(idx)}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                  style={{ zIndex: 2 }}
                  accessibilityLabel="Remove media"
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>

                {m.kind === "image" && (
                  <Pressable
                    onPress={() => {
                      setCropTargetIndex(idx);
                      setCropModalVisible(true);
                    }}
                    className="absolute left-2 bottom-2 bg-black/60 rounded-full px-2 py-1 flex-row items-center"
                  >
                    <Ionicons name="crop" size={12} color="#fff" />
                    <Text className="text-white text-xs ml-1">Crop</Text>
                  </Pressable>
                )}

                {m.kind === "video" && (
                  <View className="absolute left-2 bottom-2 bg-black/60 rounded-full px-2 py-1 flex-row items-center">
                    <Ionicons name="videocam" size={12} color="#fff" />
                    <Text className="text-white text-xs ml-1">Video</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <View className="flex-row items-center justify-end mt-2">
          <Pressable
            onPress={submit}
            disabled={uploading}
            className={`flex-row items-center px-4 py-2 rounded-md ${uploading ? "bg-gray-700" : "bg-sky-500"}`}
          >
            {uploading ? (
              <View>
                <ActivityIndicator
                  size="small"
                  color=" #0ea5e9"
                  className="mr-2"
                />
              </View>
            ) : (
              <Ionicons
                name="cloud-upload"
                size={16}
                color="#fff"
                className="mr-2"
              />
            )}
            <Text className="text-white font-semibold">
              {uploading ? "Posting..." : "Post"}
            </Text>
          </Pressable>
        </View>

        {/* Crop modal */}
        <CropSheet
          visible={cropModalVisible}
          onClose={() => {
            setCropModalVisible(false);
            setCropTargetIndex(null);
          }}
          onSelect={(w, h) => {
            if (cropTargetIndex === null) {
              setCropModalVisible(false);
              return;
            }
            cropImageAtIndex(cropTargetIndex, w, h);
          }}
          onReset={() => {
            if (cropTargetIndex !== null) {
              resetImageAtIndex(cropTargetIndex);
            }
            setCropModalVisible(false);
            setCropTargetIndex(null);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

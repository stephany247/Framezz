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
  Image as RNImage,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { uploadToCloudinary } from "@/utils/upload";
import CropSheet from "./CropSheet";
import { useVideoPlayer, VideoView } from "expo-video";
import { router } from "expo-router";

type MediaItem = { uri: string; originalUri?: string; kind: "image" | "video" };

export default function PostComposer() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const createPost = useMutation(api.posts.createPost);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);
  const [isSquare, setIsSquare] = useState(true);

  async function pickMedia() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your media library.",
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
    uri: string,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      RNImage.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (err) => reject(err),
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
    ratioH: number,
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
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
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
      router.replace("/(tabs)/feed");
    } catch (e) {
      console.error("submit error", e);
      Alert.alert("Failed to create post", String(e));
    } finally {
      setUploading(false);
    }
  }

  const { width } = Dimensions.get("window");

  function MediaVideo({ url }: { url: string }) {
    const player = useVideoPlayer({ uri: url });

    return (
      <View
        style={{
          width,
          height: width,
          alignSelf: "center",
        }}
      >
        <VideoView
          player={player}
          style={{ width, height: width }}
          contentFit={isSquare ? "cover" : "contain"}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white dark:bg-gray-950"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        className=""
      >
        {/* Media Preview */}
        <View className="w-full bg-gray-300 dark:bg-gray-800">
          {mediaItems.length === 0 ? (
            <TouchableOpacity
              onPress={pickMedia}
              className="h-80 items-center justify-center"
            >
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">Tap to add media</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {mediaItems.map((m, idx) => (
                <View key={idx} className="relative" style={{ width }}>
                  {m.kind === "video" ? (
                    <MediaVideo url={m.uri} />
                  ) : (
                    <Image
                      source={{ uri: m.uri }}
                      style={{
                        width: "100%",
                        height: width,
                        resizeMode: isSquare ? "cover" : "contain",
                      }}
                    />
                  )}
                  <Pressable
                    onPress={() => setIsSquare(!isSquare)}
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                      padding: 4,
                    }}
                  >
                    <Ionicons
                      name={isSquare ? "resize" : "expand"}
                      size={20}
                      color="#fff"
                    />
                  </Pressable>

                  {m.kind === "image" && (
                    <Pressable
                      onPress={() => {
                        setCropTargetIndex(idx);
                        setCropModalVisible(true);
                      }}
                      style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons name="crop" size={16} color="#fff" />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => removeMedia(idx)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                      padding: 4,
                      zIndex: 5,
                    }}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Caption Section */}
        <View className="px-4 py-4">
          <TextInput
            placeholder="Write a caption..."
            placeholderTextColor="#9CA3AF"
            value={caption}
            onChangeText={setCaption}
            multiline
            className="text-base text-black dark:text-white"
          />
        </View>

        {/* Add Media Button (subtle style) */}
        <View className="border-t border-gray-200 dark:border-gray-800 px-4 py-4">
          <TouchableOpacity
            onPress={pickMedia}
            className="flex-row items-center"
          >
            <Ionicons name="images-outline" size={22} color="#0ea5e9" />
            <Text className="ml-3 text-base text-sky-500 font-medium">
              Add Photo / Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Post Button */}
        <View className="px-4 mt-6">
          <Pressable
            onPress={submit}
            disabled={uploading}
            className={`py-3 rounded-xl items-center ${
              uploading ? "bg-gray-400" : "bg-sky-500"
            }`}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="send" size={18} color="#fff" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Share Post
                </Text>
              </View>
            )}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

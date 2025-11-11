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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { uploadToCloudinary } from "@/utils/upload";

type MediaItem = { uri: string; kind: "image" | "video" };

export default function PostComposer() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const createPost = useMutation(api.posts.createPost);

  // crop modal state
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  async function pickMedia() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "We need access to your media library.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!res.canceled && res.assets?.length) {
        const asset = res.assets[0];
        const kind = /\.(mp4|mov|m4v|webm)$/i.test(asset.uri ?? "") ? "video" : "image";
        setMediaItems((s) => [...s, { uri: asset.uri, kind }]);
      }
    } catch (e) {
      console.error("pickMedia error", e);
      Alert.alert("Error", "Could not open media picker.");
    }
  }

  function removeMedia(index: number) {
    setMediaItems((s) => s.filter((_, i) => i !== index));
  }

  // helper: get image size using Image.getSize
  function getImageSize(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (err) => reject(err)
      );
    });
  }

  // center-crop at index with aspect ratio ratioW:ratioH
  async function cropImageAtIndex(index: number, ratioW: number, ratioH: number) {
    const item = mediaItems[index];
    if (!item || item.kind !== "image") {
      Alert.alert("Crop not available", "Only images can be cropped.");
      return;
    }

    try {
      // ensure a file URI compatible with Image.getSize and manipulator
      const src = item.uri.startsWith("file://") ? item.uri : item.uri;

      const { width, height } = await getImageSize(src);

      const targetAspect = ratioW / ratioH;
      const srcAspect = width / height;

      let cropWidth = width;
      let cropHeight = height;
      let originX = 0;
      let originY = 0;

      if (srcAspect > targetAspect) {
        // source is wider; crop left/right
        cropHeight = height;
        cropWidth = Math.round(height * targetAspect);
        originX = Math.round((width - cropWidth) / 2);
      } else {
        // source is taller; crop top/bottom
        cropWidth = width;
        cropHeight = Math.round(width / targetAspect);
        originY = Math.round((height - cropHeight) / 2);
      }

      const manipulated = await ImageManipulator.manipulateAsync(
        src,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      // replace the mediaItems[index] with the cropped uri
      setMediaItems((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], uri: manipulated.uri };
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
        const normalized = item.uri.startsWith("file://") ? item.uri : `file://${item.uri}`;
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="bg-gray-900 rounded-lg p-4">
        <Text className="text-lg text-gray-100 mb-2">Post Caption</Text>
        <TextInput
          placeholder="Add a caption..."
          placeholderTextColor="#9CA3AF"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={3}
          className="bg-gray-800 text-white rounded-md p-3 mb-8"
        />

        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={pickMedia}
            activeOpacity={0.8}
            className="flex-row items-center bg-[#0ea5e9] px-4 py-2 rounded-md"
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {mediaItems.length === 0 ? (
            <View className="w-full items-center justify-center">
              <Text className="text-gray-500 text-lg font-medium">No media selected.</Text>
            </View>
          ) : (
            mediaItems.map((m, idx) => (
              <View key={idx} className="mr-3" style={{ width: 128, height: 128 }}>
                <Image
                  source={{ uri: m.uri }}
                  className="w-32 h-32 rounded-md"
                  style={{ resizeMode: "cover", width: 128, height: 128, borderRadius: 8 }}
                />

                {/* overlay remove button */}
                <Pressable
                  onPress={() => removeMedia(idx)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                  style={{ top: 6, right: 6 }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>

                {/* CROP button for images */}
                {m.kind === "image" && (
                  <Pressable
                    onPress={() => {
                      setCropTargetIndex(idx);
                      setCropModalVisible(true);
                    }}
                    className="absolute left-1 bottom-1 bg-black/60 rounded-full px-2 py-1 flex-row items-center"
                    style={{ left: 6, bottom: 6 }}
                  >
                    <Ionicons name="crop" size={12} color="#fff" />
                    <Text className="text-white text-xs ml-1">Crop</Text>
                  </Pressable>
                )}

                {/* video badge */}
                {m.kind === "video" && (
                  <View
                    className="absolute left-1 bottom-1 bg-black/60 rounded-full px-2 py-1 flex-row items-center"
                    style={{ left: 6, bottom: 6 }}
                  >
                    <Ionicons name="videocam" size={12} color="#fff" />
                    <Text className="text-white text-xs ml-1">Video</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <View className="flex-row items-center justify-end mt-12">
          <Pressable
            onPress={submit}
            disabled={uploading}
            className={`flex-row items-center px-4 py-2 rounded-md ${uploading ? "bg-gray-700" : "bg-[#0ea5e9]"}`}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="cloud-upload" size={16} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text className="text-white font-semibold">{uploading ? "Posting..." : "Post"}</Text>
          </Pressable>
        </View>

        {/* Crop modal */}
        <Modal
          visible={cropModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCropModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-[rgba(0,0,0,0.4)]">
            <View className="bg-gray-900 p-4 rounded-t-xl">
              <Text className="text-white mb-3 text-lg font-semibold border-b border-gray-500 pb-2">Choose crop</Text>

              <TouchableOpacity
                onPress={() => cropTargetIndex !== null && cropImageAtIndex(cropTargetIndex, 1, 1)}
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-white">Square (1:1)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => cropTargetIndex !== null && cropImageAtIndex(cropTargetIndex, 4, 3)}
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-white">4:3</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => cropTargetIndex !== null && cropImageAtIndex(cropTargetIndex, 16, 9)}
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-white">16:9</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCropModalVisible(false)} style={{ paddingVertical: 12 }}>
                <Text className="text-[#aaa]">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

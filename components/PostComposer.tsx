// src/components/PostComposer.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { uploadToCloudinary } from "@/utils/upload";

export default function PostComposer() {
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const createPost = useMutation(api.posts.createPost);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!res.canceled) setMediaUris((s) => [...s, res.assets[0].uri]);
    console.log(res);
  }

  async function submit() {
    if (mediaUris.length === 0) {
      Alert.alert("Add at least one image or video.");
      return;
    }

    try {
      // upload in sequence (parallel is possible but keep simple)
      const media = [];
      for (const uri of mediaUris) {
        // on Android sometimes we must ensure uri starts with file://
        const normalizedUri = uri.startsWith("file://") ? uri : `file://${uri}`;
        const url = await uploadToCloudinary(normalizedUri);
        const kind = /\.(mp4|mov)$/i.test(uri) ? "video" : "image";
        media.push({ url, kind });
      }

      await createPost({ media, caption: caption || undefined });
      // reset UI
      setMediaUris([]);
      setCaption("");
    } catch (e) {
      console.error("Create post failed", e);
      Alert.alert("Failed to create post", String(e));
    }
  }

  return (
    <View style={{ padding: 12 }}>
      <TextInput
        placeholder="Write a caption (optional)"
        value={caption}
        onChangeText={setCaption}
        style={{ borderWidth: 1, padding: 8, borderRadius: 8, marginBottom: 8 }}
      />

      <Button title="Pick image/video" onPress={pickImage} />

      <ScrollView horizontal style={{ marginVertical: 12 }}>
        {mediaUris.map((u, i) => (
          <Image
            key={i}
            source={{ uri: u }}
            style={{ width: 120, height: 120, marginRight: 8 }}
          />
        ))}
      </ScrollView>

      <Button title="Post" onPress={submit} />
    </View>
  );
}

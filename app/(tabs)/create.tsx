// app/(tabs)/upload.tsx
import PostComposer from "@/components/PostComposer";
import React from "react";
import { View, Text } from "react-native";

export default function UploadScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop:"auto" }}>
      <Text>Upload</Text>
      <PostComposer />
    </View>
  );
}

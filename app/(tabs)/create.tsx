// app/(tabs)/upload.tsx
import React from "react";
import { ScrollView, Text } from "react-native";
import PostComposer from "@/components/PostComposer";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-white mb-4">Create</Text>
        <PostComposer />
      </ScrollView>
    </SafeAreaView>
  );
}

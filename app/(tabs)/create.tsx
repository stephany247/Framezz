import React from "react";
import { ScrollView, Text, useColorScheme } from "react-native";
import PostComposer from "@/components/PostComposer";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadScreen() {
  const scheme = useColorScheme();
  // const isDark = scheme === "dark";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        className="bg-white dark:bg-gray-950"
      >
        <PostComposer />
      </ScrollView>
    </SafeAreaView>
  );
}

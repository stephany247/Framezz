import { Post } from "@/utils/types";
import React from "react";
import { View, Text } from "react-native";

export default function Caption({ post }: { post: Post }) {
  if (!post.caption) return null;
  return (
    <View className="px-3 pb-1 flex-row flex-wrap gap-2">
      <Text className="font-semibold mb-1 text-black dark:text-white">{post.authorName}</Text>
      <Text className="text-gray-700 dark:text-gray-300">{post.caption}</Text>
    </View>
  );
}

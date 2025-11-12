import { Post } from "@/utils/types";
import React from "react";
import { View, Text } from "react-native";

export default function Caption({ post }: { post: Post }) {
  if (!post.caption) return null;
  return (
    <View className="px-3 pb-1 flex-row gap-2">
      <Text className="font-semibold mb-1 text-white">{post.authorName}</Text>
      <Text className="text-gray-200">{post.caption}</Text>
    </View>
  );
}

import React from "react";
import { View, Text, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import formatTime from "@/utils/formatTime";
import { Post } from "@/utils/types";

export default function PostHeader({ post }: { post: Post }) {
  const time = formatTime(post._creationTime);
  return (
    <View className="p-3 flex-row items-center">
      {post.authorProfileImage ? (
        <Image
          source={{ uri: post.authorProfileImage }}
          className="w-9 h-9 rounded-full mr-3 border border-gray-300 dark:border-gray-700"
        />
      ) : (
        <Ionicons
          name="person-circle"
          size={36}
          color="#9CA3AF"
          className="mr-3"
        />
      )}
      <View className="flex-1">
        <Text className="text-black dark:text-white font-semibold" numberOfLines={1}>
          {post.authorName ?? "Anonymous"}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm">{time}</Text>
      </View>
    </View>
  );
}

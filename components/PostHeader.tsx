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
          className="w-9 h-9 rounded-full mr-3 border border-white/30"
        />
      ) : (
        <Ionicons
          name="person-circle"
          size={36}
          color="rgba(255,255,255,0.95)"
          className="mr-3"
        />
      )}
      <View className="flex-1">
        <Text className="text-white font-semibold" numberOfLines={1}>
          {post.authorName ?? "Anonymous"}
        </Text>
        <Text className="text-gray-300 text-sm">{time}</Text>
      </View>
    </View>
  );
}

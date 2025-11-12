import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  likeCount: number | string;
  hasLiked: boolean;
  onToggleLike: () => void;
  onOpenLikers: () => void;
  onOpenComments: () => void;
  commentsCount: number | undefined;
};

export default function PostActions({
  likeCount,
  hasLiked,
  onToggleLike,
  onOpenLikers,
  onOpenComments,
  commentsCount,
}: Props) {
  return (
    <View className="px-3 p-2 flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <View className="flex-row gap-1 items-center">
          <TouchableOpacity activeOpacity={0.7} onPress={onToggleLike}>
            {hasLiked ? (
              <Ionicons name="heart" size={24} color="#ff6b6b" />
            ) : (
              <Ionicons name="heart-outline" size={24} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenLikers}>
            <Text className="text-gray-300 text-lg font-medium">{likeCount}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-1 items-center">
          <TouchableOpacity activeOpacity={0.7} onPress={onOpenComments}>
            <Ionicons name="chatbubble-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-gray-300 text-lg font-medium">{commentsCount ?? 0}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onOpenComments}>
        <Text className="text-gray-300 text-sm">{(commentsCount ?? 0) + " comments"}</Text>
      </TouchableOpacity>
    </View>
  );
}

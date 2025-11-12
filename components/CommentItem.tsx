import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Comment } from "@/utils/types";
import formatTime from "@/utils/formatTime";

export default function CommentItem({
  item,
  currentUserId,
  onDelete,
}: {
  item: Comment;
  currentUserId?: string | number;
  onDelete: (id: string | any) => void;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-row items-center gap-2">
          {item.authorProfileImage ? (
            <Image
              source={{ uri: item.authorProfileImage }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#666" />
          )}

          <View className="flex-col gap-1 justify-start items-start">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-bold text-lg">
                {item.authorName ?? "Anonymous"}
              </Text>
              <Text className="text-gray-300 text-sm">
                {formatTime(item._creationTime)}
              </Text>
            </View>
            <Text className="text-gray-100 mt-1">{item.text}</Text>
          </View>
        </View>

        {currentUserId &&
        item.authorId &&
        String(item.authorId) === String(currentUserId) ? (
          <TouchableOpacity onPress={() => onDelete(item._id)} className="ml-2">
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LikeItem } from "@/utils/types";
import formatTime from "@/utils/formatTime";

type Props = {
  visible: boolean;
  onClose: () => void;
  likes: LikeItem[];
  onToggleLike: () => void;
  hasLiked: boolean;
};

export default function LikersModal({
  visible,
  onClose,
  likes,
  onToggleLike,
  hasLiked,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      className="bg-white dark:bg-gray-950"
    >
      <View className="flex-1 bg-black/40 justify-end">
        {/* Overlay */}
        <Pressable
          onPress={onClose}
          className="bg-white/50 dark:bg-gray-950/80 absolute inset-0"
        />

        {/* Bottom Sheet */}
        <View className="h-[80%] bg-white dark:bg-gray-950 rounded-t-3xl overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons
                name="arrow-back-sharp"
                size={24}
                color={isDark ? "#e5e7eb" : "#111827"}
              />
            </TouchableOpacity>

            <Text className="text-xl font-semibold text-black dark:text-white">
              Likes
            </Text>

            <View className="w-11" />
          </View>

          {/* List */}
          <FlatList
            data={likes ?? []}
            keyExtractor={(item) => String(item.likeId ?? item.userId)}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 20,
              gap: 12,
            }}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center">
                {item.profileImage ? (
                  <Image
                    source={{ uri: item.profileImage }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color={isDark ? "#9ca3af" : "#666"}
                    style={{ marginRight: 12 }}
                  />
                )}

                <View className="flex-1">
                  <Text className="font-semibold text-black dark:text-white">
                    {item.username}
                  </Text>
                  {item.likedAt && (
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatTime(item.likedAt)}
                    </Text>
                  )}
                </View>

                <TouchableOpacity onPress={onToggleLike}>
                  <Ionicons
                    name={hasLiked ? "heart" : "heart-outline"}
                    size={22}
                    color={hasLiked ? "#ff6b6b" : isDark ? "#e5e7eb" : "#111827"}
                  />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="p-6 items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  No likes yet
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LikeItem } from "@/utils/types";
import formatTime from "@/utils/formatTime";

type Props = {
  visible: boolean;
  onClose: () => void;
  likes: LikeItem[]; // raw server likes array
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
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="arrow-back-sharp" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-2xl">Likes</Text>
          <View className="w-11" />
        </View>

        <FlatList
          data={likes ?? []}
          keyExtractor={(item) => String(item.likeId ?? item.userId)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="mb-4 flex-row items-center">
              {item.profileImage ? (
                <Image
                  source={{ uri: item.profileImage }}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color="#666"
                  style={{ marginRight: 12 }}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text className="text-white font-semibold">
                  {item.username}
                </Text>
                {item.likedAt ? (
                  <Text className="text-gray-300 text-sm">
                    {formatTime(item.likedAt)}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity activeOpacity={0.7} onPress={onToggleLike}>
                {hasLiked ? (
                  <Ionicons name="heart" size={24} color="#ff6b6b" />
                ) : (
                  <Ionicons name="heart-outline" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="p-6 items-center">
              <Text className="text-gray-500">No likes yet</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

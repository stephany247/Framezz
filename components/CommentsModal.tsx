import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Comment } from "@/utils/types";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentItem from "./CommentItem";

type Props = {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  currentUserId?: string | number;
  newComment: string;
  setNewComment: (s: string) => void;
  onAddComment: () => void;
  onDeleteComment: (id: string | any) => void;
};

export default function CommentsModal({
  visible,
  onClose,
  comments,
  currentUserId,
  newComment,
  setNewComment,
  onAddComment,
  onDeleteComment,
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
        {/* DARK OVERLAY (click to close) */}
        <Pressable
          onPress={onClose}
          className="bg-white/50 dark:bg-gray-950/80 absolute inset-0"
        />

        {/* Sheet */}
        <View className="h-[85%] bg-white dark:bg-gray-950 rounded-t-3xl overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons
                name="arrow-back-sharp"
                size={24}
                color={isDark ? "#e5e7eb" : "#111827"}
              />
            </TouchableOpacity>
            {/* Header */}
            <Text className="text-xl font-semibold text-black dark:text-white">
              Comments
            </Text>
            <View className="w-11"></View>
          </View>

          <FlatList
            data={comments ?? []}
            keyExtractor={(item) => String(item._id)}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 0,
              flexDirection: "column",
              gap: 12,
            }}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CommentItem
                item={item}
                currentUserId={currentUserId}
                onDelete={onDeleteComment}
              />
            )}
            ListEmptyComponent={() => (
              <View className="p-6 items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  No comments yet — be the first.
                </Text>
              </View>
            )}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="flex-row items-center px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black pb-8">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                placeholderTextColor="#666"
                className="flex-1 p-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full"
                onSubmitEditing={onAddComment}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={onAddComment} className="ml-2">
                <Ionicons name="send-sharp" size={24} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

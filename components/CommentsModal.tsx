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
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="arrow-back-sharp" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-2xl">Comments</Text>
          <View className="w-11" />
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
          renderItem={({ item }) => (
            <CommentItem
              item={item}
              currentUserId={currentUserId}
              onDelete={onDeleteComment}
            />
          )}
          ListEmptyComponent={() => (
            <View className="p-6 items-center">
              <Text className="text-gray-500">
                No comments yet — be the first.
              </Text>
            </View>
          )}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-row items-center p-3 bg-gray-900 border-t border-gray-800">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Write a comment..."
              placeholderTextColor="#666"
              className="flex-1 p-3 bg-gray-700 text-white rounded-full"
              onSubmitEditing={onAddComment}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={onAddComment} className="ml-2">
              <Ionicons name="send-sharp" size={24} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

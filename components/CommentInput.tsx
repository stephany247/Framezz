import React from "react";
import { View, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CommentInput({ value, onChange, onSend }: { value: string; onChange: (s: string) => void; onSend: () => void; }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-row items-center p-3 bg-gray-900 border-t border-gray-800">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Write a comment..."
          placeholderTextColor="#666"
          className="flex-1 p-3 bg-gray-700 text-white rounded-full"
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={onSend} className="ml-2"><Ionicons name="send-sharp" size={24} color="#0ea5e9" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

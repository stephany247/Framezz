// src/screens/Feed.tsx
import React from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PostCard from "@/components/PostCard";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { Post } from "@/utils/types";

export type Media = { kind: string; url: string; poster?: string };

export default function Feed() {
  const posts = useQuery(api.posts.getAllPosts);
  const { userId: currentUserId } = useStoreUserEffect();

  if (!posts) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#0ea5e9" size="large" />
        <Text className="text-gray-400 mt-2">Loading feed…</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-gray-400 text-base">No posts yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts as Post[]}
      keyExtractor={(item) => String(item._id)}
      renderItem={({ item }) => (
        <PostCard post={item as Post} currentUserId={currentUserId} />
      )}
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingBottom: 60 }}
    />
  );
}

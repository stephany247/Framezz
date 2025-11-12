// src/screens/Feed.tsx
import React from "react";
import { FlatList } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PostCard, { Post } from "@/components/PostCard";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

export type Media = { kind: string; url: string; poster?: string };

export default function Feed() {
  const posts = useQuery(api.posts.getAllPosts) ?? [];
  const { userId: currentUserId } = useStoreUserEffect();

  return (
    <FlatList
      data={posts as Post[]}
      keyExtractor={(item) => String(item._id)}
      renderItem={({ item }) => (
        <PostCard post={item as Post} currentUserId={currentUserId} />
      )}
      className="bg-black"
    />
  );
}

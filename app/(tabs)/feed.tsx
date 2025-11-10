// src/screens/Feed.tsx
import React from "react";
import { FlatList } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PostCard from "@/components/PostCard";

export type Media = { kind: string; url: string; poster?: string };
type Post = {
  _id: string;
  _creationTime: string | number | Date;
  authorName?: string;
  authorProfileImage?: string;
  media?: Media[];
  caption?: string;
};

export default function Feed() {
  const posts = useQuery(api.posts.getAllPosts) ?? [];

  return (
    <FlatList
      data={posts as Post[]}
      keyExtractor={(item) => String(item._id)}
      renderItem={({ item }) => <PostCard post={item as Post} />}
      className="bg-black"
    />
  );
}

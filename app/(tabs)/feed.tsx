// src/screens/Feed.tsx
import React from "react";
import { View, FlatList, Text, Image } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Feed() {
  const posts = useQuery(api.posts.getAllPosts) ?? [];

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <PostCard post={item} />}
      contentContainerStyle={{ padding: 12 }}
    />
  );
}

function PostCard({ post }: { post: any }) {
  const when = post.createdAt ?? post._creationTime;
  const whenText = typeof when === "string" ? new Date(when).toLocaleString() : new Date(when).toLocaleString();

  return (
    <View style={{ marginBottom: 16, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
        {post.authorProfileImage ? (
          <Image source={{ uri: post.authorProfileImage }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }} />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#ddd", marginRight: 8 }} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600" }}>{post.authorName}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>{whenText}</Text>
        </View>
      </View>

      {/* show first media item as main preview */}
      {post.media?.length > 0 && post.media[0].kind === "image" ? (
        <Image source={{ uri: post.media[0].url }} style={{ width: "100%", height: 320 }} />
      ) : post.media?.length > 0 ? (
        <View style={{ width: "100%", height: 320, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>Video</Text>
        </View>
      ) : null}

      {post.caption ? <Text style={{ padding: 10 }}>{post.caption}</Text> : null}
    </View>
  );
}

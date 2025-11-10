// src/screens/Feed.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useVideoPlayer, VideoView } from "expo-video";

type Media = {
  kind: string;
  url: string;
  poster?: string;
};

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
      // contentContainerStyle={{ padding: 12 }}
      className="bg-black text-white"
    />
  );
}

function PostCard({ post }: { post: Post }) {
  const when = post._creationTime;
  const time = formatTime(when);

  const media = post.media && post.media.length > 0 ? post.media[0] : null;
  const isImage = media?.kind === "image";
  const isVideo = media?.kind === "video";

  const player = useVideoPlayer((media?.url ?? "") as any);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!player) return;
    try {
      (player as any).loop = true;
      (player as any).setLoop?.(true);
    } catch {}
    setIsPlaying(false);
  }, [player]);


  const Overlay = () => (
    <View className="p-2 flex-row items-center">
      {post.authorProfileImage ? (
        <Image
          source={{ uri: post.authorProfileImage }}
          className="w-9 h-9 rounded-full mr-3 border border-white/30"
        />
      ) : (
        <Ionicons
          name="person-circle"
          size={36}
          color="rgba(255,255,255,0.95)"
          className="mr-3"
        />
      )}

      <View className="flex-1">
        <Text className="text-white font-semibold text-sm" numberOfLines={1}>
          {post.authorName ?? "Anonymous"}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="mb-4 overflow-hidden">
      <Overlay />

      {media ? (
        isImage ? (
          <ImageBackground
            source={{ uri: media.url }}
            className="w-full aspect-square"
            imageStyle={{ resizeMode: "cover" }}
          />
        ) : isVideo ? (
          <View
            className="w-full aspect-square bg-black"
          >
            <VideoView
              player={player}
              className="w-full h-auto aspect-square"
              allowsFullscreen
              allowsPictureInPicture
            />
          </View>
        ) : null
      ) : (
        <View className="w-full" style={{ aspectRatio: 1 }}>
          <View className="flex-1 items-center justify-center bg-gray-100">
            <Text className="text-gray-400">No media</Text>
          </View>
        </View>
      )}

      {post.caption ? (
        <View className="p-3 pb-1 flex-row gap-2">
          <Text className="font-semibold mb-1 text-white">
            {post.authorName}
          </Text>
          <Text className="text-gray-50">{post.caption}</Text>
        </View>
      ) : null}
      <Text className="px-3 pb-4 text-gray-100 text-sm">{time}</Text>
    </View>
  );
}

function formatTime(time: string | number | Date): string {
  const now = new Date();
  const postTime = new Date(time);
  const diff = (now.getTime() - postTime.getTime()) / 1000; // seconds

  const minute = 60;
  const hour = 3600;
  const day = 86400;
  const week = 604800;
  const month = 2592000;
  const year = 31536000;

  if (diff < minute) return "Just now";
  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }
  if (diff < day) {
    const hrs = Math.floor(diff / hour);
    return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  }
  if (diff < 2 * day) return "Yesterday";
  if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const sameYear = postTime.getFullYear() === now.getFullYear();
  return postTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

import React from "react";
import { View, Text, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MediaCarousel from "./MedialCarousel";
import { Media } from "@/app/(tabs)/feed";
// import MediaCarousel, { Media } from "@/components/MediaCarousel";

type Post = {
  _id: string;
  _creationTime: string | number | Date;
  authorName?: string;
  authorProfileImage?: string;
  media?: Media[];
  caption?: string;
};

export default function PostCard({ post }: { post: Post }) {
  const when = post._creationTime;
  const time = formatTime(when);

  return (
    <View className="mb-4 overflow-hidden">
      {/* overlay (author) */}
      <View className="p-3 flex-row items-center">
        {post.authorProfileImage ? (
          <Image source={{ uri: post.authorProfileImage }} className="w-9 h-9 rounded-full mr-3 border border-white/30" />
        ) : (
          <Ionicons name="person-circle" size={36} color="rgba(255,255,255,0.95)" style={{ marginRight: 12 }} />
        )}
        <View className="flex-1">
          <Text className="text-white font-semibold" numberOfLines={1}>
            {post.authorName ?? "Anonymous"}
          </Text>
          <Text className="text-gray-300 text-sm">{time}</Text>
        </View>
      </View>

      {/* carousel */}
      <MediaCarousel media={post.media} />

      {/* caption */}
      {post.caption ? (
        <View className="p-3 pb-1 flex-row gap-2">
          <Text className="font-semibold mb-1 text-white">{post.authorName}</Text>
          <Text className="text-gray-200">{post.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ---------- helper: Instagram-style time ---------- */
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
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
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

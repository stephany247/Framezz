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
    // runtime-safe loop setup (avoid TS errors by casting to any)
    try {
      (player as any).loop = true;
      (player as any).setLoop?.(true);
    } catch {}
    setIsPlaying(false);
  }, [player]);

  // const togglePlay = async () => {
  //   if (!player) return;
  //   try {
  //     if (isPlaying) {
  //       await (player as any).pause?.();
  //       setIsPlaying(false);
  //     } else {
  //       await (player as any).play?.();
  //       setIsPlaying(true);
  //     }
  //   } catch {
  //     setIsPlaying((s) => !s);
  //   }
  // };


  const Overlay = () => (
    <View className="absolute left-0 top-0 p-3 flex-row items-center">
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
          {post.authorName ?? "Unknown"}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="mb-4 overflow-hidden">
      {media ? (
        isImage ? (
          <ImageBackground
            source={{ uri: media.url }}
            className="w-full aspect-square"
            imageStyle={{ resizeMode: "cover" }}
          >
            <Overlay />
          </ImageBackground>
        ) : isVideo ? (
          <View
            className="w-full"
            style={{ aspectRatio: 1, backgroundColor: "#000" }}
          >
            <VideoView
              player={player}
              style={{ width: "100%", height: "100%" }}
              allowsFullscreen
              allowsPictureInPicture
            />
            <Overlay />
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
          <Text className="font-semibold mb-1">{post.authorName}</Text>
          <Text>{post.caption}</Text>
        </View>
      ) : null}
      <Text className="px-3 pb-4 text-gray-600 text-sm">{time}</Text>
    </View>
  );
}

/* ---------- helper: Instagram-style time ---------- */

// function PostCard({ post }: { post: any }) {
//   const when = post._creationTime;
//   const time = formatTime(when);

//   return (
//     <View
//       style={{
//         marginBottom: 16,
//         backgroundColor: "transparent",
//         borderRadius: 8,
//         overflow: "hidden",
//       }}
//     >
//       <View className="flex-row items-center p-4">
//         {post.authorProfileImage ? (
//           <Image
//             source={{ uri: post.authorProfileImage }}
//             className="w-12 h-12 rounded-full bg-gray-300 mr-2"
//           />
//         ) : (
//           <View className="mr-2">
//             <Ionicons name="person-circle" size={42} color="gray" />
//           </View>
//         )}
//         <View className="flex-1">
//           <Text className="font-semibold">{post.authorName}</Text>
//           <Text className="text-gray-600 text-sm">{time}</Text>
//         </View>
//       </View>

//       {/* show first media item as main preview */}
//       {post.media?.length > 0 && post.media[0].kind === "image" ? (
//         <Image
//           source={{ uri: post.media[0].url }}
//           className="w-full h-auto aspect-square"
//         />
//       ) : post.media?.length > 0 ? (
//         <View className="w-full h-80 bg-black items-center justify-center">
//           <Text style={{ color: "#fff" }}>Video</Text>
//         </View>
//       ) : null}

//       {post.caption ? (
//         <Text className="p-3">
//           <Text className="font-semibold">{post.authorName}</Text>{" "}
//           {post.caption}
//         </Text>
//       ) : null}
//     </View>
//   );
// }

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

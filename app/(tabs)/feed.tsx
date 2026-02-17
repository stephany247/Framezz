import React, { useRef, useState } from "react";
import { View, FlatList, ActivityIndicator, Text, Animated } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PostCard from "@/components/PostCard";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { Post } from "@/utils/types";
import { SafeAreaView } from "react-native-safe-area-context";

export type Media = { kind: string; url: string; poster?: string };

export default function Feed() {
  const posts = useQuery(api.posts.getAllPosts);
  const { userId: currentUserId } = useStoreUserEffect();
  const scrollY = useRef(new Animated.Value(0)).current;
const lastOffset = useRef(0);
const [hidden, setHidden] = useState(false);

const handleScroll = (event: any) => {
  const currentOffset = event.nativeEvent.contentOffset.y;

  if (currentOffset > lastOffset.current && currentOffset > 80) {
    setHidden(true); // scrolling down
  } else {
    setHidden(false); // scrolling up
  }

  lastOffset.current = currentOffset;
};

const translateY = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [0, -80],
  extrapolate: "clamp",
});


  if (!posts) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator color="#0ea5e9" size="large" />
        <Text className="text-gray-400 mt-2">Loading feed…</Text>
      </SafeAreaView>
    );
  }

  if (posts.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <Text className="text-gray-400 text-base">No posts yet.</Text>
      </SafeAreaView>
    );
  }

  return (
     <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-white dark:bg-gray-950"
    >
      
  <Animated.View
    style={{
      transform: [{ translateY: hidden ? -90 : 0 }],
      elevation: 10,
      height: 80,
      justifyContent: "flex-end",
      alignItems: "center",
      position: "absolute",
      width: "100%",
      zIndex: 100,
    }}
    className='bg-white dark:bg-gray-950 mt-6 pb-2'
  >
    <Text className="text-3xl font-bold text-sky-500">
      Framez
    </Text>
  </Animated.View>
    <FlatList
  data={posts}
  keyExtractor={(item) => String(item._id)}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingTop: 80, paddingBottom: 60 }}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  renderItem={({ item }) => (
    <PostCard post={item} currentUserId={currentUserId} />
  )}
/>

    </SafeAreaView>
  );
}

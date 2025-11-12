// app/profile.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/SignOutButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import PostCard from "@/components/PostCard";
import MediaCarousel from "@/components/MedialCarousel";
import { Post } from "@/utils/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TILE_SIZE = Math.floor(SCREEN_WIDTH / 3);

export default function ProfilePage() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <SignedIn>
        <ProfileContent />
      </SignedIn>

      <SignedOut>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg text-white mb-3">You are not signed in</Text>
          <Text className="text-gray-400 text-center">
            Sign in to view your profile and posts.
          </Text>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}

function ProfileContent() {
  const { user } = useUser();
  const profile = useQuery(api.users.getUserProfile);
  const myPosts =
    useQuery(
      api.posts.getPostsByUser,
      profile ? { userId: profile._id } : "skip"
    ) ?? [];

  const sortedPosts = useMemo(() => {
    if (!Array.isArray(myPosts)) return [];
    return [...myPosts].sort((a, b) => {
      const ta =
        typeof a._creationTime === "number"
          ? a._creationTime
          : new Date(a._creationTime).getTime();
      const tb =
        typeof b._creationTime === "number"
          ? b._creationTime
          : new Date(b._creationTime).getTime();
      return tb - ta;
    });
  }, [myPosts]);

  const postsCount = sortedPosts.length;

  const [browserIndex, setBrowserIndex] = useState<number | null>(null);
  const [carouselOpen, setCarouselOpen] = useState<{
    post: Post;
    mediaIndex: number;
  } | null>(null);

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#0ea5e9" size="large" />
        <Text className="text-gray-300 mt-2">Loading profile…</Text>
      </View>
    );
  }

  const avatarUrl = profile.profileImage ?? user?.imageUrl ?? null;
  const displayName =
    profile?.username ||
    profile?.name ||
    user?.username ||
    user?.firstName ||
    user?.fullName ||
    "Anonymous";

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  function openFullBrowser(index = 0) {
    setBrowserIndex(index);
  }

  function openCarousel(post: Post, mediaIndex = 0) {
    setCarouselOpen({ post, mediaIndex });
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="px-4 pb-6 border-b border-gray-800 flex-row items-center bg-black">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <Ionicons
            name="person-circle"
            size={60}
            color="rgba(255,255,255,0.95)"
          />
        )}

        <View className="flex-1 ml-4">
          <Text className="text-white text-xl font-semibold">
            {displayName}
          </Text>
          {email ? (
            <Text className="text-gray-400 text-sm mt-1">{email}</Text>
          ) : null}
        </View>

        <SignOutButton />
      </View>

      {/* Grid / Empty */}
      {postsCount === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 font-medium">
            You haven't posted yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedPosts}
          keyExtractor={(item) => String(item._id)}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <PostGridTile
              post={item}
              onOpenBrowser={() => openFullBrowser(index)}
              onOpenCarousel={(mediaIndex = 0) =>
                openCarousel(item, mediaIndex)
              }
            />
          )}
          contentContainerStyle={{ backgroundColor: "#000" }}
        />
      )}

      {/* Full feed browser modal */}
      <Modal
        visible={browserIndex !== null}
        animationType="slide"
        onRequestClose={() => setBrowserIndex(null)}
      >
        <View className="flex-1 bg-black">
          <StatusBar backgroundColor="#000" barStyle="light-content" />
          <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity
                onPress={() => setBrowserIndex(null)}
                className="p-2"
              >
                <Ionicons name="arrow-back-sharp" size={20} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white font-semibold text-2xl">Posts</Text>
              <View className="w-11" />
            </View>

            <FullPostBrowser
              posts={sortedPosts}
              startIndex={browserIndex ?? 0}
              onClose={() => setBrowserIndex(null)}
              onOpenCarousel={openCarousel}
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* Media carousel modal */}
      <Modal
        visible={!!carouselOpen}
        animationType="slide"
        onRequestClose={() => setCarouselOpen(null)}
      >
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={() => setCarouselOpen(null)}
              className="p-2"
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-semibold">Post</Text>
            <View className="w-11" />
          </View>

          {carouselOpen?.post ? (
            <MediaCarousel
              media={carouselOpen.post.media}
              initialIndex={carouselOpen.mediaIndex}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

//  FullPostBrowser
function FullPostBrowser({
  posts,
  startIndex,
  onClose,
  onOpenCarousel,
}: {
  posts: Post[];
  startIndex: number;
  onClose?: () => void;
  onOpenCarousel?: (post: Post, mediaIndex?: number) => void;
}) {
  const listRef = useRef<FlatList<Post> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!listRef.current) return;
      try {
        listRef.current.scrollToIndex({
          index: startIndex,
          animated: false,
          viewPosition: 0.5,
        });
      } catch (e) {
        // ignore; variable heights might cause issues
      }
    }, 60);
    return () => clearTimeout(t);
  }, [startIndex]);

  return (
    <FlatList
      ref={listRef}
      data={posts}
      keyExtractor={(p) => String(p._id)}
      renderItem={({ item }) => (
        <View>
          <PostCard post={item} />
        </View>
      )}
    />
  );
}

// PostGridTile
function PostGridTile({
  post,
  onOpenBrowser,
  onOpenCarousel,
}: {
  post: Post;
  onOpenBrowser: () => void;
  onOpenCarousel: (mediaIndex?: number) => void;
}) {
  const first =
    Array.isArray(post.media) && post.media.length ? post.media[0] : null;
  const uri = first?.url ?? null;
  const isVideo = first?.kind === "video";

  return (
    <TouchableOpacity onPress={onOpenBrowser} activeOpacity={0.9}>
      <View
        style={{ width: TILE_SIZE, height: TILE_SIZE }}
        className="bg-[#0b0b0b]"
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: TILE_SIZE, height: TILE_SIZE, resizeMode: "cover" }}
          />
        ) : (
          <View
            style={{ width: TILE_SIZE, height: TILE_SIZE }}
            className="bg-[#0b0b0b]"
          />
        )}

        <View className="absolute left-1.5 top-1.5 flex-row items-center">
          <View className="bg-black/50 p-1 rounded-md">
            {isVideo ? (
              <Ionicons name="videocam" size={12} color="#fff" />
            ) : (
              <Ionicons name="resize" size={12} color="#fff" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

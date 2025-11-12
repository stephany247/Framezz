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
import PostCard, { Post } from "@/components/PostCard";
import MediaCarousel from "@/components/MedialCarousel";
import { Media } from "./feed";


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
      return tb - ta; // newest first
    });
  }, [myPosts]);

  const postsCount = sortedPosts.length;

  // modal states:
  const [browserIndex, setBrowserIndex] = useState<number | null>(null); // when set => open full post browser
  const [carouselOpen, setCarouselOpen] = useState<{
    post: Post;
    mediaIndex: number;
  } | null>(null);

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#fff" size="large" />
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

  // open media carousel modal (keeps old behavior)
  function openCarousel(post: Post, mediaIndex = 0) {
    setCarouselOpen({ post, mediaIndex });
  }

  return (
    <View>
      {/* Header */}
      <View className="px-4 pb-6 border-b border-gray-800 flex-row items-center">
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
            style={{ marginRight: 12 }}
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

        <View className="ml-2 bg-[#0ea5e9] rounded-lg px-4 py-2">
          <SignOutButton />
        </View>
      </View>

      {/* Grid */}
      {postsCount === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 font-medium">You haven't posted yet.</Text>
        </View>
      ) : (
        <FlatList
          data={sortedPosts}
          keyExtractor={(item) => item._id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <PostGridTile
              post={item}
              // open full feed browser at this post
              onOpenBrowser={() => openFullBrowser(index)}
              // open media carousel at this post (fallback)
              onOpenCarousel={(mediaIndex = 0) =>
                openCarousel(item, mediaIndex)
              }
            />
          )}
        />
      )}

      {/* Full-feed browser modal: scroll list of posts and show PostCard; initial set by browserIndex */}
      <Modal
        visible={browserIndex !== null}
        animationType="slide"
        onRequestClose={() => setBrowserIndex(null)}
        statusBarTranslucent={false}
        transparent={false}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {/* Make sure the status bar is opaque */}
          <StatusBar
            backgroundColor="#000"
            barStyle="light-content"
            translucent={false}
          />
          <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity
                onPress={() => setBrowserIndex(null)}
                className="p-2"
              >
                <Ionicons name="arrow-back-sharp" size={20} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white font-semibold text-2xl">Posts</Text>
              <View style={{ width: 44 }} />
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

      {/* Media carousel modal (old behavior) */}
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

/* ---------- FullPostBrowser: shows a long list of PostCard and scrolls to startIndex ---------- */
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
    // wait a tick to ensure FlatList measured, then scroll to index
    const t = setTimeout(() => {
      if (!listRef.current) return;
      try {
        listRef.current.scrollToIndex({
          index: startIndex,
          animated: false,
          viewPosition: 0.5,
        });
      } catch (e) {
        // if scrollToIndex fails (rare with variable heights), try scrollToOffset fallback
        // estimate offset by startIndex * averagePostHeight if you have that
      }
    }, 60);
    return () => clearTimeout(t);
  }, [startIndex]);

  return (
    <FlatList
      ref={listRef}
      data={posts}
      keyExtractor={(p) => p._id}
      renderItem={({ item }) => (
        <View>
          {/* PostCard already renders post header, media carousel etc */}
          <PostCard post={item} />
        </View>
      )}
    />
  );
}

/* ---------- grid tile (preview badge + open browser/carousel) ---------- */
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

  // tapping the tile opens the full-feed browser at this post
  return (
    <TouchableOpacity onPress={onOpenBrowser} activeOpacity={0.9}>
      <View
        style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: "#111" }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: TILE_SIZE, height: TILE_SIZE, resizeMode: "cover" }}
          />
        ) : (
          <View
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: "#111",
            }}
          />
        )}

        {/* quick badge/preview overlay */}
        <View
          style={{
            position: "absolute",
            left: 6,
            top: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {isVideo ? (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 4,
                borderRadius: 6,
              }}
            >
              <Ionicons name="videocam" size={12} color="#fff" />
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 4,
                borderRadius: 6,
              }}
            >
              <Ionicons name="resize" size={12} color="#fff" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

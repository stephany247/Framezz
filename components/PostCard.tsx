import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MediaCarousel from "./MedialCarousel";
import { Media } from "@/app/(tabs)/feed";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SafeAreaView } from "react-native-safe-area-context";

export type Post = {
  _id: Id<"posts">;
  _creationTime: string | number | Date;
  authorName?: string;
  authorProfileImage?: string;
  media?: Media[];
  caption?: string;
};

export type Comment = {
  _id: Id<"comments"> | string;
  _creationTime: number;
  postId: Id<"posts"> | string;
  authorId?: Id<"users"> | string;
  authorName: string;
  authorProfileImage?: string | undefined;
  text: string;
};

export default function PostCard({
  post,
  currentUserId, // optional; pass this so delete button can be shown for your user
}: {
  post: Post;
  currentUserId?: string | Id<"users">;
}) {
  const time = formatTime(post._creationTime);

  // Convex v2-style bindings (typed)
  const commentsQuery = useQuery(api.comments.getCommentsByPost, {
    postId: post._id,
    limit: 200,
  });
  const createComment = useMutation(api.comments.createComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const likesQuery = useQuery(api.likes.getLikesByPost, {
    postId: post._id,
    limit: 200,
  });
  const toggleLike = useMutation(api.likes.toggleLike);
  const likeCountQuery = useQuery(api.likes.getLikeCount, { postId: post._id });

  // local state for modal & composer
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[] | null>(null);
  const [localLikes, setLocalLikes] = useState<{ userId: string }[] | null>(
    null
  );
  const [likersOpen, setLikersOpen] = useState(false);

  // unify runtime type: use localComments when present, otherwise server streaming results.
  const comments: Comment[] = useMemo(() => {
    return (
      localComments ??
      (Array.isArray(commentsQuery)
        ? (commentsQuery as unknown as Comment[])
        : [])
    );
  }, [localComments, commentsQuery]);

  // keep localComments in sync with server stream (replace on server change)
  useEffect(() => {
    if (Array.isArray(commentsQuery)) {
      // cast server comments into our Comment[] shape (safe because fields match)
      setLocalComments(commentsQuery as unknown as Comment[]);
    }
  }, [commentsQuery?.length, commentsQuery]);

  async function handleAddComment() {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    // optimistic local insert (temp id is a string)
    const temp: Comment = {
      _id: `temp-${Date.now()}`,
      _creationTime: Date.now(),
      postId: post._id,
      authorId: currentUserId ?? "unknown",
      authorName: "You",
      text: trimmed,
    };
    setLocalComments((prev) => [temp, ...(prev ?? [])]);
    setNewComment("");

    try {
      // createComment expects postId: Id<"posts">; post._id already has that type
      const res = await createComment({
        postId: post._id,
        text: trimmed,
      } as any);
      // server returns {_id: Id<"comments">} — replace temp id if present
      if (res && (res as any)._id) {
        setLocalComments((prev) =>
          (prev ?? []).map((c) =>
            c._id === temp._id ? { ...c, _id: (res as any)._id } : c
          )
        );
      }
    } catch (err) {
      console.error("createComment failed", err);
      // rollback: remove temp
      setLocalComments((prev) =>
        (prev ?? []).filter((c) => c._id !== temp._id)
      );
    }
  }

  async function handleDeleteComment(commentId: Id<"comments"> | string) {
    // optimistic remove
    const prev =
      localComments ??
      (Array.isArray(commentsQuery)
        ? (commentsQuery as unknown as Comment[])
        : []);
    setLocalComments(prev.filter((c) => c._id !== commentId));
    try {
      // deleteComment expects commentId: Id<"comments"> — cast if necessary
      await deleteComment({ commentId: commentId as Id<"comments"> } as any);
    } catch (err) {
      console.error("deleteComment failed", err);
      // rollback on error
      setLocalComments(prev);
    }
  }

  // unify likes array (server or local)
  const likes = useMemo(() => {
    if (localLikes) return localLikes;
    if (Array.isArray(likesQuery)) {
      // likesQuery items contain userId and _id; normalize to { userId }
      return (likesQuery as any[]).map((l) => ({ userId: String(l.userId) }));
    }
    return [];
  }, [localLikes, likesQuery]);

  // helper: whether current user liked this post
  const currentUserIdStr = currentUserId ? String(currentUserId) : null;
  const hasLiked =
    !!currentUserIdStr &&
    likes.some((l) => String(l.userId) === currentUserIdStr);
  const likeCount = localLikes
    ? localLikes.length
    : Array.isArray(likesQuery)
      ? (likesQuery as any[]).length
      : (likeCountQuery ?? 0);

  async function handleToggleLike() {
    if (!currentUserId) {
      // optionally prompt to auth; for now just return
      return;
    }

    const uid = String(currentUserId);
    const prev =
      localLikes ??
      (Array.isArray(likesQuery)
        ? (likesQuery as any[]).map((l) => ({ userId: String(l.userId) }))
        : []);

    // optimistic update: add or remove locally
    if (prev.some((l) => l.userId === uid)) {
      // remove
      const next = prev.filter((l) => l.userId !== uid);
      setLocalLikes(next);
    } else {
      // add
      setLocalLikes([{ userId: uid }, ...prev]);
    }

    try {
      await toggleLike({ postId: post._id } as any);
      // server will stream new likes via getLikesByPost if it changes; we keep local until server replaces it
    } catch (err) {
      console.error("toggleLike failed", err);
      // rollback
      setLocalLikes(prev);
    }
  }

  return (
    <View className="mb-4 overflow-hidden">
      {/* overlay (author) */}
      <View className="p-3 flex-row items-center">
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
            style={{ marginRight: 12 }}
          />
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

      {/* actions row: likes (placeholder) + comments */}
      <View className="px-3 p-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          {/* placeholder Like icon (implement likes separately) */}
          <View className="flex-row gap-1 items-center">
            <TouchableOpacity activeOpacity={0.7} onPress={handleToggleLike}>
              {hasLiked ? (
                <Ionicons name="heart" size={24} color="#ff6b6b" />
              ) : (
                <Ionicons name="heart-outline" size={24} color="white" />
              )}
            </TouchableOpacity>

            {/* show like count next to comments */}
            <TouchableOpacity
              onPress={() => {
                setLikersOpen(true);
              }}
            >
              <Text className="text-gray-300 text-lg font-medium">
                {likeCount}
              </Text>
            </TouchableOpacity>
          </View>

          {/* open comments */}

          <View className="flex-row gap-1 items-center">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCommentsOpen(true)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-gray-300 text-lg font-medium">
              {comments?.length ?? 0}
            </Text>
          </View>
        </View>

        {/* small comment count */}
        <TouchableOpacity onPress={() => setCommentsOpen(true)}>
          <Text className="text-gray-300 text-sm">
            {(comments?.length ?? 0) + " comments"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* caption */}
      {post.caption ? (
        <View className="px-3 pb-1 flex-row gap-2">
          <Text className="font-semibold mb-1 text-white">
            {post.authorName}
          </Text>
          <Text className="text-gray-200">{post.caption}</Text>
        </View>
      ) : null}

      {/* Comments modal */}
      <Modal
        visible={commentsOpen}
        animationType="slide"
        onRequestClose={() => setCommentsOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-black">
          {/* header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
            <TouchableOpacity
              onPress={() => setCommentsOpen(false)}
              className="p-2"
            >
              <Ionicons name="arrow-back-sharp" size={20} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-2xl">Comments</Text>
            <View className="w-11" />
          </View>

          {/* comments list */}
          <FlatList
            data={comments ?? []}
            keyExtractor={(item) => String(item._id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View className="mb-4">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-row items-start gap-2">
                    {/* Author profile image */}
                    {item.authorProfileImage ? (
                      <Image
                        source={{ uri: item.authorProfileImage }}
                        className="w-9 h-9 rounded-full"
                      />
                    ) : (
                      <Ionicons
                        name="person-circle-outline"
                        size={36}
                        color="#666"
                      />
                    )}
                    <View className="flex-col gap-1 justify-start items-start">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-white font-bold text-lg">
                          {item.authorName ?? "Anonymous"}
                        </Text>
                        <Text className="text-gray-300 text-sm">
                          {formatTime(item._creationTime)}
                        </Text>
                      </View>
                      <Text className="text-gray-100 mt-1">{item.text}</Text>
                    </View>
                  </View>

                  {currentUserId &&
                  item.authorId &&
                  String(item.authorId) === String(currentUserId) ? (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item._id)}
                      className="ml-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ff6b6b"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="p-6 items-center">
                <Text className="text-gray-500">
                  No comments yet — be the first.
                </Text>
              </View>
            )}
          />

          {/* comment input bar */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="flex-row items-center p-3 bg-gray-900 border-t border-gray-800">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                placeholderTextColor="#666"
                className="flex-1 p-3 bg-gray-700 text-white rounded-full"
                onSubmitEditing={handleAddComment}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={handleAddComment} className="ml-2">
                <Ionicons name="send-sharp" size={24} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={likersOpen}
        animationType="slide"
        onRequestClose={() => setLikersOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
            <TouchableOpacity
              onPress={() => setLikersOpen(false)}
              className="p-2"
            >
              <Ionicons name="arrow-back-sharp" size={20} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-2xl">Likes</Text>
            <View className="w-11" />
          </View>

          <FlatList
            data={Array.isArray(likesQuery) ? likesQuery : []}
            keyExtractor={(item) => String(item.likeId ?? item.userId)}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View className="mb-4 flex-row items-center">
                {item.profileImage ? (
                  <Image
                    source={{ uri: item.profileImage }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color="#666"
                    style={{ marginRight: 12 }}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text className="text-white font-semibold">
                    {item.username}
                  </Text>
                  {item.likedAt ? (
                    <Text className="text-gray-300 text-sm">
                      {formatTime(item.likedAt)}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleToggleLike}
                >
                  {hasLiked ? (
                    <Ionicons name="heart" size={24} color="#ff6b6b" />
                  ) : (
                    <Ionicons name="heart-outline" size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="p-6 items-center">
                <Text className="text-gray-500">No likes yet</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
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

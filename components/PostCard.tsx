// PostCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import MediaCarousel from "./MedialCarousel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Post, Comment, LikeItem } from "@/utils/types";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import Caption from "./Caption";
import CommentsModal from "./CommentsModal";
import LikersModal from "./LikersModal";

export default function PostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId?: string | Id<"users">;
}) {
  // Convex hooks
  const commentsQuery = useQuery(api.comments.getCommentsByPost, {
    postId: post._id,
    limit: 200,
  });
  const createComment = useMutation(api.comments.createComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const likesQuery = useQuery(api.likes.getLikesByPost, { postId: post._id, limit: 200 });
  const toggleLike = useMutation(api.likes.toggleLike);
  const likeCountQuery = useQuery(api.likes.getLikeCount, { postId: post._id });

  // local UI state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[] | null>(null);
  const [localLikes, setLocalLikes] = useState<{ userId: string }[] | null>(null);
  const [likersOpen, setLikersOpen] = useState(false);

  const comments: Comment[] = useMemo(() => {
    return (
      localComments ??
      (Array.isArray(commentsQuery) ? (commentsQuery as unknown as Comment[]) : [])
    );
  }, [localComments, commentsQuery]);

  useEffect(() => {
    if (Array.isArray(commentsQuery)) {
      setLocalComments(commentsQuery as unknown as Comment[]);
    }
  }, [commentsQuery?.length, commentsQuery]);

  async function handleAddComment() {
    const trimmed = newComment.trim();
    if (!trimmed) return;

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
      const res = await createComment({ postId: post._id, text: trimmed } as any);
      if (res && (res as any)._id) {
        setLocalComments((prev) =>
          (prev ?? []).map((c) => (c._id === temp._id ? { ...c, _id: (res as any)._id } : c))
        );
      }
    } catch (err) {
      console.error("createComment failed", err);
      setLocalComments((prev) => (prev ?? []).filter((c) => c._id !== temp._id));
    }
  }

  async function handleDeleteComment(commentId: Id<"comments"> | string) {
    const prev =
      localComments ??
      (Array.isArray(commentsQuery) ? (commentsQuery as unknown as Comment[]) : []);
    setLocalComments(prev.filter((c) => c._id !== commentId));
    try {
      await deleteComment({ commentId: commentId as Id<"comments"> } as any);
    } catch (err) {
      console.error("deleteComment failed", err);
      setLocalComments(prev);
    }
  }

  const likes = useMemo(() => {
    if (localLikes) return localLikes;
    if (Array.isArray(likesQuery)) {
      return (likesQuery as any[]).map((l) => ({ userId: String(l.userId) }));
    }
    return [];
  }, [localLikes, likesQuery]);

  const currentUserIdStr = currentUserId ? String(currentUserId) : null;
  const hasLiked = !!currentUserIdStr && likes.some((l) => String(l.userId) === currentUserIdStr);
  const likeCount = localLikes ? localLikes.length : Array.isArray(likesQuery) ? (likesQuery as any[]).length : (likeCountQuery ?? 0);

  async function handleToggleLike() {
    if (!currentUserId) return;

    const uid = String(currentUserId);
    const prev = localLikes ?? (Array.isArray(likesQuery) ? (likesQuery as any[]).map((l) => ({ userId: String(l.userId) })) : []);

    if (prev.some((l) => l.userId === uid)) {
      const next = prev.filter((l) => l.userId !== uid);
      setLocalLikes(next);
    } else {
      setLocalLikes([{ userId: uid }, ...prev]);
    }

    try {
      await toggleLike({ postId: post._id } as any);
    } catch (err) {
      console.error("toggleLike failed", err);
      setLocalLikes(prev);
    }
  }

  // Transform likesQuery for LikersModal (keep server shape)
  const likersList: LikeItem[] = Array.isArray(likesQuery) ? (likesQuery as any[]) : [];

  return (
    <View className="mb-4 overflow-hidden">
      <PostHeader post={post} />
      <MediaCarousel media={post.media} />
      <PostActions
        likeCount={likeCount}
        hasLiked={hasLiked}
        onToggleLike={handleToggleLike}
        onOpenLikers={() => setLikersOpen(true)}
        onOpenComments={() => setCommentsOpen(true)}
        commentsCount={comments?.length}
      />
      <Caption post={post} />

      <CommentsModal
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={comments}
        currentUserId={currentUserId ? String(currentUserId) : undefined}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      <LikersModal
        visible={likersOpen}
        onClose={() => setLikersOpen(false)}
        likes={likersList}
        onToggleLike={handleToggleLike}
        hasLiked={hasLiked}
      />
    </View>
  );
}

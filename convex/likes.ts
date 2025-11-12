// convex/functions/likes.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function isUserRecord(x: any): x is { username?: string; name?: string; profileImage?: string } {
  return x && (typeof x.username === "string" || typeof x.name === "string" || typeof x.profileImage === "string");
}

/**
 * Toggle a like for the current user on a post.
 * If a like exists, delete it (unlike). Otherwise insert a new like.
 */
export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const tokenId = (identity as any).tokenIdentifier ?? identity.sub;
    if (!tokenId) throw new Error("Missing token identifier");

    // find user by token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
      .unique();
    if (!user) throw new Error("User not found; call storeUser first");

    const userId = user._id;

    // check for an existing like using index by_post_user
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) => q.eq("postId", postId).eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    } else {
      await ctx.db.insert("likes", { postId, userId });
      return { liked: true };
    }
  },
});

/**
 * Return the number of likes for a post.
 */
export const getLikeCount = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    return likes.length;
  },
});

/**
 * Return likes for a post (optionally limited).
 * Handy for checking whether current user has liked or to show list of users.
 */
export const getLikesByPost = query({
  args: { postId: v.id("posts"), limit: v.optional(v.number()) },
  handler: async (ctx, { postId, limit }) => {
    const take = typeof limit === "number" && limit > 0 ? Math.min(limit, 200) : 100;
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    // newest first isn't meaningful here because likes don't store _creationTime explicitly,
    // but Convex stores _creationTime automatically; we can sort by that:
    likes.sort((a, b) => (b._creationTime as number) - (a._creationTime as number));

    const sliced = likes.slice(0, take);
    // Fetch user records in-series (small N). For many likes consider batching.
    const results = [];
    for (const like of sliced) {
      const user = await ctx.db.get(like.userId as any);
      if (user && isUserRecord(user)) {
        results.push({
          likeId: like._id,
          userId: like.userId,
          username: user.username ?? user.name ?? "Anonymous",
          profileImage: user.profileImage ?? null,
          likedAt: like._creationTime ?? null,
        });
      } else {
        // fallback when record isn't a user
        results.push({
          likeId: like._id,
          userId: like.userId,
          username: "Unknown",
          profileImage: null,
          likedAt: like._creationTime ?? null,
        });
      }
    }

    return results;
  },
});

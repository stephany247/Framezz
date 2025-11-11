import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a post (must include at least one media item).
 * Denormalize author's name and profile image for quick feed rendering.
 */
export const createPost = mutation({
  args: {
    media: v.array(v.object({ url: v.string(), kind: v.string() })), // kind: "image" | "video"
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { media, caption }) => {
    if (!Array.isArray(media) || media.length === 0) {
      throw new Error("A post must include at least one media item (image or video).");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tokenId = (identity as any).tokenIdentifier ?? identity.sub;
    if (!tokenId) throw new Error("Missing token identifier");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
      .unique();
    if (!user) throw new Error("User not found in DB; call storeUser first");

    const authorProfileImage = typeof user.profileImage === "string" ? user.profileImage : undefined;

    return await ctx.db.insert("posts", {
      author: user._id,
      authorName: user.username ?? user.name ?? "Anonymous",
    //   authorProfileImage: user.profileImage ?? null,
    authorProfileImage,
      media,
      caption: caption ?? undefined,
    });
  },
});

/**
 * Return all posts for the feed. Each item already contains denormalized author info.
 */
export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    posts.sort((a, b) => b._creationTime - a._creationTime);
    return posts;
  },
});


/**
 * Return posts for a specific user (profile page).
 */
export const getPostsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("author", userId))
      .collect();
  },
});

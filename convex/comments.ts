// convex/functions/comments.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a comment on a post.
 */
export const createComment = mutation({
    args: {
        postId: v.id("posts"),
        text: v.string(),
    },
    handler: async (ctx, { postId, text }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const tokenId = (identity as any).tokenIdentifier ?? identity.sub;
        if (!tokenId) throw new Error("Missing token identifier");

        const clean = text?.trim();
        if (!clean) throw new Error("Empty comment");
        if (clean.length > 1000) throw new Error("Comment too long");

        const post = await ctx.db.get(postId);
        if (!post) throw new Error("Post not found");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
            .unique();
        if (!user) throw new Error("User not found; call storeUser first");

        const insertedId = await ctx.db.insert("comments", {
            postId,
            authorId: user._id,
            authorName: user.username ?? user.name ?? "Anonymous",
            authorProfileImage: user.profileImage ?? undefined,
            text: clean,
        });

        return { _id: insertedId };
    },
});

/**
 * Delete a comment. Allowed for:
 *  - the comment author
 *  - the post author (owner)
 */
export const deleteComment = mutation({
    args: {
        commentId: v.id("comments"),
    },
    handler: async (ctx, { commentId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const tokenId = (identity as any).tokenIdentifier ?? identity.sub;
        if (!tokenId) throw new Error("Missing token identifier");

        const comment = await ctx.db.get(commentId);
        if (!comment) throw new Error("Comment not found");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
            .unique();
        if (!user) throw new Error("User not found; call storeUser first");

        // If comment has authorId and it matches current user -> allow
        if ("authorId" in comment && String(comment.authorId) === String(user._id)) {
            await ctx.db.delete(commentId); // <-- single-arg delete
            return { deleted: true };
        }

        // Otherwise check post ownership safely (comment.postId exists)
        const post = await ctx.db.get(comment.postId as any);
        if (post && ("author" in post ? String((post as any).author) === String(user._id) : false)) {
            await ctx.db.delete(commentId); // <-- single-arg delete
            return { deleted: true };
        }

        throw new Error("Not authorized to delete this comment");
    },
});

/**
 * Get comments for a post, sorted by creation time (newest first).
 */
export const getCommentsByPost = query({
    args: {
        postId: v.id("posts"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { postId, limit }) => {
        const take = typeof limit === "number" && limit > 0 ? Math.min(limit, 200) : 100;
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", postId))
            .collect();

        comments.sort((a, b) => b._creationTime - a._creationTime);
        return comments.slice(0, take);
    },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Store current user in `users` table.
 * Uses tokenIdentifier when available, otherwise falls back to identity.sub.
 */
export const storeUser = mutation({
    args: { username: v.optional(v.string()) },
    handler: async (ctx, { username }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called store without authentication present.");
        }

        // prefer tokenIdentifier, fallback to subject (sub)
        const tokenId = (identity as any).tokenIdentifier ?? identity.sub;
        if (!tokenId) {
            throw new Error("No tokenIdentifier or subject available in identity.");
        }

        // Try look up existing user using the index
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
            .unique();

        // If exists, patch name if changed
        const incomingName =
            username ??
            (identity as any).username ??
            (identity as any).name ??
            (identity as any).firstName ??
            "Anonymous";

        if (user !== null) {
            // patch name and username if changed
            const patchData: any = {};
            if (user.name !== incomingName) patchData.name = incomingName;
            if (username && user.username !== username) patchData.username = username;
            if (Object.keys(patchData).length) await ctx.db.patch(user._id, patchData);
            return user._id;
        }
        const profileImage =
            typeof (identity as any).imageUrl === "string"
                ? (identity as any).imageUrl
                : undefined;

        // Insert: use plain values, no Date objects (Convex dislikes Date objects)
        return await ctx.db.insert("users", {
            name: incomingName,
            username: username ?? (identity as any).username ?? null,
            tokenIdentifier: tokenId,
            profileImage,
            updatedAt: new Date().toISOString(),
        });
    },
});



/**
 * Return the current user's Convex `users` document (or null).
 * Looks up by tokenIdentifier (preferred) and falls back to identity.sub.
 */
export const getUserProfile = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // prefer tokenIdentifier if present in the identity
        const tokenId = (identity as any).tokenIdentifier ?? identity.sub;
        if (!tokenId) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
            .unique();

        return user; // may be null if not stored yet
    },
});

/**
 Load an user by Convex document Id
 */
export const getUserById = query({
    args: { id: v.id("users") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

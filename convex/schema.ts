import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.optional(v.string()),
    tokenIdentifier: v.string(),
    profileImage: v.optional(v.string()),
    updatedAt: v.string()
  }).index("by_token", ["tokenIdentifier"]),
  messages: defineTable({
    author: v.string(),        // email or clerkId used as author
    text: v.string(),
  }),
  posts: defineTable({
    author: v.id("users"),
    authorName: v.string(),
    authorProfileImage: v.optional(v.string()),

    media: v.array(v.object({
      url: v.string(),
      kind: v.string(), // "image" or "video"
    })),

    // optional caption, but a post MUST have at least one media item (validated server-side)
    caption: v.optional(v.string()),
  }).index("by_author", ["author"]),

  comments: defineTable({
    postId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    authorProfileImage: v.optional(v.string()),
    text: v.string(),
  }).index("by_post", ["postId"]),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  }).index("by_post_user", ["postId", "userId"]).index("by_post", ["postId"])
});

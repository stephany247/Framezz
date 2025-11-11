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
    // foreign key to users collection
    author: v.id("users"),
    // denormalized author info for fast rendering
    authorName: v.string(),
    authorProfileImage: v.optional(v.string()),

    // media is an array of objects { url, kind: "image" | "video" }
    media: v.array(v.object({
      url: v.string(),
      kind: v.string(), // "image" or "video"
    })),

    // optional caption, but a post MUST have at least one media item (validated server-side)
    caption: v.optional(v.string()),
  }).index("by_author", ["author"]),
});

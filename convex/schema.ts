import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    updatedAt: v.string()
  }).index("by_token", ["tokenIdentifier"]),
  messages: defineTable({
    author: v.string(),        // email or clerkId used as author
    text: v.string(),
  }),
});

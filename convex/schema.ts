import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastSeenAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  canvases: defineTable({
    // name: v.string(),
    // createdBy: v.id("users"),
    createdBy: v.string(),
    // shareId: v.string(),
    gridSize: v.number(),
    snapToGridEnabled: v.boolean(),
    canvasItems: v.array(
      v.object({
        id: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        color: v.string(),
        type: v.string(),
      }),
    ),
    selections: v.array(
      v.object({
        userId: v.string(),
        canvasItemId: v.string(),
      }),
    ),
  }),
});

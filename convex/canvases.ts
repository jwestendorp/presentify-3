import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { v4 as uuidv4 } from "uuid";

export const createCanvas = mutation({
  args: {
    // name: v.string(),
  },
  handler: async (ctx, args) => {
    // const userId = await getOrCreateUserId(ctx);
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const canvasId = await ctx.db.insert("canvases", {
      //   name: args.name,
      createdBy: userId,
      canvasItems: [],
    });

    return { canvasId };
  },
});

export const getCanvas = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.canvasId);
  },
});

export const getUserCanvases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    console.log("userId", userId);

    return await ctx.db
      .query("canvases")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .collect();
  },
});

export const addCanvasItem = mutation({
  args: {
    canvasId: v.id("canvases"),
    canvasItem: v.object({
      // id: v.string(),
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
      color: v.string(),
      type: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.canvasId);

    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const id = uuidv4();

    const updatedCanvasItems = [
      ...canvas.canvasItems,
      { id, ...args.canvasItem },
    ];

    await ctx.db.patch(canvas._id, {
      canvasItems: updatedCanvasItems,
    });
  },
});

// export const updateCirclePosition = mutation({
//   args: {
//     canvasId: v.id("canvases"),
//     // circleId: v.string(),
//     x: v.number(),
//     y: v.number(),
//   },
//   handler: async (ctx, args) => {
//     const canvas = await ctx.db
//       .query("canvases")
//       .withIndex("by_id", (q) => q.eq("_id", args.canvasId))
//       .unique();

//     if (!canvas) {
//       throw new Error("Canvas not found");
//     }

//     // const id = uuidv4();

//     const updatedCanvasItems = [...canvas.canvasItems, { ...args }];

//     await ctx.db.patch(canvas._id, {
//       canvasItems: updatedCanvasItems,
//     });
//   },
// });

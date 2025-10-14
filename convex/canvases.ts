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
      gridSize: 20,
      canvasItems: [],
      snapToGridEnabled: true,
      selections: [],
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

export const setSnapToGridEnabled = mutation({
  args: {
    canvasId: v.id("canvases"),
    snapToGridEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.canvasId, {
      snapToGridEnabled: args.snapToGridEnabled,
    });
  },
});

export const setGridSize = mutation({
  args: {
    canvasId: v.id("canvases"),
    gridSize: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.canvasId, { gridSize: args.gridSize });
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

export const removeCanvasItem = mutation({
  args: {
    canvasId: v.id("canvases"),
    canvasItemId: v.string(),
  },
  handler: async (ctx, args) => {
    const { canvasId, canvasItemId } = args;
    const canvas = await ctx.db.get(canvasId);
    if (!canvas) {
      throw new Error("Canvas not found");
    }
    const updatedCanvasItems = canvas.canvasItems.filter(
      (item) => item.id !== canvasItemId,
    );
    await ctx.db.patch(canvasId, { canvasItems: updatedCanvasItems });
  },
});

// The mutation to move an object
export const moveCanvasItem = mutation({
  args: {
    canvasId: v.id("canvases"),
    canvasItemId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const { canvasId, canvasItemId, x, y } = args;
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const updatedCanvasItems = canvas.canvasItems.map((item) => {
      if (item.id === canvasItemId) {
        return { ...item, x, y };
      }
      return item;
    });
    await ctx.db.patch(canvasId, { canvasItems: updatedCanvasItems });
  },
});

// Selection mutations
export const selectCanvasItem = mutation({
  args: {
    canvasId: v.id("canvases"),
    canvasItemId: v.string(),
  },
  handler: async (ctx, args) => {
    const { canvasId, canvasItemId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const canvas = await ctx.db.get(canvasId);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // Remove any existing selections for this user
    const updatedSelections = canvas.selections.filter(
      (s) => s.userId !== userId,
    );

    // Add the new selection
    updatedSelections.push({ userId, canvasItemId });

    await ctx.db.patch(canvasId, { selections: updatedSelections });
  },
});

export const deselectCanvasItem = mutation({
  args: {
    canvasId: v.id("canvases"),
    canvasItemId: v.string(),
  },
  handler: async (ctx, args) => {
    const { canvasId, canvasItemId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const canvas = await ctx.db.get(canvasId);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // Remove the selection for this user and item
    const updatedSelections = canvas.selections.filter(
      (s) => !(s.userId === userId && s.canvasItemId === canvasItemId),
    );

    await ctx.db.patch(canvasId, { selections: updatedSelections });
  },
});

export const getCurrentUserSelections = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    return canvas.selections
      .filter((s) => s.userId === userId)
      .map((s) => s.canvasItemId);
  },
});

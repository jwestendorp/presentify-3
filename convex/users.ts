// Internal helper to ensure a Clerk identity has a corresponding user doc.
export async function getOrCreateUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Must be authenticated");
  }

  const clerkId = identity.subject;
  const email = identity.email ?? undefined;
  const name = identity.name ?? undefined;
  const imageUrl = (identity as any).pictureUrl ?? undefined;

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .unique();

  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, { lastSeenAt: now });
    return existing._id;
  }

  const userId = await ctx.db.insert("users", {
    clerkId,
    email,
    name,
    imageUrl,
    lastSeenAt: now,
  });
  return userId;
}

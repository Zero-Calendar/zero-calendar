import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServerAccess } from "./access";

export const listByUser = query({
  args: { userId: v.string(), serverAccessKey: v.string() },
  handler: async (ctx, { userId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    return await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByCategoryId = query({
  args: {
    userId: v.string(),
    categoryId: v.string(),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, { userId, categoryId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    return await ctx.db
      .query("categories")
      .withIndex("by_user_categoryId", (q) =>
        q.eq("userId", userId).eq("categoryId", categoryId)
      )
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    categoryId: v.string(),
    data: v.any(),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerAccess(args.serverAccessKey);
    const { serverAccessKey: _serverAccessKey, ...categoryRecord } = args;

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user_categoryId", (q) =>
        q.eq("userId", categoryRecord.userId).eq("categoryId", categoryRecord.categoryId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, categoryRecord);
      return existing._id;
    }

    return await ctx.db.insert("categories", categoryRecord);
  },
});

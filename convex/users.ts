import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServerAccess } from "./access";

export const getByUserId = query({
  args: { userId: v.string(), serverAccessKey: v.string() },
  handler: async (ctx, { userId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getByGoogleWatchChannelId = query({
  args: {
    googleWatchChannelId: v.string(),
    googleWatchToken: v.optional(v.string()),
  },
  handler: async (ctx, { googleWatchChannelId, googleWatchToken }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_googleWatchChannelId", (q) =>
        q.eq("googleWatchChannelId", googleWatchChannelId)
      )
      .unique();

    if (!user || user.googleWatchToken !== googleWatchToken) {
      return null;
    }

    return {
      accessToken: user.accessToken,
      expiresAt: user.expiresAt,
      googleWatchCalendarId: user.googleWatchCalendarId,
      refreshToken: user.refreshToken,
      userId: user.userId,
    };
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    provider: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    preferences: v.optional(v.any()),
    lastGoogleSync: v.optional(v.number()),
    googleSyncToken: v.optional(v.string()),
    googleWatchCalendarId: v.optional(v.string()),
    googleWatchChannelId: v.optional(v.string()),
    googleWatchExpiration: v.optional(v.number()),
    googleWatchResourceId: v.optional(v.string()),
    googleWatchToken: v.optional(v.string()),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerAccess(args.serverAccessKey);
    const { serverAccessKey: _serverAccessKey, ...userRecord } = args;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userRecord.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, userRecord);
      return existing._id;
    }

    return await ctx.db.insert("users", userRecord);
  },
});

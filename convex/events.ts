import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServerAccess } from "./access";

export const listByUser = query({
  args: { userId: v.string(), serverAccessKey: v.string() },
  handler: async (ctx, { userId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    return await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByEventId = query({
  args: { userId: v.string(), eventId: v.string(), serverAccessKey: v.string() },
  handler: async (ctx, { userId, eventId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    return await ctx.db
      .query("events")
      .withIndex("by_user_eventId", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    eventId: v.string(),
    startMs: v.number(),
    endMs: v.number(),
    source: v.optional(v.string()),
    data: v.any(),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerAccess(args.serverAccessKey);
    const { serverAccessKey: _serverAccessKey, ...eventRecord } = args;

    const existing = await ctx.db
      .query("events")
      .withIndex("by_user_eventId", (q) =>
        q.eq("userId", eventRecord.userId).eq("eventId", eventRecord.eventId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, eventRecord);
      return existing._id;
    }

    return await ctx.db.insert("events", eventRecord);
  },
});

export const deleteByEventId = mutation({
  args: { userId: v.string(), eventId: v.string(), serverAccessKey: v.string() },
  handler: async (ctx, { userId, eventId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    const existing = await ctx.db
      .query("events")
      .withIndex("by_user_eventId", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

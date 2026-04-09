import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServerAccess } from "./access";

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
  },
});

export const listByEvent = query({
  args: {
    eventId: v.string(),
    organizerUserId: v.string(),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, { eventId, organizerUserId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    return invitations.filter(
      (invitation) => invitation.organizerUserId === organizerUserId
    );
  },
});

export const getByEventAndInvitee = query({
  args: {
    eventId: v.string(),
    inviteeEmail: v.string(),
    organizerUserId: v.string(),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, { eventId, inviteeEmail, organizerUserId, serverAccessKey }) => {
    assertServerAccess(serverAccessKey);

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_event_invitee", (q) =>
        q.eq("eventId", eventId).eq("inviteeEmail", inviteeEmail)
      )
      .unique();

    if (invitation?.organizerUserId !== organizerUserId) {
      return null;
    }

    return invitation;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    eventId: v.string(),
    organizerUserId: v.string(),
    organizerName: v.string(),
    organizerEmail: v.string(),
    inviteeEmail: v.string(),
    eventTitle: v.string(),
    eventStart: v.string(),
    eventEnd: v.string(),
    eventLocation: v.optional(v.string()),
    eventCalendarId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    serverAccessKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerAccess(args.serverAccessKey);
    const { serverAccessKey: _serverAccessKey, ...invitationRecord } = args;

    return await ctx.db.insert("invitations", invitationRecord);
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    status: v.string(),
    respondedAt: v.number(),
  },
  handler: async (ctx, { token, status, respondedAt }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    await ctx.db.patch(invitation._id, { status, respondedAt });
    return invitation;
  },
});

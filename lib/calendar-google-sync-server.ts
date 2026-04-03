import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";
import { deleteEvent, type CalendarEvent } from "@/lib/calendar";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  updateGoogleCalendarEvent,
} from "@/lib/google-calendar";
import { upsertUserEvent, upsertUserRecord } from "@/lib/store";

type GoogleCalendarAuth = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
};

/**
 * Refreshes OAuth tokens and updates the stored user record (same pattern as /api/calendar/events).
 * Returns null when Google is not linked or refresh fails.
 */
export async function getGoogleCalendarAuthForUser(
  userId: string
): Promise<GoogleCalendarAuth | null> {
  try {
    const tokens = await fetchAuthMutation(api.auth.refreshGoogleAccessToken, {});
    if (!(tokens.accessToken && tokens.refreshToken)) {
      return null;
    }

    await upsertUserRecord({
      userId,
      provider: "google",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.accessTokenExpiresAt
        ? Math.floor(tokens.accessTokenExpiresAt / 1000)
        : 0,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.accessTokenExpiresAt
        ? Math.floor(tokens.accessTokenExpiresAt / 1000)
        : 0,
    };
  } catch (error) {
    console.error("[calendar-google-sync] Could not refresh Google tokens:", error);
    return null;
  }
}

/**
 * After creating a local event, push it to Google when the account is linked.
 * Mirrors POST /api/calendar/events with pushToGoogle: true.
 */
export async function syncCreatedLocalEventToGoogle(
  userId: string,
  localEvent: CalendarEvent
): Promise<CalendarEvent> {
  let finalEvent = localEvent;
  const auth = await getGoogleCalendarAuthForUser(userId);
  if (!auth) {
    return finalEvent;
  }

  try {
    const syncedEvent = await createGoogleCalendarEvent(
      userId,
      auth.accessToken,
      auth.refreshToken,
      auth.expiresAt,
      localEvent,
      localEvent.calendarId
    );

    if (syncedEvent) {
      await deleteEvent(userId, localEvent.id);
      await upsertUserEvent(syncedEvent);
      finalEvent = syncedEvent;
    }
  } catch (error) {
    console.error("[calendar-google-sync] Failed to push created event to Google:", error);
  }

  return finalEvent;
}

/**
 * After updating an event locally, sync to Google when linked.
 * Mirrors PATCH /api/calendar/events/[id] with pushToGoogle: true.
 */
export async function syncUpdatedEventToGoogle(
  userId: string,
  existingBeforeUpdate: CalendarEvent,
  updatedEvent: CalendarEvent
): Promise<CalendarEvent> {
  let finalEvent = updatedEvent;
  const auth = await getGoogleCalendarAuthForUser(userId);
  if (!auth) {
    return finalEvent;
  }

  try {
    if (existingBeforeUpdate.source === "google") {
      const syncedEvent = await updateGoogleCalendarEvent(
        userId,
        auth.accessToken,
        auth.refreshToken,
        auth.expiresAt,
        updatedEvent,
        updatedEvent.calendarId ?? existingBeforeUpdate.calendarId
      );

      if (syncedEvent) {
        await upsertUserEvent(syncedEvent);
        finalEvent = syncedEvent;
      }
    } else {
      const syncedEvent = await createGoogleCalendarEvent(
        userId,
        auth.accessToken,
        auth.refreshToken,
        auth.expiresAt,
        updatedEvent,
        updatedEvent.calendarId
      );

      if (syncedEvent) {
        await deleteEvent(userId, updatedEvent.id);
        await upsertUserEvent(syncedEvent);
        finalEvent = syncedEvent;
      }
    }
  } catch (error) {
    console.error("[calendar-google-sync] Failed to push updated event to Google:", error);
  }

  return finalEvent;
}

/**
 * Remove the event from Google when it was linked there, before deleting locally.
 * Mirrors DELETE /api/calendar/events/[id]?pushToGoogle=true.
 */
export async function syncDeletedEventToGoogle(
  userId: string,
  existingEvent: CalendarEvent
): Promise<void> {
  if (!(existingEvent.source === "google" || existingEvent.sourceId)) {
    return;
  }

  const auth = await getGoogleCalendarAuthForUser(userId);
  if (!auth) {
    return;
  }

  try {
    await deleteGoogleCalendarEvent(
      userId,
      auth.accessToken,
      auth.refreshToken,
      auth.expiresAt,
      existingEvent.source === "google"
        ? existingEvent.id
        : `google_${existingEvent.sourceId}`,
      existingEvent.calendarId
    );
  } catch (error) {
    console.error("[calendar-google-sync] Failed to delete Google Calendar event:", error);
  }
}

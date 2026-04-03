import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation, getCurrentAuthUser } from "@/lib/auth-server";
import { syncCreatedLocalEventToGoogle } from "@/lib/calendar-google-sync-server";
import { createEvent, getEvents, syncWithGoogleCalendar } from "@/lib/calendar";
import { ensureGoogleCalendarWatch } from "@/lib/google-calendar";
import { upsertUserRecord } from "@/lib/store";

function getWebhookBaseUrl(request: Request) {
  const origin = new URL(request.url).origin;
  return origin === "null" ? undefined : origin;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentAuthUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!(start && end)) {
      return NextResponse.json({ error: "Missing start/end" }, { status: 400 });
    }

    try {
      const tokens = await fetchAuthMutation(api.auth.refreshGoogleAccessToken, {});
      if (tokens?.accessToken && tokens?.refreshToken) {
        await upsertUserRecord({
          userId: user.id,
          provider: "google",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.accessTokenExpiresAt
            ? Math.floor(tokens.accessTokenExpiresAt / 1000)
            : 0,
        });

        await syncWithGoogleCalendar(user.id, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.accessTokenExpiresAt
            ? Math.floor(tokens.accessTokenExpiresAt / 1000)
            : null,
        });

        await ensureGoogleCalendarWatch({
          userId: user.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.accessTokenExpiresAt
            ? Math.floor(tokens.accessTokenExpiresAt / 1000)
            : 0,
          webhookBaseUrl: getWebhookBaseUrl(request),
        });
      }
    } catch (error) {
      console.error("Non-blocking Google sync failed during events fetch:", error);
    }

    const events = await getEvents(user.id, start, end);
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentAuthUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await createEvent({
      userId: user.id,
      title: body.title,
      description: body.description,
      start: body.start,
      end: body.end,
      location: body.location,
      attendees: body.attendees,
      calendarId: body.calendarId,
      color: body.color,
      categoryId: body.category,
      categories: body.category ? [body.category] : undefined,
      allDay: body.allDay ?? false,
      source: "local",
    });

    const finalEvent = body.pushToGoogle
      ? await syncCreatedLocalEventToGoogle(user.id, event)
      : event;

    return NextResponse.json({ event: finalEvent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

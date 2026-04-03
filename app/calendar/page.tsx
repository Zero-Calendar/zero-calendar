import { ModernCalendarView } from "@/components/modern-calendar-view";
import { getCurrentAuthUser } from "@/lib/auth-server";
import { getEvents } from "@/lib/calendar";
import type { CalendarEvent } from "@/types/calendar";

export default async function CalendarPage() {
  const user = await getCurrentAuthUser();

  let events: CalendarEvent[] = [];

  if (user?.id) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    events = await getEvents(user.id, startOfMonth, endOfMonth);
  }

  return (
    <div className="h-dvh overflow-hidden bg-background">
      <ModernCalendarView
        initialEvents={events}
        userEmail={user?.email ?? undefined}
        userId={user?.id}
        userImage={user?.image ?? undefined}
        userName={user?.name ?? undefined}
        userProvider={user ? "google" : undefined}
      />
    </div>
  );
}

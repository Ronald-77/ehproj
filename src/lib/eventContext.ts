export const runtime = "nodejs";

import { Event } from "@/models/Event";

export async function getActiveOrNextEvent() {
  const now = new Date();

  // ✅ active
  const active = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).sort({ startsAt: 1 });

  if (active) return { event: active, mode: "active" as const };

  // ✅ next upcoming
  const next = await Event.findOne({
    startsAt: { $gt: now },
  }).sort({ startsAt: 1 });

  if (next) return { event: next, mode: "upcoming" as const };

  return { event: null, mode: "none" as const };
}

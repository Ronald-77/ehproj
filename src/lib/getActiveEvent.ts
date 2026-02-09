import { Event } from "@/models/Event";

export async function getActiveEvent() {
  const now = new Date();
  return Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .sort({ startsAt: -1 })
    .select("_id name startsAt endsAt");
}

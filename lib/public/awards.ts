import { connectDB } from "@/lib/db/mongo";
import { AwardModel, IAward } from "@/lib/db/models/Award";
import { EventModel, IEvent } from "@/lib/db/models/Event";
import { Types } from "mongoose";

export interface PublicAward {
  id: string;
  title: string;
  eventLabel: string;
  placement: string;
  score?: string;
  description?: string;
  date: Date | string;
}

export async function getPublishedAwardsForPublic(): Promise<PublicAward[]> {
  await connectDB();

  const awards = (await AwardModel.find({ publicationStatus: "published" })
    .sort({ date: -1 })
    .lean()) as unknown as (IAward & { _id: Types.ObjectId })[];

  if (awards.length === 0) {
    return [];
  }

  const eventIds = Array.from(
    new Set(
      awards
        .map((a) => a.relatedEventId?.toString())
        .filter((id): id is string => Boolean(id))
    )
  );

  const eventMap = new Map<string, IEvent>();
  if (eventIds.length > 0) {
    const events = (await EventModel.find({
      _id: { $in: eventIds },
    }).lean()) as unknown as (IEvent & { _id: Types.ObjectId })[];

    for (const event of events) {
      eventMap.set(event._id.toString(), event);
    }
  }

  return awards.map((award) => {
    const relEvent = award.relatedEventId
      ? eventMap.get(award.relatedEventId.toString())
      : null;

    let eventLabel = "";
    if (relEvent) {
      const title = relEvent.title.trim();
      const organizerOrIssuer = (relEvent.organizer || award.issuer || "").trim();
      eventLabel = organizerOrIssuer ? `${title}, ${organizerOrIssuer}` : title;
    } else if (award.issuer) {
      eventLabel = award.issuer.trim();
    }

    return {
      id: award._id.toString(),
      title: award.title,
      eventLabel,
      placement: award.placement || "Winner",
      score: award.score || undefined,
      description: award.summary || award.description || undefined,
      date: award.date,
    };
  });
}

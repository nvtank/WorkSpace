import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { TrackerEntry } from "@/models/TrackerEntry";
import { trackerEntrySchema } from "@/lib/validations/tracker";
import { startOfDay, endOfDay, parseISO } from "date-fns";

// GET /api/tracker-entries?trackerId=...&from=...&to=...
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const trackerId = searchParams.get("trackerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query: any = { userId: user.id };
    if (trackerId) {
      query.trackerId = trackerId;
    }

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = startOfDay(parseISO(from));
      }
      if (to) {
        query.date.$lte = endOfDay(parseISO(to));
      }
    }

    const entries = await TrackerEntry.find(query).sort({ date: -1, createdAt: -1 }).limit(500);
    return NextResponse.json(serializeDocuments(entries));
  });
}

// POST /api/tracker-entries
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = trackerEntrySchema.parse(body);

    const entryDate = typeof validatedData.date === "string" ? parseISO(validatedData.date) : validatedData.date;

    const newEntry = await TrackerEntry.create({
      userId: user.id,
      trackerId: validatedData.trackerId,
      value: validatedData.value,
      type: validatedData.type || "expense",
      category: validatedData.category,
      note: validatedData.note,
      date: entryDate,
    });

    return NextResponse.json(serializeDocument(newEntry), { status: 201 });
  });
}

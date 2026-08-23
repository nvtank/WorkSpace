import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Tracker } from "@/models/Tracker";
import { trackerSchema } from "@/lib/validations/tracker";

// GET /api/trackers
export async function GET() {
  return withAuth(async (user) => {
    const trackers = await Tracker.find({ userId: user.id, isArchived: false }).sort({
      order: 1,
      createdAt: 1,
    });
    return NextResponse.json(serializeDocuments(trackers));
  });
}

// POST /api/trackers
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = trackerSchema.parse(body);

    const highestOrderTracker = await Tracker.findOne({ userId: user.id }).sort({ order: -1 });
    const order = validatedData.order ?? (highestOrderTracker ? highestOrderTracker.order + 1 : 0);

    const newTracker = await Tracker.create({
      ...validatedData,
      userId: user.id,
      order,
    });

    return NextResponse.json(serializeDocument(newTracker), { status: 201 });
  });
}

// PATCH /api/trackers - Reorder bulk
export async function PATCH(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    if (Array.isArray(body.orders)) {
      const updates = body.orders.map((item: { id: string; order: number }) =>
        Tracker.updateOne({ _id: item.id, userId: user.id }, { order: item.order })
      );
      await Promise.all(updates);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
  });
}

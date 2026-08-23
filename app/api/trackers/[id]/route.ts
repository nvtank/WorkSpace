import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { Tracker } from "@/models/Tracker";
import { trackerSchema } from "@/lib/validations/tracker";

// PATCH /api/trackers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = trackerSchema.partial().parse(body);

    const tracker = await Tracker.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: validatedData },
      { new: true }
    );

    if (!tracker) {
      return NextResponse.json({ error: "Tracker không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(tracker));
  });
}

// DELETE /api/trackers/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const tracker = await Tracker.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: { isArchived: true } },
      { new: true }
    );

    if (!tracker) {
      return NextResponse.json({ error: "Tracker không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Đã lưu trữ tracker" });
  });
}

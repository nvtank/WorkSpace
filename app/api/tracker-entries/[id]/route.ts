import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { TrackerEntry } from "@/models/TrackerEntry";
import { trackerEntrySchema } from "@/lib/validations/tracker";
import { parseISO } from "date-fns";

// PATCH /api/tracker-entries/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = trackerEntrySchema.partial().parse(body);

    const updatePayload: any = { ...validatedData };
    if (validatedData.date) {
      updatePayload.date =
        typeof validatedData.date === "string"
          ? parseISO(validatedData.date)
          : validatedData.date;
    }

    const entry = await TrackerEntry.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: updatePayload },
      { new: true }
    );

    if (!entry) {
      return NextResponse.json({ error: "Log entry không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(entry));
  });
}

// DELETE /api/tracker-entries/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const entry = await TrackerEntry.findOneAndDelete({ _id: id, userId: user.id });
    if (!entry) {
      return NextResponse.json({ error: "Log entry không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xoá entry" });
  });
}

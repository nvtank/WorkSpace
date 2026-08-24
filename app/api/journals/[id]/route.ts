import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { Journal } from "@/models/Journal";
import { journalSchema } from "@/lib/validations/index";

// GET /api/journals/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const journal = await Journal.findOne({
      _id: id,
      userId: user.id,
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Không tìm thấy nhật ký" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(journal));
  });
}

// PUT /api/journals/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = journalSchema.parse(body);

    const date = new Date(validatedData.date);
    date.setHours(0, 0, 0, 0);

    const journal = await Journal.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        date,
        mood: validatedData.mood,
        content: validatedData.content,
        prompt: validatedData.prompt,
      },
      { new: true, runValidators: true }
    );

    if (!journal) {
      return NextResponse.json(
        { error: "Không tìm thấy nhật ký" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(journal));
  });
}

// DELETE /api/journals/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const journal = await Journal.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Không tìm thấy nhật ký" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  });
}

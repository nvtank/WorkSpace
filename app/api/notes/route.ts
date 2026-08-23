import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Note } from "@/models/Note";
import { noteSchema } from "@/lib/validations/index";

// GET /api/notes?tag=...&search=...&limit=...&page=...
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const query: any = { userId: user.id };

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(query);

    return NextResponse.json({
      notes: serializeDocuments(notes),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}

// POST /api/notes
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = noteSchema.parse(body);

    const newNote = await Note.create({
      ...validatedData,
      userId: user.id,
    });

    return NextResponse.json(serializeDocument(newNote), { status: 201 });
  });
}

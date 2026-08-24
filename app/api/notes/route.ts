import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Note } from "@/models/Note";
import { noteSchema } from "@/lib/validations/index";
import sanitizeHtml from "sanitize-html";

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

    // Sanitize HTML content to prevent XSS
    const cleanContent = sanitizeHtml(validatedData.content, {
      allowedTags: [
        "p", "b", "strong", "i", "em", "u", "s", "strike",
        "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
        "blockquote", "br", "code", "pre", "a", "span", "div"
      ],
      allowedAttributes: {
        "a": ["href", "target", "rel"],
        "span": ["style"],
        "div": ["style"],
      },
      allowedStyles: {
        "*": {
          "color": [/^#[0-9a-fA-F]{3,6}$/],
          "background-color": [/^#[0-9a-fA-F]{3,6}$/],
          "text-align": [/^(left|right|center|justify)$/],
        }
      },
    });

    const newNote = await Note.create({
      ...validatedData,
      content: cleanContent,
      userId: user.id,
    });

    return NextResponse.json(serializeDocument(newNote), { status: 201 });
  });
}

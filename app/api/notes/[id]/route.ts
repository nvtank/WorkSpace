import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { Note } from "@/models/Note";
import { noteSchema } from "@/lib/validations/index";
import sanitizeHtml from "sanitize-html";

// PATCH /api/notes/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = noteSchema.partial().parse(body);

    // Sanitize HTML content if present
    if (validatedData.content) {
      validatedData.content = sanitizeHtml(validatedData.content, {
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
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: validatedData },
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Note không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(note));
  });
}

// DELETE /api/notes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const note = await Note.findOneAndDelete({ _id: id, userId: user.id });
    if (!note) {
      return NextResponse.json({ error: "Note không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xoá note" });
  });
}

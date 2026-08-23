import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Category } from "@/models/Category";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().default("#4a154b"),
  type: z.enum(["task", "note", "general"]).default("general"),
});

// GET /api/categories
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const query: any = { userId: user.id };
    if (type) {
      query.type = { $in: [type, "general"] };
    }

    const categories = await Category.find(query).sort({ createdAt: 1 });
    return NextResponse.json(serializeDocuments(categories));
  });
}

// POST /api/categories
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    const newCategory = await Category.create({
      ...validatedData,
      userId: user.id,
    });

    return NextResponse.json(serializeDocument(newCategory), { status: 201 });
  });
}

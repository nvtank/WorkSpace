import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Journal } from "@/models/Journal";
import { journalSchema } from "@/lib/validations/index";

// GET /api/journals?month=2024-08&limit=...&page=...
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const query: any = { userId: user.id };

    // Filter by month if provided
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const journals = await Journal.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Journal.countDocuments(query);

    return NextResponse.json({
      journals: serializeDocuments(journals),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}

// POST /api/journals
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = journalSchema.parse(body);

    // Normalize date to start of day
    const date = new Date(validatedData.date);
    date.setHours(0, 0, 0, 0);

    // Check if entry already exists for this date
    const existing = await Journal.findOne({
      userId: user.id,
      date,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bạn đã có nhật ký cho ngày này rồi" },
        { status: 409 }
      );
    }

    const newJournal = await Journal.create({
      userId: user.id,
      date,
      mood: validatedData.mood,
      content: validatedData.content,
      prompt: validatedData.prompt,
    });

    return NextResponse.json(serializeDocument(newJournal), { status: 201 });
  });
}

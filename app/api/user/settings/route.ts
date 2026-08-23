import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { User } from "@/models/User";
import { userSettingsSchema } from "@/lib/validations/index";

// GET /api/user/settings
export async function GET() {
  return withAuth(async (user) => {
    const userDoc = await User.findById(user.id).select("-passwordHash");
    if (!userDoc) {
      return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });
    }
    return NextResponse.json(serializeDocument(userDoc));
  });
}

// PATCH /api/user/settings
export async function PATCH(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = userSettingsSchema.partial().parse(body);

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: validatedData },
      { new: true }
    ).select("-passwordHash");

    return NextResponse.json(serializeDocument(updatedUser));
  });
}

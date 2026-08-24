import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helper";
import { User } from "@/models/User";
import { changePasswordSchema } from "@/lib/validations/index";
import bcrypt from "bcryptjs";

// POST /api/user/change-password
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    const userDoc = await User.findById(user.id);
    if (!userDoc || !userDoc.passwordHash) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại hoặc không đăng nhập bằng mật khẩu" },
        { status: 400 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      validatedData.currentPassword,
      userDoc.passwordHash
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không chính xác" },
        { status: 400 }
      );
    }

    // Check if new password is identical to current password
    if (validatedData.currentPassword === validatedData.newPassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới không được trùng với mật khẩu hiện tại" },
        { status: 400 }
      );
    }

    // Hash new password and save
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

    userDoc.passwordHash = newPasswordHash;
    await userDoc.save();

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  });
}

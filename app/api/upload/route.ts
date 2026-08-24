import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helper";

// POST /api/upload
export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    // Validate file type - only images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file ảnh (jpg, png, gif, webp...)" },
        { status: 400 }
      );
    }

    // Validate file size - max 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ảnh quá lớn. Kích thước tối đa: 5MB" },
        { status: 400 }
      );
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error: "Chức năng upload ảnh chưa được cấu hình",
          details: "Vui lòng thiết lập CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong file .env",
        },
        { status: 503 }
      );
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    if (uploadPreset) {
      uploadData.append("upload_preset", uploadPreset);
    }

    // Call Cloudinary API
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadData,
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: "Upload Cloudinary thất bại", details: err },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json({ url: result.secure_url });
  });
}

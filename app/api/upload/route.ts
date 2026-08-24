import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helper";

// POST /api/upload
export async function POST(req: NextRequest) {
  return withAuth(async () => {
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    let apiKey = process.env.CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Parse CLOUDINARY_URL if provided (e.g. cloudinary://api_key:api_secret@cloud_name)
    const cloudinaryUri = process.env.CLOUDINARY_URL;
    if (cloudinaryUri && (!cloudName || !apiKey || !apiSecret)) {
      const match = cloudinaryUri.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    }

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
          details: "Vui lòng thiết lập CLOUDINARY_URL hoặc (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) trong biến môi trường",
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

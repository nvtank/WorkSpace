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

    if (!cloudName) {
      // Return a placeholder or mock URL if Cloudinary is not configured yet
      const fallbackUrl = `https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=60`;
      return NextResponse.json({
        url: fallbackUrl,
        warning: "CLOUDINARY_CLOUD_NAME chưa được thiết lập, dùng fallback preview",
      });
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

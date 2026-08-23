import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ZodError } from "zod";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || "",
    image: session.user.image || undefined,
  };
}

export async function withAuth(
  handler: (user: SessionUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    return await handler(user);
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.errors },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function serializeDocument<T>(doc: any): T {
  if (!doc) return doc;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  if (obj.__v !== undefined) {
    delete obj.__v;
  }
  if (obj.userId && typeof obj.userId.toString === "function") {
    obj.userId = obj.userId.toString();
  }
  if (obj.trackerId && typeof obj.trackerId.toString === "function") {
    obj.trackerId = obj.trackerId.toString();
  }
  if (obj.categoryId && typeof obj.categoryId.toString === "function") {
    obj.categoryId = obj.categoryId.toString();
  }
  if (obj.templateId && typeof obj.templateId.toString === "function") {
    obj.templateId = obj.templateId.toString();
  }
  return obj as T;
}

export function serializeDocuments<T>(docs: any[]): T[] {
  return docs.map((doc) => serializeDocument<T>(doc));
}

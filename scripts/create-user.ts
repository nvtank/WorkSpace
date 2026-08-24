import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { User } from "../models/User";

// Load .env.local manually if not loaded
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/life-hub";

async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password || !name) {
    console.error("❌ Thiếu tham số!");
    console.log("\nCách dùng:");
    console.log("  npm run create-user -- <email> <password> <name>");
    console.log("\nVí dụ:");
    console.log('  npm run create-user -- friend@gmail.com "TempPass123" "Tên Bạn"');
    process.exit(1);
  }

  console.log("Connecting to MongoDB at:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  const emailLower = email.toLowerCase().trim();

  // Check if user already exists
  const existing = await User.findOne({ email: emailLower });
  if (existing) {
    console.log(`⚠️  Email "${emailLower}" đã tồn tại trong hệ thống`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with generic grade scale (4.0 scale)
  const genericGradeScale = {
    max: 4.0,
    conversionTable: [
      { label: "A", min: 3.5, max: 4.0, value: 4.0 },
      { label: "B", min: 2.5, max: 3.49, value: 3.0 },
      { label: "C", min: 1.5, max: 2.49, value: 2.0 },
      { label: "D", min: 1.0, max: 1.49, value: 1.0 },
      { label: "F", min: 0.0, max: 0.99, value: 0.0 },
    ],
  };

  await User.create({
    email: emailLower,
    passwordHash,
    name: name.trim(),
    timezone: "Asia/Ho_Chi_Minh",
    preferences: { theme: "light", weekStartsOn: 1 },
    gradeScale: genericGradeScale,
    failedLoginAttempts: 0,
  });

  console.log(`\n✅ Tạo tài khoản thành công!`);
  console.log(`   Tên: ${name}`);
  console.log(`   Email: ${emailLower}`);
  console.log(`   Password: ${password}`);
  console.log(`\n⚠️  Nhắc họ đổi mật khẩu sau khi login lần đầu (trong Settings)`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Lỗi khi tạo user:", err);
  process.exit(1);
});

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Tracker } from "../models/Tracker";
import { TrackerEntry } from "../models/TrackerEntry";
import { AcademicGoal } from "../models/AcademicGoal";
import { Semester } from "../models/Semester";
import { format, subDays } from "date-fns";

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
const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL || "nvtank";
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "TuanAnh_205";
const SEED_NAME = process.env.SEED_ADMIN_NAME || "Nguyễn Văn Tuấn Anh";

async function seed() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  const emailIdentifier = SEED_EMAIL.includes("@") ? SEED_EMAIL.toLowerCase() : `${SEED_EMAIL.toLowerCase()}@lifehub.local`;
  let user = await User.findOne({
    $or: [{ email: emailIdentifier }, { email: "nvtank" }, { name: SEED_NAME }],
  });

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const vkuGradeScale = {
    max: 4.0,
    conversionTable: [
      { label: "A", min: 8.5, max: 10.0, value: 4.0 },
      { label: "B", min: 7.0, max: 8.4, value: 3.0 },
      { label: "C", min: 5.5, max: 6.9, value: 2.0 },
      { label: "D", min: 4.0, max: 5.4, value: 1.0 },
      { label: "F", min: 0.0, max: 3.9, value: 0.0 },
    ],
  };

  if (!user) {
    user = await User.create({
      email: emailIdentifier,
      passwordHash,
      name: SEED_NAME,
      timezone: "Asia/Ho_Chi_Minh",
      preferences: { theme: "light", weekStartsOn: 1 },
      gradeScale: vkuGradeScale,
    });
    console.log("Created user:", user.name, "(", user.email, ")");
  } else {
    user.email = emailIdentifier;
    user.name = SEED_NAME;
    user.passwordHash = passwordHash;
    user.gradeScale = vkuGradeScale;
    await user.save();
    console.log("Updated user credentials for:", user.name);
  }

  // 1. Seed Academic Goal (VKU: 126 TC, Target GPA: 3.5)
  await AcademicGoal.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        targetGPA: 3.5,
        totalCreditsRequired: 126,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Updated Academic Goal: 126 TC, Target GPA 3.5");

  // 2. Seed All Semesters & Courses from VKU Transcript
  await Semester.deleteMany({ userId: user._id });

  const semestersData = [
    {
      name: "Học kỳ 1 - 2023-2024",
      order: 1,
      courses: [
        { name: "Lập trình cơ bản", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Tiếng Anh chuyên ngành 1 IT", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Giải tích 1", credits: 2, grade: 2.0, difficulty: "hard", status: "completed" },
        { name: "Tiếng Anh 1", credits: 3, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Cơ sở dữ liệu", credits: 3, grade: 2.0, difficulty: "medium", status: "completed" },
        { name: "Lập trình hướng đối tượng", credits: 3, grade: 3.0, difficulty: "medium", status: "completed" },
      ],
    },
    {
      name: "Học kỳ 2 - 2023-2024",
      order: 2,
      courses: [
        { name: "Đại số tuyến tính", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Nhập môn ngành và kỹ năng mềm IT", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Khởi nghiệp và đổi mới sáng tạo", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Tiếng Anh 2", credits: 2, grade: 2.0, difficulty: "medium", status: "completed" },
        { name: "Lập trình Java", credits: 3, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Thiết kế web", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Cấu trúc dữ liệu và giải thuật", credits: 3, grade: 2.0, difficulty: "hard", status: "completed" },
        { name: "Tiếng Anh chuyên ngành 2", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Đồ án cơ sở 1", credits: 1, grade: 4.0, difficulty: "easy", status: "completed" },
      ],
    },
    {
      name: "Học kỳ 1 - 2024-2025",
      order: 3,
      courses: [
        { name: "Kiến trúc máy tính", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Lập trình Python (Lần 1)", credits: 3, grade: 1.0, difficulty: "hard", status: "completed" },
        { name: "Nguyên lý hệ điều hành", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Tiếng Anh nâng cao 1", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Phân tích và thiết kế hệ thống", credits: 3, grade: 1.0, difficulty: "hard", status: "completed" },
        { name: "Công nghệ và lập trình web", credits: 3, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Vật lý", credits: 2, grade: 2.0, difficulty: "medium", status: "completed" },
        { name: "Giải tích 2", credits: 2, grade: 2.0, difficulty: "hard", status: "completed" },
        { name: "Tiếng Anh 3", credits: 2, grade: 2.0, difficulty: "medium", status: "completed" },
        { name: "Đồ án cơ sở 2", credits: 1, grade: 4.0, difficulty: "easy", status: "completed" },
      ],
    },
    {
      name: "Học kỳ 2 - 2024-2025",
      order: 4,
      courses: [
        { name: "Tiếng Anh nâng cao 2", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Công nghệ phần mềm", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Lập trình di động", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Triết học Mác - Lênin", credits: 3, grade: 2.0, difficulty: "medium", status: "completed" },
        { name: "Xác suất thống kê", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Vi điều khiển", credits: 3, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Chuyên đề 1 (IT)", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Mạng máy tính", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Toán rời rạc", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Đồ án cơ sở 3 IT", credits: 1, grade: 4.0, difficulty: "easy", status: "completed" },
      ],
    },
    {
      name: "Học kỳ 1 - 2025-2026",
      order: 5,
      courses: [
        { name: "Tư tưởng Hồ Chí Minh", credits: 2, grade: 2.0, difficulty: "medium", status: "completed" },
        { name: "Kho dữ liệu", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Lập trình Python (Cải thiện)", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Trí tuệ nhân tạo", credits: 3, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Pháp luật đại cương", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Lập trình mạng", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Thực tập thực tế (IT)", credits: 1, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Đồ án cơ sở 4 (IT)", credits: 1, grade: 4.0, difficulty: "easy", status: "completed" },
      ],
    },
    {
      name: "Học kỳ 2 - 2025-2026",
      order: 6,
      courses: [
        { name: "Phát triển ứng dụng di động đa nền tảng", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Phân tích và thiết kế giải thuật", credits: 2, grade: 1.0, difficulty: "hard", status: "completed" },
        { name: "Lập trình Game", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Kinh tế chính trị Mác - Lênin", credits: 2, grade: 3.0, difficulty: "medium", status: "completed" },
        { name: "Đảm bảo chất lượng và kiểm thử phần mềm", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Chủ nghĩa xã hội khoa học", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Chuyên đề 2", credits: 2, grade: 4.0, difficulty: "easy", status: "completed" },
        { name: "Đồ án chuyên ngành 1 (IT)", credits: 1, grade: 4.0, difficulty: "easy", status: "completed" },
      ],
    },
    {
      name: "Học kỳ 1 - 2026-2027 (Kế hoạch)",
      order: 7,
      courses: [
        { name: "Quản trị dự án phần mềm", credits: 2, difficulty: "medium", status: "planned" },
        { name: "Chuyên đề 3", credits: 2, difficulty: "medium", status: "planned" },
        { name: "Lịch sử Đảng Cộng sản Việt Nam", credits: 2, difficulty: "medium", status: "planned" },
        { name: "Thiết kế UX/UI", credits: 2, difficulty: "easy", status: "planned" },
        { name: "Đồ án chuyên ngành 2 (IT)", credits: 1, difficulty: "hard", status: "planned" },
        { name: "Thực tập tốt nghiệp (ITCN)", credits: 3, difficulty: "easy", status: "planned" },
        { name: "Đồ án tốt nghiệp (ITCN)", credits: 5, difficulty: "hard", status: "planned" },
      ],
    },
  ];

  for (const sem of semestersData) {
    await Semester.create({
      userId: user._id,
      name: sem.name,
      order: sem.order,
      courses: sem.courses,
    });
  }
  console.log("Seeded 7 Semesters and 55+ VKU Courses!");

  // 3. Seed Sample Expenses with detailed breakdown items (Ăn cơm 25k, nước 20k...)
  const expenseTracker = await Tracker.findOneAndUpdate(
    { userId: user._id, name: "Chi tiêu hàng ngày" },
    {
      $set: {
        icon: "Wallet",
        color: "#D9A441",
        unitType: "currency",
        unitLabel: "VNĐ",
        goal: { period: "monthly", targetValue: 4500000 },
        order: 0,
      },
    },
    { upsert: true, new: true }
  );

  const workoutTracker = await Tracker.findOneAndUpdate(
    { userId: user._id, name: "Tập luyện & Thể thao" },
    {
      $set: {
        icon: "Dumbbell",
        color: "#F0A875",
        unitType: "duration",
        unitLabel: "phút",
        goal: { period: "weekly", targetValue: 240 },
        order: 1,
      },
    },
    { upsert: true, new: true }
  );

  // Sample detailed entries for the past few days
  const today = new Date();
  const sampleEntries = [
    { trackerId: expenseTracker._id, value: 25000, category: "Ăn uống", note: "Cơm trưa sinh viên", date: subDays(today, 0) },
    { trackerId: expenseTracker._id, value: 20000, category: "Ăn uống", note: "Trà đào giải khát", date: subDays(today, 0) },
    { trackerId: expenseTracker._id, value: 50000, category: "Di chuyển", note: "Đổ xăng xe máy", date: subDays(today, 0) },
    { trackerId: expenseTracker._id, value: 30000, category: "Ăn uống", note: "Bún bò sáng", date: subDays(today, 1) },
    { trackerId: expenseTracker._id, value: 25000, category: "Ăn uống", note: "Cơm sườn trưa", date: subDays(today, 1) },
    { trackerId: expenseTracker._id, value: 15000, category: "Ăn uống", note: "Cà phê sữa đá", date: subDays(today, 1) },
    { trackerId: expenseTracker._id, value: 65000, category: "Học tập", note: "Mua tài liệu & in ấn", date: subDays(today, 2) },
    { trackerId: expenseTracker._id, value: 25000, category: "Ăn uống", note: "Cơm gà xối mỡ", date: subDays(today, 2) },
    { trackerId: expenseTracker._id, value: 20000, category: "Ăn uống", note: "Nước mía & tráng miệng", date: subDays(today, 2) },
    { trackerId: workoutTracker._id, value: 45, category: "Gym", note: "Tập ngực + tay sau", date: subDays(today, 0) },
    { trackerId: workoutTracker._id, value: 60, category: "Bơi lội", note: "Bơi 12 vòng hồ", date: subDays(today, 1) },
    { trackerId: workoutTracker._id, value: 40, category: "Chạy bộ", note: "Chạy 5km công viên", date: subDays(today, 2) },
  ];

  await TrackerEntry.deleteMany({ userId: user._id });
  for (const entry of sampleEntries) {
    await TrackerEntry.create({
      userId: user._id,
      ...entry,
    });
  }
  console.log("Seeded sample detailed expenses & workouts!");

  console.log("✅ Seed completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error during seed:", err);
  process.exit(1);
});

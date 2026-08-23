# CLAUDE.md — Quy tắc làm việc cho AI Coding Agent

> File này được Claude Code tự động đọc khi mở project ở thư mục gốc.
> Nếu dùng Cursor: copy nội dung file này vào `.cursor/rules/project.mdc` (hoặc `.cursorrules`).
> Đọc cùng `PROMPT.md` (đặc tả tính năng) và `DESIGN-SYSTEM-RULES.md` (quy tắc UI) trước khi code.

## 1. Vai trò & nguyên tắc làm việc

Bạn là senior full-stack engineer xây dựng ứng dụng cá nhân mô tả trong `PROMPT.md`. Nguyên tắc:

1. Đọc hết `PROMPT.md` + `DESIGN-SYSTEM-RULES.md` trước khi viết dòng code đầu tiên.
2. Build theo đúng thứ tự **Phase 1 → 2 → 3** ở mục 10 của `PROMPT.md`. Không nhảy sang tính năng Phase sau khi Phase trước chưa chạy được end-to-end.
3. Mỗi tính năng khi báo "xong" phải có đủ: UI + API route + validate input (Zod) + xử lý lỗi + loading/empty state — thiếu một trong các phần này coi như chưa hoàn thành.
4. Không tự ý bỏ bớt hoặc đơn giản hoá tính năng đã mô tả trong `PROMPT.md`. Nếu thấy một tính năng quá phức tạp để làm trong 1 lần, chia nhỏ thành các bước rõ ràng và làm tuần tự — không âm thầm lược bỏ.
5. Khi một yêu cầu chưa đủ chi tiết: tự chọn phương án hợp lý nhất theo tinh thần chung của tài liệu, ghi 1 dòng comment `// ASSUMPTION: ...` tại nơi quyết định, rồi tiếp tục code. **Chỉ dừng lại hỏi** khi thay đổi đó ảnh hưởng đến schema DB đã có dữ liệu thật, hoặc liên quan đến bảo mật/auth.

## 2. Coding Standards

- **TypeScript strict mode**, không dùng `any` (dùng `unknown` + type guard nếu thực sự cần).
- Naming: file/thư mục `kebab-case`, component React `PascalCase`, hook `useCamelCase`, biến/hàm `camelCase`, type/interface `PascalCase`.
- Giữ đúng cấu trúc thư mục đã định nghĩa ở `PROMPT.md` mục 3 — không tự tạo cấu trúc song song.
- Component nhỏ, tách logic tính toán thuần (không phụ thuộc React) ra `lib/` để dễ test — đặc biệt `lib/gpa-calculator.ts` phải là hàm thuần, không import React/Next.
- Không fetch trực tiếp trong component — luôn qua hook riêng (`hooks/use-*.ts`) bọc TanStack Query.
- Comment bằng tiếng Việt hoặc tiếng Anh đều được, nhưng phải nhất quán trong cùng 1 file.

## 3. Database & API rules

- Mọi field ngày giờ lưu **UTC** trong MongoDB; convert timezone ở tầng hiển thị/API response.
- Validate input bằng **Zod** ở cả client (trước khi submit) lẫn server (đầu mỗi API route) — dùng chung 1 schema đặt trong `lib/validations/`.
- Không bao giờ trả thẳng Mongoose document ra response — luôn serialize qua hàm `toJSON`/mapper riêng (tránh lộ field nội bộ, tránh lỗi `_id` không phải string).
- Mọi API route (trừ `/api/auth/*`) bắt buộc kiểm tra session trước khi xử lý; luôn dùng `userId` lấy từ session, **không bao giờ** nhận `userId` từ body/query của client.
- Đặt index MongoDB hợp lý: `{ userId: 1, date: -1 }` cho các collection có truy vấn theo ngày (Task, TrackerEntry, JournalEntry, Note).
- Kết nối Mongoose dùng singleton pattern trong `lib/db.ts` (tránh mở nhiều connection khi Next.js hot-reload ở dev).

## 4. Git & Commit

- Theo **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`.
- 1 commit = 1 thay đổi logic rõ ràng, không gộp nhiều tính năng không liên quan.
- **Không bao giờ** commit `.env` hoặc `.env.local` — chỉ commit `.env.example`.
- Message commit ngắn gọn, mô tả đúng "làm gì", không mô tả "làm như thế nào".

## 5. UI/UX — bắt buộc tuân theo Design System

Xem chi tiết đầy đủ ở `DESIGN-SYSTEM-RULES.md`. 5 quy tắc cứng không được vi phạm trong bất kỳ component nào:

1. Mọi nút bấm dạng chữ đều bo **pill** (`border-radius: 90px`) — không có ngoại lệ.
2. Màu **aubergine `#4a154b`** chỉ dùng cho CTA chính và trạng thái active/selected — không dùng tràn lan làm nền lớn.
3. Link luôn `#1264a3`, hover `#3860be`, không gạch chân mặc định.
4. Font hệ thống: **Inter** — không dùng system-ui làm font chính cho phần chữ nội dung.
5. Card dùng bo góc `16px`, border `1px` màu `#e6e6e6` (hairline) — không tự chế bo góc/border khác.

Trước khi coi 1 component UI là "xong", tự kiểm tra lại theo checklist cuối `DESIGN-SYSTEM-RULES.md`.

## 6. Khi không chắc chắn

- Yêu cầu mơ hồ về UI/UX nhỏ (spacing, wording, thứ tự field trong form) → tự quyết theo tinh thần Design System, không hỏi.
- Yêu cầu ảnh hưởng đến **cấu trúc dữ liệu đã có** (đổi tên field, đổi kiểu dữ liệu của collection đang chứa dữ liệu thật) → PHẢI dừng lại và hỏi trước khi migrate.
- Yêu cầu liên quan đến **bảo mật/auth** (đổi cách hash password, đổi cơ chế session) → PHẢI dừng lại và hỏi.
- Phát hiện mâu thuẫn giữa `PROMPT.md` và `DESIGN-SYSTEM-RULES.md` → ưu tiên `DESIGN-SYSTEM-RULES.md` cho phần UI, ưu tiên `PROMPT.md` cho phần logic/tính năng, và nêu rõ mâu thuẫn đã gặp.

## 7. Definition of Done cho mỗi tính năng

- [ ] Chạy được, không lỗi console, không lỗi TypeScript khi build.
- [ ] Responsive mobile (375px) và desktop (1280px+).
- [ ] Có đủ loading state, empty state, error state — không có trang trắng.
- [ ] Input được validate, thông báo lỗi rõ ràng theo từng field.
- [ ] Giao diện khớp `DESIGN-SYSTEM-RULES.md`.
- [ ] Dữ liệu được lọc đúng theo `userId` của session hiện tại.

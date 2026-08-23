# Design System Rules — chuyển thể `DESIGN-slack.md` cho ứng dụng cá nhân

> File nguồn: `DESIGN-slack.md` (đính kèm cùng bộ này) — chứa toàn bộ token màu/typography/spacing gốc.
> File này **không lặp lại** các token đã có sẵn, mà định nghĩa: (1) cách áp dụng chúng vào 1 web app dùng hằng ngày thay vì trang marketing, và (2) phần mở rộng mà file gốc chưa có (dark mode, màu category, trạng thái task...).
> AI phải đọc cả 2 file trước khi viết component UI đầu tiên, và tự kiểm tra lại theo checklist cuối file này trước khi coi 1 component là hoàn thành.

## 1. Bối cảnh chuyển đổi

`DESIGN-slack.md` là design system cho trang **marketing/SaaS landing** (hero band, pricing card, footer band...). Ứng dụng cần build là 1 **app quản lý cá nhân dùng mỗi ngày** (transactional). Nguyên tắc chuyển đổi: giữ nguyên toàn bộ **token gốc** (màu, chữ, bo góc, spacing, elevation) và **tinh thần thiết kế** ("chromatic monotheism" — aubergine là màu duy nhất được lạm dụng, mọi thứ khác trung tính), nhưng **không dùng các component chỉ dành cho marketing**.

## 2. Token áp dụng trực tiếp (giữ nguyên 100% từ file gốc)

Copy nguyên bảng `colors`, `typography`, `rounded`, `spacing` trong `DESIGN-slack.md` vào `tailwind.config.ts` dưới dạng CSS variables / theme extend. Font: dùng **Inter** (Google Fonts) cho cả display lẫn body, đúng theo khuyến nghị "Note on Font Substitutes" của file gốc — không dùng font hệ thống mặc định.

## 3. Ánh xạ Component (Marketing → App)

| Component gốc | Dùng trong app cho |
|---|---|
| `button-primary-pill` | Hành động chính: Lưu, Thêm Task, Đăng nhập, Xác nhận |
| `button-secondary-pill` | Hành động phụ không nguy hiểm: Xem thêm, Bỏ qua |
| `button-outline-aubergine` | Hành động tertiary trên nền trắng (VD: "Huỷ" cạnh nút Lưu) |
| `button-outline-on-aubergine` | Nút trên các mảng nền aubergine (VD: sidebar khi active) |
| `text-input` | Mọi input / textarea / select trong form |
| `card-feature-cream` | Empty state, onboarding tip, card gợi ý hành động đầu tiên |
| `card-stat` | Số liệu tổng quan trên Dashboard (VD: "12 giờ bơi tuần này") |
| `nav-bar-light` | Topbar của app |
| `pill-cap-shade` | Badge/tag trạng thái nhỏ (VD: "Hoàn thành", "Quá hạn") |
| `link-on-light` / `link-on-aubergine` | Toàn bộ link trong app, theo đúng nền đang đứng trên |
| Elevation Level 1–4 (box-shadow) | Dùng nguyên cho dropdown, modal, toast, focus ring (xem mục 6) |

**Không dùng trong app:** `card-aubergine-band`, `footer-aubergine`, `card-pricing` / `card-pricing-featured` — đây là component chỉ dành riêng cho trang marketing, không có chỗ đứng trong 1 app quản lý cá nhân.

## 4. Mở rộng cần thiết cho App (chưa có trong file gốc)

### 4.1 Sidebar Navigation
Thành phần chưa tồn tại trong design gốc (vốn chỉ có top nav cho marketing). Quy tắc:
- Nền `{colors.canvas}` trắng, item active có nền `{colors.canvas-lavender}` + chữ/icon màu `{colors.primary}`.
- Item hover (chưa active): nền `{colors.canvas-lavender}` mờ hơn (opacity ~50%).
- Icon dùng bộ `lucide-react`, kích thước 20px, đồng nhất toàn app.
- Trên mobile: collapse thành bottom tab bar hoặc drawer trượt từ trái — không dùng hamburger ẩn hoàn toàn vì đây là app thao tác thường xuyên, không phải trang thông tin.

### 4.2 Bảng màu mở rộng cho Category/Tracker
File gốc chủ trương chỉ 1 màu chromatic (aubergine) + 1 màu link. App cần nhiều màu để phân biệt Tracker/Category trên calendar và dashboard — mở rộng theo đúng tinh thần pastel-mesh gradient (peach/lavender/dusty-green) của bản gốc thay vì màu bão hoà cao tuỳ tiện:

| Tên | Hex | Gợi ý dùng cho |
|---|---|---|
| Aubergine (mặc định) | `#4a154b` | Công việc / mặc định |
| Peach | `#F0A875` | Sức khoẻ, Thể thao |
| Dusty Green | `#8CA88A` | Học tập |
| Lavender đậm | `#9B7EBD` | Cá nhân, Sở thích |
| Sand | `#D9A441` | Tài chính, Chi tiêu |
| Dusty Blue | `#6E93B5` | Giải trí, Xã hội |

Người dùng có thể tự chọn màu khác ngoài bảng này khi tạo Tracker mới, nhưng 6 màu trên là gợi ý mặc định trong color-picker.

### 4.3 Trạng thái Task & Priority
| Trạng thái | Màu | Cách thể hiện |
|---|---|---|
| `status: done` | `{colors.semantic-success}` `#007a5a` | Checkbox tick xanh, chữ gạch ngang, opacity 70% |
| `status: overdue` (quá giờ mà chưa done) | `{colors.semantic-error}` `#cc4117` | Viền trái task block màu đỏ + icon cảnh báo nhỏ |
| `priority: high` | `#cc4117` (semantic-error) | Chấm tròn nhỏ đầu task |
| `priority: medium` | `#D9A441` (sand) | Chấm tròn nhỏ đầu task |
| `priority: low` | `{colors.ink-mute}` `#696969` | Chấm tròn nhỏ đầu task |

### 4.4 Trạng thái kéo-thả (Drag & Drop)
- Đang kéo (`dragging`): opacity 0.6 + `box-shadow` Elevation Level 2 (`rgba(0,0,0,.1) 0 0 32px 0`) để cảm giác "nhấc lên".
- Vùng có thể thả (`drop zone hover`): viền nét đứt `1px dashed {colors.primary}` + nền `{colors.canvas-lavender}` opacity 40%.
- Sau khi thả thành công: hiệu ứng nhấp nháy nhẹ nền `{colors.canvas-lavender}` rồi fade về bình thường trong ~300ms (feedback xác nhận đã lưu).

### 4.5 Dark Mode (bổ sung — file gốc không định nghĩa)
Giữ đúng danh tính aubergine, chỉ đảo nền/chữ, tái sử dụng tối đa token đã có thay vì bịa màu mới:

| Token | Light (gốc) | Dark (mới) |
|---|---|---|
| Nền chính (canvas) | `#ffffff` | `#17121b` |
| Nền surface/card | `#ffffff` | `#211a26` |
| Primary/CTA fill | `#4a154b` | `#611f69` (tái dùng `primary-press` để đủ tương phản trên nền tối) |
| Chữ chính (ink) | `#1d1d1d` | `#f2eef0` |
| Chữ phụ (ink-mute) | `#696969` | `#d9bdde` (tái dùng `on-aubergine-mute`) |
| Hairline border | `#e6e6e6` | `rgba(255,255,255,0.12)` |
| Link | `#1264a3` | `#5B9BD5` (đã làm sáng hơn để đủ tương phản) |
| Success / Error | `#007a5a` / `#cc4117` | `#1FA97A` / `#E2603B` (đã làm sáng hơn) |

### 4.6 Focus Ring (accessibility)
Tái sử dụng nguyên Elevation Level 4 của file gốc cho mọi trạng thái focus bàn phím: `box-shadow: rgb(97,31,105) 0 0 0 1px inset` kết hợp thêm `outline: 2px solid #4a154b; outline-offset: 2px` để đảm bảo nhìn rõ khi Tab qua các phần tử tương tác.

## 5. Quy tắc BẮT BUỘC (Do's & Don'ts)

### Luôn luôn
1. Mọi button dạng chữ đều bo **pill** (`{rounded.pill}` = 90px), kể cả nút nhỏ trong toolbar.
2. Icon-only button dùng hình tròn hoàn toàn (`border-radius: 50%`), kích thước tối thiểu `44×44px` (touch target).
3. Padding nút chữ tối thiểu `14px 28px` (nút lớn) hoặc `10px 20px` (nút compact trong bảng/toolbar) — không nhỏ hơn.
4. Aubergine `#4a154b` chỉ xuất hiện ở: CTA chính, trạng thái active/selected, sidebar khi active.
5. Link luôn `{colors.link-blue}` `#1264a3`, hover `{colors.link-hover}` `#3860be`, không gạch chân mặc định (trừ link trên nền aubergine → luôn gạch chân theo `link-on-aubergine`).
6. Heading ≥ 32px dùng letter-spacing âm đúng theo bảng typography gốc.
7. Card dùng bo góc `{rounded.xl}` 16px + border `1px {colors.hairline}`.

### Không bao giờ
1. Không dùng nút vuông hoặc bo góc nhỏ (`rounded-md`) cho bất kỳ action button nào.
2. Không thêm màu accent thứ 3 cho **UI chrome** (nav, button, link) ngoài aubergine + link-blue — bảng màu category ở mục 4.2 là ngoại lệ đã định nghĩa riêng, chỉ dùng cho tag/nhãn dữ liệu, không dùng cho chrome hệ thống.
3. Không dùng aubergine làm màu chữ ở body text kích thước thường (chỉ dùng làm nền hoặc màu icon/CTA).
4. Không bo góc `0` (sharp corner) ở bất kỳ đâu — tối thiểu `{rounded.sm}` 4px.
5. Không đặt product mockup/ảnh chụp màn hình vào trong card có border — nếu cần hiển thị ảnh lớn (VD: ảnh trong Note/Journal), để ảnh full-bleed trong khung `{rounded.lg}` không viền.

## 6. Responsive

Theo đúng breakpoint gốc: Mobile `<768px` / Tablet `768–1023px` / Desktop `1024–1440px` / Wide `≥1440px`. Áp dụng riêng cho app:
- Sidebar: ẩn thành drawer/bottom-tab dưới `768px`.
- Calendar: lưới giờ 2 chiều (cột = ngày, hàng = giờ) chỉ giữ ở Tablet trở lên; dưới `768px` chuyển thành danh sách task theo giờ cuộn dọc, kéo-thả để đổi giờ vẫn hoạt động qua long-press.
- Dashboard: grid widget 3 cột (Desktop) → 2 cột (Tablet) → 1 cột (Mobile), thứ tự kéo-thả sắp xếp vẫn giữ nguyên trên mobile qua nút "..." thay vì kéo bằng ngón tay (tránh xung đột với cuộn trang).

## 7. Checklist review trước khi coi 1 component UI là "xong"

- [ ] Toàn bộ màu dùng đúng token trong bảng (mục 2 + 4.2 + 4.5) — không có hex hardcode ngoài palette.
- [ ] Button đúng pill-shape, padding đúng chuẩn.
- [ ] Card đúng bo góc `16px` + hairline border.
- [ ] Font Inter đã áp dụng, letter-spacing âm ở heading lớn.
- [ ] Có trạng thái hover/active/focus rõ ràng, focus ring theo mục 4.6.
- [ ] Có empty state riêng (không chỉ là khoảng trắng) khi danh sách rỗng.
- [ ] Kiểm tra responsive tối thiểu ở 375px và 1280px.
- [ ] Nếu có kéo-thả: đã áp dụng visual feedback theo mục 4.4.

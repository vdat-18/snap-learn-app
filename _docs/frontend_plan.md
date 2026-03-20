# SnapLearn — Frontend Plan (Chi tiết A-Z)

---

## Mục lục

1. [Đối tượng Người dùng](#1-đối-tượng-người-dùng)
2. [Design System](#2-design-system)
3. [Hệ thống Màn hình](#3-hệ-thống-màn-hình)
4. [Gamification & Mechanics](#4-gamification--mechanics)
5. [Animation & Motion](#5-animation--motion)
6. [Sound Design](#6-sound-design)
7. [Xử lý Lỗi cho Trẻ em](#7-xử-lý-lỗi-cho-trẻ-em)
8. [Offline & PWA](#8-offline--pwa)
9. [An toàn & Bảo mật](#9-an-toàn--bảo-mật)

---

## 1. Đối tượng Người dùng

### 1.1 Trẻ em (6-10 tuổi) - Trọng tâm chính
- **Thị giác & Tương tác:** Ưu tiên màu sắc rực rỡ, icon thay cho văn bản, và phản hồi tức thì (hình ảnh + âm thanh + haptic).
- **UX phù hợp:** Nút bấm lớn (tối thiểu 48px), font chữ to rõ (16px+), thao tác đơn giản (không double-tap).
- **Tâm lý:** Thích sưu tập (Gacha), được khen thưởng, và nhiệm vụ ngắn gọn (5-10 phút).

### 1.2 Phụ huynh
- **Kiểm soát:** Truy cập qua Parent Gate (giải toán) để quản lý thời gian và bật/tắt ngôn ngữ.
- **Theo dõi:** Dashboard thống kê từ vựng và nhật ký ảnh chụp của trẻ.

---

## 2. Design System

### 2.1 Bảng màu (Color Palette)

#### Màu chính (Primary Colors)
| Tên | Hex | Sử dụng |
|---|---|---|
| **Sky Blue** | `#4DA8FF` | Màu chủ đạo — nút bấm, links, HUD highlights |
| **Sunshine Yellow** | `#FFD234` | Điểm nhấn — XP, phần thưởng, ngôi sao |
| **Coral Red** | `#FF6B6B` | Nút Capture chính, streak flame |

#### Màu nền (Backgrounds)
| Tên | Hex | Sử dụng |
|---|---|---|
| **Snow White** | `#F8FAFC` | Nền chính các màn hình (trừ Camera) |
| **Soft Cream** | `#FFF9ED` | Nền cards, sections |
| **Deep Navy** | `#0F172A` | Nền Camera viewfinder |

#### Màu phụ (Secondary / Accent)
| Tên | Hex | Sử dụng |
|---|---|---|
| **Mint Green** | `#34D399` | Thành công, đúng, hoàn thành |
| **Lavender Purple** | `#A78BFA` | Tiếng Trung, Epic rarity |
| **Warm Orange** | `#FB923C` | Cảnh báo nhẹ, gợi ý |

#### Màu Rarity (Độ hiếm)
| Độ hiếm | Màu chính | Màu glow | Gradient |
|---|---|---|---|
| **Common** | `#94A3B8` (Slate) | `rgba(148,163,184,0.4)` | Slate 400 → Slate 300 |
| **Uncommon** | `#22C55E` (Green) | `rgba(34,197,94,0.4)` | Green 500 → Emerald 400 |
| **Rare** | `#3B82F6` (Blue) | `rgba(59,130,246,0.4)` | Blue 500 → Cyan 400 |
| **Epic** | `#A855F7` (Purple) | `rgba(168,85,247,0.4)` | Purple 500 → Violet 400 |
| **Legendary** | `#F59E0B` (Amber) | `rgba(245,158,11,0.4)` | Amber 500 → Yellow 300 |

#### Màu ngôn ngữ
| Ngôn ngữ | Màu | Mục đích |
|---|---|---|
| Tiếng Việt | `#0F172A` (Navy) | Ngôn ngữ chính, hiển thị đậm nhất |
| Tiếng Anh | `#3B82F6` (Blue) | Luôn kèm nhãn "EN" |
| Tiếng Trung | `#22C55E` (Green) | Luôn kèm nhãn "ZH" |

### 2.2 Typography (Phông chữ)

| Vai trò | Font | Weight | Size | Ghi chú |
|---|---|---|---|---|
| **Heading lớn** | Outfit | 700 (Bold) | 28-32px | Tên từ vựng tiếng Việt, tiêu đề màn hình |
| **Heading nhỏ** | Outfit | 600 (SemiBold) | 20-24px | Tên nhóm, tiêu đề section |
| **Body** | Outfit | 500 (Medium) | 16-18px | Mô tả, nội dung thẻ |
| **Caption** | Outfit | 400 (Regular) | 12-14px | Phiên âm, label nhỏ |
| **Badge / Tag** | Outfit | 700 (Bold) | 10-11px | Rarity badge, level tag — UPPERCASE, letter-spacing rộng |

> **Lý do chọn Outfit:** Bo tròn, thân thiện, dễ đọc cho trẻ em. Hỗ trợ tốt tiếng Việt. Không quá "trẻ con" để phụ huynh vẫn thấy chuyên nghiệp.

### 2.3 Spacing & Layout

- **Grid:** 4px base unit. Mọi khoảng cách là bội số của 4px (4, 8, 12, 16, 24, 32, 48, 64).
- **Safe area:** Padding 16px hai bên. Top: tính cả notch/status bar. Bottom: tính cả home indicator.
- **Card border-radius:** 16-24px (bo tròn mềm mại).
- **Button border-radius:** 16px (nút thường), full-rounded (nút tròn như Capture).
- **Glassmorphism:** `background: rgba(255,255,255,0.7)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.3)`.

### 2.4 Iconography

- **Thư viện:** Lucide React (nhất quán, stroke-based, 24px mặc định).
- **Icon size:** 20px (inline), 24px (navigation), 32px (action buttons), 48px (feature highlights).
- **Icon quan trọng:**
  - 📸 Camera → icon tùy chỉnh hoặc `Camera`
  - 📖 Book → `Book` hoặc `BookOpen`
  - ⚔️ Quest → `Target` hoặc `Swords`
  - 🏆 Rank → `Award` hoặc `Trophy`
  - 👤 Me → `User` hoặc `CircleUser`
  - 🎤 Mic → `Mic`
  - ⭐ Star → `Star`
  - 🔥 Streak → emoji hoặc custom flame icon
  - ❌ Close → `X`
  - ✅ Success → `Check`

### 2.5 Shadows & Elevation

| Level | Shadow | Sử dụng |
|---|---|---|
| **Level 0** | Không shadow | Nền, flat elements |
| **Level 1** | `0 1px 3px rgba(0,0,0,0.08)` | Cards nhỏ, tags |
| **Level 2** | `0 4px 12px rgba(0,0,0,0.1)` | Cards chính, bottom nav |
| **Level 3** | `0 8px 24px rgba(0,0,0,0.15)` | Modal, overlay cards |
| **Rarity Glow** | `0 0 20px [rarity-color]` | Viền thẻ từ vựng khi reveal |

### 2.6 Hình ảnh & Illustration Style

- **Phong cách:** Flat illustration với màu pastel, đường nét mềm, góc bo tròn.
- **Nhân vật mascot:** Không bắt buộc cho POC, nhưng nên có 1 nhân vật (ví dụ: con cú nhỏ đeo kính) xuất hiện trong onboarding và thông báo lỗi.
- **Category icons:** Dùng emoji hoặc illustration nhỏ cho mỗi nhóm chủ đề (🐾 Động vật, 🍎 Thức ăn, 🌿 Thiên nhiên, 🏫 Trường học, 🏠 Nhà cửa, 🚗 Phương tiện).
- **Silhouette cards:** Thẻ chưa khám phá hiển thị bóng đen + "?" ở giữa, tạo sự tò mò.

---

## 3. Hệ thống Màn hình

### 3.1 Sơ đồ Điều hướng (Navigation Map)

```
┌─────────────────────────────────────────────┐
│              BOTTOM NAVIGATION              │
├──────────┬──────────┬──────────┬────────────┤
│ 📖 Book  │ ⚔️ Quest │ 🏆 Rank  │  👤 Me    │
└────┬─────┴────┬─────┴────┬─────┴─────┬──────┘
     │          │          │           │
     ▼          ▼          ▼           ▼
 Collection   Quest    Leaderboard  Profile
 Screen       Screen   Screen       Screen
     │                                 │
     ▼                                 ▼
 Vocab Detail                    Parent Dashboard
 Screen                          (sau Parent Gate)

┌─────────────────────────────────────────────┐
│    📸 CAMERA SCREEN (NÚT NỔI / FAB)        │
│    Luôn accessible từ mọi màn hình          │
│    hoặc là màn hình mặc định khi mở app     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│    🎬 ONBOARDING (chỉ hiện lần đầu tiên)   │
└─────────────────────────────────────────────┘
```

---

### 3.2 Màn hình 1: 🎬 Onboarding

**Mục đích:** Giới thiệu ứng dụng cho trẻ em lần đầu sử dụng.

**Cấu trúc:** 4 slides, vuốt ngang hoặc nhấn nút "Tiếp".

| Slide | Illustration | Tiêu đề | Mô tả ngắn |
|---|---|---|---|
| 1 | Trẻ em cầm điện thoại, xung quanh có các vật thể sáng lấp lánh | "Chào mừng đến SnapLearn!" | "Khám phá thế giới và học từ mới mỗi ngày!" |
| 2 | Tay chụp ảnh một con mèo, thẻ từ bay ra | "Chụp vật xung quanh!" | "Đưa camera về phía vật thể và nhấn nút chụp" |
| 3 | Biểu tượng micro với sóng âm thanh | "Nói để thu thập!" | "Phát âm đúng để thêm từ vào bộ sưu tập" |
| 4 | Cuốn sổ sưu tập mở ra, bên trong có nhiều sticker sáng lấp lánh | "Sưu tập & Thăng cấp!" | "Thu thập từ hiếm, hoàn thành nhiệm vụ, trở thành nhà vô địch!" |

**Nút CTA ở slide cuối:** "🚀 Bắt đầu khám phá!" → chuyển tới Camera Screen.

**Chỉ báo tiến trình:** 4 chấm tròn ở dưới cùng, chấm hiện tại sáng lên.

**Quy tắc:** Chỉ hiện 1 lần duy nhất. Lưu trạng thái "đã xem" vào bộ nhớ thiết bị. Nếu đã xem, mở app sẽ vào thẳng Camera Screen.

---

### 3.3 Màn hình 2: 📸 Camera Screen (Trải nghiệm Lõi)

**Mục đích:** Đây là màn hình CHÍNH. Trẻ sử dụng camera để chụp ảnh vật thể, AI nhận diện và tạo thẻ từ vựng.

**Bố cục tổng thể:**

```
┌──────────────────────────────────┐
│ [Level Badge]  [XP]    [🔥 7]   │ ← Top HUD (glassmorphism)
│                                  │
│  ┌─ Today's Mission ──────────┐  │ ← Mission Overlay
│  │ Tìm 3 vật màu đỏ 🔴       │  │
│  │ ████░░░░░░ 1/3             │  │
│  └────────────────────────────┘  │
│                                  │
│         ┌──────────┐             │
│         │          │             │ ← Viewfinder (camera live)
│     ┌───│  🎯 AI   │───┐        │    với 4 góc trắng
│         │          │             │
│         └──────────┘             │
│                                  │
│           ┌──────┐               │
│           │  ●   │               │ ← Capture Button (đỏ, tròn, lớn)
│           └──────┘               │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 📖 Book │ ⚔️ Quest │ 🏆 │ 👤│ │ ← Bottom Navigation
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

#### Top HUD (Head-Up Display)
- **Vị trí:** Trên cùng, nằm đè lên camera view.
- **Style:** Glassmorphism (trong suốt mờ, blur nền).
- **Bên trái:** Badge tròn hiển thị Level (ví dụ: "L5" trên nền xanh) + XP hiện tại (ví dụ: "⭐ 142 pts").
- **Bên phải:** Streak flame "🔥 7" (số ngày liên tiếp).
- **Khi XP thay đổi:** Số XP nhảy lên kèm hiệu ứng vàng lấp lánh.

#### Mission Overlay
- **Vị trí:** Phía dưới Top HUD, bên trái.
- **Style:** Glassmorphism card nhỏ gọn (max 200px width).
- **Nội dung:** Label "TODAY'S MISSION" (nhỏ, xanh, uppercase) + mô tả nhiệm vụ + thanh tiến trình.
- **Animation:** Slide-in từ trái khi mở app.

#### Camera Viewfinder
- **Nền:** Live camera feed (camera sau của điện thoại).
- **Overlay:** 4 góc trắng bán trong suốt tạo thành khung ngắm ở giữa (khoảng 70% chiều rộng màn hình).
- **Khi app chưa được cấp quyền camera:** Hiển thị thông báo dễ thương "📸 Cho mình xem thế giới nhé!" kèm nút "Cho phép".

#### Capture Button
- **Vị trí:** Giữa dưới, phía trên Bottom Nav.
- **Kích thước:** 72px (vòng ngoài), 56px (vòng đỏ bên trong).
- **Style:** Viền trắng dày, bên trong là hình tròn đỏ coral. Khi nhấn: scale nhỏ lại 90% rồi nảy lên.
- **Trạng thái Loading:** Vòng đỏ biến thành vòng xoay spinner xanh (AI đang xử lý).
- **Bị vô hiệu hóa:** Khi đang xử lý hoặc khi Reveal Card đang mở.

#### Bottom Navigation
- **Style:** Glassmorphism bar, bo tròn 24px, nằm cách đáy 24px.
- **4 mục:** Book | Quest | Rank | Me (icon + label nhỏ bên dưới).
- **Mục đang chọn:** Màu Sky Blue + chấm tròn nhỏ bên dưới.
- **Mục không chọn:** Màu Slate 400.

---

### 3.4 Overlay: 🃏 Reveal Card (Thẻ từ vựng)

**Khi nào xuất hiện:** Sau khi AI nhận diện thành công (confidence ≥ 0.7).

**Animation xuất hiện:** Slide up từ dưới lên với hiệu ứng spring (nảy nhẹ). Nền phía sau tối dần (overlay đen 40%).

**Bố cục:**

```
┌──────────────────────────────────┐
│                    [X]           │ ← Nút đóng (góc phải)
│                                  │
│         [ RARE ]                 │ ← Rarity Badge (màu tương ứng)
│                                  │
│     ┌──────────────────┐         │
│     │                  │         │
│     │   📷 Ảnh chụp    │         │ ← Ảnh vật thể do trẻ chụp
│     │                  │         │    Viền + glow theo rarity
│     └──────────────────┘         │
│                                  │
│       "Con mèo"                  │ ← Tiếng Việt (lớn, đậm, navy)
│       "Cat" /kæt/                │ ← Tiếng Anh (xanh dương) + phiên âm
│       "猫" māo                   │ ← Tiếng Trung (xanh lá) + pinyin
│                                  │
│  ┌──────────────────────────┐    │
│  │   "Nói đi nào!"          │    │ ← Khu vực luyện phát âm
│  │                          │    │
│  │       [ 🎤 ]             │    │ ← Nút PTT (Push-to-Talk)
│  │                          │    │
│  │    ☆   ☆   ☆            │    │ ← 3 ngôi sao (chờ đánh giá)
│  └──────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

**Các trạng thái ngôi sao:**
- ☆☆☆ — Chưa thử (xám nhạt)
- ★☆☆ — Phát âm được nhưng chưa chuẩn
- ★★☆ — Phát âm khá tốt
- ★★★ — Phát âm xuất sắc (kèm confetti animation)

**Hiệu ứng Rarity Glow:**
- Common: Không glow, viền slate nhẹ
- Uncommon: Viền phát sáng xanh lá nhẹ
- Rare: Viền phát sáng xanh dương + particle nhỏ
- Epic: Viền phát sáng tím + particle trung bình
- Legendary: Viền phát sáng vàng gold + particle rực rỡ + tia sáng xoay

---

### 3.5 Màn hình 3: 📖 Collection Screen (Sổ sưu tập)

**Mục đích:** Hiển thị tất cả từ vựng đã thu thập, phân loại theo chủ đề. Giống "Pokédex".

**Bố cục:**

```
┌──────────────────────────────────┐
│   📖 Sổ sưu tập                 │ ← Tiêu đề
│   "42 từ đã thu thập"           │ ← Tổng số từ
│                                  │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🐾      │  │ 🍎      │       │ ← Category Grid (2 cột)
│  │ Động vật │  │ Thức ăn │       │
│  │ 8/20    │  │ 5/15    │       │    Mỗi tile: icon + tên + progress
│  │ ████░░░ │  │ ███░░░░ │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🌿      │  │ 🏫      │       │
│  │ Thiên   │  │ Trường  │       │
│  │ nhiên   │  │ học     │       │
│  │ 12/25   │  │ 3/18    │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🏠      │  │ 🚗      │       │
│  │ Nhà cửa │  │ Phương  │       │
│  │ 10/22   │  │ tiện    │       │
│  │ ████░░░ │  │ 4/12    │       │
│  └─────────┘  └─────────┘       │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Khi nhấn vào một Category → Mở VocabGrid:**

```
┌──────────────────────────────────┐
│ ← Quay lại    🐾 Động vật       │
│               8/20               │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ ← Grid 4 cột
│  │ 🐱 │ │ 🐶 │ │ ?? │ │ ?? │   │    Từ đã có: ảnh thumbnail
│  │Cat │ │Dog │ │    │ │    │   │    Từ chưa có: silhouette + "?"
│  │ ★★ │ │ ★★★│ │    │ │    │   │
│  └────┘ └────┘ └────┘ └────┘   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ 🐟 │ │ ?? │ │ ?? │ │ ?? │   │
│  │Fish│ │    │ │    │ │    │   │
│  │ ★  │ │    │ │    │ │    │   │
│  └────┘ └────┘ └────┘ └────┘   │
└──────────────────────────────────┘
```

**Style Category Tile:**
- Nền: Soft Cream (`#FFF9ED`) hoặc trắng.
- Viền: 1px solid, màu nhạt.
- Border-radius: 20px.
- Progress bar: Thanh nhỏ ở dưới, màu Sky Blue.
- Khi category hoàn thành 100%: Viền vàng gold + badge "Master ✨".

---

### 3.6 Màn hình 4: 🔍 Vocab Detail Screen

**Mục đích:** Xem chi tiết một từ vựng. Luyện phát âm. Xem tiến hóa.

**Bố cục:**

```
┌──────────────────────────────────┐
│ ← Quay lại              [RARE]  │ ← Rarity badge
│                                  │
│     ┌──────────────────┐         │
│     │                  │         │ ← Ảnh gốc do trẻ chụp
│     │   📷 Ảnh con mèo │         │    Viền glow theo rarity
│     │                  │         │
│     └──────────────────┘         │
│                                  │
│     "Con mèo"                    │ ← Tiếng Việt (28px, bold)
│     🔊 "Cat" /kæt/              │ ← Tiếng Anh (có nút nghe 🔊)
│     🔊 "猫" māo                 │ ← Tiếng Trung (có nút nghe 🔊)
│                                  │
│  ┌─ Phát âm ──────────────────┐  │
│  │ Tiếng Anh: ★★★             │  │ ← Sao phát âm mỗi ngôn ngữ
│  │ Tiếng Trung: ★★☆           │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌─ Tiến hóa ─────────────────┐  │
│  │ ●●●○○  3/5 lần luyện       │  │ ← Thanh tiến hóa
│  │ "Luyện thêm 2 lần nữa     │  │
│  │  để mở khóa sự thật        │  │
│  │  thú vị!"                   │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌─ Sự thật thú vị 🔒 ────────┐  │ ← Khóa cho đến khi tiến hóa
│  │ (Mở khóa sau khi tiến hóa) │  │
│  └────────────────────────────┘  │
│                                  │
│  [ 🎤 Luyện phát âm ]           │ ← Nút luyện (mở SayItChallenge)
│                                  │
└──────────────────────────────────┘
```

**Sau khi tiến hóa (5/5):**
- Hiệu ứng nổ confetti + glow rực rỡ.
- Section "Sự thật thú vị" mở khóa (ví dụ: "Mèo có thể ngủ 16 giờ mỗi ngày!").
- Section "Câu ví dụ" mở khóa (ví dụ: "The cat is sleeping on the sofa.").
- Badge "Evolved ✨" xuất hiện trên thẻ.

---

### 3.7 Màn hình 5: ⚔️ Quest Screen

**Mục đích:** Hiển thị nhiệm vụ hàng ngày/tuần để thúc đẩy khám phá.

**Bố cục:**

```
┌──────────────────────────────────┐
│   ⚔️ Nhiệm vụ                   │
│                                  │
│  ── Hôm nay ──                   │
│  ┌────────────────────────────┐  │
│  │ 🔴 Tìm 3 vật màu đỏ      │  │ ← Mission Card
│  │    ●●○  2/3                │  │    Icon + mô tả + progress
│  │    Thưởng: 50 XP + Streak │  │    Phần thưởng preview
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 📷 Chụp 5 vật bất kỳ     │  │
│  │    ●●●●○  4/5             │  │
│  │    Thưởng: 30 XP          │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ ✅ Luyện nói 3 từ          │  │ ← Đã hoàn thành
│  │    ●●●  3/3  XONG! 🎉     │  │    Nền xanh nhạt
│  │    [Nhận thưởng]           │  │    Nút nhận thưởng sáng lên
│  └────────────────────────────┘  │
│                                  │
│  ── Tuần này ──                  │
│  ┌────────────────────────────┐  │
│  │ 🍳 Chụp 5 món trong bếp  │  │
│  │    ●●○○○  2/5             │  │
│  │    Thưởng: 200 XP + 🏅   │  │
│  └────────────────────────────┘  │
│                                  │
│  ── Thử thách lớn ──            │
│  ┌────────────────────────────┐  │
│  │ 🐾 Nhà Động vật học        │  │
│  │    Hoàn thành nhóm Động vật│  │
│  │    8/20                    │  │
│  │    Thưởng: 500 XP + 🏆   │  │
│  └────────────────────────────┘  │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Trạng thái Mission Card:**
| Trạng thái | Style |
|---|---|
| Đang thực hiện | Nền trắng, viền nhạt, progress bar Sky Blue |
| Hoàn thành (chưa nhận thưởng) | Nền Mint Green nhạt, nút "Nhận thưởng" sáng lấp lánh |
| Đã nhận thưởng | Nền xám nhạt, đánh dấu ✅, opacity 60% |

---

### 3.8 Màn hình 6: 🏆 Leaderboard Screen

**Bố cục:**

```
┌──────────────────────────────────┐
│   🏆 Bảng xếp hạng              │
│                                  │
│  [ Lớp học ] [ Bạn bè ] [ Mọi  ]│ ← Tab bar
│                  ↑ active         │
│                                  │
│        👑                        │
│     ┌──────┐                     │ ← Top 3 Podium
│     │  #1  │                     │    Avatar lớn, 3D-like
│  ┌──┤ An   ├──┐                  │    Crown cho #1
│  │#2│ 980  │#3│                  │
│  │Mai│     │Bảo│                 │
│  │720│     │650│                 │
│  └──┘      └──┘                  │
│                                  │
│  4. Linh       ⭐ 580            │ ← Ranked List
│  5. Hùng       ⭐ 520            │    Avatar nhỏ + tên + điểm
│  6. Thảo       ⭐ 490            │
│  7. Dũng       ⭐ 445            │
│  ...                             │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 📍 Bạn: #12  ⭐ 142         │ │ ← Sticky bar (vị trí của mình)
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Ghi chú:**
- Top 3 hiển thị lớn, nổi bật với podium style.
- Crown vàng cho hạng 1. Huy chương bạc cho hạng 2. Huy chương đồng cho hạng 3.
- Leaderboard reset hàng tháng — hiển thị countdown timer nhỏ "Reset in 12 days".
- Sticky bar ở dưới luôn hiển thị vị trí hiện tại của trẻ.

---

### 3.9 Màn hình 7: 👤 Profile Screen

**Bố cục:**

```
┌──────────────────────────────────┐
│                                  │
│         ┌────────┐               │
│         │ Avatar │               │ ← Avatar tròn, viền gradient
│         │  (📸)  │               │    theo level
│         └────────┘               │
│         "Đạt Nguyễn"            │ ← Tên
│     [ Word Collector - Lv.5 ]    │ ← Badge danh hiệu
│                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │  42  │ │  7   │ │  3   │     │ ← Stats Grid
│  │ Từ   │ │ Ngày │ │ Hiếm │     │    Tổng từ | Streak | Thẻ hiếm
│  └──────┘ └──────┘ └──────┘     │
│                                  │
│  ── Huy hiệu ──                 │
│  🏅 🏅 🏅 🔒 🔒 🔒 🔒 🔒       │ ← Badge Showcase
│  "Nhà thám hiểm"                │    Đã nhận: sáng
│  "Bạn của động vật"              │    Chưa nhận: khóa, xám
│                                  │
│  ── Nhóm yêu thích ──           │
│  🐾 Động vật (8 từ)             │ ← Category yêu thích nhất
│                                  │
│                                  │
│  ⚙️ (Giữ 3 giây để vào         │ ← Parent Gate
│      cài đặt phụ huynh)         │    Nút nhỏ, ẩn, góc dưới
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Parent Gate — Cách hoạt động:**
1. Nút nhỏ (icon ⚙️) ở góc dưới, màu xám nhạt, kích thước 32px — trẻ khó nhận ra.
2. Khi nhấn giữ 3 giây → Hiện popup "Giải bài toán: 7 + 8 = ?" (phép tính thay đổi mỗi lần).
3. Trả lời đúng → Chuyển đến Parent Dashboard.
4. Trả lời sai → "Hỏi bố mẹ nhé! 😊"

---

### 3.10 Màn hình 8: 👨‍👩‍👧 Parent Dashboard

**Mục đích:** Cho phụ huynh theo dõi và kiểm soát trải nghiệm học tập.

**Phong cách thiết kế:** **KHÁC BIỆT** hoàn toàn với giao diện trẻ em:
- Nền trắng sạch, typography tối giản.
- Không animation rực rỡ, không emoji.
- Bảng biểu và số liệu rõ ràng.
- Giống dashboard quản trị chuyên nghiệp.

**Các section:**

| Section | Nội dung |
|---|---|
| **Tổng quan** | Số từ đã học, streak hiện tại, level |
| **Biểu đồ tiến độ** | Đường cong số từ mới theo ngày/tuần (line chart) |
| **Phân bổ chủ đề** | Pie chart: tỉ lệ từ theo nhóm (Động vật chiếm 30%...) |
| **Phân bổ độ hiếm** | Bar chart: bao nhiêu Common, Uncommon, Rare... |
| **Nhật ký hoạt động** | Danh sách gần đây: ảnh + từ + kết quả phát âm + thời gian |
| **Cài đặt thời gian** | Slider: Giới hạn mỗi ngày (mặc định 30 phút) |
| **Cài đặt ngôn ngữ** | Toggle: Bật/tắt Tiếng Anh, Bật/tắt Tiếng Trung |
| **Cài đặt lưu ảnh** | Toggle: Lưu ảnh gốc hay không |
| **Nút đăng xuất Parent** | Quay lại giao diện trẻ em |

---

## 4. Gamification & Mechanics

### 4.1 Hệ thống Điểm (XP)

| Hành động | Điểm |
|---|---|
| Capture Common mới | 10 XP |
| Capture Uncommon mới | 25 XP |
| Capture Rare mới | 50 XP |
| Capture Epic mới | 100 XP |
| Capture Legendary mới | 250 XP |
| Capture trùng lặp (duplicate) | 25% điểm gốc |
| Phát âm đúng 3 sao | +5 XP bonus |
| Hoàn thành Daily Quest | 50 XP |
| Hoàn thành Weekly Quest | 200 XP |
| Hoàn thành Category | 500 XP |
| Diversity Bonus | 300 XP |

### 4.2 Hệ thống Level

| Level | Danh hiệu | XP cần | Mở khóa |
|---|---|---|---|
| 1 | Beginner Explorer | 0 | Camera, Daily Quests |
| 5 | Word Collector | 500 | Collection Book |
| 10 | Vocab Hunter | 1,500 | Weekly Quests, Bảng xếp hạng bạn bè |
| 20 | Language Scout | 5,000 | Điểm Epic bonus, Bảng xếp hạng lớp |
| 50 | Polyglot Champion | 20,000 | Rare Radar (gợi ý tìm vật hiếm) |

### 4.3 Streak (Chuỗi ngày)
- Mỗi ngày chụp ≥ 1 từ mới = duy trì streak.
- Streak hiển thị bằng 🔥 + số ngày.
- Streak dài → phần thưởng nhân đôi (ví dụ: streak 7 ngày → 2x XP trong 1 ngày).

### 4.4 Evolution (Tiến hóa)
- Luyện phát âm đúng **5 lần** (trong **phiên học khác nhau**) → Thẻ tiến hóa.
- Tiến hóa mở khóa: Fun Fact + Example Sentence + Visual upgrade.
- Animation tiến hóa: Thẻ sáng rực, particle explosion, âm thanh "level up".

### 4.5 Chống Gian lận
- Chụp cùng 1 vật thể nhiều lần → chỉ tính 1 lần capture mới + các lần sau là duplicate (25% XP).
- Leaderboard reset hàng tháng.
- Diversity bonus khuyến khích chụp nhiều nhóm khác nhau thay vì spam 1 nhóm.

---

## 5. Animation & Motion

### 5.1 Nguyên tắc chung
- **Nhanh & mượt:** Duration 200-400ms cho micro-interactions, 400-600ms cho transitions lớn.
- **Spring physics:** Sử dụng spring animation (damping + stiffness) thay vì easing tuyến tính — tạo cảm giác "có trọng lượng".
- **Không quá nhiều:** Trẻ em thích animation nhưng quá nhiều sẽ gây mất tập trung. Chỉ animate ở những thời điểm quan trọng.

### 5.2 Danh sách Animation cụ thể

| Thời điểm | Loại Animation | Chi tiết |
|---|---|---|
| Nhấn Capture Button | Scale bounce | Scale 1 → 0.9 → 1.05 → 1 (200ms) |
| AI đang xử lý | Rotation spinner | Vòng xoay liên tục (border spinner) |
| Reveal Card xuất hiện | Slide-up spring | Từ dưới lên, spring damping 25, stiffness 200 |
| Rarity glow (Legendary) | Pulse glow + particles | Box-shadow pulse liên tục + floating particles |
| XP tăng | Number counter + sparkle | Số nhảy từ cũ → mới + tia sáng vàng |
| Level Up | Full-screen celebration | Flash trắng + "Level Up!" text + confetti |
| Ngôi sao phát âm | Pop-in | Scale 0 → 1.2 → 1 từng sao một, delay 100ms mỗi sao |
| Confetti (3 sao) | Particle explosion | Nhiều particle nhỏ đa màu rơi từ trên xuống (3 giây) |
| Thu thập thẻ thành công | Card fly | Thẻ thu nhỏ + bay vào icon Book trên nav bar |
| Evolution | Glow burst | Thẻ sáng rực + particle vỡ tung + morphing hình ảnh |
| Mission hoàn thành | Checkmark bounce | ✅ xuất hiện với bounce effect + particle nhỏ |
| Streak flame | Wobble | 🔥 rung nhẹ liên tục (subtle wobble, 2-3px) |
| Onboarding slides | Slide horizontal | Slide trái/phải mượt mà khi chuyển slide |
| Bottom Nav switch | Content fade | Fade out → fade in (150ms) khi chuyển tab |

---

## 6. Sound Design

### 6.1 Nguyên tắc
- Âm thanh phải **vui tươi, tích cực**, không đáng sợ hay quá ồn ào.
- Mỗi âm thanh **ngắn** (< 1 giây cho SFX, < 3 giây cho jingle).
- Cho phép phụ huynh **tắt âm thanh** trong Parent Dashboard.

### 6.2 Danh sách âm thanh

| Sự kiện | Mô tả âm thanh | Thời gian |
|---|---|---|
| Chụp ảnh (Capture) | "Click" camera cơ học, sắc nét | 0.3s |
| AI đang xử lý | Tiếng "bíp bo" nhẹ, lặp lại | Loop |
| Reveal Card | Tiếng "whoosh" + tiếng chuông nhẹ (chime) | 0.8s |
| Reveal Legendary | Tiếng "whoosh" mạnh hơn + fanfare ngắn | 1.5s |
| Phát âm mẫu (TTS) | Giọng AI đọc từ vựng (ElevenLabs) | Tùy từ |
| Phát âm đúng (1-2 sao) | Tiếng "ding" nhẹ, vui | 0.3s |
| Phát âm xuất sắc (3 sao) | Tiếng "ta-da!" + confetti jingle | 1s |
| Phát âm sai | Tiếng "boop" nhẹ nhàng (KHÔNG tiêu cực) | 0.3s |
| XP nhận được | Tiếng xu rơi "ching ching" | 0.5s |
| Level Up | Fanfare ngắn, trang trọng | 2s |
| Evolution | Tiếng sáng lấp lánh "shimmer + ding" | 1.5s |
| Mission Complete | Tiếng trumpet ngắn vui vẻ | 1s |
| Nhận thưởng (Reward) | Tiếng mở rương/hộp quà | 1s |

---

## 7. Xử lý Lỗi cho Trẻ em

### 7.1 Nguyên tắc vàng
> **KHÔNG BAO GIỜ** hiện thông báo lỗi kỹ thuật. Mọi lỗi đều phải được "dịch" sang ngôn ngữ trẻ em hiểu được, kèm gợi ý hành động.

### 7.2 Bảng xử lý lỗi

| Lỗi kỹ thuật | Thông báo cho trẻ | Hành động |
|---|---|---|
| Camera permission denied | "📸 Cho mình nhìn thế giới nhé! Nhấn 'Cho phép' để bật camera." | Nút "Cho phép" |
| AI API timeout / 500 | "😴 Ôi, AI buồn ngủ một chút! Chụp lại nhé!" | Nút "Thử lại" |
| AI confidence < 0.7 | "🤔 Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!" | Quay lại viewfinder |
| Không có internet | "📡 Ối, mất sóng rồi! Xem sổ sưu tập trong khi chờ nhé." | Nút "Xem sổ sưu tập" |
| Mic permission denied | "🎤 Cho mình nghe giọng bạn nhé! Nhấn 'Cho phép'." | Nút "Cho phép" |
| Phát âm sai 3 lần | "👏 Giỏi lắm! Thử từ khác dễ hơn nhé!" | Tự chuyển từ |
| Dung lượng IndexedDB đầy | "📦 Sổ sưu tập đầy rồi! Nhờ bố mẹ giúp nhé." | Parent Gate |
| Hết thời gian (time limit) | "⏰ Hôm nay học đủ rồi! Mai quay lại nha! 🌟" | Khóa camera, cho xem collection |

---

## 8. Offline & PWA

### 8.1 Khả năng Offline

| Tính năng | Online | Offline |
|---|---|---|
| Camera + AI Capture | ✅ | ❌ (Cần AI API) |
| Xem sổ sưu tập | ✅ | ✅ (Dữ liệu IndexedDB) |
| Xem chi tiết từ vựng | ✅ | ✅ |
| Luyện phát âm (TTS) | ✅ | ⚠️ (Nếu đã cache audio) |
| Xem nhiệm vụ | ✅ | ✅ (Hiển thị từ cache) |
| Bảng xếp hạng | ✅ | ❌ (Cần server) |
| Parent Dashboard | ✅ | ⚠️ (Dữ liệu cục bộ, không sync) |

### 8.2 PWA Requirements
- **manifest.json:** App name, icon (192x192 và 512x512), theme color (Sky Blue), background color (Snow White).
- **Service Worker:** Cache static assets + vocabulary data.
- **Install prompt:** Hiện gợi ý "Thêm vào Màn hình chính" sau lần sử dụng thứ 2.

---

## 9. An toàn & Bảo mật

### 9.1 Content Safety (Lọc nội dung)
- AI được prompt để **từ chối** nhận diện: vũ khí, chất kích thích, nội dung người lớn, nội dung bạo lực.
- Có **stop-list** các từ nhạy cảm — nếu AI trả về từ trong danh sách này → bỏ qua, yêu cầu chụp lại.

### 9.2 Privacy (Quyền riêng tư)
- **PII Blurring:** Không lưu ảnh có mặt người (xử lý phía server hoặc prompt AI bỏ qua).
- **Không có tính năng xã hội trực tiếp:** Trẻ không thể chat, gửi tin nhắn hay chia sẻ ảnh với người khác.
- **Leaderboard ẩn danh:** Chỉ hiển thị tên (không ảnh, không thông tin cá nhân).

### 9.3 Parent Gate
- **Bắt buộc** để truy cập bất kỳ cài đặt nào ảnh hưởng đến trải nghiệm.
- Xác thực bằng phép tính (ví dụ: 17 + 6 = ?) — đủ khó để trẻ 6-10 tuổi không tự giải được.
- Session hết hạn sau 5 phút — phải xác thực lại.



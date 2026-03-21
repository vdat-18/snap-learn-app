# SnapLearn — Frontend Plan (Complete A-Z Guide)

---

## Table of Contents

1. [Target Users](#1-target-users)
2. [Design System](#2-design-system)
3. [Screen System](#3-screen-system)
4. [Gamification & Mechanics](#4-gamification--mechanics)
5. [Animation & Motion](#5-animation--motion)
6. [Sound Design](#6-sound-design)
7. [Error Handling for Children](#7-error-handling-for-children)
8. [Offline & PWA](#8-offline--pwa)
9. [Safety & Security](#9-safety--security)

---

## 1. Target Users

### 1.1 Children (6-10 years old) - Main Focus
- **Visual & Interaction:** Use bright colors, icons instead of text, and instant feedback (images + sounds + haptic).
- **Good UX:** Large buttons (minimum 48px), big clear fonts (16px+), simple actions (no double-tap).
- **Psychology:** Like collecting things (Gacha style), want rewards, and short tasks (5-10 minutes).

### 1.2 Parents
- **Control:** Access through Parent Gate (solve math) to manage time and turn languages on/off.
- **Tracking:** Dashboard with vocabulary stats and log of child's photos.

---

## 2. Design System

### 2.1 Color Palette

#### Primary Colors
| Name | Hex | Use |
|---|---|---|
| **Sky Blue** | `#4DA8FF` | Main color — buttons, links, HUD highlights |
| **Sunshine Yellow** | `#FFD234` | Accent — XP, rewards, stars |
| **Coral Red** | `#FF6B6B` | Main Capture button, streak flame |

#### Background Colors
| Name | Hex | Use |
|---|---|---|
| **Snow White** | `#F8FAFC` | Main background for screens (except Camera) |
| **Soft Cream** | `#FFF9ED` | Background for cards, sections |
| **Deep Navy** | `#0F172A` | Camera viewfinder background |

#### Secondary / Accent Colors
| Name | Hex | Use |
|---|---|---|
| **Mint Green** | `#34D399` | Success, correct, completed |
| **Lavender Purple** | `#A78BFA` | Chinese language, Epic rarity |
| **Warm Orange** | `#FB923C` | Light warning, hints |

#### Rarity Colors
| Rarity | Main Color | Glow Color | Gradient |
|---|---|---|---|
| **Common** | `#94A3B8` (Slate) | `rgba(148,163,184,0.4)` | Slate 400 → Slate 300 |
| **Uncommon** | `#22C55E` (Green) | `rgba(34,197,94,0.4)` | Green 500 → Emerald 400 |
| **Rare** | `#3B82F6` (Blue) | `rgba(59,130,246,0.4)` | Blue 500 → Cyan 400 |
| **Epic** | `#A855F7` (Purple) | `rgba(168,85,247,0.4)` | Purple 500 → Violet 400 |
| **Legendary** | `#F59E0B` (Amber) | `rgba(245,158,11,0.4)` | Amber 500 → Yellow 300 |

#### Language Colors
| Language | Color | Purpose |
|---|---|---|
| Vietnamese | `#0F172A` (Navy) | Main language, shown with darkest color |
| English | `#3B82F6` (Blue) | Always with "EN" label |
| Chinese | `#22C55E` (Green) | Always with "ZH" label |

### 2.2 Typography (Fonts)

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| **Large Heading** | Outfit | 700 (Bold) | 28-32px | Vietnamese word name, screen titles |
| **Small Heading** | Outfit | 600 (SemiBold) | 20-24px | Group names, section titles |
| **Body** | Outfit | 500 (Medium) | 16-18px | Descriptions, card content |
| **Caption** | Outfit | 400 (Regular) | 12-14px | Pronunciation, small labels |
| **Badge / Tag** | Outfit | 700 (Bold) | 10-11px | Rarity badge, level tag — UPPERCASE, wide letter-spacing |

> **Why Outfit:** Rounded, friendly, easy to read for children. Good Vietnamese support. Not too "childish" so parents still see it as professional.

### 2.3 Spacing & Layout

- **Grid:** 4px base unit. All spacing is multiples of 4px (4, 8, 12, 16, 24, 32, 48, 64).
- **Safe area:** 16px padding on sides. Top: includes notch/status bar. Bottom: includes home indicator.
- **Card border-radius:** 16-24px (soft rounded corners).
- **Button border-radius:** 16px (regular buttons), full-rounded (round buttons like Capture).
- **Glassmorphism:** `background: rgba(255,255,255,0.7)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.3)`.

### 2.4 Icons

- **Library:** Lucide React (consistent, stroke-based, 24px default).
- **Icon sizes:** 20px (inline), 24px (navigation), 32px (action buttons), 48px (feature highlights).
- **Important icons:**
  - 📸 Camera → custom icon or `Camera`
  - 📖 Book → `Book` or `BookOpen`
  - ⚔️ Quest → `Target` or `Swords`
  - 🏆 Rank → `Award` or `Trophy`
  - 👤 Me → `User` or `CircleUser`
  - 🎤 Mic → `Mic`
  - ⭐ Star → `Star`
  - 🔥 Streak → emoji or custom flame icon
  - ❌ Close → `X`
  - ✅ Success → `Check`

### 2.5 Shadows & Elevation

| Level | Shadow | Use |
|---|---|---|
| **Level 0** | No shadow | Background, flat elements |
| **Level 1** | `0 1px 3px rgba(0,0,0,0.08)` | Small cards, tags |
| **Level 2** | `0 4px 12px rgba(0,0,0,0.1)` | Main cards, bottom nav |
| **Level 3** | `0 8px 24px rgba(0,0,0,0.15)` | Modal, overlay cards |
| **Rarity Glow** | `0 0 20px [rarity-color]` | Vocabulary card border when revealed |

### 2.6 Images & Illustration Style

- **Style:** Flat illustration with pastel colors, soft lines, rounded corners.
- **Mascot character:** Not required for POC, but should have 1 character (example: small owl with glasses) appearing in onboarding and error messages.
- **Category icons:** Use emoji or small illustrations for each topic group (🐾 Animals, 🍎 Food, 🌿 Nature, 🏫 School, 🏠 Home, 🚗 Transportation).
- **Silhouette cards:** Undiscovered cards show black shadow + "?" in center, creating curiosity.

---

## 3. Screen System

### 3.1 Navigation Map

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
 Screen                          (after Parent Gate)

┌─────────────────────────────────────────────┐
│    📸 CAMERA SCREEN (FLOATING BUTTON)      │
│    Always accessible from every screen     │
│    or default screen when opening app      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│    🎬 ONBOARDING (only shows first time)   │
└─────────────────────────────────────────────┘
```

---

### 3.2 Screen 1: 🎬 Onboarding

**Purpose:** Introduce the app to children using it for the first time.

**Structure:** 4 slides, swipe horizontally or tap "Next" button.

| Slide | Illustration | Title | Short Description |
|---|---|---|---|
| 1 | Child holding phone with bright sparkling objects around | "Welcome to SnapLearn!" | "Discover the world and learn new words every day!" |
| 2 | Hand taking photo of a cat, word card flying out | "Take photos of things around you!" | "Point camera at objects and tap the capture button" |
| 3 | Microphone icon with sound waves | "Speak to collect!" | "Say it correctly to add words to your collection" |
| 4 | Collection book opening with many sparkling stickers inside | "Collect & Level Up!" | "Gather rare words, complete quests, become a champion!" |

**CTA button on last slide:** "🚀 Start exploring!" → goes to Camera Screen.

**Progress indicator:** 4 round dots at bottom, current dot lights up.

**Rule:** Only shows once. Save "seen" status to device memory. If already seen, opening app goes straight to Camera Screen.

---

### 3.3 Screen 2: 📸 Camera Screen (Core Experience)

**Purpose:** This is the MAIN screen. Children use camera to take photos of objects, AI recognizes and creates vocabulary cards.

**Overall Layout:**

```
┌──────────────────────────────────┐
│ [Level Badge]  [XP]    [🔥 7]   │ ← Top HUD (glassmorphism)
│                                  │
│  ┌─ Today's Mission ──────────┐  │ ← Mission Overlay
│  │ Find 3 red objects 🔴     │  │
│  │ ████░░░░░░ 1/3             │  │
│  └────────────────────────────┘  │
│                                  │
│         ┌──────────┐             │
│         │          │             │ ← Viewfinder (live camera)
│     ┌───│  🎯 AI   │───┐        │    with 4 white corners
│         │          │             │
│         └──────────┘             │
│                                  │
│           ┌──────┐               │
│           │  ●   │               │ ← Capture Button (red, round, big)
│           └──────┘               │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 📖 Book │ ⚔️ Quest │ 🏆 │ 👤│ │ ← Bottom Navigation
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

#### Top HUD (Head-Up Display)
- **Position:** Top, overlaying camera view.
- **Style:** Glassmorphism (transparent blur, blur background).
- **Left side:** Round badge showing Level (example: "L5" on blue background) + current XP (example: "⭐ 142 pts").
- **Right side:** Streak flame "🔥 7" (consecutive days).
- **When XP changes:** XP number jumps up with golden sparkle effect.

#### Mission Overlay
- **Position:** Below Top HUD, left side.
- **Style:** Compact glassmorphism card (max 200px width).
- **Content:** "TODAY'S MISSION" label (small, blue, uppercase) + mission description + progress bar.
- **Animation:** Slide-in from left when opening app.

#### Camera Viewfinder
- **Background:** Live camera feed (phone's rear camera).
- **Overlay:** 4 white semi-transparent corners forming viewfinder frame in center (about 70% of screen width).
- **When app doesn't have camera permission:** Show cute message "📸 Let me see the world!" with "Allow" button.

#### Capture Button
- **Position:** Center bottom, above Bottom Nav.
- **Size:** 72px (outer ring), 56px (red inner circle).
- **Style:** Thick white border, inside is coral red circle. When pressed: scale down to 90% then bounce up.
- **Loading state:** Red circle becomes spinning blue spinner (AI processing).
- **Disabled:** When processing or when Reveal Card is open.

#### Bottom Navigation
- **Style:** Glassmorphism bar, 24px border radius, 24px from bottom.
- **4 items:** Book | Quest | Rank | Me (icon + small label below).
- **Selected item:** Sky Blue color + small dot below.
- **Unselected items:** Slate 400 color.

---

### 3.4 Overlay: 🃏 Reveal Card (Vocabulary Card)

**When it appears:** After AI successfully recognizes (confidence ≥ 0.7).

**Appearance animation:** Slide up from bottom with spring effect (light bounce). Background dims (40% black overlay).

**Layout:**

```
┌──────────────────────────────────┐
│                    [X]           │ ← Close button (top right)
│                                  │
│         [ RARE ]                 │ ← Rarity Badge (matching color)
│                                  │
│     ┌──────────────────┐         │
│     │                  │         │
│     │   📷 Photo       │         │ ← Object photo taken by child
│     │                  │         │    Border + glow by rarity
│     └──────────────────┘         │
│                                  │
│       "Con mèo"                  │ ← Vietnamese (big, bold, navy)
│       "Cat" /kæt/                │ ← English (blue) + pronunciation
│       "猫" māo                   │ ← Chinese (green) + pinyin
│                                  │
│  ┌──────────────────────────┐    │
│  │   "Say it!"              │    │ ← Pronunciation practice area
│  │                          │    │
│  │       [ 🎤 ]             │    │ ← PTT (Push-to-Talk) button
│  │                          │    │
│  │    ☆   ☆   ☆            │    │ ← 3 stars (waiting for rating)
│  └──────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

**Star states:**
- ☆☆☆ — Not tried yet (light gray)
- ★☆☆ — Can pronounce but not accurate
- ★★☆ — Pretty good pronunciation
- ★★★ — Excellent pronunciation (with confetti animation)

**Rarity Glow Effects:**
- Common: No glow, light slate border
- Uncommon: Light green glowing border
- Rare: Blue glowing border + small particles
- Epic: Purple glowing border + medium particles
- Legendary: Golden glow border + bright particles + spinning light rays

---

### 3.5 Screen 3: 📖 Collection Screen (Collection Book)

**Purpose:** Show all collected vocabulary, organized by topics. Like a "Pokédex".

**Layout:**

```
┌──────────────────────────────────┐
│   📖 Collection Book             │ ← Title
│   "42 words collected"           │ ← Total words count
│                                  │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🐾      │  │ 🍎      │       │ ← Category Grid (2 columns)
│  │ Animals │  │ Food    │       │
│  │ 8/20    │  │ 5/15    │       │    Each tile: icon + name + progress
│  │ ████░░░ │  │ ███░░░░ │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🌿      │  │ 🏫      │       │
│  │ Nature  │  │ School  │       │
│  │ 12/25   │  │ 3/18    │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🏠      │  │ 🚗      │       │
│  │ Home    │  │ Trans   │       │
│  │ 10/22   │  │ port    │       │
│  │ ████░░░ │  │ 4/12    │       │
│  └─────────┘  └─────────┘       │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**When clicking a Category → Opens VocabGrid:**

```
┌──────────────────────────────────┐
│ ← Back       🐾 Animals          │
│              8/20                │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ ← 4-column Grid
│  │ 🐱 │ │ 🐶 │ │ ?? │ │ ?? │   │    Have: photo thumbnail
│  │Cat │ │Dog │ │    │ │    │   │    Don't have: silhouette + "?"
│  │ ★★ │ │ ★★★│ │    │ │    │   │
│  └────┘ └────┘ └────┘ └────┘   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ 🐟 │ │ ?? │ │ ?? │ │ ?? │   │
│  │Fish│ │    │ │    │ │    │   │
│  │ ★  │ │    │ │    │ │    │   │
│  └────┘ └────┘ └────┘ └────┘   │
└──────────────────────────────────┘
```

**Category Tile Style:**
- Background: Soft Cream (`#FFF9ED`) or white.
- Border: 1px solid, light color.
- Border-radius: 20px.
- Progress bar: Small bar at bottom, Sky Blue color.
- When category 100% complete: Gold border + "Master ✨" badge.

---

### 3.6 Screen 4: 🔍 Vocab Detail Screen

**Purpose:** View details of one word. Practice pronunciation. See evolution.

**Layout:**

```
┌──────────────────────────────────┐
│ ← Back                   [RARE]  │ ← Rarity badge
│                                  │
│     ┌──────────────────┐         │
│     │                  │         │ ← Original photo by child
│     │   📷 Cat photo   │         │    Border glow by rarity
│     │                  │         │
│     └──────────────────┘         │
│                                  │
│     "Con mèo"                    │ ← Vietnamese (28px, bold)
│     🔊 "Cat" /kæt/              │ ← English (with sound button 🔊)
│     🔊 "猫" māo                 │ ← Chinese (with sound button 🔊)
│                                  │
│  ┌─ Pronunciation ─────────────┐  │
│  │ English: ★★★              │  │ ← Stars for each language
│  │ Chinese: ★★☆              │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌─ Evolution ─────────────────┐  │
│  │ ●●●○○  3/5 practice times  │  │ ← Evolution progress bar
│  │ "Practice 2 more times    │  │
│  │  to unlock fun facts!"    │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌─ Fun Facts 🔒 ─────────────┐  │ ← Locked until evolution
│  │ (Unlock after evolution)   │  │
│  └───────────────────────────┘  │
│                                  │
│  [ 🎤 Practice Speaking ]       │ ← Practice button (opens SayItChallenge)
│                                  │
└──────────────────────────────────┘
```

**After evolution (5/5):**
- Confetti explosion effect + bright glow.
- "Fun Facts" section unlocks (example: "Cats can sleep 16 hours per day!").
- "Example Sentence" section unlocks (example: "The cat is sleeping on the sofa.").
- "Evolved ✨" badge appears on card.

---

### 3.7 Screen 5: ⚔️ Quest Screen

**Purpose:** Show daily/weekly quests to encourage exploration.

**Layout:**

```
┌──────────────────────────────────┐
│   ⚔️ Quests                     │
│                                  │
│  ── Today ──                     │
│  ┌────────────────────────────┐  │
│  │ 🔴 Find 3 red objects     │  │ ← Mission Card
│  │    ●●○  2/3                │  │    Icon + description + progress
│  │    Reward: 50 XP + Streak │  │    Reward preview
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 📷 Take 5 photos          │  │
│  │    ●●●●○  4/5             │  │
│  │    Reward: 30 XP          │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ ✅ Practice 3 words        │  │ ← Completed
│  │    ●●●  3/3  DONE! 🎉     │  │    Light green background
│  │    [Claim Reward]         │  │    Glowing claim button
│  └────────────────────────────┘  │
│                                  │
│  ── This Week ──                 │
│  ┌────────────────────────────┐  │
│  │ 🍳 Take 5 kitchen photos  │  │
│  │    ●●○○○  2/5             │  │
│  │    Reward: 200 XP + 🏅   │  │
│  └────────────────────────────┘  │
│                                  │
│  ── Big Challenge ──             │
│  ┌────────────────────────────┐  │
│  │ 🐾 Animal Master          │  │
│  │    Complete Animal group   │  │
│  │    8/20                    │  │
│  │    Reward: 500 XP + 🏆   │  │
│  └────────────────────────────┘  │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Mission Card States:**
| State | Style |
|---|---|
| In progress | White background, light border, Sky Blue progress bar |
| Complete (not claimed) | Light Mint Green background, glowing "Claim Reward" button |
| Already claimed | Light gray background, ✅ mark, 60% opacity |

---

### 3.8 Screen 6: 🏆 Leaderboard Screen

**Layout:**

```
┌──────────────────────────────────┐
│   🏆 Leaderboard                 │
│                                  │
│  [ Class ] [ Friends ] [ All  ]  │ ← Tab bar
│              ↑ active            │
│                                  │
│        👑                        │
│     ┌──────┐                     │ ← Top 3 Podium
│     │  #1  │                     │    Large avatar, 3D-like
│  ┌──┤ An   ├──┐                  │    Crown for #1
│  │#2│ 980  │#3│                  │
│  │Mai│     │Bao│                 │
│  │720│     │650│                 │
│  └──┘      └──┘                  │
│                                  │
│  4. Linh       ⭐ 580            │ ← Ranked List
│  5. Hung       ⭐ 520            │    Small avatar + name + points
│  6. Thao       ⭐ 490            │
│  7. Dung       ⭐ 445            │
│  ...                             │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 📍 You: #12  ⭐ 142         │ │ ← Sticky bar (your position)
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Notes:**
- Top 3 shown large and prominent with podium style.
- Gold crown for #1. Silver medal for #2. Bronze medal for #3.
- Leaderboard resets monthly — show small countdown timer "Reset in 12 days".
- Sticky bar at bottom always shows child's current position.

---

### 3.9 Screen 7: 👤 Profile Screen

**Layout:**

```
┌──────────────────────────────────┐
│                                  │
│         ┌────────┐               │
│         │ Avatar │               │ ← Round avatar, gradient border
│         │  (📸)  │               │    by level
│         └────────┘               │
│         "Dat Nguyen"             │ ← Name
│     [ Word Collector - Lv.5 ]    │ ← Title badge
│                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │  42  │ │  7   │ │  3   │     │ ← Stats Grid
│  │Words │ │ Days │ │ Rare │     │    Total words | Streak | Rare cards
│  └──────┘ └──────┘ └──────┘     │
│                                  │
│  ── Badges ──                    │
│  🏅 🏅 🏅 🔒 🔒 🔒 🔒 🔒       │ ← Badge Showcase
│  "Explorer"                      │    Earned: bright
│  "Animal Friend"                 │    Not earned: locked, gray
│                                  │
│  ── Favorite Topic ──            │
│  🐾 Animals (8 words)            │ ← Most collected category
│                                  │
│                                  │
│  ⚙️ (Hold 3 seconds for         │ ← Parent Gate
│      parent settings)           │    Small, hidden, bottom corner
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bottom Navigation            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Parent Gate — How it works:**
1. Small button (⚙️ icon) in bottom corner, light gray, 32px size — hard for children to notice.
2. Hold for 3 seconds → Show popup "Solve: 7 + 8 = ?" (math changes each time).
3. Correct answer → Go to Parent Dashboard.
4. Wrong answer → "Ask mom and dad! 😊"

---

### 3.10 Screen 8: 👨‍👩‍👧 Parent Dashboard

**Purpose:** Let parents track and control learning experience.

**Design Style:** **COMPLETELY DIFFERENT** from children's interface:
- Clean white background, minimal typography.
- No bright animations, no emoji.
- Clear charts and numbers.
- Like professional admin dashboard.

**Sections:**

| Section | Content |
|---|---|
| **Overview** | Words learned, current streak, level |
| **Progress Chart** | Line chart of new words by day/week |
| **Topic Distribution** | Pie chart: word percentage by group (Animals 30%...) |
| **Rarity Distribution** | Bar chart: how many Common, Uncommon, Rare... |
| **Activity Log** | Recent list: photo + word + pronunciation result + time |
| **Time Settings** | Slider: Daily limit (default 30 minutes) |
| **Language Settings** | Toggle: Enable/disable English, Enable/disable Chinese |
| **Photo Storage** | Toggle: Save original photos or not |
| **Parent Logout** | Back to children's interface |

---

## 4. Gamification & Mechanics

### 4.1 Point System (XP)

| Action | Points |
|---|---|
| Capture new Common | 10 XP |
| Capture new Uncommon | 25 XP |
| Capture new Rare | 50 XP |
| Capture new Epic | 100 XP |
| Capture new Legendary | 250 XP |
| Capture duplicate | 25% of original points |
| Perfect pronunciation (3 stars) | +5 XP bonus |
| Complete Daily Quest | 50 XP |
| Complete Weekly Quest | 200 XP |
| Complete Category | 500 XP |
| Diversity Bonus | 300 XP |

### 4.2 Level System

| Level | Title | XP Needed | Unlocks |
|---|---|---|---|
| 1 | Beginner Explorer | 0 | Camera, Daily Quests |
| 5 | Word Collector | 500 | Collection Book |
| 10 | Vocab Hunter | 1,500 | Weekly Quests, Friends Leaderboard |
| 20 | Language Scout | 5,000 | Epic bonus points, Class Leaderboard |
| 50 | Polyglot Champion | 20,000 | Rare Radar (hints for finding rare objects) |

### 4.3 Streak (Daily Chain)
- Each day with ≥ 1 new word = maintain streak.
- Streak shown as 🔥 + number of days.
- Long streaks → double rewards (example: 7-day streak → 2x XP for 1 day).

### 4.4 Evolution
- Practice pronunciation correctly **5 times** (in **different sessions**) → Card evolves.
- Evolution unlocks: Fun Fact + Example Sentence + Visual upgrade.
- Evolution animation: Card glows bright, particle explosion, "level up" sound.

### 4.5 Anti-Cheat
- Taking photos of same object multiple times → only counts once as new capture + later times are duplicates (25% XP).
- Leaderboard resets monthly.
- Diversity bonus encourages taking photos of different groups instead of spamming one group.

---

## 5. Animation & Motion

### 5.1 General Rules
- **Fast & smooth:** 200-400ms duration for micro-interactions, 400-600ms for large transitions.
- **Spring physics:** Use spring animation (damping + stiffness) instead of linear easing — creates "weight" feeling.
- **Not too much:** Children like animation but too much causes distraction. Only animate at important moments.

### 5.2 Specific Animation List

| Moment | Animation Type | Details |
|---|---|---|
| Press Capture Button | Scale bounce | Scale 1 → 0.9 → 1.05 → 1 (200ms) |
| AI processing | Rotation spinner | Continuous spinning (border spinner) |
| Reveal Card appears | Slide-up spring | From bottom up, spring damping 25, stiffness 200 |
| Rarity glow (Legendary) | Pulse glow + particles | Continuous box-shadow pulse + floating particles |
| XP increase | Number counter + sparkle | Number jumps from old → new + golden sparkles |
| Level Up | Full-screen celebration | White flash + "Level Up!" text + confetti |
| Pronunciation stars | Pop-in | Scale 0 → 1.2 → 1 each star, 100ms delay per star |
| Confetti (3 stars) | Particle explosion | Many small colorful particles falling from top (3 seconds) |
| Card collection success | Card fly | Card shrinks + flies into Book icon on nav bar |
| Evolution | Glow burst | Card glows bright + particle burst + morphing image |
| Mission complete | Checkmark bounce | ✅ appears with bounce effect + small particles |
| Streak flame | Wobble | 🔥 shakes gently continuously (subtle wobble, 2-3px) |
| Onboarding slides | Slide horizontal | Smooth left/right slide when changing slides |
| Bottom Nav switch | Content fade | Fade out → fade in (150ms) when switching tabs |

---

## 6. Sound Design

### 6.1 Rules
- Sounds must be **happy and positive**, not scary or too loud.
- Each sound is **short** (< 1 second for SFX, < 3 seconds for jingles).
- Allow parents to **turn off sounds** in Parent Dashboard.

### 6.2 Sound List

| Event | Sound Description | Duration |
|---|---|---|
| Take photo (Capture) | Sharp mechanical camera "click" | 0.3s |
| AI processing | Light "beep boop" repeating | Loop |
| Reveal Card | "Whoosh" + light chime | 0.8s |
| Reveal Legendary | Stronger "whoosh" + short fanfare | 1.5s |
| Sample pronunciation (TTS) | AI voice reads vocabulary (ElevenLabs) | Variable |
| Correct pronunciation (1-2 stars) | Light happy "ding" | 0.3s |
| Perfect pronunciation (3 stars) | "Ta-da!" + confetti jingle | 1s |
| Wrong pronunciation | Gentle "boop" (NOT negative) | 0.3s |
| Receive XP | Coin drop "ching ching" | 0.5s |
| Level Up | Short, dignified fanfare | 2s |
| Evolution | Sparkling "shimmer + ding" | 1.5s |
| Mission Complete | Short happy trumpet | 1s |
| Claim Reward | Treasure chest/gift box opening | 1s |

---

## 7. Error Handling for Children

### 7.1 Golden Rule
> **NEVER** show technical error messages. All errors must be "translated" to child-friendly language with action suggestions.

### 7.2 Error Handling Table

| Technical Error | Message for Children | Action |
|---|---|---|
| Camera permission denied | "📸 Let me see the world! Tap 'Allow' to turn on camera." | "Allow" button |
| AI API timeout / 500 | "😴 Oops, AI is a bit sleepy! Let's try again!" | "Try Again" button |
| AI confidence < 0.7 | "🤔 Hmm, I can't see clearly. Come closer!" | Back to viewfinder |
| No internet | "📡 Oops, lost signal! Let's look at your collection while waiting." | "View Collection" button |
| Mic permission denied | "🎤 Let me hear your voice! Tap 'Allow'." | "Allow" button |
| Wrong pronunciation 3 times | "👏 Great job! Let's try an easier word!" | Auto-switch word |
| IndexedDB storage full | "📦 Collection is full! Ask mom and dad for help." | Parent Gate |
| Time limit reached | "⏰ You learned enough today! Come back tomorrow! 🌟" | Lock camera, show collection |

---

## 8. Offline & PWA

### 8.1 Offline Capabilities

| Feature | Online | Offline |
|---|---|---|
| Camera + AI Capture | ✅ | ❌ (Needs AI API) |
| View collection | ✅ | ✅ (IndexedDB data) |
| View word details | ✅ | ✅ |
| Practice pronunciation (TTS) | ✅ | ⚠️ (If audio cached) |
| View quests | ✅ | ✅ (Show from cache) |
| Leaderboard | ✅ | ❌ (Needs server) |
| Parent Dashboard | ✅ | ⚠️ (Local data, no sync) |

### 8.2 PWA Requirements
- **manifest.json:** App name, icons (192x192 and 512x512), theme color (Sky Blue), background color (Snow White).
- **Service Worker:** Cache static assets + vocabulary data.
- **Install prompt:** Show "Add to Home Screen" suggestion after 2nd use.

---

## 9. Safety & Security

### 9.1 Content Safety (Content Filtering)
- AI is prompted to **reject** recognition of: weapons, stimulants, adult content, violent content.
- Have **stop-list** of sensitive words — if AI returns words in this list → skip, ask to retake photo.

### 9.2 Privacy
- **PII Blurring:** Don't save photos with people's faces (handle server-side or prompt AI to skip).
- **No direct social features:** Children cannot chat, send messages, or share photos with others.
- **Anonymous leaderboard:** Only show names (no photos, no personal information).

### 9.3 Parent Gate
- **Required** to access any settings that affect the experience.
- Authenticate with math problem (example: 17 + 6 = ?) — hard enough for 6-10 year olds to not solve.
- Session expires after 5 minutes — need to authenticate again.

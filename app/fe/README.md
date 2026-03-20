# SnapLearn — Frontend (Next.js PWA)

**Camera-first, audio-driven language learning experience for Vietnamese children aged 6-10**

---

## Overview

The SnapLearn frontend is a **Next.js 14 Progressive Web App (PWA)** that provides the child-facing capture & display layer. It communicates with the FastAPI backend via REST APIs. The frontend is a **thin client** — all game logic, AI processing, and data persistence happen server-side.

### Design Philosophy

- **Audio-first, icon-driven:** Target users are 6-10 year-olds who may not read fluently. Everything that can be read is also spoken aloud via TTS. Navigation uses icons as primary signifiers — text is secondary.
- **Camera-first home screen:** The app opens directly to the camera viewfinder (like Pokemon Go's map). Capturing is the core action.
- **Vietnamese-first:** UI, narration, and scaffolding in Vietnamese. Target language (EN or ZH) is the learning content.
- **Child-safe:** No free-form chat, no social features, no direct messaging. Bright, encouraging, never punitive.

---

## Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript | SSR/SSG, file-based routing, PWA-ready |
| **Styling** | Tailwind CSS 3 | Rapid iteration, good CJK typography, small bundle |
| **State** | Zustand | Lightweight, no boilerplate, works well with async |
| **Animation** | Framer Motion | Spring physics, gesture support, performant card reveals |
| **Camera** | `navigator.mediaDevices.getUserMedia()` | Direct browser API |
| **Audio** | MediaRecorder API + Web Audio API | PTT recording, audio blob for ASR upload |
| **PWA** | next-pwa (Workbox) | Service worker, precaching static assets |
| **Icons** | Lucide React | Consistent stroke-based icons, tree-shakeable |
| **Charts** | Recharts | Lightweight charting for parent dashboard |
| **HTTP** | Native `fetch` or ky | API calls with retry, timeout, interceptors |

---

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout + providers
│   ├── page.tsx                   # Camera screen (default home)
│   ├── onboarding/page.tsx        # 4-slide onboarding flow
│   ├── collection/
│   │   ├── page.tsx               # Category grid
│   │   └── [category]/page.tsx    # Vocab grid for a category
│   ├── vocab/[id]/page.tsx        # Single word detail + practice
│   ├── quests/page.tsx            # Mission list
│   ├── leaderboard/page.tsx       # Rankings (class/friends/global)
│   ├── profile/page.tsx           # Child profile + badges
│   ├── parent/
│   │   └── dashboard/page.tsx     # Parent dashboard
│   ├── auth/
│   │   ├── login/page.tsx         # Parent login
│   │   └── register/page.tsx      # Parent registration
│   └── manifest.json              # PWA manifest
│
├── components/
│   ├── ui/                        # Reusable primitives (Button, Card, Badge, ...)
│   ├── capture/                   # CaptureButton, Viewfinder, RevealCard
│   ├── pronunciation/             # PTTButton, StarRating, SayItChallenge
│   ├── navigation/                # BottomNav, TopHUD, MissionOverlay
│   ├── gamification/              # XPCounter, LevelBadge, StreakFlame, Confetti
│   └── parent/                    # ParentGate, DashboardCharts, ControlPanel
│
├── hooks/
│   ├── useCamera.ts               # Camera stream management
│   ├── useAudioRecorder.ts        # PTT audio recording
│   ├── useCapture.ts              # Capture flow orchestration
│   ├── usePronunciation.ts        # Pronunciation practice flow
│   ├── useTTS.ts                  # Text-to-speech playback
│   └── useAuth.ts                 # JWT auth state + refresh
│
├── stores/
│   ├── userStore.ts               # Child profile, XP, level, streak
│   ├── collectionStore.ts         # Captured vocab, categories
│   ├── missionStore.ts            # Active missions, progress
│   └── audioStore.ts              # Sound effects state
│
├── services/
│   ├── api.ts                     # HTTP client setup + JWT interceptor
│   ├── captureApi.ts              # /api/capture calls
│   ├── speechApi.ts               # /api/pronounce + /api/tts calls
│   ├── gameApi.ts                 # Missions, leaderboard, profile calls
│   └── parentApi.ts               # Parent dashboard API calls
│
├── lib/
│   ├── imageCompression.ts        # Client-side image resize + compress
│   ├── audioUtils.ts              # Audio blob processing
│   └── constants.ts               # Rarity colors, XP values, category icons
│
├── assets/
│   ├── sounds/                    # SFX (capture click, chime, confetti, etc.)
│   ├── illustrations/             # Onboarding slides, mascot, error states
│   └── fonts/                     # Outfit font files
│
└── middleware.ts                   # Next.js middleware (auth redirect, etc.)
```

---

## Screen System

### Navigation Map

```
┌─────────────────────────────────────────┐
│            BOTTOM NAVIGATION            │
├──────────┬──────────┬──────────┬────────┤
│ 📖 Book  │ ⚔️ Quest │ 🏆 Rank  │ 👤 Me  │
└────┬─────┴────┬─────┴────┬─────┴────┬───┘
     │          │          │          │
     ▼          ▼          ▼          ▼
 Collection   Quest    Leaderboard  Profile
     │                                │
     ▼                                ▼
 Vocab Detail              Parent Dashboard
                           (after Parent Gate)

┌─────────────────────────────────────────┐
│  📸 CAMERA SCREEN (default home)        │
│  Always accessible, FAB or home screen  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🎬 ONBOARDING (first launch only)     │
└─────────────────────────────────────────┘
```

### Screens Overview

| Screen | Purpose | Key Features |
|---|---|---|
| **Onboarding** | First-launch introduction (4 slides) | Audio-guided, icon-driven, < 60 seconds |
| **Camera** | Core experience — capture objects | Live viewfinder, Top HUD (level/XP/streak), Mission overlay, Capture button |
| **Reveal Card** | Show captured vocab card | Rarity glow, trilingual display (VI/EN/ZH), pronunciation practice (PTT) |
| **Collection** | Browse captured words | Category grid (2 columns), progress bars, silhouette for undiscovered |
| **Vocab Detail** | Word detail + practice | Photo, translations, TTS playback, mastery stars, evolution progress |
| **Quests** | Daily/weekly missions | Mission cards with progress, reward preview, claim button |
| **Leaderboard** | Rankings | Top 3 podium, ranked list, tab bar (class/friends/global), sticky "my rank" |
| **Profile** | Child stats + badges | Avatar, level badge, stats grid, badge showcase, Parent Gate trigger |
| **Parent Dashboard** | Adult-facing analytics | Clean/minimal design, charts, activity feed, parental controls |

---

## Design System

### Color Palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Sky Blue | `#4DA8FF` | Buttons, links, HUD highlights |
| Accent | Sunshine Yellow | `#FFD234` | XP, rewards, stars |
| Action | Coral Red | `#FF6B6B` | Capture button, streak flame |
| Success | Mint Green | `#34D399` | Correct, completed |
| Background | Snow White | `#F8FAFC` | Main screen backgrounds |
| Cards | Soft Cream | `#FFF9ED` | Card backgrounds, sections |
| Camera | Deep Navy | `#0F172A` | Camera viewfinder background |

### Rarity Colors

| Tier | Color | Glow |
|---|---|---|
| Common | `#94A3B8` (Slate) | No glow |
| Uncommon | `#22C55E` (Green) | Subtle green glow |
| Rare | `#3B82F6` (Blue) | Blue glow + particles |
| Epic | `#A855F7` (Purple) | Purple glow + medium particles |
| Legendary | `#F59E0B` (Amber) | Gold glow + rarity particles + rotating rays |

### Typography

- **Font:** Outfit (rounded, friendly, good Vietnamese support)
- **Headings:** 28-32px Bold / 20-24px SemiBold
- **Body:** 16-18px Medium
- **Captions:** 12-14px Regular
- **Spacing:** 4px base unit grid
- **Min tap target:** 48px

### Language Colors

| Language | Color | Label |
|---|---|---|
| Vietnamese | `#0F172A` (Navy) | Primary display, boldest |
| English | `#3B82F6` (Blue) | Always with "EN" label |
| Chinese | `#22C55E` (Green) | Always with "ZH" label |

---

## Animation System

| Moment | Animation | Duration |
|---|---|---|
| Capture button tap | Scale bounce (1 → 0.9 → 1.05 → 1) | 200ms |
| AI processing | Rotation spinner | Loop |
| Reveal card | Slide-up spring (damping 25, stiffness 200) | 400-600ms |
| Legendary glow | Pulse glow + floating particles | Continuous |
| XP earned | Number counter + gold sparkle | 300ms |
| Level up | Full-screen flash + confetti | 2s |
| Star rating | Pop-in per star (scale 0 → 1.2 → 1) | 100ms delay each |
| 3-star confetti | Particle explosion, multi-color | 3s |
| Card evolution | Glow burst + particle explosion | 1.5s |
| Mission complete | Checkmark bounce + particles | 500ms |

---

## Sound Design

| Event | Sound | Duration |
|---|---|---|
| Capture | Camera click | 0.3s |
| AI processing | Soft beep loop | Loop |
| Card reveal | Whoosh + chime | 0.8s |
| Legendary reveal | Strong whoosh + fanfare | 1.5s |
| Pronunciation correct (1-2 stars) | Light ding | 0.3s |
| Pronunciation perfect (3 stars) | Ta-da! + confetti jingle | 1s |
| Pronunciation miss | Gentle boop (NOT negative) | 0.3s |
| XP earned | Coin sound | 0.5s |
| Level up | Fanfare | 2s |
| Evolution | Shimmer + ding | 1.5s |
| Mission complete | Short trumpet | 1s |

---

## Error Handling (Child-Friendly)

> **Golden rule:** NEVER show technical error messages. All errors are translated into child-friendly Vietnamese with an action.

| Error | Child Message | Action |
|---|---|---|
| Camera denied | "📸 Cho mình nhìn thế giới nhé!" | "Cho phep" button |
| AI timeout | "😴 AI buồn ngủ! Chụp lại nhé!" | "Thử lại" button |
| Low confidence | "🤔 Mình chưa nhìn rõ. Lại gần hơn nha!" | Return to viewfinder |
| No internet | "📡 Mất sóng rồi! Xem sổ sưu tập nhé." | "Xem sổ sưu tập" button |
| Mic denied | "🎤 Cho mình nghe giọng bạn nhé!" | "Cho phep" button |
| Time limit | "⏰ Hôm nay học đủ rồi! Mai quay lại nha!" | Lock camera, allow collection browsing |

---

## PWA Configuration

- **manifest.json:** App name, icons (192x192, 512x512), theme color (Sky Blue), background (Snow White)
- **Service Worker:** Cache static assets + vocabulary data via Workbox
- **Install prompt:** Show "Add to Home Screen" after 2nd use
- **Offline support:** Collection browsing (IndexedDB), cached TTS audio; Camera capture requires internet

---

## Gamification Mechanics

### XP System

| Action | Points |
|---|---|
| Capture Common | 10 XP |
| Capture Uncommon | 25 XP |
| Capture Rare | 50 XP |
| Capture Epic | 100 XP |
| Capture Legendary | 250 XP |
| Duplicate capture | 25% of original |
| 3-star pronunciation | +5 XP bonus |
| Daily quest complete | 50 XP |
| Weekly quest complete | 200 XP |
| Category complete | 500 XP |

### Level Progression

| Level | Title | XP Required |
|---|---|---|
| 1 | Beginner Explorer | 0 |
| 5 | Word Collector | 500 |
| 10 | Vocab Hunter | 1,500 |
| 20 | Language Scout | 5,000 |
| 50 | Polyglot Champion | 20,000 |

---

## Privacy & Safety

- **No PII collected** beyond first name and avatar
- **Photo storage opt-out by default** — photos processed and discarded unless parent enables
- **No social features** — no messaging, sharing, or connecting with unknowns
- **Leaderboard anonymized** — display names only
- **Parent Gate** — hidden settings icon (3s hold) → math puzzle → 5-min parent session
- **Content filter** — Standard (default) or Strict mode (parent-configured)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Sprint Roadmap

| Sprint | Weeks | Deliverables |
|---|---|---|
| **1** | 1-2 | Next.js PWA scaffold, Camera API, capture flow UI, onboarding slides, basic auth screens |
| **2** | 3-4 | Reveal card with rarity glow, PTT pronunciation recording, star rating, TTS playback |
| **3** | 5-6 | Collection Book (category grid + vocab grid), vocab detail screen, mastery display, evolution UI |
| **4** | 7-8 | Quest screen, leaderboard (podium + list), profile + badges, bottom navigation, level up celebration |
| **5** | 9-10 | Parent Gate, parent dashboard (charts, activity feed, controls), auth flow polish |
| **6** | 11-12 | Animation polish, sound effects integration, offline support, PWA install prompt, performance tuning |

---

## Related Docs

- [Frontend Plan (Chi tiet A-Z)](../../_docs/frontend_plan.md)
- [Architecture Plan](../../_docs/architecture.md)
- [Product Vision](../../_docs/product_vision.md)
- [Backend Plan](../../_docs/backend.md)

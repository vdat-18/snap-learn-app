# SnapLearn — LotusHack 2026 Hackathon Vision

**AI-Powered Vocabulary Camera for Vietnamese Kids**
*LotusHack x HackHarvard | Edtech Track | March 20-22, 2026*

---

## The Hook

> My daughter is two and a half. She already grabs my phone and demands to watch YouTube. Every time I hand it over, I feel a pang of guilt — she's absorbing brainrot when she should be learning about the world.
>
> I wanted to build something where I hand her my phone and feel *good* about it.
>
> Turns out, every parent feels this way.

Smartphones are ubiquitous. Children are using them to consume passive, low-value content on TikTok and YouTube. We built an alternative: **use the smartphone to actively explore the world and build knowledge, one capture at a time.**

> **"Pokémon Go for vocabulary"** — Point your camera at anything, capture the word, learn to pronounce it, build your collection.

Instead of passively scrolling, kids actively explore. Instead of brainrot, brain growth.

---

## Why This Matters

### The Problem (Universal)

Kids spend hours daily on smartphones consuming passive content. Parents feel guilty but have no compelling alternative — taking the phone away causes meltdowns, and "educational apps" are just flashcards with cartoon wrappers.

### The Problem (Vietnam-Specific)

- **8 million** kids aged 6-10 learning English
- Parents spend **$50-200/month** on tutoring
- Between classes? Zero engaging practice
- Result: Vietnam ranks **58th globally** in English proficiency
- Parents already spend heavily on education — they'll pay for something that works

### The Insight

Kids love collecting things. Pokémon Go proved that exploration + collection + gamification = obsession. What if we channeled that obsession toward vocabulary?

### The Solution

A camera-first app where every real-world object becomes a vocabulary card to capture, pronounce, and collect. The world is the curriculum. The smartphone — the thing parents feel guilty about — becomes the learning tool.

---

## What Makes This Different: Shared Visual Context

Most AI interactions are passive. Chatbots sit and wait for you to type a prompt. The user initiates everything. The AI is reactive.

**SnapLearn inverts this.**

When a child snaps a photo, they don't think they're "prompting an AI." They think they're capturing a Pokémon. But the camera snap IS the prompt — and because the AI now sees the same object the child sees, they share a **visual context**.

This shared context enables something powerful: **the AI feels proactive.** It doesn't wait for a question — it responds to what the child just discovered. "That's a *cat*! In English we say *cat*. Can you say it?"

And this interaction model extends far beyond vocabulary:

> Imagine the AI sees the same cat as you and asks: *"Is that your cat? What's its name?"*
>
> Suddenly it's a conversation seemingly initiated by the AI — triggered by a shared moment in the real world.

**This is our real innovation.** Not the tech stack (we're professional AI builders — the plumbing is straightforward). The innovation is a **new interaction paradigm**: the physical world as shared context between child and AI, with the camera as a disguised prompt mechanism. The AI becomes a companion, not a tool.

For the hackathon, we demonstrate this with vocabulary. But the platform can extend to storytelling, science exploration, cultural discovery — any domain where "look at this thing together" is the starting point.

---

## The Team

| Role | Name | Background |
|------|------|------------|
| **Product & Design** | [Your name] | Former Etest instructor. Father of a 2.5-year-old. Built this because he wants to hand his daughter a phone without guilt. |
| **AI Engineer** | [Name] | Enterprise AI solutions. [Specialty] |
| **AI Engineer** | [Name] | Enterprise AI solutions. [Specialty] |
| **AI Engineer** | [Name] | Enterprise AI solutions. [Specialty] |

**Why this team:** We build AI systems for enterprises professionally. For this hackathon, we wanted to challenge ourselves with a consumer problem — where the user is a 6-year-old who can't read and the UX must be purely intuitive. Technical execution is our baseline; the challenge is making AI feel magical to a child.

---

## Hackathon MVP Scope

### What We're Building (36 Hours)

| Screen | Description | Priority |
|--------|-------------|----------|
| **1. Onboarding** | Mascot welcome → Name entry → Avatar pick → First capture prompt | P0 |
| **2. Camera/Capture** | Viewfinder → Snap → AI identifies → Card reveal with rarity glow → TTS → "Say it!" PTT → ASR match → Points | P0 |
| **3. Words Vault** | Grid of captured vocab cards as trophies, tap to re-hear/re-practice | P0 |
| **4. Leaderboard** | Single global ranking by total points | P1 |
| **5. Profile/Stats** | Level, total captures, streak (stretch goal) | P2 |

### What We're NOT Building (Post-Hackathon)

| Cut Feature | Why Cut | Future Value |
|-------------|---------|--------------|
| Chinese language | Halves the work, English demos the concept | HSK 1-2 vocabulary ready to add |
| Missions system | Complex backend, not needed for core loop | Daily/weekly quests drive retention |
| Parent dashboard | Different user, not demo-able in 3 min | Learning insights, time controls |
| Card evolution (5-level mastery) | Simplified to pass/fail | Spaced repetition via "power-ups" |
| Multiple leaderboards | One global view shows motivation | Class, friends, category views |
| Conversational AI | Beyond hackathon scope | "Is that your cat?" — the vision |

---

## Core Loop (The "Wow" Demo)

```
┌─────────────────────────────────────────────┐
│                                             │
│   [Avatar] [Level 3]      [🏆 142 pts]      │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │         📷 LIVE VIEWFINDER         │   │
│   │                                     │   │
│   │         [ 🔘 SNAP PHOTO ]          │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌────┐  ┌────┐  ┌────┐                   │
│   │📖  │  │🏆  │  │👤  │                   │
│   └────┘  └────┘  └────┘                   │
│                                             │
└─────────────────────────────────────────────┘
```

**The Magic Flow (must work perfectly):**

1. **Snap** → Child photographs a real object
2. **AI Identify** → Vision API returns Vietnamese + English word
3. **Card Reveal** → Animated card with rarity glow (Common to Legendary)
4. **Listen** → TTS auto-plays Vietnamese word, then English word
5. **Pronounce** → Child holds button, says the word
6. **Score** → ASR matches pronunciation → Stars + points awarded
7. **Collect** → Card added to Words Vault

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js 14 PWA + TypeScript | Camera/mic via browser APIs, Framer Motion animations, installable without app store |
| **Styling** | Tailwind CSS | Rapid iteration, good Vietnamese typography |
| **Backend** | FastAPI (Python) | AI orchestration, async support |
| **AI Orchestration** | BAML (Boundary AI Markup Language) | Type-safe structured LLM outputs, automatic fallback chains |
| **Vision AI** | GPT-4o → Gemini Flash → Claude Sonnet (fallback chain) | Object identification + translation, triple redundancy |
| **TTS** | OpenAI TTS | Natural-sounding Vietnamese + English voices |
| **ASR** | OpenAI Whisper | Pronunciation checking — our "ASR-as-judge" |
| **Database** | Supabase (PostgreSQL) | Quick setup, built-in auth |
| **Storage** | Supabase Storage | Photo storage (opt-in) |

### AI Pipeline

```
Photo → BAML VisionFallback → {object_vi, object_en, category, rarity}
         (GPT-4o → Gemini       ↓
          Flash → Claude)   
                           OpenAI TTS: "Đây là [Vietnamese]. In English: [English word]"
                                       ↓
                              Child speaks → OpenAI Whisper transcribes
                                       ↓
                              BAML PronunciationFeedback → Stars + points
```

### Vision API Response (JSON)

```json
{
  "object_vi": "con mèo",
  "object_en": "cat",
  "phonetic_en": "/kæt/",
  "category": "animals",
  "difficulty": 2,
  "rarity_tier": "common",
  "points": 10,
  "fun_fact_vi": "Mèo có thể ngủ 16 giờ mỗi ngày!",
  "confidence": 0.95
}
```

### Pronunciation Check (Simplified for Hackathon)

```
ASR output == target word → ⭐⭐⭐ PASS (full points)
ASR output ~ target word  → ⭐⭐ CLOSE (partial points, "Almost! Try again!")
ASR output != target     → ⭐ RETRY (TTS replays, max 3 attempts)
After 3 attempts         → Encouraging move-on ("We'll practice later!")
```

### Latency & Fallback Plan

**Expected latency:** Photo upload (0.5s) → Vision API (2-3s) → TTS generation (1-2s) = **3-5 seconds total**

**Mitigation:**
- "What did you find...?" anticipation animation covers the wait — builds excitement, not frustration
- Loading animation is part of the UX, not a bug

**Hackathon venue risk:** 200+ people on shared WiFi could degrade performance.

**Fallback plan:**
| Scenario | Response |
|----------|----------|
| Vision API slow (>5s) | Extended anticipation animation with mascot commentary |
| Vision API fails | Pre-cached responses for demo objects kick in automatically |
| ASR fails in noisy hall | Show the retry flow gracefully; have quiet corner identified |
| WiFi dies completely | Switch to mobile hotspot; worst case, play pre-recorded video |
| Low confidence (<0.7) | "Hmm, I can't quite see that — try getting closer!" |

**Demo insurance:** The 5 demo objects (see Demo Script below) will each have a hard-coded fallback response cached locally. If the API fails during live demo, the experience is identical — judges won't know.

---

## Rarity System (The Collection Hook)

| Rarity | Points | Visual | Examples |
|--------|--------|--------|----------|
| ⚪ Common | 10 | White shimmer | chair, table, door |
| 🟢 Uncommon | 25 | Green glow | bicycle, umbrella, clock |
| 🔵 Rare | 50 | Blue sparkle | telescope, violin, cactus |
| 🟣 Epic | 100 | Purple pulse | stethoscope, abacus, loom |
| 🟡 Legendary | 250 | Gold explosion | fossils, calligraphy brush, bonsai |

Rarity determined dynamically by AI based on:
- Global capture frequency (mocked for hackathon)
- Linguistic difficulty
- Category diversity

---

## User Experience Principles

### Audio-First, Icon-Driven

Target users are 6-10 year-olds who may not read fluently.

- **Every text is also spoken** via TTS
- **Navigation uses icons only** (no text labels)
- **Error states use mascot voice** + retry icon
- **Tutorials use illustrations**, not paragraphs

### Active vs. Passive (The Core Contrast)

| Passive (TikTok/YouTube) | Active (SnapLearn) |
|--------------------------|-------------------|
| Sit and scroll | Get up and explore |
| Content chosen by algorithm | Content chosen by curiosity |
| Silent consumption | Speaking out loud |
| No retention | Vocabulary retention |
| Guilt for parents | Pride for parents |
| Isolated | Social (leaderboard) |

### The Demo Must Show

1. **Instant gratification** — Snap → card reveal within 3-5 seconds (with engaging wait animation)
2. **Emotional reward** — Card reveal animation + rarity glow + sound effects
3. **Progression** — Points go up, level visible
4. **Collection urge** — "You have 5 words, 47 more common words to find!"
5. **Graceful failure** — Pronunciation retry flow feels encouraging, not punishing

---

## Demo Script (2-3 Minutes)

### Pre-Demo Setup

**Objects to bring to the demo table (pre-tested with the AI):**

| # | Object | Expected Rarity | Demo Purpose | Backup |
|---|--------|----------------|--------------|--------|
| 1 | Water bottle | ⚪ Common | Easy opener, reliable identification | Hard-coded fallback |
| 2 | Earbuds | 🟢 Uncommon | Shows rarity jump, good pronunciation word | Hard-coded fallback |
| 3 | Rubik's cube | 🔵 Rare | Visually striking, unexpected, shows diversity | Hard-coded fallback |
| 4 | Toy excavator | 🟣 Epic / 🟡 Legendary | Every kid loves construction vehicles, judges remember this one | Hard-coded fallback |
| 5 | (Spare) Potted plant | 🟢 Uncommon | Category diversity, if needed | Hard-coded fallback |

**Pre-test ALL objects** with the Vision API before the demo. Confirm identification and rarity. Swap out any that fail.

### Demo Flow

**Opening — The Story (30 seconds)**
> "My daughter is two and a half. She already grabs my phone and demands YouTube. Every parent knows this guilt — your kid is absorbing brainrot content, and you feel powerless.
>
> We built SnapLearn — an app that turns that same phone into an exploration tool. Instead of passively scrolling, kids actively capture the world around them and learn vocabulary. Think of it as Pokémon Go, but for English words."

**Demo — Three Captures (90 seconds)**

**Capture 1: Water Bottle (Common)**
> "Let me show you. I point the camera at this water bottle and snap."
- Card reveals: "Chai nước / Water Bottle" — white shimmer — ⚪ Common, +10 pts
- TTS plays Vietnamese, then English
- Pronounce "water bottle" → ⭐⭐⭐ Perfect! +10 points

**Capture 2: Earbuds (Uncommon)**
> "Let's try something less common."
- Card reveals: "Tai nghe / Earbuds" — green glow — 🟢 Uncommon, +25 pts
- TTS plays
- **Deliberately mispronounce** → ⭐ "Almost! Listen again..."
- TTS replays → Pronounce correctly → ⭐⭐⭐ "Great job!"
> "Notice the app didn't punish the mistake — it encouraged a retry. This is designed for 6-year-olds building confidence."

**Capture 3: Toy Excavator (Epic/Legendary)**
> "Now watch what happens with something rare."
- Card reveals: "Xe xúc đất / Excavator" — purple pulse or gold explosion — 🟣 Epic, +100 pts
- Dramatic reveal animation
> "Rare objects earn more points. Kids are motivated to explore beyond their living room — go to the market, the park, a museum."

**Show Collection & Leaderboard (15 seconds)**
- Flip to Words Vault: "Every capture becomes a trophy card in their collection."
- Flip to Leaderboard: "And they compete with friends."

**Vision — The Platform (30 seconds)**
> "This is just vocabulary. But the real innovation is the interaction model — the camera creates shared context between the child and AI. Imagine the AI sees the same cat your child does and asks: 'Is that your cat? What's its name?' Suddenly it's a conversation.
>
> We see a future where every object is a learning moment. Screen-free hardware for younger kids. School deployments. But today, it starts with one thing: a parent who can hand their child a phone and feel proud instead of guilty."

---

## Submission Checklist

### Required (Must Have)
- [ ] Working demo (deployed URL or runnable locally)
- [ ] 2-3 minute demo video (YouTube/Vimeo)
- [ ] Devpost submission (title, tagline, story, built-with)
- [ ] Public GitHub repo with README

### Recommended (Separates Winners)
- [ ] Pitch deck (5-8 slides)
- [ ] Architecture diagram (simplify from `_docs/architecture.md`)
- [ ] README with problem, tech stack, setup steps, team
- [ ] Personal story (the daughter angle)

---

## Pitch Deck Outline (5-8 Slides)

| Slide | Title | Content | Visual |
|-------|-------|---------|--------|
| 1 | **The Guilt** | "My 2.5yo grabs my phone. Every parent knows this." | Photo: child with phone (or illustration) |
| 2 | **The Problem** | Passive brainrot → Vietnam's 8M kids → $200/mo tutoring → 58th in English | Before: kid scrolling TikTok |
| 3 | **The Flip** | "What if that phone became an exploration tool?" | After: kid pointing camera at the world |
| 4 | **The Solution** | Pokémon Go for vocabulary. Snap → Learn → Pronounce → Collect | Core loop diagram |
| 5 | **Live Demo** | 3 captures, rarity progression, pronunciation flow | Screen recording or live |
| 6 | **The Innovation** | Shared visual context. Camera as disguised prompt. AI feels proactive. | "Is that your cat?" example |
| 7 | **The Vision** | Hardware devices, school deployments, conversational AI, new languages | Roadmap visual |
| 8 | **The Team** | 4 enterprise AI builders solving a consumer problem. Personal motivation. | Team photo |

---

## Time Budget (36 Hours)

| Hours | Task |
|-------|------|
| 0-2 | Finalize scope, set up project, assign roles |
| 2-6 | Backend AI pipeline (vision + TTS + ASR) |
| 6-14 | Frontend screens (camera, card reveal, vault) |
| 14-20 | Integration, leaderboard, polish core loop |
| 20-26 | Bug fixes, UX polish, edge cases, hard-coded fallbacks |
| **26** | **CODE FREEZE** |
| 26-28 | Pre-test demo objects, cache fallback responses |
| 28-30 | Demo video recording, Devpost writeup, README cleanup |
| 30-34 | Pitch deck, practice demo × 3, practice pitch × 3 |
| 34-36 | Final submission |

---

## Future Vision (Post-Hackathon)

This hackathon validates the **core capture loop** and the **shared visual context** interaction model. The full vision includes:

### Near-Term (3-6 months)
- **Chinese language** (HSK 1-2 vocabulary)
- **Missions** (daily/weekly quests for guided exploration)
- **Parent dashboard** (learning insights, time controls, activity feed)
- **Conversational AI** ("Is that your cat?") — extending shared context beyond vocab

### Medium-Term (6-18 months)
- **School deployments** (teacher view, class leaderboards, custom missions)
- **Spaced repetition** (card evolution, mastery levels)
- **Content expansion** (science, culture, storytelling through the camera)

### Long-Term (18+ months)
- **Hardware devices** (SnapBear plush toy for screen-free learning, SnapScope explorer tool)
- **Vietnamese market launch** (8M kids, $2-3B tutoring spend, Tết gift positioning)
- **Regional expansion** (Thailand, Indonesia — same parent psychology, same phone guilt)

See `product_vision.md` for the complete vision document with market research, unit economics, and hardware specifications.

---

## Tech Decisions Log

*Document key decisions during the hackathon for judges:*

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend | Next.js 14 PWA | Browser-native camera/mic APIs, Framer Motion for card animations, installable without app store |
| AI orchestration | BAML | Type-safe structured LLM outputs, automatic fallback chains, no glue code |
| Vision API | GPT-4o (primary) | Best object ID accuracy; Gemini Flash + Claude Sonnet as automatic fallbacks |
| ASR-as-judge | OpenAI Whisper | If the speech model understands the child, a native speaker would too — that's our bar |
| TTS | OpenAI TTS | Natural-sounding voices for Vietnamese + English |
| Database | Supabase | Quick setup, built-in auth, PostgreSQL, realtime for leaderboard |
| English-only | English | Halves scope while fully demonstrating the concept |
| Hard-coded fallbacks | 5 demo objects cached | Demo must work flawlessly regardless of WiFi |

---

## Judging Criteria Alignment

| Criterion | Our Angle | Evidence |
|-----------|-----------|----------|
| **Technical Execution** | Multi-API orchestration (Vision + TTS + ASR) with graceful fallbacks. Real-time pipeline, not a mockup. | Live demo with real AI responses |
| **Innovation** | Shared visual context as a new AI interaction paradigm. Camera as disguised prompt. AI feels proactive, not reactive. | "Is that your cat?" vision. No competitor does this. |
| **Design/UX** | Audio-first, icon-driven for pre-literate children. Card reveal animations. Encouraging retry flow. | Demo shows a 6-year-old could use this |
| **Impact/Relevance** | 8M Vietnamese kids. $2-3B tutoring market. Transforms passive screen time into active learning. Personal story. | Father building for his daughter |

---

*Last updated: March 21, 2026*

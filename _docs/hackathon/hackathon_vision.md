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

## What Makes This Different: Three Tangible Innovations

### 1. Passive → Active: The Child Creates the Curriculum

Every other kids' learning app is content the child consumes — videos, flashcards, quizzes someone else designed. SnapLearn inverts this. The child goes out into the world and builds their own vocabulary collection by choosing what to photograph. The real world is the curriculum. No two children's collections are the same.

This is fundamentally different from Duolingo (structured curriculum on a screen) or YouTube Kids (passive content chosen by algorithm). The child is the content creator.

### 2. Gamified Learning: Pokémon Go Psychology for Education

Pokémon Go proved that exploration + collection + rarity + competition = obsession. We channel that exact psychology into vocabulary building:
- **Rarity tiers** (Common → Legendary) make every snap feel like opening a loot box
- **Points + levels** create visible progression
- **Leaderboards** drive social competition
- **Collection completionism** ("47 more Common words to find!") drives daily engagement

Kids don't feel like they're studying. They feel like they're playing.

### 3. Audio-First UX: Genuinely Accessible AI for Pre-Literate Children

Our primary user is a 6-year-old who cannot read. This constraint drives every design decision:
- **Every text is also spoken** via TTS
- **Navigation uses icons only** — no text labels, no menus
- **Error states use mascot voice** + retry icon
- **Tutorials use illustrations**, not paragraphs

This isn't a nice-to-have accessibility feature — it's the core interaction model. The app is usable with ears and taps alone. This makes it genuinely accessible to pre-literate children, children with reading difficulties, and visually impaired users.

### The Deeper Innovation: Shared Visual Context

Beyond these three, there's a deeper interaction paradigm at play. When a child snaps a photo, they don't think they're "prompting an AI." They think they're capturing a Pokémon. But the camera snap IS the prompt — and because the AI now sees the same object the child sees, they share a **visual context**.

This shared context is what enables the AI to feel proactive rather than reactive. Today we use it for vocabulary. But it extends to conversational AI ("Is that your cat? What's its name?"), storytelling ("A cat once climbed the tallest tree in the park..."), and science exploration ("Cats can see in the dark because..."). The camera as a disguised prompt mechanism is the platform.

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
| Chinese language | Halves the work, English demos the concept | Backend already returns trilingual data (EN/VI/ZH) — weeks not months to enable |
| Missions system | Complex backend, not needed for core loop | Daily/weekly quests drive retention ("Find 5 kitchen items!") |
| Parent dashboard | Different user, not demo-able in 3 min | Learning insights, time controls, progress sharing |
| Spaced repetition | Simplified to pass/fail for hackathon | Resurface weak words at increasing intervals (Leitner box) |
| AI Storytelling | Beyond hackathon scope | Generate personalized stories from captured words ("The cat climbed the tree...") |
| Classroom mode | B2B feature, different distribution | Teacher assigns missions, class leaderboards, 30 kids per teacher |
| Conversational AI | Beyond hackathon scope | "Is that your cat? What's its name?" — 2-3 turn micro-conversations |

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
| **Vision AI** | GPT → Gemini → Claude (fallback chain) | Object identification + translation, triple redundancy |
| **TTS** | ElevenLabs | Natural-sounding Vietnamese + English voices |
| **ASR** | OpenAI ASR | Pronunciation checking — our "ASR + LLM-as-judge" |
| **Database** | Supabase (PostgreSQL) | Quick setup, built-in auth |
| **Storage** | Supabase Storage | Photo storage (opt-in) |

### AI Pipeline

```
Photo → BAML VisionFallback → {object_vi, object_en, object_zh, category, difficulty, ...}
         (GPT → Gemini       ↓
          → Claude)   
                           ↓ Hybrid Semantic-Keyword Search (dedup check vs collection)
                           ↓
                           ElevenLabs TTS: "Đây là [Vietnamese]. In English: [English word]"
                                       ↓
                              Child speaks → OpenAI ASR → transcribed text
                                       ↓
                              LLM-as-Judge → Stars + feedback_vi + points
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

### Pronunciation Check (Two-Stage: ASR + LLM-as-Judge)

Rather than a simple string match, we use a two-stage approach:

1. **OpenAI ASR** transcribes the child's speech (fast, handles accents)
2. **LLM-as-Judge** evaluates the transcription against the target word (handles partial matches, accent variations, childish mispronunciations)

```
Child speaks → OpenAI ASR → transcribed text
                                    ↓
                          LLM-as-Judge evaluates:
                          - Exact/contains match → ⭐⭐⭐ (3 stars, full points)
                          - No match, attempt 1-2 → ⭐ (retry with encouragement)
                          - No match, attempt 3   → Move on with praise for effort
```

**Why this works:** The LLM judge handles "water bottle" vs "the water bottle" vs "wawa bottle" (childish pronunciation) gracefully — far better than rigid string matching. And OpenAI ASR's transcription speed keeps total latency under 2 seconds for the pronunciation step.

**The principle:** If the speech model understands you, a native speaker would too. That's our pronunciation bar.

### Duplicate Detection (Hybrid Semantic-Keyword Search)

When a child captures a new object, we need to know: is this genuinely new, or a variation of something they already have? A child who photographs a "water bottle" and then a "thermos" has found semantically similar but linguistically distinct objects.

We use **hybrid semantic-keyword search** — the same RAG technique used in enterprise search:
- **Keyword matching** catches exact duplicates ("water bottle" → "water bottle")
- **Semantic similarity** (OpenAI embeddings + ChromaDB) catches near-duplicates ("thermos" ≈ "water bottle")
- **Reciprocal Rank Fusion** combines both signals for robust matching

This ensures the collection stays meaningful — no flooding with duplicates, but genuinely new words are always rewarded.

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
> "This is just vocabulary. But the platform expands naturally — the child's captured words become sentences, then stories the AI generates and reads aloud. Teachers assign scavenger hunts: 'Find 5 things in the park.' And eventually, the AI sees the same cat your child sees and starts a conversation: 'Is that your cat? What's its name?'
>
> We're targeting eight million Vietnamese kids learning English and a two-to-three-billion-dollar tutoring market. But today, it starts with one thing: a parent who can hand their child a phone and feel proud instead of guilty."

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

## Pitch Deck Outline (10 Slides — Finals Only)

See `pitch_deck_plan.md` for the full slide-by-slide plan with speaker notes and timing.

| Slide | Title | Content | Visual |
|-------|-------|---------|--------|
| 1 | **Title** | SnapLearn — Pokémon Go for Vocabulary | Logo |
| 2 | **The Guilt** | "My 2.5yo grabs my phone. Every parent knows this." | Child with phone |
| 3 | **The Problem** | Passive brainrot → Vietnam's 8M kids → $200/mo tutoring → 58th in English | Stats |
| 4 | **The Flip** | "What if that phone became an exploration tool?" | Before/after |
| 5 | **Demo** | Screen recording: 3 captures, rarity progression, pronunciation retry | Video |
| 6 | **Under the Hood** | 3 AI models, BAML, ASR + LLM-as-Judge, hybrid RAG search | Architecture diagram |
| 7 | **The Innovation** | Passive→Active · Gamified Learning · Audio-First UX | Three columns |
| 8 | **vs Google Lens** | "Google Lens identifies. SnapLearn teaches." | Side-by-side |
| 9 | **The Vision** | Sentences → Stories → Classroom mode → Conversational AI → 8M kids | Roadmap |
| 10 | **The Team** | 4 AI engineers. 1 dad. 36 hours. | Team photo + tagline |

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

This hackathon validates the **core capture loop** and the three innovations (passive→active, gamification, audio-first UX). The full vision expands along four axes: content depth, activities, distribution, and interaction model.

### Near-Term (3-6 months) — Low Hanging Fruit

| Feature | Description | Why It's Easy |
|---------|-------------|---------------|
| **Chinese language** | Enable Mandarin alongside English | Backend already returns trilingual data (EN/VI/ZH with pinyin) — flip a switch |
| **Spaced repetition** | Resurface weak words at increasing intervals | `practiceCount` already tracked per card; add Leitner box scheduling |
| **Category badges** | "Animals Master" — capture 10 animals | 16 categories already defined; pure frontend + simple DB query |
| **Sentence building** | "The ___ is sleeping" → fill in by speaking | `example_sentence_en/vi/zh` already returned by Vision API — surface it |
| **Parent sharing** | Generate shareable card images for Zalo/Facebook | Canvas-rendered export; growth hack disguised as feature |
| **Themed missions** | "Kitchen Safari," "Park Explorer," "Color Hunt" | Mission system already built; add curated mission templates |

### Medium-Term (6-18 months) — Platform Expansion

| Feature | Description | Strategic Value |
|---------|-------------|-----------------|
| **AI Storytelling** | Generate personalized micro-stories from captured words ("One sunny day, a cat climbed a tree and watched a bicycle go by...") | BAML prompt function, TTS reads aloud — turns collection into narrative |
| **Classroom mode** | Teacher creates class → assigns missions → sees per-student progress, class leaderboard | B2B distribution: 1 teacher = 30 kids. Revenue via school licenses |
| **Scavenger hunts** | Location-aware challenges: "Museum Hunt," "Market Adventure" with bonus XP | Venue partnerships (zoos, museums, botanical gardens) |
| **Pronunciation journey** | Phonics drills, tongue twisters, per-word improvement tracking over time | Extends ASR + LLM-as-Judge into a genuine speech practice tool |
| **Parent dashboard** | Learning insights, time controls, activity feed, progress reports | Already partially built (`parent.py`); high parent willingness-to-pay |

### Long-Term (18+ months) — Moonshots

| Feature | Description | Why It's Exciting |
|---------|-------------|-------------------|
| **Voice-first companion** | After capturing a cat, AI asks: "Is that your cat? What's its name?" — 2-3 turn micro-conversations | Transforms vocabulary tool into AI companion; shared visual context as platform |
| **World Pokédex** | Collaborative encyclopedia built by kids — every capture contributes to global entries | User-generated content at scale; "You were the 47th person to discover 'armadillo!'" |
| **Cultural discovery** | Capture cultural objects (áo dài, nón lá) → AI tells cultural stories in Vietnamese | Powerful for diaspora kids reconnecting with heritage |
| **Card trading** | Gift duplicate cards to friends; special "Trade" cards only obtainable via exchange | Social virality without social media risk; Pokémon trading psychology |
| **Hardware devices** | Camera device for children too young for phones (screen-free, squeeze-to-capture) | Long-term play; targeting Vietnam's 8M kids, $2-3B tutoring market |
| **Regional expansion** | Thailand, Indonesia, Philippines — same parent psychology, same phone guilt | Same tech stack, new language models, massive TAM |

### The Expansion Logic

```
Content Depth:     Vocabulary → Sentences → Stories → Science → Culture
Activities:        Capture → Practice → Missions → Quizzes → Conversations
Distribution:      Parent (B2C) → Teacher (B2B) → School (B2B2C) → Venue partnerships
Interaction Model: Camera snap → Voice companion → AR overlay → Hardware device
```

See `product_vision.md` for the complete vision document with market research, unit economics, and hardware specifications.

---

## Tech Decisions Log

*Document key decisions during the hackathon for judges:*

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend | Next.js 14 PWA | Browser-native camera/mic APIs, Framer Motion for card animations, installable without app store |
| AI orchestration | BAML | Type-safe structured LLM outputs, automatic fallback chains, no glue code |
| Vision API | GPT (primary) | Best object ID accuracy; Gemini + Claude as automatic fallbacks |
| Pronunciation scoring | ASR + LLM-as-Judge | OpenAI ASR for fast transcription, LLM for nuanced matching — handles accents, partial matches, childish speech |
| Duplicate detection | Hybrid semantic-keyword search | RAG-style approach (OpenAI embeddings + ChromaDB + RRF) catches both exact and semantic duplicates |
| TTS | ElevenLabs | Natural-sounding voices for Vietnamese + English |
| Database | Supabase | Quick setup, built-in auth, PostgreSQL, realtime for leaderboard |
| English-only (hackathon) | English | Halves scope while fully demonstrating the concept; backend already returns trilingual data |
| Hard-coded fallbacks | 5 demo objects cached | Demo must work flawlessly regardless of WiFi |

---

## Judging Criteria Alignment

| Criterion | Weight | Our Angle | Evidence |
|-----------|--------|-----------|----------|
| **Technical Implementation & Complexity** | **25 pts** | Multi-model AI failover (GPT/Gemini/Claude) via BAML with type-safe outputs. ASR + LLM-as-judge for pronunciation scoring. Hybrid semantic-keyword search (RAG) for collection dedup. Real-time pipeline <5s. | Live demo with real AI, architecture diagram, GitHub repo |
| **Innovation** | **20 pts** | Passive→Active (child creates curriculum). Gamified learning (Pokémon Go psychology). Audio-first UX for pre-literate children. Camera as disguised AI prompt. | Demo shows a 6yo could use this. No competitor does this. |
| **Functionality & Reliability** | **20 pts** | Core loop works end-to-end. Graceful retry on pronunciation failure. 3-model fallback chain. Hard-coded demo object cache. | Live demo, fallback resilience |
| **Design/UX** | **15 pts** | Audio-first, icon-driven for pre-literate children. Card reveal animations with rarity glow. Encouraging retry flow. | Demo UX speaks for itself |
| **Presentation** | **10 pts** | Personal hook (dad building for daughter). Clear structure. Confident delivery. | Practice × 3 minimum |
| **Impact/Relevance** | **10 pts** | 8M Vietnamese kids. $2-3B tutoring market. Transforms passive screen time into active learning. Personal story. | Father building for his daughter |

---

*Last updated: March 22, 2026*

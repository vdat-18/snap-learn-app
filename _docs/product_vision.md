# SnapLearn — POC Scoping Document v2

**AI-Powered Language Learning Camera for Vietnamese Pupils**
Version 2.0 | March 2026
Target: Vietnamese primary school pupils (ages 6–10) learning English & Chinese

---

## 1. Executive summary

SnapLearn is an AI-powered language learning device for Vietnamese primary school pupils (ages 6–10) learning English and Mandarin Chinese. The POC will be delivered as a **progressive web app (PWA)** that uses the phone's camera and microphone to validate the core learning loop before committing to custom hardware.

The core experience is modeled on **Pokémon Go**: the child explores the real world, captures vocabulary by photographing objects, builds a collection, earns points, completes missions, and competes on leaderboards. The world is the curriculum.

**Key differentiators:**

- **Vietnamese-first pedagogy:** UI, narration, and scaffolding in Vietnamese, aligned to MOET curriculum standards for English and Chinese as foreign languages.
- **Dual target languages:** English and Mandarin Chinese in one product — Vietnam's two most in-demand foreign languages.
- **Exploration-first, not list-first:** No pre-defined vocabulary syllabus. The child captures the world freely. Every real object is a potential vocabulary item. A reference word list exists for verification only, never as a curriculum constraint.
- **Collection & gamification:** Vocabulary is collectible. Rare and difficult words are worth more. Diversity of captures is rewarded. Leaderboards create social motivation.

---

## 2. Core concept: "Pokémon Go for vocabulary"

The product metaphor is deliberate. Pokémon Go succeeded because it turned the real world into a game board. SnapLearn does the same for language learning.

### 2.1 The collection loop

```
Explore → Spot something → Snap it → Capture the vocab → Earn points → Level up
```

Every photograph is a potential "catch." The child doesn't follow a syllabus — they follow their curiosity. A kid at the market captures `cá` → `fish` → `鱼 (yú)`. A kid at school captures `bảng đen` → `blackboard` → `黑板 (hēibǎn)`. The more diverse the collection, the higher the rewards.

### 2.2 Vocab rarity & point system

Not all words are equal. The system assigns rarity tiers based on how commonly the object appears in everyday life and how difficult the word is in the target language.

| Rarity tier            | Points  | Examples (EN)                               | Examples (ZH)                | Drop rate logic                                         |
| ---------------------- | ------- | ------------------------------------------- | ---------------------------- | ------------------------------------------------------- |
| **Common** ⚪    | 10 pts  | chair, table, door, cup                     | 椅子, 桌子, 门, 杯子         | Objects found in any room                               |
| **Uncommon** 🟢  | 25 pts  | bicycle, umbrella, clock, map               | 自行车, 雨伞, 钟, 地图       | Objects that require going outside or to specific rooms |
| **Rare** 🔵      | 50 pts  | telescope, violin, lighthouse, cactus       | 望远镜, 小提琴, 灯塔, 仙人掌 | Objects that require seeking out                        |
| **Epic** 🟣      | 100 pts | stethoscope, abacus, sundial, loom          | 听诊器, 算盘, 日晷, 织布机   | Unusual objects, field trips, museums                   |
| **Legendary** 🟡 | 250 pts | fossils, calligraphy brush, bonsai, sextant | 化石, 毛笔, 盆景, 六分仪     | Truly rare encounters                                   |

**Rarity is determined dynamically**, not from a static list. The AI classifies rarity based on:

1. **Global capture frequency:** If 80% of users have captured "chair," it's Common. If only 2% have captured "sundial," it's Legendary.
2. **Linguistic difficulty:** Words with complex tones (Chinese) or unusual phoneme clusters (English) get a rarity bump.
3. **Category diversity bonus:** The 5th animal captured is worth less than the 1st musical instrument — the system rewards breadth.

### 2.3 Collection mechanics

- **Vocab Cards:** Every captured word becomes a card in the child's collection. The card shows: photo they took, Vietnamese name, English name + phonetic, Chinese name + pinyin, rarity badge, date captured, pronunciation mastery stars.
- **Collection Book:** Organized by category (animals, food, nature, tools, vehicles, etc.). Completing a category page unlocks a badge. Think of it like a collector's album organized by habitat.
- **Duplicates are useful:** Re-capturing a word you already have triggers a "power up" — the child practices pronunciation again, and if they nail it, the card's mastery level increases. But the XP reward for duplicates is 1/4 of a new capture, so exploration is always more rewarding.
- **Evolution:** When a card reaches max mastery (pronunciation nailed 5 times across different sessions), it "evolves" — the card gets a visual upgrade and the child unlocks the word's use in a sentence, a fun fact, or a cultural note.

### 2.4 Missions

Missions are the "quests" that guide exploration and prevent aimless photographing.

| Mission type                  | Example                                           | Reward                            |
| ----------------------------- | ------------------------------------------------- | --------------------------------- |
| **Daily mission**       | "Find 3 things that are red!"                     | 50 XP + streak bonus              |
| **Weekly expedition**   | "Capture 5 words from the kitchen"                | 200 XP + kitchen badge            |
| **Category challenge**  | "Complete the Animals page (12 words)"            | 500 XP + Animal Master badge      |
| **Diversity quest**     | "Capture words from 5 different categories today" | 300 XP + Explorer badge           |
| **Pronunciation quest** | "Evolve 3 cards to max mastery"                   | 400 XP + Pronunciation Star badge |
| **Social mission**      | "Capture 3 words at a friend's house"             | 150 XP + Adventurer badge         |

Missions refresh daily/weekly and are generated dynamically based on what the child has NOT yet captured, nudging them toward new vocabulary without dictating a syllabus.

### 2.5 Leaderboard

Leaderboards create social motivation without toxicity. Design principles:

- **Class leaderboard:** If deployed through a school, children see their classmates' rankings. Top 3 get weekly badges.
- **Friends leaderboard:** Children can add friends via parent-approved connections. Small, intimate competition.
- **Global leaderboard (anonymized):** "Vietnamese learners this week" — see where you rank nationally. Usernames only, no real names.
- **Category leaderboards:** "Most animals captured," "Most kitchen words," etc. — so every child can find a leaderboard they can win.
- **Anti-gaming:** Points are weighted by diversity. Photographing the same chair 100 times doesn't help. The system detects and devalues repeated captures of the same object.
- **Seasonal resets:** Monthly leaderboard resets keep things fresh and give new players a chance.

### 2.6 Levels & progression

| Level | Title             | XP required | Unlocks                                            |
| ----- | ----------------- | ----------- | -------------------------------------------------- |
| 1     | Beginner Explorer | 0           | Camera, basic missions                             |
| 5     | Word Collector    | 500         | Collection Book, category pages                    |
| 10    | Vocab Hunter      | 2,000       | Weekly expeditions, friend leaderboard             |
| 20    | Language Scout    | 8,000       | Epic word bonus multiplier, class leaderboard      |
| 35    | Word Master       | 25,000      | Custom card backgrounds, global leaderboard        |
| 50    | Polyglot Champion | 60,000      | Legendary word radar (hints for rare words nearby) |

---

## 3. AI pipeline architecture

### 3.1 Vision: object recognition

The vision component identifies objects from photos. For the POC, we use a cloud-based multimodal LLM.

| Option              | Pros                                                      | Cons                                              | POC recommendation       |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------ |
| Claude (Sonnet)     | Strong object ID, structured JSON output, safety built-in | Higher latency (~2–3s), cost per call            | **Primary choice** |
| GPT-4o mini         | Fast, cheap, good vision                                  | Less controllable safety, need prompt engineering | Fallback                 |
| Google Gemini Flash | Very fast, free tier generous                             | Inconsistent object labeling                      | Benchmark only           |

**Vision prompt design:** The LLM returns structured JSON:

```json
{
  "object_vi": "con mèo",
  "object_en": "cat",
  "phonetic_en": "/kæt/",
  "object_zh": "猫",
  "pinyin": "māo",
  "category": "animals",
  "fun_fact_vi": "Mèo có thể ngủ 16 giờ mỗi ngày!",
  "difficulty_en": 1,
  "difficulty_zh": 2,
  "confidence": 0.95
}
```

- `difficulty_en` / `difficulty_zh` (1–5 scale) feeds into the rarity calculation.
- Low confidence (<0.7) triggers a retry: "Hmm, I'm not sure what that is — try getting closer!"
- The LLM also assigns the category, which feeds into the Collection Book.

**No maintained vocab list required.** The LLM handles identification and translation on the fly. A reference word list (~1,000 verified entries) exists as a verification cache: if the object matches a known entry, we serve the verified translation instantly (faster, cheaper, guaranteed correct). If it's a novel object, the LLM generates it live. Over time, the reference list grows organically from verified LLM outputs.

### 3.2 Speech: ASR-as-pronunciation-judge

Rather than a dedicated pronunciation scoring API (slow, expensive, poor on children's voices), we use a **simpler and more robust heuristic:**

> If the ASR model transcribes the correct word from the child's speech, the pronunciation is good enough. If it doesn't, it isn't.

This is elegant because:

1. **It's fast.** ASR transcription is 1–2 seconds, vs. 3–5 seconds for pronunciation assessment APIs.
2. **It's already good at the task.** If Google STT or Whisper can understand the child, a native speaker probably can too. That's the bar we care about.
3. **It handles all three languages uniformly.** No special tone-scoring API needed for Chinese — if the ASR transcribes `māo` when the child says `māo`, the tone was right.
4. **It degrades gracefully.** If the child's pronunciation is close but not perfect, ASR often still gets it — which is the right pedagogical outcome for 6–10 year olds. We're building confidence, not training interpreters.

**Implementation:**

| Component     | Vietnamese                                       | English                             | Mandarin Chinese                      |
| ------------- | ------------------------------------------------ | ----------------------------------- | ------------------------------------- |
| **ASR** | Google Cloud STT (vi-VN)                         | Google Cloud STT (en-US) or Whisper | Google Cloud STT (zh-CN) or Azure STT |
| **TTS** | Google Cloud TTS (vi-VN, WaveNet) or Zalo AI TTS | ElevenLabs or Azure Neural TTS      | Azure Neural TTS (zh-CN)              |

**Pronunciation flow:**

1. TTS plays the target word (with phonetic guide on screen)
2. Child **holds the push-to-talk (PTT) button** and says the word. Audio is captured only while the button is held — no voice activity detection needed. This is critical: VAD fails in noisy environments (markets, playgrounds, classrooms), and we expect kids to be running around capturing things outdoors.
3. On button release, audio is sent to ASR for transcription
4. **Match check:** Does the ASR output match the expected word?
   - **Exact match** → ⭐⭐⭐ Great! Card mastery +1
   - **Partial/fuzzy match** (e.g., ASR returns "cat" when target is "cat" but with low confidence) → ⭐⭐ Good try! Listen again and retry.
   - **No match** (ASR returns a different word or fails) → ⭐ Let's practice! TTS replays, shows mouth/tongue diagram, child retries.
5. After 3 attempts, the system moves on encouragingly: "We'll practice this one again later!"

**Fuzzy matching logic:** For English, simple string matching works. For Chinese, we compare pinyin (tone-insensitive for the first attempt, tone-sensitive for "evolution" captures). This lets beginners succeed at word-level and challenges advanced learners at tone-level.

### 3.3 Content safety

Safety for 6–10 year-olds requires multiple layers:

- **Vision-level filtering:** The LLM prompt includes explicit instructions to refuse identification of weapons, alcohol, tobacco, adult content, and other inappropriate objects. Returns a safe fallback message in Vietnamese.
- **Content stop-list:** A curated list of Vietnamese, English, and Chinese words/topics that are blocked from appearing in any output.
- **No free-form chat:** The POC does not include an AI chatbot. All interactions are structured (photo → word, mission → action, quiz → answer).
- **Parental controls:** Parent can view all captured words, missions completed, and usage time. No data persisted without explicit opt-in.

---

## 4. Web app architecture

### 4.1 Tech stack

| Layer            | Technology                                           | Rationale                                                                                                                          |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Frontend         | React + TypeScript, PWA (installable)                | Works on any phone with a camera; installable without app store                                                                    |
| UI framework     | Tailwind CSS + custom Vietnamese-friendly typography | Fast iteration, good CJK support                                                                                                   |
| Backend          | Python (FastAPI)                                     | Natural fit for AI orchestration (Claude SDK, Google Cloud client libs are Python-first); async for concurrent speech/vision calls |
| AI orchestration | Custom routing layer                                 | Routes to Claude for vision, Google/Azure for speech, handles fallbacks                                                            |
| Database         | PostgreSQL + Redis cache                             | User progress, vocab reference cache, session data, leaderboard                                                                    |
| Storage          | S3-compatible (MinIO or AWS S3)                      | Audio files, story assets, captured photos (opt-in only)                                                                           |
| Auth             | Firebase Auth or Supabase Auth                       | Phone number or social login (parents); child profile is sub-account                                                               |
| Hosting          | Vercel (frontend) + Railway or Fly.io (backend)      | Low-cost, Vietnam-accessible, auto-scaling                                                                                         |
| Leaderboard      | Redis sorted sets + PostgreSQL for persistence       | Real-time ranking with periodic snapshots                                                                                          |

### 4.2 Core user flow (Pokémon Go model)

The app opens to a **"world view"** — not a menu, but an invitation to explore.

```
┌─────────────────────────────────────────────┐
│                                             │
│   [Avatar + Level]     [🏆 142 pts]  [🔥7] │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │         📷 CAMERA VIEWFINDER        │   │
│   │         (live, always ready)        │   │
│   │                                     │   │
│   │         [ 🔘 CAPTURE ]              │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Today's mission: "Find 3 green things!"   │
│   Progress: ██░░░ 1/3                       │
│                                             │
│   ┌────┐  ┌────┐  ┌────┐  ┌────┐           │
│   │📖  │  │🎯  │  │🏆  │  │👤  │           │
│   │Book│  │Quest│  │Rank│  │ Me │           │
│   └────┘  └────┘  └────┘  └────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

**Primary flow — Capture:**

1. Child sees the camera viewfinder as the default home screen (like Pokémon Go's map)
2. Child photographs an object → loading animation with anticipation build-up ("What did you find...?")
3. **Reveal animation:** Card slides in from bottom with rarity glow effect (Common = white shimmer, Legendary = gold explosion)
4. Card shows: Vietnamese name → English name + audio → Chinese name + audio
5. "Say it!" prompt → child holds PTT button and speaks → ASR match check → stars awarded
6. Points awarded + collection updated + mission progress checked
7. Camera viewfinder returns (ready for next capture)

**Secondary flows:**

- **Collection Book (📖):** Browse all captured words by category. See completion percentage per category. Tap any card to practice pronunciation. View evolution status.
- **Missions (🎯):** Active daily/weekly missions. Tap to see details and progress. Completed missions show rewards.
- **Leaderboard (🏆):** Toggle between class/friends/global/category views. See your rank, streak, and points this period.
- **Profile (👤):** Level, total captures, badges earned, streak count. Parent-accessible settings.

### 4.3 Data model (key entities)

```
User
├── id, name, avatar, level, total_xp, current_streak
├── language_config (en, zh, or both)
└── parent_id (FK to parent account)

CapturedVocab
├── id, user_id, word_vi, word_en, word_zh, pinyin
├── category, rarity_tier, points_earned
├── photo_url (opt-in), captured_at
├── mastery_level (0–5), last_practiced
└── evolved (boolean)

Mission
├── id, type (daily/weekly/category/diversity/pronunciation/social)
├── description_vi, target_count, current_count
├── reward_xp, reward_badge
└── expires_at

LeaderboardEntry
├── user_id, period (weekly/monthly), scope (class/friends/global)
├── total_points, rank
└── category_points (jsonb — per-category breakdown)

ReferenceVocab (verification cache, NOT a curriculum)
├── word_vi, word_en, word_zh, pinyin, phonetic_en
├── category, verified (boolean), source (curated/llm_verified)
└── difficulty_en, difficulty_zh
```

---

## 5. Content and pedagogy

### 5.1 Pedagogical framework

The learning model is **exploration-first, review-second:**

1. **Contextual vocabulary acquisition:** Words are learned in the context of real objects the child encounters. No syllabus, no predetermined list. Research shows object-anchored vocabulary retention is 2–3x higher than list-based memorization for this age group.
2. **Intrinsic motivation via collection:** The Pokémon Go collection mechanic taps into children's natural desire to complete sets, earn rare items, and compare with peers. The language learning is the vehicle, not the destination from the child's perspective.
3. **Spaced repetition via card mastery:** Every captured word has a mastery level (0–5). The app surfaces low-mastery cards for practice, but frames it as "powering up your cards" not "studying." Mastery review is opt-in during capture duplicates and during dedicated "training" sessions.
4. **Active recall via speech:** The child must say the word aloud. The ASR-as-judge approach means we're testing real-world intelligibility, not textbook perfection.
5. **Social reinforcement:** Leaderboards and class rankings create positive peer pressure. Missions create shared experiences ("Did you find a Legendary word today?").

### 5.2 Curriculum alignment (reference, not constraint)

The reference vocabulary list (~1,000 verified entries) maps loosely to:

- **English:** MOET Grade 3–4 English textbook vocabulary (Tieng Anh 3, Tieng Anh 4) covering: greetings, numbers, colors, animals, food, family, school, body parts, weather, daily routines.
- **Chinese:** HSK 1 (150 words) and HSK 2 (300 words) vocabulary. Topics: numbers, family, time, food, places, basic verbs.
- **Early learners (Grade 1–2):** Pre-curriculum tier focused on concrete nouns with heavy Vietnamese scaffolding.

This list is used for **verification** (fast, cheap, guaranteed-correct lookups) and for **mission generation** (ensuring missions target age-appropriate vocabulary). It is never presented to the child as "the words you must learn."

### 5.3 Content types for POC

| Content type                    | Description                                                  | POC scope                          |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| **Camera capture**        | Snap → identify → learn → pronounce → collect            | Unlimited (AI-powered)             |
| **Collection Book**       | Browse captured words by category, track completion          | Auto-generated from captures       |
| **Daily/weekly missions** | Guided exploration quests                                    | Auto-generated, 1 daily + 1 weekly |
| **Card training**         | Practice pronunciation on captured words to level up mastery | Auto from collection               |
| **Category challenges**   | Complete a category page (e.g., 12 animals)                  | 6 categories at launch             |
| **Leaderboard**           | Points ranking by class/friends/global                       | Class + global                     |

Note: Interactive stories (branching narratives) are deferred to v2. The POC focuses entirely on the capture → collect → compete loop.

---

## 6. POC cost estimation

Estimated costs for a 3-month POC development phase with 100 beta test users.

| Item                                 | Monthly cost (USD)                              | Notes                                                      |
| ------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| Claude API (vision)                  | $150–300 | ~10K API calls/month at ~$0.02/call |                                                            |
| Google Cloud Speech (ASR + TTS)      | $80–150                                        | STT + TTS for 3 languages, no pronunciation API needed     |
| Hosting (Vercel + Railway)           | $50–100                                        | Frontend + backend + DB + Redis                            |
| Content creation (missions, UI copy) | $300–500                                       | Vietnamese UI strings, mission templates, category artwork |
| Vietnamese linguistic review         | $200–400                                       | Spot-check LLM translations, verify reference vocab        |
| **Total (monthly)**            | **$780–$1,450**                          | **~$2,400–$4,350 for full 3-month POC**             |

Cost is lower than v1 estimate because: no pronunciation assessment API, no story content creation, no pre-built audio library. The LLM and ASR handle everything dynamically.

---

## 7. POC timeline

| Phase              | Duration     | Deliverables                                                                                                                 | Dependencies                          |
| ------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Sprint 1** | Weeks 1–2   | Camera → Vision API → display word (EN + ZH) with rarity. Basic capture animation. UI shell with camera-first home screen. | Claude API access, React PWA scaffold |
| **Sprint 2** | Weeks 3–4   | TTS playback for all 3 languages. ASR mic input. ASR-as-judge pronunciation check. Point scoring system.                     | Google Cloud Speech setup             |
| **Sprint 3** | Weeks 5–6   | Collection Book UI. Category pages. Card mastery system. Duplicate capture → power-up flow.                                 | Design for card UI                    |
| **Sprint 4** | Weeks 7–8   | Mission system (daily + weekly + category). Leaderboard (class + global). Level progression.                                 | Redis for leaderboard                 |
| **Sprint 5** | Weeks 9–10  | Parent dashboard (view collection, usage time, controls). Beta deployment to 10 families.                                    | Beta testers recruited                |
| **Sprint 6** | Weeks 11–12 | Beta feedback iteration. Anti-gaming tuning. Performance optimization. Hardware scoping begins.                              | Beta feedback data                    |

---

## 8. Hardware path: preview

While the POC is web-first, hardware planning should start in parallel during Sprint 5–6.

| Approach                                  | Estimated BOM       | Pros                                                                                                         | Cons                                                                              |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Shenzhen ODM**                    | $40–70 at 1K units | Fastest to production, existing camera molds, LTE module options, Shenzhen supply chain accessible from HCMC | Less design control, MOQ typically 500–1K                                        |
| **Raspberry Pi CM4 + custom board** | $60–90 at 1K units | Full software control, good Linux ecosystem, strong community                                                | Larger form factor, higher power draw, less kid-friendly without custom enclosure |
| **ESP32-S3 + cloud**                | $15–30 at 1K units | Cheapest, tiny, low power, good for thin-client design                                                       | Limited on-device processing, 100% cloud dependent, camera quality limited        |
| **Qualcomm QCS400 series**          | $50–80 at 1K units | Purpose-built for smart cameras, good AI inference, LTE modem options                                        | Higher NRE, longer lead time, needs Android BSP                                   |

**Recommendation:** Start with a Shenzhen ODM partner. The HCMC–Shenzhen corridor is well-established, and ODMs can provide a kids' camera reference design with LTE, camera, touchscreen, and microphone for $40–70/unit at 1K quantity. The web app's backend becomes the device's cloud brain with minimal refactoring.

**Target hardware specs (aligned to POC requirements):**

- 8–13MP rear camera (object recognition doesn't need more)
- 2" touchscreen (480×480 minimum)
- 2GB RAM / 32GB storage (photos cached locally, synced to cloud)
- WiFi 2.4/5GHz + optional 4G LTE
- Speaker (1.5W minimum for clear TTS playback)
- Dual microphones (noise cancellation for outdoor capture)
- 2500+ mAh battery (target 3–4 hours active use)
- USB-C charging
- Drop-tested from 1m, rounded edges, non-toxic materials

---

## 9. Parent dashboard

The parent dashboard is a separate view within the same PWA, accessed via parent authentication (PIN or biometric). It serves three roles: visibility into the child's learning, control over the experience, and proof-of-value for retention.

### 9.1 Learning insights (the "why it's working" screen)

| Data point                                 | What it shows                                                                                     | Why parents care                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Words captured this week**         | Count + trend sparkline (vs. previous weeks)                                                      | Activity level — is my child still engaged?                             |
| **Vocabulary breakdown by language** | EN vs. ZH split, with total unique words per language                                             | Am I getting value for both languages or just one?                       |
| **Category diversity chart**         | Radar/spider chart showing capture spread across categories (animals, food, nature, school, etc.) | Is my child exploring broadly or stuck on one topic?                     |
| **Rarity distribution**              | Pie or bar chart: how many Common / Uncommon / Rare / Epic / Legendary words                      | Bragging rights + indicator of how adventurous the child is              |
| **Pronunciation mastery**            | Cards at each mastery level (0–5) + number of evolved cards                                      | Is my child actually practicing pronunciation, not just snapping photos? |
| **Streak & consistency**             | Current streak, longest streak, days active this month                                            | Habit formation tracking                                                 |
| **Mission completion rate**          | Missions attempted vs. completed, with badge gallery                                              | Is the gamification working?                                             |
| **Leaderboard position**             | Child's rank in class/friends/global + trend                                                      | Social context for the parent                                            |

### 9.2 Activity feed (the "what happened today" screen)

A chronological feed of the child's session, showing:

- Each word captured (with the photo, the translations, and the rarity badge)
- Pronunciation attempts and results (⭐ ratings per word)
- Missions started and completed
- Level-ups and badges earned
- Cards that evolved to max mastery

This feed lets parents have a conversation with their child about learning: "I see you found a Rare word today — what was that?" It turns the dashboard into a shared experience rather than a surveillance tool.

### 9.3 Controls (the "I'm in charge" screen)

| Control                              | Description                                                                                                                    | Default              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| **Daily time limit**           | Max minutes per day the app is active. Configurable in 15-min increments. Soft lock with "ask parent to continue" option.      | 30 minutes           |
| **Session reminders**          | Push notification to parent when child starts/ends a session                                                                   | On                   |
| **Photo storage opt-in**       | Whether captured photos are stored server-side or processed and discarded                                                      | Off (privacy-first)  |
| **Language selection**         | Enable/disable English, Chinese, or both as target languages                                                                   | Both                 |
| **Leaderboard visibility**     | Whether the child can see class/friends/global leaderboards                                                                    | Class + friends only |
| **Content filter sensitivity** | Standard (blocks weapons, alcohol, adult content) or Strict (also blocks insects, medical imagery, anything potentially scary) | Standard             |
| **Data export**                | Download child's full vocabulary list as CSV (Vietnamese, English, Chinese, pinyin, date captured, mastery level)              | Available on demand  |
| **Account deletion**           | Delete all child data permanently                                                                                              | Available            |

### 9.4 Teacher view (stretch goal for school deployments)

If SnapLearn is deployed through a school, teachers get an additional layer:

- **Class overview:** All students' capture counts, streaks, and leaderboard standings in one view
- **Vocabulary overlap report:** Which words have most/fewest students captured — useful for planning lessons around gaps
- **Mission assignment:** Teacher can create custom missions for the class ("This week, find 5 things related to our Science lesson on plants")
- **Progress export:** Exportable class report for parent-teacher conferences

### 9.5 Notifications for parents

| Trigger                                        | Notification                                                           | Channel       |
| ---------------------------------------------- | ---------------------------------------------------------------------- | ------------- |
| Child captures first word of the day           | "[Child] just started exploring! They found: 🐱 cat / 猫"              | Push          |
| Child earns a new badge                        | "[Child] earned the Animal Master badge! 🏅"                           | Push          |
| Child hits a streak milestone (7, 14, 30 days) | "[Child] is on a 7-day streak! 🔥"                                     | Push          |
| Daily time limit reached                       | "[Child] has used their 30 minutes for today"                          | Push          |
| Weekly summary (Sunday evening)                | "This week: 23 words captured, 4 missions completed, Rank #3 in class" | Push + in-app |
| Inactivity (3+ days without use)               | "It's been a few days — want to set a mission for [Child]?"           | Push          |
| LLM flagged a translation for review           | "SnapLearn wasn't sure about a translation — tap to review"           | In-app only   |

---

## 10. Key risks and mitigations

| Severity         | Risk                                                                                                               | Mitigation                                                                                                                                                             | Owner              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **High**   | Vietnamese children's speech patterns cause ASR to fail frequently, making the "ASR-as-judge" heuristic too strict | Calibrate ASR confidence thresholds on children's voices during beta; use fuzzy matching with configurable tolerance; collect anonymized failure cases for tuning      | AI/Speech engineer |
| **High**   | LLM produces incorrect translations for novel objects (no curated list to fall back on)                            | Reference vocab cache for common objects; LLM outputs include confidence score — low confidence triggers "I'm not sure, let me check!" flow; flagged for human review | Content lead       |
| **Medium** | Leaderboard gaming (photographing the same object repeatedly, gaming diversity scores)                             | Anti-gaming: image similarity detection (perceptual hash), diminishing returns on same-category captures, duplicate detection via CLIP embeddings                      | Backend engineer   |
| **Medium** | Latency too high on mobile networks in Vietnam                                                                     | Optimize image compression before upload; pre-cache TTS audio for reference vocab; use Singapore-region cloud                                                          | Backend engineer   |
| **Medium** | Children lose interest after initial novelty (Pokémon Go retention curve problem)                                 | Mission variety, seasonal events, class competitions, evolving cards, new category unlocks over time                                                                   | Product lead       |
| **Low**    | Parents resistant to children using phone cameras                                                                  | Position as educational tool; parent controls prominent; school partnership validation; dedicated device removes concern (hardware phase)                              | Product lead       |

---

## 11. Immediate next steps

1. **Set up AI sandbox (Week 0):** Claude API for vision, Google Cloud STT/TTS for 3 languages. Test the snap → identify → speak → ASR-judge loop with 20 common Vietnamese household objects.
2. **Design the capture card UI (Week 0–1):** The card reveal animation is the emotional core of the product. Prototype rarity glow effects, card layouts for trilingual display, and the "Say it!" interaction.
3. **Build reference vocab cache (Week 1):** 200 verified Vietnamese ↔ English ↔ Chinese entries covering the most common household/school objects. This is a verification cache, not a curriculum.
4. **PWA scaffold (Week 1):** React + TypeScript + camera access + audio recording. Camera-first home screen. Deploy to Vercel with Vietnamese UI strings.
5. **Define beta cohort (Week 2):** Identify 10 families in HCMC with children aged 6–10 who are learning English or Chinese.
6. **Hardware introduction call (Week 4):** Contact 2–3 Shenzhen ODMs for kids' camera reference designs and pricing at 500/1000/5000 unit quantities.

---

*End of document*

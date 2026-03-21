
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
- **Dual target languages, one at a time:** English and Mandarin Chinese in one product — Vietnam's two most in-demand foreign languages. The child selects one target language during onboarding; the other can be added or swapped at any time in Settings. This keeps the UI simple and the cognitive load low, while the backend retains data for all supported languages.
- **Audio-first, icon-driven UX:** The target users are 6–10 year-olds who may not read fluently in any language. Everything that can be read is also spoken aloud via TTS. Navigation, actions, and feedback use icons and illustrated figures as the primary signifiers — text is secondary. The child can operate the app with ears and taps alone.
- **Exploration-first, not list-first:** No pre-defined vocabulary syllabus. The child captures the world freely. Every real object is a potential vocabulary item.
- **Collection & gamification:** Vocabulary is collectible. Rare and difficult words are worth more. Diversity of captures is rewarded. Leaderboards create social motivation.

---

## 2. Core concept: "Pokémon Go for vocabulary"

The product metaphor is deliberate. Pokémon Go succeeded because it turned the real world into a game board. SnapLearn does the same for language learning.

### 2.0 Onboarding

First launch is audio-guided, icon-driven, and takes under 60 seconds. No screen requires reading.

1. **Welcome screen** — An animated mascot waves. TTS plays: *"Xin chào! Chào mừng đến SnapLearn!"* (Vietnamese greeting). No text-heavy splash — just the mascot, a waving animation, and the voice.
2. **Language selection** — The mascot asks via TTS: *"Bạn muốn học tiếng gì?"* ("What language do you want to learn?"). Two large, tappable cards appear side by side:

   - 🇬🇧 **English** (with TTS: *"English"*)
   - 🇨🇳 **中文** (with TTS: *"Zhōngwén"*)

   Future supported languages get additional cards in the same grid. The child taps one. This choice is stored in the user profile as `target_language` and can be changed at any time in **Settings → Language**. Parents can also override or add a second language from the parent controls.
3. **Avatar pick** — 6 pre-drawn animal avatars displayed as a tappable grid. Each plays a short, distinct sound effect on tap. No text labels needed — the visual and audio feedback are sufficient.
4. **First mission prompt** — The mascot says via TTS: *"Hãy chụp thứ đầu tiên nào!"* ("Let's capture your first thing!"). The camera opens automatically. The child is now in the core loop.

Onboarding is skipped on subsequent launches — the app opens directly to the camera viewfinder. If the child wants to change their language or avatar, they do so in Settings.

### 2.1 The collection loop

```
Explore → Spot something → Snap it → Capture the vocab → Earn points → Level up
```

Every photograph is a potential "catch." The child doesn't follow a syllabus — they follow their curiosity. A kid learning English at the market captures `cá` → `fish`. A kid learning Chinese at school captures `bảng đen` → `黑板 (hēibǎn)`. If both languages are enabled, the card shows all three: `cá` → `fish` → `鱼 (yú)`. The more diverse the collection, the higher the rewards.

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

- **Vocab Cards:** Every captured word becomes a card in the child's collection. The card shows: photo they took, Vietnamese name (spoken aloud), target language name + phonetic/pinyin (spoken aloud), rarity badge, date captured, pronunciation mastery stars. If a second language is enabled, it appears below the primary target language. The card is designed to work cleanly with one or two target languages — single-language cards are less cluttered and easier for younger children.
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

### 2.7 Audio-first & icon-driven UX

**Design principle: if it can be read, it must also be spoken. If it can be labeled with text, prefer an icon.**

Target users are 6–10 year-olds who may not read fluently in Vietnamese, let alone a foreign language. The app must be fully operable by a child who cannot read.

**Audio rules:**

- Every screen transition is accompanied by a short TTS narration in Vietnamese explaining what the child should do next.
- Card reveals auto-play all words via TTS: the Vietnamese word, then the target language word. The child *hears* the card before they need to read it.
- Mission descriptions are read aloud by the mascot when the child opens them.
- Error states are spoken: a sad mascot voice says *"Hmm, thử lại nhé!"* ("Hmm, let's try again!") rather than relying on text.
- An omnipresent 🔊 icon on any text element lets the child tap to hear it read aloud on demand.

**Icon & figure rules:**

- Navigation bar uses **icons only** (no text labels). Icons are large (min 48×48dp tap target) and accompanied by a subtle audio cue on tap:
  - 📖 = Collection Book · 🎯 = Missions · 🏆 = Leaderboard · 👤 = Profile
  - 🔊 = Play audio · 🎤 = Speak now · 📷 = Capture
- Tutorials, onboarding, and help screens use illustrated figures and step-by-step pictures — not paragraphs of text.
- Error states use an expressive mascot illustration + retry icon instead of a text error message.
- Rarity tiers are communicated via color-coded glow effects and badge icons, not text labels.

**Exception:** Settings and parent/teacher-facing screens use standard text UI since they target adults.

---

## 3. AI pipeline architecture

### 3.1 Vision: object recognition

The vision component identifies objects from photos. For the POC, we use a cloud-based multimodal LLM.

| Option              | Pros                                                      | Cons                                              | POC recommendation       |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------ |
| Claude (Sonnet)     | Strong object ID, structured JSON output                  | Higher latency (~2–3s), cost per call            | **Primary choice** |
| GPT-4o mini         | Fast, cheap, good vision                                  | Need prompt engineering                           | Fallback                 |
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

**Language-agnostic backend:** The LLM always returns data for *all* supported languages (EN + ZH) regardless of the child's selected target language. This allows instant language switching without re-capturing. The frontend filters the response and displays only the child's selected language(s).

**No maintained vocab list required.** The LLM handles identification and translation on the fly.

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

1. **Auto-play on card reveal (audio-first):** As soon as the card appears, TTS plays automatically in sequence — Vietnamese word first, then the target language word. Vietnamese scaffolding narrates the reveal: the mascot says *"Đây là [Vietnamese word]. Tiếng Anh là:"* (or *"Tiếng Trung là:"*) before playing the target language TTS. The child hears the word before they need to read anything.
2. "Say it!" prompt appears with a phonetic guide on screen. Child **holds the push-to-talk (PTT) button** and says the word. Audio is captured only while the button is held — no voice activity detection needed. This is critical: VAD fails in noisy environments (markets, playgrounds, classrooms), and we expect kids to be running around capturing things outdoors.
3. On button release, audio is sent to ASR for transcription
4. **Match check:** Does the ASR output match the expected word?
   - **Exact match** → ⭐⭐⭐ Great! Card mastery +1
   - **Partial/fuzzy match** (e.g., ASR returns "cat" when target is "cat" but with low confidence) → ⭐⭐ Good try! Listen again and retry.
   - **No match** (ASR returns a different word or fails) → ⭐ Let's practice! TTS replays, shows mouth/tongue diagram, child retries.
5. After 3 attempts, the system moves on encouragingly: "We'll practice this one again later!"

**Fuzzy matching logic:** For English, simple string matching works. For Chinese, we compare pinyin (tone-insensitive for the first attempt, tone-sensitive for "evolution" captures). This lets beginners succeed at word-level and challenges advanced learners at tone-level.

### 3.3 Content safety

Safety for 6–10 year-olds requires multiple layers:

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
| Database         | PostgreSQL + Redis cache                             | User progress, session data, leaderboard                                                                    |
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
│   🔊 Today's mission: "Find 3 green things!"│
│   Progress: ██░░░ 1/3                       │
│                                             │
│   ┌────┐  ┌────┐  ┌────┐  ┌────┐           │
│   │📖  │  │🎯  │  │🏆  │  │👤  │           │
│   │    │  │    │  │    │  │    │           │
│   └────┘  └────┘  └────┘  └────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

> **Audio-first note:** All text shown on this screen is also narrated via TTS. The mission text is read aloud by the mascot when the screen loads. Navigation bar icons have no text labels — only icons with audio cues on tap. The child can use the app with eyes on the real world and ears on the device.

**Primary flow — Capture:**

1. Child sees the camera viewfinder as the default home screen (like Pokémon Go's map)
2. Child photographs an object → loading animation with anticipation build-up ("What did you find...?")
3. **Reveal animation:** Card slides in from bottom with rarity glow effect (Common = white shimmer, Legendary = gold explosion)
4. Card auto-plays via TTS: Vietnamese name (spoken by mascot with scaffolding) → target language name + audio. If both languages are enabled, the second language plays after. The child *hears* the word before needing to read it.
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
├── target_language ('en' | 'zh') — selected during onboarding, changeable in Settings
├── secondary_language (nullable, 'en' | 'zh') — optionally enabled by parent or child
└── parent_id (FK to parent account)

Note: target_language controls what the frontend displays. The backend always stores
vocab data for ALL supported languages (see §3.1). When the child switches languages,
existing cards instantly show the new language — no re-capture needed.

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

This list is used for **mission generation** (ensuring missions target age-appropriate vocabulary). It is never presented to the child as "the words you must learn."

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

## 6. Hardware path: medium-term vision

The mobile PWA is the validation vehicle. Hardware is the scale vehicle. A dedicated physical device will only be pursued once the mobile app has proven the core learning loop works with real Vietnamese children. The signals that trigger hardware investment are: (1) retention — children return daily for 2+ weeks, (2) learning efficacy — measurable pronunciation improvement across the beta cohort, and (3) parent willingness to pay — at least 30% of beta parents express interest in a dedicated device at a stated price point.

| Approach                                  | Estimated BOM       | Pros                                                                                                         | Cons                                                                              |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Shenzhen ODM**                    | $40–70 at 1K units | Fastest to production, existing camera molds, LTE module options, Shenzhen supply chain accessible from HCMC | Less design control, MOQ typically 500–1K                                        |
| **Raspberry Pi CM4 + custom board** | $60–90 at 1K units | Full software control, good Linux ecosystem, strong community                                                | Larger form factor, higher power draw, less kid-friendly without custom enclosure |
| **ESP32-S3 + cloud**                | $15–30 at 1K units | Cheapest, tiny, low power, good for thin-client design                                                       | Limited on-device processing, 100% cloud dependent, camera quality limited        |
| **Qualcomm QCS400 series**          | $50–80 at 1K units | Purpose-built for smart cameras, good AI inference, LTE modem options                                        | Higher NRE, longer lead time, needs Android BSP                                   |

**Recommendation:** When hardware is greenlit, start with a Shenzhen ODM partner. The HCMC–Shenzhen corridor is well-established, and ODMs can provide a kids' camera reference design with LTE, camera, touchscreen, and microphone for $40–70/unit at 1K quantity. The web app's backend becomes the device's cloud brain with minimal refactoring. However, the form factor should be informed by mobile beta learnings — see §6.1 for physical toy concepts that go beyond a generic kids' camera.

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

### 6.1 Physical toy form factors

Beyond a generic kids' camera, two physical form factors have strong product-market fit with SnapLearn's exploration-first, audio-first design. Both are explored here as medium-term options to be validated by mobile app beta data.

#### Concept A: "SnapBear" — AI Learning Companion (Plush Toy)

**Form factor:** A soft plush bear (25–30cm) with an embedded camera in one eye (behind a transparent polycarbonate lens), a speaker in the belly, a microphone near the mouth, and a squeeze-to-capture button in one paw. No screen — fully audio-driven. An LED ring around the camera eye glows with the rarity color on capture (white shimmer = Common, gold pulse = Legendary).

**Why it could work:**

- **Emotional attachment drives retention.** Children aged 4–8 form genuine bonds with stuffed animals. Research on parasocial relationships in children shows that a "language buddy" companion creates intrinsic daily engagement — the child talks *to* the bear, not *at* an app. This directly attacks the Pokémon Go retention cliff (§8 risk table). A plush companion that "misses you" (via gentle TTS prompt when picked up after inactivity) is stickier than a notification.
- **Screen-free removes the #1 parent objection.** Vietnamese parents in urban areas (HCMC, Hanoi) are increasingly screen-anxious — studies show a strong majority of Vietnamese parents of 5–9 year-olds worry about screen time. A screenless toy eliminates this objection entirely. The parent dashboard stays on the parent's phone; the child never touches a screen.
- **Audio-first design is already built for this.** The product's audio-first philosophy (§2.7) was designed for children who can't read. A screenless bear doesn't require any UX redesign — it *is* the audio-first interface. TTS narration, spoken missions, pronunciation practice via squeeze-to-talk — all transfer directly.
- **No direct competitor in Vietnam.** The smart plush market has precedents — Codi by Pillar Learning (~$60, storytelling/music), Miko robot (~$150, general AI companion) — but none combine camera + real-world vocabulary capture + pronunciation practice + gamification. SnapBear would be first-in-category.
- **Natural portability.** A child carries a teddy bear to the market, to school, to grandma's house — everywhere the app wants them to be capturing words. No need to borrow a parent's phone.

**Risks & challenges:**

- **No visual gamification.** Without a screen, the collection book, rarity badges, leaderboard, and card evolution are invisible. Options: (a) make gamification purely audio ("You now have 47 words! You're a Vocab Hunter!"), (b) companion app on parent's phone/family tablet for visual browsing, or (c) simple LED indicators (color = rarity, pulse pattern = mastery level). This is the biggest design challenge.
- **Durability.** Camera lens in a plush toy carried by a 6-year-old who drops it in puddles. Requires: IP54+ waterproofing for the electronics pod, reinforced lens housing, removable/washable outer shell with a snap-in electronics module.
- **Higher BOM.** Plush shell + electronics pod + speaker + mic + camera + battery + WiFi = estimated $50–90 at 1K units. The plush manufacturing adds ~$8–15 over a bare electronics device.
- **Hygiene.** Daily-use plush toy for a young child needs to be washable. Solution: removable electronics pod (like Build-A-Bear sound modules), machine-washable outer shell.
- **Age ceiling.** A teddy bear may feel "babyish" to 9–10 year-olds. The sweet spot is 5–7. Older children may prefer the SnapScope (Concept B) or the phone app.

#### Concept B: "SnapScope" — Explorer's Looking Glass

**Form factor:** A chunky, colorful monocular or magnifying glass (20–25cm length) with a camera lens at the viewing end, a small round screen (1.5–2" diameter) on the body showing the captured word card, a speaker, microphone, and a large tactile capture button on top. The child "discovers" words by looking through the scope and pressing the button — like a real explorer.

**Why it could work:**

- **The exploration metaphor becomes physical.** SnapLearn's core identity is "explore the world, capture vocabulary." A telescope/looking glass makes that identity literal and embodied. The child IS an explorer with a tool. This is far more powerful than an app icon on a borrowed phone. It creates an identity story: "I'm a Word Explorer."
- **Intuitive capture gesture.** Look through → press button. A 5-year-old understands this with zero instruction. No menus, no swipe gestures, no app navigation. The entire UI is: look, press, listen, speak.
- **Small screen is a feature, not a limitation.** The 1.5–2" round screen shows exactly one thing: the word card (photo, Vietnamese name, target language name, rarity glow). It cannot show YouTube, games, or anything distracting. Parents love single-purpose devices. The screen supplements the audio with the rarity visual and written word — supporting visual learners without becoming a screen-time concern.
- **Strong gift positioning.** A $49–79 "explorer's telescope that teaches your child English" is a compelling gift for Vietnamese grandparents, aunts/uncles, and parents. Vietnam's gift economy around Tết (Lunar New Year) and International Children's Day (June 1) represents a significant annual purchasing event for children's educational products. Dual positioning as toy AND education makes it appropriate for family gifts where pure toys feel frivolous and pure study tools feel joyless.
- **Proven category.** VTech and LeapFrog have demonstrated that single-purpose educational devices sell sustainably in the 4–10 age range ($20–60 price point). Their products are screen-heavy, curriculum-driven, and content-static. SnapScope would be exploration-driven, AI-powered, and infinitely expansive — a generational upgrade to the same purchase intent.

**Risks & challenges:**

- **Collection book / leaderboard need a companion app.** The tiny round screen can't render a full collection book or leaderboard. These features would live on a companion app (parent's phone or family tablet). The scope itself focuses on the capture → pronounce loop; the phone app handles the meta-game.
- **Custom mold required.** A telescope/magnifying glass form factor is not a standard ODM reference design. Custom mold tooling costs ~$5,000–$15,000 and adds 6–8 weeks to initial production. However, once molded, per-unit cost is comparable to standard devices.
- **Fragility of optics.** If the child can look through the viewfinder, the lens assembly must be robust. Recommendation: sealed polycarbonate window, not glass. The camera doesn't need optical magnification — the "looking through" gesture is psychological, not functional.
- **WiFi dependency.** Unlike a phone that has cellular data, the scope needs WiFi or a paired phone's hotspot. This limits outdoor use in areas without WiFi. Mitigation: offline capture mode (photos queued, processed when WiFi reconnects) or optional LTE module (+$8–12 BOM).

#### Form factor comparison

| Dimension                                    | SnapBear (Plush)                          | SnapScope (Looking Glass)              | Phone App (current)                       |
| -------------------------------------------- | ----------------------------------------- | -------------------------------------- | ----------------------------------------- |
| **Screen**                             | None (pure audio + LED)                   | Small round (1.5–2")                  | Full phone screen                         |
| **Capture gesture**                    | Squeeze paw                               | Look through + press button            | Tap screen                                |
| **Emotional hook**                     | Companion bond ("my friend")              | Explorer identity ("my tool")          | Gamification only                         |
| **Parent screen-time concern**         | None                                      | Very low (tiny, single-purpose)        | Medium (it's a phone)                     |
| **Gamification UX**                    | Audio-only or companion app               | Minimal on-device + companion app      | Full on-device                            |
| **Natural portability**                | Very high (carried like a toy)            | Medium (must be intentionally brought) | Depends on phone access                   |
| **Estimated BOM (1K units)**           | $50–90 | $40–70                         | $0 (user's phone)                      |                                           |
| **Target retail price**                | $79–129 | $49–89                        | Free / freemium                        |                                           |
| **Gift appeal (Tết, Children's Day)** | Very high                                 | High                                   | Low                                       |
| **Age sweet spot**                     | 5–7                                      | 6–10                                  | 8–10 (needs own phone/tablet)            |
| **Best for**                           | Youngest learners, screen-averse families | Core target demographic, schools       | Older children, budget-conscious families |

#### Hardware form factor decision: not yet

Do not commit to a form factor now. The mobile PWA validates the **core learning loop**. Once validated, the physical toy decision should be informed by:

1. **User observation during beta:** How do children physically hold the phone when capturing? Do they hold it up to their eye? Do they cradle it? Physical behavior hints at preferred form factor.
2. **Parent interviews:** What matters more — completely screenless (→ bear) or the explorer identity (→ scope)? Would they pay $79? $49?
3. **Age segmentation:** If beta reveals strong engagement in 5–7 year-olds, the bear wins. If 7–10 is the sweet spot, the scope wins. Both could coexist as product lines.
4. **Unit economics modeling:** Can we hit <$60 retail and sustain cloud API costs? What subscription price is acceptable? (See §10 Business Model.)
5. **ODM reference design availability:** What Shenzhen ODMs already offer for plush-embedded electronics vs. handheld camera devices.

---

## 7. Parent dashboard

The parent dashboard is a separate view within the same PWA, accessed via parent authentication (PIN or biometric). It serves three roles: visibility into the child's learning, control over the experience, and proof-of-value for retention.

### 7.1 Learning insights (the "why it's working" screen)

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

### 7.2 Activity feed (the "what happened today" screen)

A chronological feed of the child's session, showing:

- Each word captured (with the photo, the translations, and the rarity badge)
- Pronunciation attempts and results (⭐ ratings per word)
- Missions started and completed
- Level-ups and badges earned
- Cards that evolved to max mastery

This feed lets parents have a conversation with their child about learning: "I see you found a Rare word today — what was that?" It turns the dashboard into a shared experience rather than a surveillance tool.

### 7.3 Controls (the "I'm in charge" screen)

| Control                              | Description                                                                                                                                                                              | Default                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Daily time limit**           | Max minutes per day the app is active. Configurable in 15-min increments. Soft lock with "ask parent to continue" option.                                                                | 30 minutes                                      |
| **Session reminders**          | Push notification to parent when child starts/ends a session                                                                                                                             | On                                              |
| **Photo storage opt-in**       | Whether captured photos are stored server-side or processed and discarded                                                                                                                | Off (privacy-first)                             |
| **Language selection**         | Change the child's target learning language or enable a second language. The child selects their primary language during onboarding; parents can override or add a second language here. | As selected during onboarding (single language) |
| **Leaderboard visibility**     | Whether the child can see class/friends/global leaderboards                                                                                                                              | Class + friends only                            |
| **Data export**                | Download child's full vocabulary list as CSV (Vietnamese, English, Chinese, pinyin, date captured, mastery level)                                                                        | Available on demand                             |
| **Account deletion**           | Delete all child data permanently                                                                                                                                                        | Available                                       |

### 7.4 Teacher view (stretch goal for school deployments)

If SnapLearn is deployed through a school, teachers get an additional layer:

- **Class overview:** All students' capture counts, streaks, and leaderboard standings in one view
- **Vocabulary overlap report:** Which words have most/fewest students captured — useful for planning lessons around gaps
- **Mission assignment:** Teacher can create custom missions for the class ("This week, find 5 things related to our Science lesson on plants")
- **Progress export:** Exportable class report for parent-teacher conferences

### 7.5 Notifications for parents

| Trigger                                        | Notification                                                           | Channel       |
| ---------------------------------------------- | ---------------------------------------------------------------------- | ------------- |
| Child captures first word of the day           | "[Child] just started exploring! They found: 🐱 cat / 猫"              | Push          |
| Child earns a new badge                        | "[Child] earned the Animal Master badge! 🏅"                           | Push          |
| Child hits a streak milestone (7, 14, 30 days) | "[Child] is on a 7-day streak! 🔥"                                     | Push          |
| Daily time limit reached                       | "[Child] has used their 30 minutes for today"                          | Push          |
| Weekly summary (Sunday evening)                | "This week: 23 words captured, 4 missions completed, Rank #3 in class" | Push + in-app |
| Inactivity (3+ days without use)               | "It's been a few days — want to set a mission for [Child]?"           | Push          |

---

## 8. Key risks and mitigations

| Severity         | Risk                                                                                                               | Mitigation                                                                                                                                                             | Owner              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **High**   | Vietnamese children's speech patterns cause ASR to fail frequently, making the "ASR-as-judge" heuristic too strict | Calibrate ASR confidence thresholds on children's voices during beta; use fuzzy matching with configurable tolerance; collect anonymized failure cases for tuning      | AI/Speech engineer |
| **High**   | LLM produces incorrect translations for novel objects                            | LLM outputs include confidence score — low confidence triggers "I'm not sure, let me check!" flow; flagged for human review | Content lead       |
| **Medium** | Leaderboard gaming (photographing the same object repeatedly, gaming diversity scores)                             | Anti-gaming: diminishing returns on same-category captures, rate limiting per day                      | Backend engineer   |
| **Medium** | Latency too high on mobile networks in Vietnam                                                                     | Optimize image compression before upload; pre-cache TTS audio; use Singapore-region cloud                                                          | Backend engineer   |
| **Medium** | Children lose interest after initial novelty (Pokémon Go retention curve problem)                                 | Mission variety, seasonal events, class competitions, evolving cards, new category unlocks over time                                                                   | Product lead       |
| **Low**    | Parents resistant to children using phone cameras                                                                  | Position as educational tool; parent controls prominent; school partnership validation; dedicated device removes concern (hardware phase)                              | Product lead       |

---

## 9. Immediate next steps

1. **Set up AI sandbox (Week 0):** Claude API for vision, Google Cloud STT/TTS for 3 languages. Test the snap → identify → speak → ASR-judge loop with 20 common Vietnamese household objects.
2. **Design the capture card UI (Week 0–1):** The card reveal animation is the emotional core of the product. Prototype rarity glow effects, card layouts for trilingual display, and the "Say it!" interaction.
3. **PWA scaffold (Week 1):** React + TypeScript + camera access + audio recording. Camera-first home screen. Deploy to Vercel with Vietnamese UI strings.
4. **Define beta cohort (Week 2):** Identify 10 families in HCMC with children aged 6–10 who are learning English or Chinese.

---

## 10. Business model & go-to-market

### 10.1 Market context

**The opportunity:** Vietnam has ~8 million children aged 6–10. English is mandatory from Grade 3 (MOET curriculum); Chinese is the fastest-growing second foreign language. The private English tutoring market in Vietnam is estimated at $2–3 billion annually (2024), with parents spending $50–200/month per child on after-school English classes. Yet outcomes are poor — Vietnam ranks 58th globally in EF English Proficiency Index, and most tutoring follows rote memorization methods.

**Parent psychology:** Vietnamese parents across income levels prioritize education spending above almost all other discretionary spending. The cultural concept of "đầu tư cho con" (investing in the child) makes educational products easier to sell than entertainment products. However, parents are skeptical of apps — they associate phone use with distraction. A product that is visibly educational (dedicated device or structured app with parent dashboard) converts better than a generic mobile app.

**Competitive landscape:**

| Competitor                                  | Model                                 | Price           | Weakness vs. SnapLearn                                                                                           |
| ------------------------------------------- | ------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Private English tutors (HCMC)               | In-person, 2–3x/week                 | $50–200/month  | No practice between sessions; rote methods; no Chinese                                                           |
| Monkey Junior (VN app)                      | Phonics-based app, subscription       | ~$5/month       | List-based curriculum; no real-world connection; no speech practice                                              |
| VTech / LeapFrog devices                    | Pre-loaded content, one-time purchase | $30–60         | Static content; no AI; English only; no Vietnamese scaffolding                                                   |
| Duolingo                                    | Gamified app, freemium                | Free / $7/month | Not designed for pre-literate children; no camera; no Vietnamese scaffolding; no Chinese for Vietnamese learners |
| English tutoring centers (VUS, ILA, Apollo) | In-center classes                     | $100–300/month | High cost; schedule-bound; no daily practice outside class                                                       |

SnapLearn's wedge: **daily practice between tutoring sessions**, at a fraction of the cost, using the real world as the classroom. We complement tutoring; we don't replace it. This positioning avoids direct competition with entrenched tutoring centers and instead becomes the "homework" tool they recommend.

### 10.2 Revenue model

A hybrid model that evolves with the product phase:

**Phase 1 — Mobile app (current POC):**

| Revenue stream                  | Model                                                                                                                            | Price point                                                                                                                                                                                          | Rationale                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Freemium subscription** | Free tier: 5 captures/day, basic collection. Premium: unlimited captures, full missions, leaderboards, parent dashboard.         | Free / 99,000–149,000 VND/month ($4–6) | Price anchored below private tutoring ($50–200/month) but above casual apps. Vietnamese parents pay for education, not entertainment — framing matters. |                                                                                                                                       |
| **School/class licenses** | Per-student annual license sold to schools or tutoring centers. Includes teacher dashboard, class leaderboards, custom missions. | 500,000–800,000 VND/student/year ($20–32)                                                                                                                                                          | B2B2C channel. Schools pay; parents get it "for free" through school. Lower per-student revenue but predictable volume and retention. |
| **Referral/affiliate**    | Tutoring centers recommend SnapLearn as daily practice. Revenue share on conversions.                                            | 10–20% commission on subscriptions attributed to partner                                                                                                                                            | Aligns incentives: tutoring centers want students practicing between sessions.                                                        |

**Phase 2 — Physical device (post-validation):**

| Revenue stream                       | Model                                                                                               | Price point                               | Rationale                                                                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Device sale**                | One-time hardware purchase. Includes 12 months of cloud service.                                    | 1,200,000–2,000,000 VND ($49–79) retail | Target: Tết/Children's Day gift market. Positioned as "investment in child's English" not "toy."                                                                                    |
| **Cloud subscription renewal** | After included 12 months, ongoing cloud service (AI vision, TTS, ASR, leaderboards).                | 79,000–99,000 VND/month ($3–4)          | Lower than app-only price because hardware purchase already demonstrated commitment. Churn risk if cloud lapses — device becomes a paperweight. Must deliver obvious ongoing value. |
| **Expansion packs**            | Additional language modules (e.g., Japanese, Korean), themed mission packs, seasonal event content. | 49,000–99,000 VND each ($2–4)           | Low-cost upsell. Content is AI-generated so marginal cost is near zero.                                                                                                              |

### 10.3 Unit economics (illustrative)

**Mobile app (per active user per month):**

| Item                                   | Cost                                                                | Notes                                                             |
| -------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| AI vision API (Claude/Gemini)          | ~$0.40 | ~20 captures/day × 30 days × $0.0007/call (Gemini Flash) |                                                                   |
| ASR + TTS (Google Cloud)               | ~$0.30                                                              | ~20 pronunciation attempts/day + TTS playback                     |
| Hosting/infra (amortized)              | ~$0.10                                                              | At 1,000+ users                                                   |
| **Total cost/user/month**        | **~$0.80**                                                    |                                                                   |
| **Revenue/user/month (premium)** | **$4–6**                                                     |                                                                   |
| **Gross margin**                 | **~80–85%**                                                  | Strong, but only on premium users. Free-tier users are pure cost. |

Break-even requires ~15–20% free-to-premium conversion (industry average for education apps: 5–10%, but SnapLearn's daily-use loop and parent dashboard may push higher).

**Physical device (per unit):**

| Item                        | Cost                   | Notes                                             |
| --------------------------- | ---------------------- | ------------------------------------------------- |
| Hardware BOM                | $40–70                | Depending on form factor (see §6.1)              |
| Manufacturing + assembly    | $8–15                 | Shenzhen ODM, including QC                        |
| Packaging + shipping to VN  | $5–8                  | Sea freight in bulk                               |
| **Total landed cost** | **$53–93**      |                                                   |
| **Retail price**      | **$49–79**      |                                                   |
| **Hardware margin**   | **–$4 to +$26** | Hardware is near break-even or slight loss leader |

The device business is **subscription-dependent**. Hardware margins are thin or negative at the SnapBear price point. The $3–4/month cloud subscription is where the business makes money. At 18+ months average lifetime, the lifetime value (LTV) per device customer is $49–79 (device) + $54–72 (18 months × $3–4) = **$103–151 LTV** against **$53–93 landed cost** = healthy margin over time.

### 10.4 Go-to-market strategy

**Phase 1 — Validate (Months 1–6): Mobile app, HCMC only**

- Launch PWA with 50–100 beta families in HCMC (Thu Duc, District 7, Binh Thanh — areas with high concentration of English-learning families).
- Partner with 2–3 English tutoring centers for beta distribution. Tutoring center recommends SnapLearn as daily practice tool; we provide free premium access to their students during beta.
- Target metric: 50% of beta children use the app 4+ days/week after 4 weeks.
- Parent willingness-to-pay survey at Week 6: "Would you pay 99,000 VND/month for this?" and "Would you buy a dedicated device for 1,500,000 VND?"

**Phase 2 — Grow (Months 6–18): Subscription + school channel**

- Launch premium subscription in App Store / Google Play (in addition to PWA).
- Sign 5–10 school/tutoring center partnerships in HCMC and Hanoi. Focus on international-track schools and premium tutoring centers (VUS, ILA, Apollo, YOLA) where parents already spend $100+/month.
- Hire 1 school sales rep per city. Selling to schools is relationship-driven in Vietnam — cold outreach doesn't work, warm introductions through school administration do.
- Target: 5,000 active users, 15% premium conversion = 750 paying users × $5/month = $3,750 MRR.

**Phase 3 — Scale (Months 18–36): Physical device + national expansion**

- Launch physical device (form factor decided by beta learnings — see §6.1).
- Distribution: direct-to-consumer (Shopee, Lazada, TikTok Shop — Vietnam's primary e-commerce channels) + retail (Fahasa bookstores, Concung kids' stores — high foot traffic with parents).
- Tết and Children's Day seasonal launch campaigns: "Gift your child a year of English."
- Expand to Đà Nẵng, Cần Thơ, and other Tier 2 cities.
- Target: 20,000 active users across app + device, $15,000–25,000 MRR.

### 10.5 Key business risks

| Risk                                                                         | Impact                                      | Mitigation                                                                                                                                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Free-to-premium conversion too low (<5%)                                     | Revenue doesn't cover cloud costs           | Aggressive free-tier gating (5 captures/day is enough to hook but not enough to satisfy). Parent dashboard is premium-only — parents who see value will pay.                  |
| School sales cycle too slow (6+ months per school)                           | Revenue delayed; can't fund growth          | Start with tutoring centers (faster decision-making, 1 owner) before approaching schools (bureaucratic, MOET approval process).                                                |
| Parents won't pay for a subscription after buying a device                   | Hardware becomes loss leader with no recoup | 12 months included in device price. After 12 months, the device still works offline for review/practice but can't capture new words without subscription — clear value gate.  |
| Competitor copies the concept (especially Monkey Junior or a Chinese edtech) | Market share erosion                        | Speed to market + brand loyalty + school partnerships create switching costs. The collection/progression system creates lock-in — children won't abandon 500 captured words.  |
| Cloud API costs spike at scale                                               | Margins erode                               | Migrate high-volume calls (common words) to on-device inference. Cache TTS audio. Negotiate volume pricing with Google/Anthropic. Budget for 20% API cost escalation annually. |

---

*End of document*

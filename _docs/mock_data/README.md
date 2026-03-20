# SnapLearn Mock Data

Mock data for building and testing the SnapLearn MVP without live AI APIs, real user accounts, or actual camera captures. Every screen in the app can be populated from these files from day one.

**Base date:** All timestamps are relative to **2026-03-20**.

---

## Quick Start

```ts
// Frontend — import as static JSON (Vite / Next.js / CRA all support this)
import referenceVocab from '@docs/mock_data/reference_vocab.json';
import users from '@docs/mock_data/users.json';
import capturedVocab from '@docs/mock_data/captured_vocab.json';

// Filter for the hero user
const hero = users.find(u => u.id === 'user_001');                  // "Minh"
const heroCaptures = capturedVocab.filter(c => c.user_id === 'user_001');
```

```python
# Backend — load in FastAPI / Python
import json
from pathlib import Path

MOCK_DIR = Path("_docs/mock_data")
reference_vocab = json.loads((MOCK_DIR / "reference_vocab.json").read_text())
users = json.loads((MOCK_DIR / "users.json").read_text())
```

---

## Hero User

The **hero user** (`user_001`, "Minh") is the primary test account. His data populates every screen:

| Field | Value |
|---|---|
| ID | `user_001` |
| Name | Minh |
| Avatar | 🐻 bear |
| Level | 5 — "Word Collector" |
| XP | 842 |
| Streak | 🔥 7 days |
| Captures | 42 words across 6 categories |
| Evolved cards | 5 (mastery level 5) |
| Badges earned | 5 of 15 |
| Target language | English (`en`) |
| Class rank | #6 of 13 |
| Friends rank | #4 of 6 |
| Global rank | #142 of 1,247 |

---

## Files

### 1. `reference_vocab.json` — 200 entries

The trilingual vocabulary cache. Every word the AI can identify, pre-verified. This is **not** a curriculum — it's a verification cache that makes lookups instant and cheap.

**Shape:** `Array<ReferenceVocab>`

```jsonc
{
  "id": "vocab_001",             // Unique ID (vocab_001 – vocab_200)
  "word_vi": "con mèo",          // Vietnamese (with diacritics)
  "word_en": "cat",              // English
  "phonetic_en": "/kæt/",        // IPA pronunciation
  "word_zh": "猫",               // Simplified Chinese
  "pinyin": "māo",               // Pinyin with tone marks
  "category": "animals",         // One of 6 categories (see below)
  "fun_fact_vi": "Mèo có thể ngủ tới 16 giờ mỗi ngày!",
  "example_sentence_en": "The cat is sleeping on the sofa.",
  "example_sentence_zh": "猫在沙发上睡觉。",
  "difficulty_en": 1,            // 1–5 scale (feeds rarity calculation)
  "difficulty_zh": 2,            // 1–5 scale
  "rarity_tier": "common",       // common | uncommon | rare | epic | legendary
  "verified": true,
  "source": "curated"            // "curated" or "llm_verified"
}
```

**Category breakdown:**

| Category | Key | Count | ID Range |
|---|---|---|---|
| 🐾 Animals | `animals` | 40 | vocab_001 – vocab_040 |
| 🍎 Food | `food` | 35 | vocab_041 – vocab_075 |
| 🌿 Nature | `nature` | 35 | vocab_076 – vocab_110 |
| 🏫 School | `school` | 30 | vocab_111 – vocab_140 |
| 🏠 Home | `home` | 35 | vocab_141 – vocab_175 |
| 🚗 Vehicles | `vehicles` | 25 | vocab_176 – vocab_200 |

**Rarity distribution:** 100 Common ⚪ · 50 Uncommon 🟢 · 28 Rare 🔵 · 15 Epic 🟣 · 7 Legendary 🟡

**Used by:** Collection Book, Card Reveal, AI verification cache, Mission generation

---

### 2. `users.json` — 20 users

**Shape:** `Array<User>`

```jsonc
{
  "id": "user_001",
  "name": "Minh",
  "avatar_id": "bear",           // One of: bear, cat, owl, rabbit, fox, panda
  "level": 5,
  "level_title": "Word Collector",
  "total_xp": 842,
  "current_streak": 7,
  "longest_streak": 14,
  "target_language": "en",       // "en" or "zh"
  "secondary_language": null,    // Nullable
  "parent_id": "parent_001",
  "total_captures": 42,
  "rare_captures": 5,
  "badges_earned": ["first_capture", "streak_7", "ten_words", "first_evolution", "explorer"],
  "favorite_category": "animals",
  "created_at": "2026-02-15T08:00:00Z"
}
```

**User segments:**

| Segment | IDs | Count | Purpose |
|---|---|---|---|
| Hero (logged-in child) | `user_001` | 1 | Primary test account |
| Classmates | `user_002` – `user_013` | 12 | Class leaderboard |
| Friends | `user_003`, `user_005`, `user_007`, `user_009`, `user_011` | 5 | Friends leaderboard (subset of classmates) |
| Global stars | `user_019`, `user_020` | 2 | Aspirational top-rankers |

**Used by:** Profile, Leaderboard, Parent Dashboard

---

### 3. `captured_vocab.json` — 42 entries

The hero user's personal collection. Each entry is a word Minh has captured with his camera.

**Shape:** `Array<CapturedVocab>`

```jsonc
{
  "id": "capture_001",
  "user_id": "user_001",
  "vocab_id": "vocab_001",       // FK → reference_vocab.id
  "word_vi": "con mèo",          // Denormalized from reference_vocab
  "word_en": "cat",
  "phonetic_en": "/kæt/",
  "word_zh": "猫",
  "pinyin": "māo",
  "category": "animals",
  "rarity_tier": "common",
  "points_earned": 10,           // Common=10, Uncommon=25, Rare=50, Epic=100, Legendary=250
  "photo_url": "/mock_data/photos/animals_cat.svg",
  "captured_at": "2026-02-15T08:30:00Z",
  "mastery_level": 5,            // 0–5 (5 = max, card evolves)
  "mastery_en": 5,               // Per-language pronunciation mastery
  "mastery_zh": 4,
  "last_practiced": "2026-03-19T09:00:00Z",  // null if never practiced
  "evolved": true,               // true when mastery_level reaches 5
  "practice_count": 12
}
```

**Mastery distribution (42 cards):**

| Mastery | Count | Evolved | Notes |
|---|---|---|---|
| 5 | 5 | ✅ Yes | Oldest captures (Feb 15–28). Fun fact & example sentence unlocked. |
| 3–4 | 8 | No | Early-mid March. Close to evolving. |
| 1–2 | 15 | No | Mid March. Some practice. |
| 0 | 14 | No | Last 5–7 days. Never practiced (`last_practiced: null`). |

**Category distribution:** Animals 8 · Food 5 · Nature 12 · School 3 · Home 10 · Vehicles 4

**Used by:** Collection Book, Vocab Detail, Profile stats, Parent Dashboard

---

### 4. `missions.json` — 10 missions

**Shape:** `{ user_id, generated_at, missions: Array<Mission> }`

```jsonc
{
  "id": "mission_daily_001",
  "type": "daily",               // daily | weekly | category_challenge | diversity_quest | pronunciation_quest
  "description_vi": "Tìm 3 vật màu đỏ!",
  "description_en": "Find 3 red things!",
  "icon": "🔴",
  "target_count": 3,
  "current_count": 1,
  "reward_xp": 50,
  "reward_badge": null,          // Badge ID or null
  "status": "in_progress",       // "not_started" | "in_progress" | "completed"
  "expires_at": "2026-03-20T23:59:59Z",  // null for category challenges (no expiry)
  "created_at": "2026-03-20T00:00:00Z"
}
```

**Status mix:**

| Type | Count | Statuses |
|---|---|---|
| Daily | 3 | 1 completed (reward unclaimed), 1 in-progress, 1 in-progress |
| Weekly | 2 | 1 in-progress, 1 not-started |
| Category challenge | 3 | All in-progress |
| Diversity quest | 1 | In-progress (3/5) |
| Pronunciation quest | 1 | In-progress (2/3) |

**Used by:** Quest screen, Camera HUD (today's mission overlay)

---

### 5. `leaderboard.json`

**Shape:** `{ period, reset_date, total_global_users, scopes: { class, friends, global } }`

```jsonc
// Each entry in a scope array:
{
  "user_id": "user_002",
  "name": "An",
  "avatar_id": "owl",
  "total_points": 4800,
  "rank": 1,
  "category_points": {           // Present for top 3 in class & global
    "animals": 1200,
    "food": 800,
    "nature": 1000,
    "school": 600,
    "home": 700,
    "vehicles": 500
  }
}
```

| Scope | Entries | Hero rank | Notes |
|---|---|---|---|
| `class` | 13 | #6 | All classmates + hero |
| `friends` | 6 | #4 | Hero + 5 friends |
| `global` | 11 | #142 of 1,247 | Top 10 + hero's position |

Monthly reset: `2026-04-01T00:00:00Z`

**Used by:** Leaderboard screen (3 tabs), Profile rank display

---

### 6. `badges.json` — 15 definitions

**Shape:** `Array<Badge>`

```jsonc
{
  "id": "first_capture",
  "name_vi": "Lần chụp đầu tiên",
  "name_en": "First Capture",
  "icon": "📸",
  "description_vi": "Chụp từ vựng đầu tiên của bạn",
  "description_en": "Capture your first vocabulary word",
  "category": "capture_milestone",  // capture_milestone | streak_milestone | category_completion | pronunciation | exploration
  "requirement": "Capture 1 word",
  "rarity": "common"               // common | uncommon | rare | epic
}
```

**Badge list:**

| Badge | Icon | Category | Hero has? |
|---|---|---|---|
| `first_capture` | 📸 | capture_milestone | ✅ |
| `ten_words` | 📚 | capture_milestone | ✅ |
| `fifty_words` | 🏆 | capture_milestone | ❌ |
| `streak_7` | 🔥 | streak_milestone | ✅ |
| `streak_14` | 🔥🔥 | streak_milestone | ❌ |
| `streak_30` | 🔥🔥🔥 | streak_milestone | ❌ |
| `animal_lover` | 🐾 | category_completion | ❌ |
| `food_expert` | 🍎 | category_completion | ❌ |
| `nature_explorer` | 🌿 | category_completion | ❌ |
| `school_star` | 🏫 | category_completion | ❌ |
| `home_hero` | 🏠 | category_completion | ❌ |
| `vehicle_master` | 🚗 | category_completion | ❌ |
| `first_evolution` | ✨ | pronunciation | ✅ |
| `pronunciation_star` | ⭐ | pronunciation | ❌ |
| `explorer` | 🧭 | exploration | ✅ |

To check if the hero has a badge: `users[0].badges_earned.includes(badge.id)`

**Used by:** Profile (badge showcase), Quest screen (reward previews)

---

### 7. `levels.json` — 5 level definitions

**Shape:** `Array<Level>`

```jsonc
{
  "level": 5,
  "title_vi": "Nhà sưu tập",
  "title_en": "Word Collector",
  "xp_required": 500,            // XP needed to reach this level
  "unlocks": ["collection_book"],
  "icon": "📖"
}
```

| Level | Title | XP | Unlocks |
|---|---|---|---|
| 1 | Beginner Explorer | 0 | Camera, daily quests |
| 5 | Word Collector | 500 | Collection Book |
| 10 | Vocab Hunter | 1,500 | Weekly quests, friends leaderboard |
| 20 | Language Scout | 5,000 | Epic bonus, class leaderboard |
| 50 | Polyglot Champion | 20,000 | Rare radar |

To find a user's level: the highest level entry where `xp_required <= user.total_xp`.

**Used by:** Profile, Camera HUD (level badge), level-up animation

---

### 8. `ai_responses.json` — 15 canned responses

Simulate the AI vision pipeline without calling Claude/GPT-4o. Use these as mock API return values.

**Shape:** `{ generated_at, responses: Array<AIResponse> }`

```jsonc
{
  "id": "ai_resp_001",
  "scenario": "high_confidence_common",
  "trigger_description": "Photo of a cat",
  "response": {
    "object_vi": "con mèo",
    "object_en": "cat",
    "phonetic_en": "/kæt/",
    "object_zh": "猫",
    "pinyin": "māo",
    "category": "animals",
    "fun_fact_vi": "Mèo có thể ngủ 16 giờ mỗi ngày!",
    "difficulty_en": 1,
    "difficulty_zh": 2,
    "confidence": 0.95,
    "rarity": "common"
  }
}
```

**Scenario coverage:**

| Scenario | IDs | Confidence | Behavior |
|---|---|---|---|
| Happy path (common) | ai_resp_001 – 005 | 0.91–0.97 | Normal card reveal |
| Happy path (uncommon/rare) | ai_resp_006 – 008 | 0.85–0.89 | Card reveal with rarity glow |
| Happy path (epic/legendary) | ai_resp_009 – 010 | 0.78–0.82 | Full celebration animation |
| Low confidence | ai_resp_011 – 012 | 0.35–0.45 | Show "get closer" / "more light" error |
| Blocked content | ai_resp_013 – 014 | `null` | Show friendly refusal message |
| Novel (not in cache) | ai_resp_015 | 0.80 | `needs_verification: true` |

**Low confidence response shape** (additional fields):

```jsonc
"error_type": "blurry",
"error_message_vi": "🤔 Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!",
"error_message_en": "Hmm, I can't see clearly. Get closer!"
```

**Blocked response shape** (additional fields):

```jsonc
"blocked": true,
"block_reason": "weapon",
"error_message_vi": "😊 Hãy chụp thứ khác vui hơn nha!",
"error_message_en": "Let's find something more fun to capture!"
```

**Used by:** Capture flow, Card Reveal overlay

---

### 9. `pronunciation_results.json` — 10 words × 4 scenarios

Simulate the ASR-as-pronunciation-judge pipeline.

**Shape:** `Array<PronunciationWord>`

```jsonc
{
  "vocab_id": "vocab_001",
  "expected_word_en": "cat",
  "expected_word_zh": null,       // Populated for Chinese entries
  "expected_pinyin": null,        // Populated for Chinese entries
  "language": "en",               // "en" or "zh"
  "scenarios": [
    {
      "id": "pron_001_en_exact",
      "asr_result": "cat",        // What the ASR transcribed (null on failure)
      "asr_confidence": 0.95,
      "match_type": "exact",      // exact | partial | no_match | asr_failure
      "stars": 3,                 // 0–3
      "feedback_vi": "Tuyệt vời! Phát âm xuất sắc! 🌟",
      "feedback_en": "Amazing! Perfect pronunciation! 🌟"
    }
    // ... 3 more scenarios per word
  ]
}
```

**Star mapping:**

| Stars | Match type | UX |
|---|---|---|
| ★★★ | `exact` (high confidence) | Confetti animation, mastery +1 |
| ★★☆ | `partial` (low confidence) | "Good try, listen again" |
| ★☆☆ | `no_match` (wrong word) | "Let's practice more" |
| ☆☆☆ | `asr_failure` (silence/noise) | "Speak louder" |

**Coverage:** 5 English words (`cat`, `dog`, `banana`, `book`, `car`) + 5 Chinese words (`猫`, `狗`, `树`, `门`, `鱼`). For Chinese, `partial` = correct syllable, wrong tone; `no_match` = different word entirely.

**Used by:** "Say it!" flow on Card Reveal and Vocab Detail

---

### 10. `avatars.json` — 6 avatars

**Shape:** `Array<Avatar>`

```jsonc
{
  "id": "bear",
  "name_vi": "Gấu",
  "name_en": "Bear",
  "emoji": "🐻",
  "color": "#8B5E3C",            // Theme color for avatar border gradient
  "sound_effect": "bear_growl.mp3"
}
```

Available: `bear` 🐻 · `cat` 🐱 · `owl` 🦉 · `rabbit` 🐰 · `fox` 🦊 · `panda` 🐼

**Used by:** Onboarding (avatar picker), Profile, Leaderboard thumbnails

---

### 11. `content_stoplist.json`

Words the app must never display or accept from the AI.

**Shape:**

```jsonc
{
  "version": "1.0",
  "last_updated": "2026-03-20",
  "blocked_categories": [
    { "id": "weapons", "name_vi": "Vũ khí", "name_en": "Weapons", "severity": "always_block" }
    // ... 7 categories
  ],
  "blocked_words": {
    "vi": ["súng", "dao", "rượu", ...],   // 51 terms
    "en": ["gun", "knife", "beer", ...],   // 51 terms
    "zh": ["枪", "刀", "酒", ...]          // 50 terms
  },
  "strict_mode_additions": {
    "description": "Additional blocks when parent sets content filter to Strict mode",
    "blocked_words": {
      "vi": [...],  // 20 terms (insects, medical, scary animals)
      "en": [...],  // 20 terms
      "zh": [...]   // 20 terms
    }
  }
}
```

Standard mode blocks: weapons, alcohol, tobacco, drugs, adult content, violence, gambling.
Strict mode also blocks: insects, medical imagery, sharks, wolves, ghosts, skeletons, etc.

**Used by:** AI response filtering, content safety pipeline

---

### 12. `activity_feed.json` — 30 entries

Chronological log of the hero user's activity over the last 7 days (newest first).

**Shape:** `Array<ActivityEntry>`

```jsonc
{
  "id": "activity_001",
  "user_id": "user_001",
  "type": "capture",             // capture | pronunciation_practice | mission_completed | level_up | badge_earned | evolution
  "data": { ... },               // Shape varies by type (see below)
  "timestamp": "2026-03-20T08:45:00Z"
}
```

**`data` shape by type:**

| Type | Fields in `data` |
|---|---|
| `capture` | `word_vi`, `word_en`, `word_zh`, `rarity_tier`, `photo_url`, `pronunciation_stars` |
| `pronunciation_practice` | `word_vi`, `word_en`, `word_zh`, `previous_mastery`, `new_mastery`, `stars` |
| `mission_completed` | `mission_description_vi`, `mission_type`, `reward_xp`, `reward_badge` |
| `level_up` | `previous_level`, `new_level`, `new_title_vi`, `new_title_en` |
| `badge_earned` | `badge_id`, `badge_name_vi`, `badge_name_en`, `badge_icon` |
| `evolution` | `word_vi`, `word_en`, `word_zh`, `fun_fact_vi` |

**Distribution:** 15 captures · 6 pronunciation practices · 4 missions completed · 1 level-up · 2 badges earned · 2 evolutions

**Used by:** Parent Dashboard (activity feed / "what happened today")

---

### 13. `notifications.json` — 7 templates

Push/in-app notification templates with variable placeholders.

**Shape:** `Array<NotificationTemplate>`

```jsonc
{
  "id": "notif_001",
  "trigger": "first_word_of_day",
  "template_vi": "{child_name} vừa bắt đầu khám phá! Từ mới: {emoji} {word_vi} → {word_target}",
  "template_en": "{child_name} just started exploring! They found: {emoji} {word_vi} → {word_target}",
  "channel": "push",             // "push" | "inapp" | "push_and_inapp"
  "example": {
    "child_name": "Minh",
    "rendered_vi": "Minh vừa bắt đầu khám phá! Từ mới: 🐱 con mèo → cat"
    // ... full rendered example with all variables filled in
  }
}
```

**Triggers:** `first_word_of_day` · `badge_earned` · `streak_milestone` · `daily_time_limit_reached` · `weekly_summary` · `inactivity` · `translation_flagged_for_review`

**Used by:** Parent notifications

---

### 14. `photos/` — 200 SVG placeholders

Simple colored SVG placeholders for every word in the reference vocabulary. Each placeholder shows the first letter of the English word, the English and Vietnamese names, and a rarity-colored border.

**Naming convention:** `{category}_{word_en}.svg`
- `animals_cat.svg`, `food_banana.svg`, `home_door.svg`, etc.
- Spaces → underscores, all lowercase

**Colors:** Background tint matches category; border color matches rarity tier.

**Used by:** Collection Book thumbnails, Card Reveal, Vocab Detail, Activity Feed

---

## Relationships Between Files

```
users.json
  │
  ├──→ captured_vocab.json      (user_id FK)
  │       └──→ reference_vocab.json  (vocab_id FK)
  │       └──→ photos/               (photo_url)
  │
  ├──→ missions.json            (user_id)
  ├──→ leaderboard.json         (user_id in each scope)
  ├──→ activity_feed.json       (user_id FK)
  └──→ badges.json              (badges_earned[] ↔ badge.id)

avatars.json ←── users.avatar_id
levels.json  ←── users.level (find matching level definition)

ai_responses.json         (standalone — mock API returns)
pronunciation_results.json (standalone — mock ASR returns)
content_stoplist.json      (standalone — safety filter)
notifications.json         (standalone — templates)
```

---

## Screen → File Mapping

Use this to know which files to load for each screen:

| Screen | Files needed |
|---|---|
| **Onboarding** | `avatars.json` |
| **Camera (home)** | `users.json` (hero stats), `missions.json` (today's mission overlay), `levels.json` |
| **Card Reveal** | `ai_responses.json`, `pronunciation_results.json`, `reference_vocab.json` |
| **Collection Book** | `captured_vocab.json`, `reference_vocab.json` (for total per category) |
| **Vocab Detail** | `captured_vocab.json` (single entry), `pronunciation_results.json` |
| **Quest Screen** | `missions.json`, `badges.json` (reward previews) |
| **Leaderboard** | `leaderboard.json`, `avatars.json` |
| **Profile** | `users.json` (hero), `badges.json`, `levels.json`, `captured_vocab.json` (stats) |
| **Parent Dashboard** | `activity_feed.json`, `users.json`, `captured_vocab.json`, `missions.json` |
| **Safety filtering** | `content_stoplist.json` |
| **Parent notifications** | `notifications.json` |

---

## Conventions

### IDs
All IDs follow predictable patterns for easy cross-referencing:

| Entity | Pattern | Range |
|---|---|---|
| Reference vocab | `vocab_NNN` | 001–200 |
| Users | `user_NNN` | 001–020 |
| Captures | `capture_NNN` | 001–042 |
| Missions | `mission_{type}_NNN` | — |
| AI responses | `ai_resp_NNN` | 001–015 |
| Activities | `activity_NNN` | 001–030 |
| Notifications | `notif_NNN` | 001–007 |

### Languages
- **Vietnamese (vi):** Always uses proper diacritics — `con mèo`, not `con meo`
- **English (en):** IPA phonetics in `phonetic_en` — `/kæt/`, not `kat`
- **Chinese (zh):** Simplified characters + pinyin with tone marks — `猫` + `māo`, not `mao`

### Timestamps
- All timestamps are **UTC** in ISO 8601 format
- Vietnam is UTC+7, so `08:00Z` = 3pm Vietnam time
- Activity entries use hours between 01:00–11:00 UTC (8am–6pm Vietnam)

### Rarity → Points

| Rarity | Points | Color | Hex |
|---|---|---|---|
| Common ⚪ | 10 | Slate | `#94A3B8` |
| Uncommon 🟢 | 25 | Green | `#22C55E` |
| Rare 🔵 | 50 | Blue | `#3B82F6` |
| Epic 🟣 | 100 | Purple | `#A855F7` |
| Legendary 🟡 | 250 | Amber | `#F59E0B` |

---

## Extending the Data

### Adding new vocabulary
1. Add the entry to `reference_vocab.json` with the next available `vocab_NNN` ID
2. Create a matching SVG in `photos/` following the naming convention
3. If the hero user should have captured it, add an entry to `captured_vocab.json`

### Adding new users
1. Add to `users.json` with the next `user_NNN` ID
2. Add to the appropriate leaderboard scope in `leaderboard.json`
3. Re-sort and re-rank the affected scope

### Adding new missions
1. Add to the `missions` array inside `missions.json`
2. If the mission rewards a badge, ensure the badge exists in `badges.json`

### Updating the hero user's progress
When simulating progression, update these files together:
- `users.json` → `total_xp`, `level`, `level_title`, `current_streak`, `total_captures`, `badges_earned`
- `captured_vocab.json` → add new captures or update `mastery_level`
- `leaderboard.json` → update `total_points` and re-rank
- `activity_feed.json` → prepend new activity entries
- `missions.json` → update `current_count` and `status`

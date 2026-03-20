# Pupil Experience Scenarios

Sample scenarios illustrating the user experience of a Vietnamese pupil interacting with SnapLearn. Each scenario follows a child through a realistic usage session, written as narrative storyboards that bring the product vision to life.

These scenarios are **not** test plans or acceptance criteria. They are communication tools — designed to help the team, stakeholders, and partners feel what SnapLearn is like from a child's perspective.

> **Source document:** [`../product_vision.md`](../product_vision.md)

---

## Scenario Index

| # | Scenario | Character | Age | Setting | Primary Flow Coverage |
|---|----------|-----------|-----|---------|----------------------|
| 1 | [First Time Magic](01_first_time_magic.md) | Linh | 7 | Home after school | Onboarding → first capture |
| 2 | [The Market Explorer](02_the_market_explorer.md) | Minh | 9 | Bến Thành Market | Duplicates, rare finds, mission completion |
| 3 | [Pronunciation Power-Up](03_pronunciation_power_up.md) | Hà | 8 | Home (tablet) | Collection Book, card evolution, Chinese learning |
| 4 | [Chasing Legends](04_chasing_legends.md) | Tuấn | 10 | Science Museum field trip | Legendary capture, level-up, class competition |
| 5 | [The Weekly Race](05_the_weekly_race.md) | Mai | 8 | Home, Sunday evening | Leaderboard strategy, mission → rank climb |
| 6 | [Oops, Try Again!](06_oops_try_again.md) | Bảo | 6 | Garden with dad | Blurry photo retry, pronunciation failure → success |
| 7 | [House Safari](07_house_safari.md) | Lan Anh | 7 | Home (rainy day) | Pure joyous exploration, room-by-room discovery |
| 8 | [Window Watcher](08_window_watcher.md) | Phúc | 8 | Family car (HCMC → Vũng Tàu) | Captures on the road, motion blur, changing scenery |

---

## Flow Mapping to Product Vision

Each scenario maps to specific sections of the [product vision](../product_vision.md):

| Product Vision Section | Covered By |
|------------------------|------------|
| **§2.0** Onboarding | Scenario 1 |
| **§2.1** Collection Loop | Scenarios 2, 7, 8 |
| **§2.2** Rarity & Points | Scenarios 2, 4, 7, 8 |
| **§2.3** Collection Mechanics | Scenarios 3, 7 |
| **§2.4** Missions | Scenarios 2, 5 |
| **§2.5** Leaderboard | Scenario 5 |
| **§2.6** Levels & Progression | Scenario 4 |
| **§2.7** Audio-first UX | Scenarios 1, 6, 8 |
| **§3.1** Vision / Object Recognition | Scenarios 6, 8 |
| **§3.2** Speech / ASR-as-judge | Scenarios 3, 6 |
| **§4.2** Core User Flow | Scenarios 1, 2, 4, 7, 8 |
| **§7.5** Parent Notifications | Scenario 5 |

---

## Characters at a Glance

The scenarios collectively cover the full age range (6–10), both target languages, and a spread of experience levels:

| Character | Age | Grade | Language | Level | Words | Key Trait |
|-----------|-----|-------|----------|-------|-------|-----------|
| Bảo | 6 | 1 | English | 3 | 12 | Youngest user, pre-literate |
| Linh | 7 | 2 | English | 1 | 0 | Brand new user, first launch |
| Lan Anh | 7 | 2 | English | 6 | 34 | Curious explorer, intrinsic motivation |
| Hà | 8 | 3 | **Chinese** | 9 | 62 | Pronunciation-focused, quiet learner |
| Mai | 8 | 3 | English | 10 | 71 | Competitive, leaderboard-driven |
| Phúc | 8 | 3 | English | 8 | 48 | Adventurous, finds fun in transit |
| Minh | 9 | 4 | English | 12 | 87 | Social, explores with family |
| Tuấn | 10 | 5 | English | 19 | 234 | Power user, chasing rare words |

---

## Scenario Themes

| Theme | Scenarios | Why It Matters |
|-------|-----------|----------------|
| **Joyous exploration** | 1, 7, 8 | The core promise: the world is the curriculum |
| **Social & competitive** | 2, 4, 5 | Leaderboards, class challenges, family play |
| **Mastery & growth** | 3, 4 | Pronunciation practice, card evolution, leveling up |
| **Graceful failure** | 6, 8 | Errors are never punishing — always encouraging |
| **Audio-first design** | 1, 6, 7, 8 | No reading required at any point |
| **Real-world contexts** | 2, 4, 7, 8 | Market, museum, home, car — vocabulary is everywhere |

---

## Reading Guide

Each scenario follows a consistent format:

1. **Metadata table** — Character, profile, setting, flow mapping at a glance
2. **Narrative prose** — Storyboard-style writing organized by `###` subheadings
3. **Callout boxes** — Highlighted throughout:
   - 🔊 **Audio-first moment** — where TTS/audio replaces text
   - 🗺️ **Flow mapping** — explicit reference to product vision sections
   - 💡 **Design principle** — which core differentiator is illustrated
4. **Session summary table** — Before/after metrics for the session

**Suggested reading order for different audiences:**

- **New to the product?** Start with Scenario 1 (onboarding), then 7 (pure exploration)
- **Interested in pedagogy?** Read 3 (pronunciation mastery) and 6 (failure recovery)
- **Evaluating gamification?** Read 4 (rarity/leveling) and 5 (leaderboard strategy)
- **Assessing real-world viability?** Read 2 (market), 7 (home), and 8 (car)

---

## What's Not Covered

These scenarios focus on the **pupil experience** only. Not covered:

- Parent dashboard interactions (see [product vision §7](../product_vision.md))
- Teacher view and school deployment (see [product vision §7.4](../product_vision.md))
- Settings and language switching
- Hardware form factors (SnapBear, SnapScope)
- Content safety edge cases
- Backend/technical flows

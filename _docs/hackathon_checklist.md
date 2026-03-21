# LotusHack 2026 Submission Checklist

**SnapLearn — AI-Powered Vocabulary Camera**
*Edtech Track | Submission Deadline: Sunday March 22, 8:00 AM*

---

## Submission Requirements (Devpost)

| # | Deliverable | Status | Owner | Notes |
|---|-------------|--------|-------|-------|
| 1 | Project title | ✅ Done | - | "SnapLearn — AI-Powered Vocabulary Camera" |
| 2 | Tagline (one sentence) | ✅ Done | - | "Turn passive screen time into active vocabulary building — Pokémon Go for English words" |
| 3 | The Story (why, how, challenges) | 🔴 Not started | | 300-500 words, lead with personal story |
| 4 | Built With tags | 🔴 Not started | | Flutter, Python, Claude API, Google Cloud STT/TTS, Supabase |
| 5 | Demo video (2-3 min) | 🔴 Not started | | YouTube/Vimeo link |
| 6 | GitHub repo link | 🟡 Exists | | README updated |
| 7 | Track selection | ✅ Done | - | Edtech (by Etest) |

---

## Demo Video Script

### Structure (180 seconds total)

| Section | Duration | Content |
|---------|----------|---------|
| **Personal hook** | 0:00-0:15 | "My daughter is 2.5. She grabs my phone and demands YouTube. I wanted to build something where handing over the phone feels like good parenting." |
| **Problem** | 0:15-0:30 | "Every parent knows this guilt. Kids absorb brainrot. In Vietnam, parents spend $200/mo on tutoring but kids have no daily practice." |
| **Solution** | 0:30-0:45 | "SnapLearn turns that phone into an exploration tool. Pokémon Go for vocabulary." |
| **Demo** | 0:45-2:15 | 3 captures: water bottle (Common) → headphones with deliberate mispronunciation + retry (Uncommon) → nón lá (Epic). Show vault + leaderboard. |
| **Innovation** | 2:15-2:30 | "The real innovation is shared visual context. The camera is a disguised prompt. The AI sees what the child sees." |
| **Vision** | 2:30-2:50 | "Imagine the AI sees a cat and asks 'Is that your cat?' Hardware devices. School deployments." |
| **Close** | 2:50-3:00 | "SnapLearn — so parents can hand over the phone and feel proud, not guilty." |

### Demo Scenes to Capture

- [ ] App opens to camera viewfinder
- [ ] Capture 1: Water bottle → Common card → perfect pronunciation
- [ ] Capture 2: Headphones → Uncommon card → deliberate fail → retry → success
- [ ] Capture 3: Nón lá → Epic/Legendary card → dramatic reveal
- [ ] Words Vault grid with collected cards
- [ ] Leaderboard view

---

## Demo Station Prep

### Objects to Bring (Pre-Tested)

| # | Object | Expected Rarity | Pre-tested? | Fallback cached? |
|---|--------|----------------|-------------|------------------|
| 1 | Water bottle | ⚪ Common | ☐ | ☐ |
| 2 | Headphones | 🟢 Uncommon | ☐ | ☐ |
| 3 | Rubik's cube | 🔵 Rare | ☐ | ☐ |
| 4 | Nón lá (conical hat) | 🟣 Epic | ☐ | ☐ |
| 5 | Potted plant (spare) | 🟢 Uncommon | ☐ | ☐ |

### Backup Plans

- [ ] Mobile hotspot ready (don't rely on venue WiFi)
- [ ] Hard-coded fallback responses for all 5 demo objects
- [ ] Pre-recorded demo video on phone (nuclear option)
- [ ] Quiet corner identified for ASR demo if hall is too noisy
- [ ] Phone/laptop fully charged + charger packed

---

## Pitch Deck (8 Slides)

| Slide | Title | Status | Content |
|-------|-------|--------|---------|
| 1 | The Guilt | 🔴 | "My 2.5yo grabs my phone..." + before image |
| 2 | The Problem | 🔴 | Brainrot + Vietnam stats + tutoring gap |
| 3 | The Flip | 🔴 | "What if that phone became an exploration tool?" + after image |
| 4 | The Solution | 🔴 | Pokémon Go for vocabulary, core loop diagram |
| 5 | Live Demo | 🔴 | Screen recording or screenshots |
| 6 | The Innovation | 🔴 | Shared visual context, "Is that your cat?", AI as companion |
| 7 | The Vision | 🔴 | Hardware, schools, languages, conversational AI |
| 8 | The Team | 🔴 | 4 AI engineers, personal motivation |

---

## Story Template (Devpost)

```markdown
## Inspiration

My daughter is two and a half years old. She already grabs my phone and demands 
to watch YouTube. Every time I hand it over, I feel a pang of guilt — she's 
absorbing passive content when she should be exploring the world.

I'm not alone. Smartphones are ubiquitous in children's lives. Most kids use them 
to consume low-value content on TikTok and YouTube. In Vietnam specifically, 
parents spend $50-200 per month on English tutoring, yet between classes, their 
kids have zero engaging practice. The result: Vietnam ranks 58th globally in 
English proficiency despite massive education spending.

We wanted to offer an alternative: use the smartphone to develop their brains, 
their language skills, starting with vocabulary.

## What it does

SnapLearn turns passive screen time into active vocabulary building. A child 
points their camera at any object — a water bottle, a cat, a bicycle — snaps a 
photo, and the AI identifies it in both Vietnamese and English. The child hears 
the pronunciation, speaks it back, and if the AI understands them, they earn 
points and add the word to their collection.

It's Pokémon Go for vocabulary. Kids explore the real world, capture words, build 
a collection, and compete on leaderboards. Rare and unusual objects are worth more, 
motivating kids to explore beyond their living room.

## How we built it

- **Frontend**: Flutter for cross-platform mobile with camera and microphone access
- **Backend**: FastAPI (Python) for AI orchestration
- **Vision**: Claude Sonnet 3.5 for real-time object identification and translation
- **Speech**: Google Cloud TTS for pronunciation playback, Google Cloud STT for 
  pronunciation checking (our "ASR-as-judge" approach — if the speech recognition 
  understands you, a native speaker would too)
- **Database**: Supabase for user data and leaderboards

## Challenges we ran into

[TO BE FILLED DURING HACKATHON]

## Accomplishments that we're proud of

[TO BE FILLED DURING HACKATHON]

## What we learned

[TO BE FILLED DURING HACKATHON]

## What's next for SnapLearn

The real innovation isn't the vocabulary app — it's the interaction model. When a 
child snaps a photo, the AI and child now share visual context. The AI doesn't 
feel like a chatbot waiting for a prompt; it feels like a companion responding to 
a shared discovery.

Imagine the AI sees the same cat your child does and asks: "Is that your cat? 
What's its name?" That's where we're going.

Near-term: Chinese language support, daily missions, parent dashboard. 
Medium-term: school deployments, conversational AI, content expansion.
Long-term: dedicated hardware devices (SnapBear plush toy for screen-free learning), 
Vietnamese market launch targeting 8 million kids.
```

---

## Pre-Submission Final Check

- [ ] Demo video uploaded to YouTube (public or unlisted)
- [ ] Demo video is 2-3 minutes, follows the script
- [ ] GitHub repo is public
- [ ] README has problem, solution, tech, setup, team
- [ ] Devpost project created
- [ ] All required fields filled
- [ ] Track selected: Edtech
- [ ] Video link works (test in incognito)
- [ ] GitHub link works (test in incognito)
- [ ] Story section complete (300+ words)
- [ ] Built With tags added
- [ ] Submission saved/published before 8:00 AM Sunday

---

## Live Demo Preparation

### Table Demo Script (60 seconds)

> "My daughter is two and a half — she already demands my phone for YouTube. We built SnapLearn so parents can hand over the phone and feel good about it.
>
> It's Pokémon Go for vocabulary. Watch — [snap water bottle] — the AI identifies it, plays the pronunciation, and checks if the child can say it back. [snap headphones] — this one's rarer, worth more points. Kids are motivated to explore, not scroll.
>
> The real innovation is the interaction model — the camera creates shared context between child and AI. Today it's vocabulary. Tomorrow, the AI sees the same cat your child does and starts a conversation."

### Main Stage Pitch (3 minutes)

> Follow the pitch deck. Personal story → Problem → Solution → Demo → Innovation → Vision → Team.

### Practice Schedule

- [ ] Practice table demo × 3 (time it — must be under 90 seconds)
- [ ] Practice main stage pitch × 3 (time it — must be under 3 minutes)
- [ ] Practice with all demo objects (confirm AI identifies each correctly)
- [ ] Practice the deliberate mispronunciation → retry flow

---

## Judging Criteria Alignment

| Criterion | Our Angle | Evidence |
|-----------|-----------|----------|
| **Technical Execution** | Real-time multi-API pipeline (Vision + TTS + ASR) with graceful fallbacks | Live demo with real AI |
| **Innovation** | Shared visual context — new AI interaction paradigm. Camera as disguised prompt. | "Is that your cat?" |
| **Design/UX** | Audio-first, icon-driven for pre-literate children. Encouraging retry. | Demo shows a 6yo could use this |
| **Impact/Relevance** | 8M Vietnamese kids. Transforms passive screen time. Personal story. | Father building for his daughter |

---

*Last updated: March 21, 2026*

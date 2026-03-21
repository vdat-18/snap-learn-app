# Pitch Deck Plan — Round 2 Finals (10 Slides)

**Context:** This deck is for **Final Round only** — Top 10 pitch on main stage. 5 min pitch + 2 min Q&A. Large screen, all 30 judges + audience.

**Round 1 does NOT use slides** — it's a table pitch with live phone demo. See `round1_table_pitch.md`.

**Tool:** Google Slides (for collaboration and backup) or Keynote. NOT PowerPoint on a USB — too many compatibility issues with venue laptops.

---

## Design Principles

- **One idea per slide.** If you need to explain a slide, it has too much on it.
- **Minimal text.** Maximum 6 words per line, maximum 3 lines per slide. The slide supports your voice — it doesn't replace it.
- **Large visuals.** Images, diagrams, screenshots should fill 60%+ of the slide.
- **Dark background recommended.** Works better on projectors in bright hackathon venues.
- **Consistent brand colors:**
  - Primary: `#4DA8FF` (Sky Blue)
  - Accent: `#FFD234` (Sunshine Yellow)
  - Action: `#FF6B6B` (Coral)
  - Background: `#0F172A` (Deep Navy) or `#1E293B` (Slate)
  - Text: `#F8FAFC` (White)

---

## Stage Logistics

- **Screen position:** Large projected screen behind you and to your right.
- **Standing position:** Stage left (audience's right), angled 45° so you can gesture to the screen without turning your back.
- **Mic:** Clip-on lapel preferred. Handheld in non-dominant hand so dominant hand is free for gestures/clicker.
- **Eye contact:** 70% judges, 20% audience, 10% screen.
- **Critical rule:** NEVER do a live demo on stage. WiFi fails. Projectors lag. Use the pre-recorded screen recording instead.

---

## Slide-by-Slide Plan

### SLIDE 1: Title
**Time on stage:** 0:00 – 0:05 (5 seconds)

| Element | Content |
|---------|---------|
| **Logo** | SnapLearn logo (`_docs/assets/_logo.jpg`) — centered, large |
| **Tagline** | "Pokémon Go for Vocabulary" |
| **Subtitle** | LotusHack x HackHarvard 2026 · Edtech Track |

> "We're SnapLearn."

---

### SLIDE 2: The Guilt
**Time on stage:** 0:05 – 0:30 (25 seconds)

| Element | Content |
|---------|---------|
| **Visual** | A single photo/illustration: a child staring at a phone screen, glowing face in dim light. |
| **Text (large)** | "My daughter is 2½. She grabs my phone and demands YouTube." |

> "My daughter is two and a half years old. She already grabs my phone and demands to watch YouTube. Every time I hand it over, I feel a pang of guilt. She's absorbing passive content when she should be exploring the world. And I know — every parent in this room knows that feeling."

---

### SLIDE 3: The Problem
**Time on stage:** 0:30 – 0:55 (25 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Stats appearing one by one (animated). |
| **Stat 1** | 📱 Kids spend **3+ hours/day** on passive content |
| **Stat 2** | 🇻🇳 **8 million** Vietnamese kids learning English |
| **Stat 3** | 💰 Parents spend **$50-200/month** on tutoring |
| **Stat 4** | 📉 Vietnam ranks **58th** in English proficiency |

> "Kids spend hours daily on passive content — TikTok, YouTube, brainrot. In Vietnam, eight million children are learning English. Parents spend up to two hundred dollars a month on tutoring. Between classes? Nothing. Zero engaging practice. Vietnam ranks fifty-eighth globally in English proficiency. The spending is there. The results aren't."

---

### SLIDE 4: The Flip
**Time on stage:** 0:55 – 1:10 (15 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Side-by-side: LEFT — muted, child slumped scrolling. RIGHT — bright, child pointing camera at the world. |
| **Text (large, center)** | "What if that phone became an exploration tool?" |

> "What if we flipped the script? What if that same phone — the thing parents feel guilty about — became the most powerful learning tool in the child's life? We built SnapLearn. Pokémon Go for vocabulary. Let me show you."

---

### SLIDE 5: The Demo
**Time on stage:** 1:10 – 2:25 (75 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Pre-recorded screen capture plays full-screen (see `screen_recording_script.md`) |
| **Text** | None — video fills the slide |

**Speaker notes:** Video plays with app sounds MUTED. You narrate live. Practice timing so words match on-screen actions.

> "Here's SnapLearn. I point the camera at a water bottle — snap — the AI identifies it in under five seconds. Vietnamese: 'Chai nước.' English: 'Water Bottle.' Common rarity, ten points."
>
> "The app speaks both words aloud — audio-first, because our users can't read yet. The child says it back. Three stars."
>
> "Now earbuds — Uncommon, twenty-five points. What happens when they mispronounce? No punishment. The mascot encourages in Vietnamese. Second try — three stars."
>
> "A toy excavator. Epic. One hundred points. That purple glow, that celebration — *that's* what makes kids want to explore the world, not sit on the couch."
>
> "Every capture becomes a trophy in their collection. And they compete on a leaderboard."

---

### SLIDE 6: Under the Hood
**Time on stage:** 2:25 – 2:55 (30 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Clean architecture flow diagram (see below) |
| **Text (large)** | "3 AI Models · Automatic Failover · Under 5 Seconds" |
| **Design** | Dark background (`#0F172A`), boxes + arrows in brand colors |

**Architecture diagram layout:**
```
📷 Camera Snap
    ↓
🔀 BAML Orchestration (type-safe structured outputs)
    ↓ (failover chain)
┌──────────┬──────────────┬───────────────┐
│ GPT      │ Gemini       │ Claude        │
└──────────┴──────────────┴───────────────┘
    ↓
🔊 ElevenLabs TTS (Vietnamese + English)
    ↓
🎤 OpenAI ASR → LLM-as-Judge (pronunciation scoring)
    ↓
🔍 Hybrid Semantic-Keyword Search (collection matching)
    ↓
⭐ Score + Collect
```

> "Under the hood: three AI vision models — GPT, Gemini, Claude — orchestrated through BAML with type-safe structured outputs and automatic failover. Zero glue code."
>
> "Pronunciation scoring uses a two-stage approach: OpenAI ASR transcribes the child's speech, then an LLM-as-judge evaluates the match. This gives us low latency and nuanced scoring that handles accents gracefully."
>
> "When a child captures an object, we match it against their collection using hybrid semantic-keyword search — the same RAG technique used in enterprise search — so the app knows whether you found a new word or a variation of one you already have."
>
> "The full pipeline — snap to scored card — under five seconds. Real-time, not a mockup."

---

### SLIDE 7: The Innovation
**Time on stage:** 2:55 – 3:20 (25 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Three columns with icons: (1) ↑ arrow flip, (2) 🏆 trophy, (3) 🔊 speaker |
| **Column 1** | **Passive → Active** — "Child creates their own curriculum" |
| **Column 2** | **Gamified Learning** — "Pokémon Go psychology for vocabulary" |
| **Column 3** | **Audio-First AI** — "No text. No menus. Ears and taps." |

> "Three things make this different. First: passive becomes active — the child isn't consuming a curriculum, they're creating one by exploring the real world. Second: gamified learning — rarity, collection, competition — Pokémon Go psychology channeled into vocabulary. Third: audio-first UX — our user can't read. Every interaction is spoken. This is genuinely accessible AI for pre-literate children."

---

### SLIDE 8: Google Lens vs SnapLearn
**Time on stage:** 3:20 – 3:30 (10 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Side-by-side. Left: Google Lens icon + "Identifies." Right: SnapLearn logo + "Teaches." |
| **Text (large)** | "Google Lens identifies. SnapLearn teaches." |

> "The obvious comparison — Google Lens identifies and stops. SnapLearn turns identification into a learning loop: hear, speak, score, collect, compete. Lens is a dictionary. SnapLearn is a game that teaches."

---

### SLIDE 9: The Vision
**Time on stage:** 3:30 – 3:50 (20 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Roadmap with 3 tiers + mascot |
| **Step 1** | 📱 **Now:** Vocabulary camera — snap, learn, collect |
| **Step 2** | 📚 **Next:** Sentences & stories from captured words, classroom mode, Chinese, missions |
| **Step 3** | 🤖 **Future:** Voice companion ("Is that your cat?"), cultural discovery, 8M kids market |

> "Today it's vocabulary. Next: the child's captured words become sentences, then personalized stories the AI generates and reads aloud. Teachers assign scavenger hunts — one teacher, thirty kids. Chinese language — the backend already returns trilingual data."
>
> "Longer term: the AI sees the same cat your child sees and starts a conversation. We're targeting eight million Vietnamese kids and a two-billion-dollar tutoring market."

---

### SLIDE 10: The Team + Close
**Time on stage:** 3:50 – 4:10 (20 seconds)

| Element | Content |
|---------|---------|
| **Visual** | Team photo or avatars. Mascot alongside. |
| **Text** | Team names + "4 AI Engineers. 1 Dad. 36 Hours." |
| **Closing tagline** | *"So parents can hand over the phone and feel proud — not guilty."* |

> "We're four enterprise AI engineers who build AI systems for a living. This hackathon, we built for the hardest user we've ever designed for — a six-year-old who can't read."
>
> *[Pause. Make eye contact.]*
>
> "SnapLearn. So parents can hand over the phone and feel proud — not guilty. Thank you."

---

## Total Slide Count: 10
## Total Pitch Time: ~4:10 (with ~50s buffer to 5:00 — use for pacing, not rushing)
## Q&A: 2 minutes after the pitch (Final Round only)

---

## Q&A Prep (2 Minutes, Final Round)

### Team Roles During Q&A

| Question Topic | Who Answers |
|---------------|-------------|
| Product vision, story, market, monetization | Product lead |
| AI pipeline, BAML, fallback chains, LLM-as-judge | AI Engineer 1 |
| Frontend, animations, UX, PWA decisions | AI Engineer 2 |
| Backend, database, RAG search, deployment | AI Engineer 3 |

**Rule:** One person per question. Product lead redirects: "Great question — [name] built that, they can speak to it."

### Anticipated Questions

**"What was the hardest technical challenge?"**
> "Orchestrating three AI services in real-time with low enough latency that a six-year-old doesn't lose interest. BAML handles the failover chain declaratively — GPT to Gemini to Claude. And the pronunciation scoring was tricky — we landed on ASR plus LLM-as-judge, which gives us both speed and nuanced evaluation."

**"How does pronunciation scoring actually work?"**
> "Two stages. First, OpenAI ASR transcribes what the child says. Then an LLM evaluates the transcription against the target word — it handles accent variations, partial matches, and childish mispronunciations better than a simple string match. Low latency because ASR is fast, and the LLM judge call is lightweight."

**"How do you handle duplicate captures?"**
> "Hybrid semantic-keyword search — the same approach used in RAG pipelines. When a child snaps a new object, we check against their existing collection using both keyword matching and semantic similarity. So if they already captured 'water bottle' and now photograph a 'thermos,' the system recognizes the semantic overlap and can either flag it as a variation or award it as a new word depending on the linguistic distance."

**"How is this different from Google Lens?"**
> "Google Lens identifies and stops. We turn identification into a complete learning loop: hear, speak, score, collect, compete. Lens is a utility. SnapLearn is a game that teaches."

**"Did you build this in 36 hours?"**
> "Yes. Product vision was scoped beforehand, but all code was written during the hackathon. Check our commit history."

**"What about children's privacy?"**
> "Photos are processed and discarded by default. No image storage unless a parent opts in. No social features, no messaging, no PII beyond a first name and avatar."

**"How do you make money?"**
> "Freemium. Five captures per day free. Premium unlocks unlimited captures, full leaderboards, parent dashboard. Four to six dollars per month — a fraction of what parents already spend on tutoring."

**"What would you do with more time?"**
> "Three things. One: sentence building and AI storytelling — the child's captured words become personalized stories the AI generates and reads aloud. Two: classroom mode — a teacher creates a class, assigns scavenger hunts, sees per-student progress. One teacher, thirty kids. Three: Chinese language — the backend already returns trilingual data, it's weeks not months."

**"What if the AI misidentifies an object?"**
> "Below 0.7 confidence, the mascot says 'I can't quite see that — try getting closer.' And the three-model fallback chain reduces misidentification significantly compared to a single model."

**"Isn't this just flashcards with a camera?"**
> "Flashcards are static and pre-made. Here, the child creates the content by exploring the real world. And the gamification — rarity, collection, leaderboards, pronunciation scoring — creates a motivation loop that flashcards can't. Kids don't voluntarily do flashcards. They'll voluntarily do this."

---

## Slide Production Checklist

- [ ] Create in Google Slides
- [ ] Logo on Slides 1, 10
- [ ] Concept art on Slides 2, 4
- [ ] Screen recording embedded in Slide 5 (audio OFF)
- [ ] Architecture diagram created for Slide 6 (include LLM-as-judge + hybrid search)
- [ ] Three-column innovation icons for Slide 7
- [ ] Google Lens comparison for Slide 8
- [ ] Mascot on Slides 9, 10
- [ ] All text readable from back of room (min 36pt headlines, 24pt body)
- [ ] Test on projector
- [ ] Export PDF backup + save to USB
- [ ] Share link with all team members

---

## Assets to Use

| Asset | File | Slide(s) |
|-------|------|----------|
| Logo | `_docs/assets/_logo.jpg` | 1, 10 |
| Mascot | `_docs/assets/_mascot.jpg` | 4, 9, 10 |
| Concept (market) | `_docs/assets/_concept.png` | 2 or 4 |
| Concept (exploration) | `_docs/assets/_concept2.png` | 4 |
| Screen recording | TBD | 5 |
| Architecture diagram | TBD (create from this doc) | 6 |

---

*Last updated: March 22, 2026*

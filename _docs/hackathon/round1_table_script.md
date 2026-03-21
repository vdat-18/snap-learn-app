# Round 1: Table Judging Script (5 Minutes)

**Setup:** App loaded on phone, camera screen ready. Objects on table in order. Phone on mobile hotspot. All team members standing, facing judges.

**Who presents:** Product lead delivers the pitch. Team members answer technical questions.

---

## BEFORE JUDGES ARRIVE (Checklist)

- [ ] App is open, camera viewfinder loaded
- [ ] Phone on mobile hotspot (NOT venue WiFi)
- [ ] Objects arranged left-to-right in demo order: water bottle → earbuds → toy excavator
- [ ] Backup objects nearby: potted plant, Rubik's cube
- [ ] Pre-recorded video queued on a second phone (nuclear backup)
- [ ] Fallback cache enabled for all demo objects
- [ ] Everyone has water, no one is mid-chew

---

## THE SCRIPT (3 minutes 30 seconds)

### 0:00 – 0:30 | THE HOOK (30 seconds)

> *[Make eye contact with the judges, not the screen]*
>
> "My daughter is two and a half. She already grabs my phone and demands YouTube. Every time I hand it over, I feel guilty — she's absorbing passive content when she should be exploring the world."
>
> *[Brief pause — let it land]*
>
> "Every parent knows this feeling. So we built SnapLearn — an app that turns the phone from a guilt machine into a learning tool. Think of it as Pokémon Go, but for English vocabulary."
>
> "Let me show you."

**Transition:** Pick up the phone, point camera at the water bottle.

---

### 0:30 – 1:15 | CAPTURE 1: Water Bottle — Common (45 seconds)

> *[Point camera at water bottle, tap capture]*
>
> "I point the camera at this water bottle and snap."
>
> *[Wait for card reveal — anticipation animation plays]*
>
> "The AI identifies the object, returns it in Vietnamese and English — 'Chai nước, Water Bottle' — and assigns a rarity. This is a Common word, worth 10 points."
>
> *[TTS plays automatically]*
>
> "The app speaks the word aloud in both languages — audio-first, because our users are six-year-olds who can't read yet."
>
> *[Tap the pronunciation button, say "water bottle" clearly]*
>
> "Now the child says it back. Our speech recognition — OpenAI Whisper — checks: did I say it correctly? Three stars. The logic is simple: if the AI understands you, a native speaker would too. That's our pronunciation bar."
>
> *[Show points added]*

---

### 1:15 – 2:15 | CAPTURE 2: Earbuds — Uncommon + Fail/Retry (60 seconds)

> "Let's try something harder."
>
> *[Point at earbuds, snap]*
>
> "Earbuds — that's Uncommon. Green glow. Worth 25 points. See how the rarity system works? Common objects are everywhere. Rare ones motivate kids to explore — go to the market, the park, a museum."
>
> *[TTS plays]*
>
> *[Tap pronunciation button — deliberately mispronounce: say "EAR-budds" or mumble]*
>
> "Now watch what happens when the pronunciation isn't right."
>
> *[Show the retry prompt — encouraging mascot feedback in Vietnamese]*
>
> "No punishment. The mascot says 'Gần đúng rồi! Thử lại nha!' — 'Almost! Try again!' This is designed for six-year-olds building confidence, not adults cramming for an exam."
>
> *[Tap again, say "earbuds" correctly]*
>
> "Second try — three stars. The card is collected."

---

### 2:15 – 2:45 | CAPTURE 3: Toy Excavator — Epic/Legendary (30 seconds)

> "Now the fun part."
>
> *[Pick up the toy excavator, hold it up, snap]*
>
> "A toy excavator — every kid loves construction vehicles."
>
> *[Wait for reveal — dramatic animation, purple or gold glow]*
>
> "Epic! 100 points. The AI assigns rarity dynamically — this isn't a static list. A common chair is worth 10 points. But a toy excavator? That's a rare find in most households. This is what makes kids want to explore."

---

### 2:45 – 3:00 | VAULT + LEADERBOARD (15 seconds)

> *[Navigate to Words Vault]*
>
> "Every capture becomes a trophy card in their collection — the Words Vault."
>
> *[Quick swipe through a few cards]*
>
> *[Navigate to Leaderboard]*
>
> "And they compete with other kids on a global leaderboard. Collection plus competition — that's what drives daily engagement."

---

### 3:00 – 3:30 | THE INNOVATION + CLOSE (30 seconds)

> "But here's what we're really excited about. The camera creates shared visual context between the child and the AI. The child doesn't feel like they're prompting a chatbot — they feel like they discovered something, and the AI is responding to that shared moment."
>
> "Today it's vocabulary. But imagine: the AI sees the same cat your child does, and asks *'Is that your cat? What's its name?'* Now it's a conversation. That's where this goes."
>
> *[Pause]*
>
> "We built this so parents can hand over their phone and feel proud instead of guilty."

---

## 3:30 – 5:00 | Q&A (90 seconds)

### Anticipated Questions + Answers

**"How is this different from Google Lens?"**

> "Google Lens identifies objects but stops there. We turn identification into a complete learning loop — hear the word, say it back, get scored, collect the card, compete on leaderboards. Google Lens is a utility. SnapLearn is a game."

**"What was the hardest technical challenge?"**

> "Orchestrating three AI services in real-time — vision, text-to-speech, and speech recognition — with low enough latency that a child doesn't lose interest. We use BAML for structured LLM orchestration with automatic fallback chains across GPT-4o, Gemini, and Claude. If one API is slow, the next one picks up."

**"Did you build this during the hackathon?"**

> "Yes. We had the product vision pre-scoped, but all code was written in these 36 hours. Check our commit history."

**"Who is this for exactly?"**

> "Vietnamese children aged 6-10 learning English. But the interaction model — camera as shared context — works for any language, any age, any subject."

**"What about children's privacy?"**

> "Photos are processed and discarded by default — we don't store images unless a parent opts in. No social features, no messaging, no PII beyond a first name and avatar."

**"How does the rarity system work?"**

> "The AI assigns rarity dynamically based on linguistic difficulty and how commonly the object is captured across all users. A chair is Common. A stethoscope is Epic. This means rarity evolves over time as more kids use the app."

**"What would you do with more time?"**

> "Chinese language support — the backend already returns trilingual data. Daily missions to guide exploration. And conversational AI — that 'Is that your cat?' moment."

**"How do you make money?"**

> "Freemium. Free tier gets 5 captures per day. Premium unlocks unlimited captures, full leaderboards, and a parent dashboard. We'd price at about $4-6 per month — a fraction of the $50-200 parents already spend on tutoring."

---

## EMERGENCY FALLBACKS

| Situation               | Action                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App crashes             | Restart app (< 5 seconds). Continue pitch verbally while it loads.                                                                                                                                                     |
| API timeout             | Say "The AI is thinking..." — if >8 seconds, say "Let me show you one we captured earlier" and open Words Vault to show a pre-collected card                                                                          |
| WiFi dies               | Switch to mobile hotspot. If that fails, play pre-recorded video from second phone.                                                                                                                                    |
| ASR fails (noisy room)  | "As you can see, it's quite noisy in here — the speech recognition works best in quieter environments, which is how kids actually use it. Let me show you the retry flow..." and demonstrate with a pre-captured card |
| Judges seem bored       | Skip directly to the toy excavator capture. The Legendary reveal animation always gets a reaction.                                                                                                                          |
| Judges ask you to hurry | Drop capture 2 (earbuds). Do water bottle → toy excavator → vault → innovation line.                                                                                                                                  |

---

## TEAM ROLES DURING Q&A

| Question Topic                     | Who Answers   |
| ---------------------------------- | ------------- |
| Product vision, story, market      | Product lead  |
| AI pipeline, BAML, fallback chains | AI Engineer 1 |
| Frontend, animations, UX           | AI Engineer 2 |
| Backend, database, deployment      | AI Engineer 3 |

**Rule:** Only one person answers each question. No talking over each other. If unsure, product lead redirects: "That's a great question — [name] built that part, let them answer."

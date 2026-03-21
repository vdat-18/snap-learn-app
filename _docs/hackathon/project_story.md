## Inspiration

My daughter is two and a half years old. She already grabs my phone and demands to watch YouTube. Every time I hand it over, I feel a pang of guilt — she's absorbing passive, low-value content when she should be exploring the world around her.

I'm not alone. Smartphones have become ubiquitous in children's lives. Most kids use them to consume brainrot content on TikTok and YouTube — hours of passive scrolling that does nothing for their development. In Vietnam, the stakes are even higher: parents spend $50–200 per month on English tutoring, yet between classes, their children have zero engaging ways to practice. The result? Vietnam ranks 58th globally in English proficiency despite massive education spending.

We're a team of four AI engineers who build enterprise AI systems professionally. For this hackathon, we wanted to challenge ourselves with a fundamentally different problem: building for a user who is six years old, can't read, and needs an experience that is purely intuitive. We wanted to turn the device parents feel guilty about — the smartphone — into something they feel proud to hand over.

## What it does

SnapLearn is Pokémon Go for vocabulary. A child points their phone camera at any real-world object — a water bottle, a cat, a bicycle — snaps a photo, and the AI identifies it in both Vietnamese and English. The app plays the pronunciation aloud, then challenges the child to say the word back. If the speech recognition understands them, they earn points and collect the word as a trophy card in their vault.

Every object has a rarity tier — Common items like chairs are worth 10 points, while Legendary finds like a calligraphy brush are worth 250. This motivates kids to explore beyond their living room: go to the market, the park, a museum. Rare words are out there waiting.

The entire experience is audio-first and icon-driven. A child who cannot read can use the app with ears and taps alone. Every text element is spoken aloud. Navigation uses icons, not labels. Error messages are delivered by a friendly mascot voice, never a text popup.

## How we built it

- **Frontend:** Next.js 14 PWA with Tailwind CSS and Framer Motion for card reveal animations and rarity glow effects. Camera access via browser MediaDevices API. Push-to-talk audio recording via MediaRecorder API.
- **Backend:** FastAPI (Python) for AI orchestration with async processing across multiple AI services.
- **AI Pipeline:** We use BAML (Boundary AI Markup Language) to define structured LLM functions with type-safe outputs and automatic fallback chains. Our vision pipeline falls through GPT-4o → Gemini Flash → Claude Sonnet, ensuring reliability.
- **Speech:** OpenAI Whisper for speech-to-text (our "ASR-as-pronunciation-judge" — if the speech model understands the child, a native speaker would too). OpenAI TTS for pronunciation playback.
- **Rarity Engine:** A separate BAML function classifies each object's rarity based on linguistic difficulty and capture frequency, making every snap feel like opening a loot box.
- **Database:** Supabase (PostgreSQL) for user profiles, vocabulary collections, and leaderboard rankings.

## Challenges we ran into

[TO BE FILLED DURING HACKATHON — suggestions below]

*Potential areas to document:*
- *Tuning ASR confidence thresholds for non-native children's voices*
- *Latency optimization for the multi-API pipeline (Vision → TTS → ASR)*
- *Handling noisy hackathon venue audio for pronunciation demos*
- *Card reveal animation timing to feel magical without feeling slow*
- *Balancing rarity assignment so every capture feels rewarding*

## Accomplishments that we're proud of

[TO BE FILLED DURING HACKATHON — suggestions below]

*Potential highlights:*
- *End-to-end AI pipeline working in real-time: snap a photo of anything and get a complete learning experience in under 5 seconds*
- *The "ASR-as-judge" approach — elegant, fast, and works across languages without a dedicated pronunciation scoring API*
- *Audio-first UX that a pre-literate child could genuinely use*
- *The moment the card reveal animation + rarity glow + sound effect all came together*

## What we learned

[TO BE FILLED DURING HACKATHON — suggestions below]

*Potential learnings:*
- *Building for children is harder than building for enterprise — you can't rely on text, tooltips, or documentation*
- *BAML's structured LLM functions with fallback chains made multi-provider AI orchestration surprisingly clean*
- *The gap between "technically working" and "emotionally delightful" is where all the effort goes*
- *Latency is the enemy of magic — every extra second between snap and reveal kills the feeling*

## What's next for SnapLearn

The vocabulary app is just the beginning. The real innovation is the interaction model: the camera creates **shared visual context** between the child and the AI. The snap is a disguised prompt — the child doesn't feel like they're talking to a chatbot. The AI feels like a companion responding to a shared moment in the real world.

Imagine the AI sees the same cat your child does and asks: *"Is that your cat? What's its name?"* Suddenly it's a conversation — seemingly initiated by the AI, triggered by a real-world discovery. That's where this goes.

**Near-term:** Chinese language support (HSK 1–2 vocabulary), daily missions and guided exploration quests, parent dashboard with learning insights and screen time controls.

**Medium-term:** School deployments with teacher dashboards and class leaderboards, conversational AI that goes beyond vocabulary into storytelling and science exploration.

**Long-term:** Dedicated hardware devices — a SnapBear plush toy for completely screen-free learning (camera in the eye, speaker in the belly, squeeze-to-capture), targeting Vietnam's 8 million kids aged 6–10 and the $2–3 billion annual tutoring market.

We started this project because one dad wanted to hand his daughter a phone without guilt. We're continuing because every parent deserves that feeling.

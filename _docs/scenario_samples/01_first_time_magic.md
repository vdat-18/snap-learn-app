# Scenario 1 — "First Time Magic"

## Metadata

| Field             | Detail                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| **Character**     | Linh, age 7, Grade 2                                                      |
| **Profile**       | New user, no captures, no level — first time opening the app              |
| **Target language**| English                                                                   |
| **Setting**       | At home after school, kitchen table, using mom's phone (Android)          |
| **Flow mapping**  | §2.0 Onboarding → §4.2 Primary Flow (Capture) → §3.2 Speech/ASR         |
| **Sections covered** | Welcome screen, language selection, avatar pick, first mission prompt, camera viewfinder, capture flow, card reveal with TTS, pronunciation attempt (PTT), points earned |

---

## The Story

### The welcome

Linh's mom hands her the phone. The screen is white for half a breath — and then a round, bright-eyed mascot bounces into view, waving one oversized paw. The mascot fills most of the screen. There is no wall of text, no terms-of-service paragraph, no "Sign up" form. Just the mascot, mid-wave, and a voice.

*"Xin chào! Chào mừng đến SnapLearn!"*
("Hello! Welcome to SnapLearn!")

Linh grins. She doesn't need to read a single word. The voice is warm — pitched for a child's ear, neither babyish nor adult. The mascot's wave loops gently, waiting.

> 🔊 **Audio-first moment** — The entire welcome screen is communicated through TTS narration and animation. There is no text-heavy splash. A child who cannot yet read Vietnamese fluently can understand everything happening on screen through the mascot voice and visual cues alone.

> 🗺️ **Flow mapping** — This is §2.0 Onboarding, Step 1: Welcome screen. The product vision specifies: "No text-heavy splash — just the mascot, a waving animation, and the voice."

### Choosing a language

The mascot's voice continues without pause. Linh doesn't have to find a "Next" button — the flow carries her forward.

*"Bạn muốn học tiếng gì?"*
("What language do you want to learn?")

Two large cards appear side by side, each taking up nearly half the screen. On the left, a card with a Union Jack flag and the word "English." On the right, a card with a Chinese flag and "中文." As each card slides into position, a short audio clip plays — a cheerful voice saying "English!" on the left, "Zhōngwén!" on the right. The cards are big enough that Linh could tap either one with her whole palm.

Linh taps the English card. It bounces with a satisfying pop. The other card fades away. The choice is stored in her profile as `target_language: 'en'` and can be changed at any time in Settings — but Linh doesn't need to know any of that. She just tapped the flag she recognized from her Grade 2 English textbook.

> 💡 **Design principle — Dual target languages, one at a time.** The child picks one language. The UI stays simple, the cognitive load stays low. The backend silently stores vocabulary data for all supported languages (§3.1), so if Linh's mom later enables Chinese in parent controls, every card Linh has already captured will instantly show its Chinese translation too — no re-capturing required.

### Picking an avatar

Six animal faces fill the screen in a two-by-three grid. A tiger. A rabbit. A parrot. A dolphin. A panda. A cat. No text labels — just bright, round, hand-drawn faces staring up at Linh with cartoon eyes.

Linh taps the rabbit. A short, high-pitched squeak plays — the rabbit's sound effect. She laughs, taps the tiger. A tiny roar. The parrot: a squawk. She cycles through all six, giggling at each sound, before coming back to the rabbit. She taps it one more time. The rabbit bounces, a confirm chime plays, and the avatar settles into the top-left corner of the screen — her identity now.

> 🔊 **Audio-first moment** — The avatar selection screen has no text labels at all. Each animal is identified purely by its illustration and its sound effect on tap. The audio feedback is the label. This is §2.7 in action: "if it can be labeled with text, prefer an icon."

### The first mission

The screen transitions. The mascot reappears, smaller now, perched in the corner with a speech bubble. Its voice is conspiratorial, excited — like an older cousin daring Linh to do something fun.

*"Hãy chụp thứ đầu tiên nào!"*
("Let's capture your first thing!")

The camera viewfinder opens. It fills the entire screen — live, breathing, showing the kitchen table and the fluorescent light overhead. In the top-left corner, Linh's rabbit avatar sits beside a small "Level 1" indicator. In the top-right, a point counter reads "0 pts" with a tiny flame icon showing "0" for her streak. At the bottom, a large, pulsing circular capture button invites her thumb. Below the viewfinder, the bottom navigation bar shows four icons and nothing else: 📖 📎 🏆 👤. No text. Just shapes.

This is the home screen. Not a menu. Not a dashboard. A camera. The world is the curriculum, and Linh is already looking at it.

> 🗺️ **Flow mapping** — This is §4.2 Core User Flow: "The app opens to a 'world view' — not a menu, but an invitation to explore." The camera viewfinder is the default home screen, just as Pokémon Go opens to the map. Onboarding is now complete. The entire sequence — welcome, language, avatar, first mission — has taken under forty-five seconds. On every subsequent launch, the app will skip straight to this camera view.

> 💡 **Design principle — Exploration-first, not list-first.** There is no vocabulary syllabus on screen. No "Lesson 1: Colors." No predetermined list of words to study. Linh's curriculum is whatever she points the camera at. Every real object is a potential vocabulary item (§2.1).

---

### The first capture

Linh looks around the kitchen. A cup sits on the table in front of her — white ceramic, half-full of water, catching the overhead light. She doesn't think about it strategically. She just points and taps the capture button.

The screen freezes on her photo for a split second, then a playful loading animation takes over. The mascot appears center-screen, squinting at the photo with exaggerated curiosity. A dotted circle spins around the object. The mascot's voice murmurs:

*"Hmm... bạn tìm thấy gì thế...?"*
("Hmm... what did you find...?")

Behind the animation, the captured image is being compressed and sent to the AI vision pipeline. The multimodal LLM (Claude Sonnet, per §3.1) analyzes the photo and returns structured JSON:

```json
{
  "object_vi": "cái cốc",
  "object_en": "cup",
  "phonetic_en": "/kʌp/",
  "object_zh": "杯子",
  "pinyin": "bēizi",
  "category": "household",
  "fun_fact_vi": "Một cái cốc có thể chứa khoảng 250 ml nước!",
  "difficulty_en": 1,
  "difficulty_zh": 2,
  "confidence": 0.97
}
```

The confidence is 0.97 — well above the 0.7 threshold. No retry needed. The card is ready.

### The reveal

The loading animation dissolves. From the bottom of the screen, a card slides upward with a soft white shimmer rippling along its edges — the rarity glow for Common ⚪. The card fills the center of the screen. On it: Linh's own photo of the cup, slightly cropped and framed. Below the photo, the Vietnamese word in large, friendly type. Below that, the English word. A small white circle with a ⚪ badge marks the rarity. The date reads "Hôm nay" — today.

But Linh doesn't read any of that. She doesn't have to. The moment the card appears, the mascot's voice begins the scaffolding sequence:

*"Đây là cái cốc."*
("This is a cup." — Vietnamese name, spoken clearly.)

A beat. Then the mascot shifts tone, becoming a teacher for one sentence:

*"Tiếng Anh là:"*
("In English, it is:")

And a different voice — the English TTS, clean and natural — says:

**"Cup."**

The word appears on the card with a subtle pulse as the audio plays, reinforcing the sound-to-text connection. Linh hears the Vietnamese word she already knows, then hears the bridge phrase she'll come to recognize over dozens of captures, then hears the new English word. Vietnamese first. Always Vietnamese first.

> 🔊 **Audio-first moment** — The card reveal is entirely audio-driven. The TTS auto-plays the full scaffolding sequence without any tap from the child: Vietnamese name → bridge phrase → English name. Per §3.2: "The child hears the card before they need to read it." The mascot scaffolding ("Đây là [Vietnamese]. Tiếng Anh là:") provides the pedagogical frame — the child understands what is happening because the explanation is in their native language.

> 💡 **Design principle — Vietnamese-first pedagogy.** The UI, narration, and scaffolding are in Vietnamese, aligned to MOET curriculum standards. The child's mother tongue is the foundation, never an afterthought. The target language is introduced through Vietnamese, not despite it.

A small celebration animation plays — sparkles drift from the card's edges, and a chime sounds. The point counter at the top of the screen ticks from "0 pts" to "10 pts" with a miniature firework. Common ⚪ — ten points. Linh's first word. Linh's first points.

### "Say it!"

The celebration fades, and a new element appears below the card: a large, round microphone button with a pulsing ring around it. Above it, in small text (and simultaneously spoken aloud by the mascot):

*"Nào, nói thử đi!"*
("Now, try saying it!")

The phonetic guide `/kʌp/` displays beside the English word on the card. The microphone button pulses gently, waiting.

Linh presses and holds the button — the push-to-talk (PTT) interaction. The screen dims slightly around the edges, the card word enlarges, and a subtle audio waveform animation appears, showing that the app is listening. No voice activity detection needed. The app captures audio for exactly as long as Linh holds the button. This is critical: VAD fails in noisy kitchens, in crowded markets, in school hallways with thirty children talking. PTT is reliable everywhere.

"Cup!" Linh says into the phone, still holding the button.

She releases. The waveform freezes. A brief processing beat — the audio is sent to Google Cloud STT (en-US) for transcription. The ASR returns: `"cup"`. Exact match against the expected word.

Three gold stars cascade onto the screen: ⭐⭐⭐. The mascot cheers:

*"Tuyệt vời! Giỏi lắm!"*
("Wonderful! Great job!")

The card's mastery indicator updates — one small star filled in out of five. The pronunciation was clear enough that a speech-to-text engine understood it on the first try. Per the product's pedagogical philosophy (§3.2): "If the ASR model transcribes the correct word from the child's speech, the pronunciation is good enough. If Google STT can understand the child, a native speaker probably can too."

> 🗺️ **Flow mapping** — This is §3.2 Speech: ASR-as-pronunciation-judge, and §4.2 Primary Flow step 5: "'Say it!' prompt → child holds PTT button and speaks → ASR match check → stars awarded." The full pronunciation flow: auto-play TTS on reveal → "Say it!" prompt with phonetic guide → PTT hold → ASR transcription → match check → star rating → mastery update.

### Back to the world

The stars dissolve. The card slides down and away, tucking itself into the 📖 Collection icon at the bottom of the screen with a small animation — Linh can see where it went. The camera viewfinder returns, live and ready. The point counter reads "10 pts." The streak flame now shows "1." The mission bar at the bottom, which Linh hasn't consciously noticed, has a small checkmark.

Linh is back where she started — looking at the world through the camera. But now she knows the game. She looks left and right across the kitchen, eyes wide, already hunting for the next thing to capture.

Mom, watching from across the table, sees the point counter and smiles. Later tonight, she'll check the parent dashboard (§7) and see a single entry in the activity feed: one white-bordered Common card, a cup, three stars on pronunciation, captured at 4:47 PM. A small push notification had already arrived on her phone: "Linh just started exploring! She found: 🥤 cup."

> 💡 **Design principle — Collection & gamification.** The entire interaction — photograph, reveal, pronounce, earn — mirrors the Pokémon Go loop: explore → spot → catch → earn → explore again. The vocabulary learning is the vehicle; the collection mechanic is the engine. From Linh's perspective, she isn't studying English. She is catching words and earning points. The fact that she just learned the English word for "cup" and practiced saying it aloud is, from her seven-year-old point of view, incidental to the thrill of the card appearing with a shimmer and the stars cascading down the screen.

---

## Session Summary

| Metric                     | Before session | After session       |
| -------------------------- | -------------- | ------------------- |
| **Total captures**         | 0              | 1                   |
| **Unique words**           | 0              | 1 ("cup")           |
| **Points**                 | 0              | 10                  |
| **Level**                  | 1 (Beginner Explorer) | 1 (Beginner Explorer) |
| **XP toward next level**   | 0 / 500        | 10 / 500            |
| **Streak**                 | 0 days         | 1 day               |
| **Cards at mastery 1+**    | 0              | 1                   |
| **Categories unlocked**    | 0              | 1 (Household)       |
| **Missions completed**     | 0              | 0 (first capture mission is implicit, not a tracked mission) |
| **Onboarding status**      | Not started    | Complete            |
| **Time elapsed (onboarding + first capture)** | — | ~55 seconds |

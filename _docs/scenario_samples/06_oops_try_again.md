# Scenario 6 — "Oops, Try Again!"

| Field | Detail |
|-------|--------|
| **Character** | Bảo, age 6, Grade 1, learning English |
| **Profile** | Level 3 Beginner Explorer · 12 words captured · 🔥 2-day streak |
| **Setting** | In the garden at home, late afternoon, dad sitting on a plastic chair nearby reading the news on his phone |
| **Flow mapping** | §3.1 Vision (confidence/retry) · §3.2 Speech/ASR (pronunciation failures) · §2.7 Audio-first UX |
| **Sections covered** | Blurry photo recovery, vision confidence threshold, mascot-led error communication, pronunciation retry loop (3 attempts), progressive star rating, phonetic guide + mouth diagram, successful recovery, confidence-building follow-up capture |

---

## Context

Bảo is the youngest child in our scenario set. He turned six four months ago. He can write his own name and sound out simple Vietnamese words, but reading is still a slow, effortful process — each syllable a small negotiation between his eyes and his memory. He cannot read English at all. He does not need to. SnapLearn was built for him.

He has been using the app for five days. Twelve words live in his collection — common things from around the house and from the park near his apartment. A ball. A shoe. A dog. A tree. Each one captured with the careful seriousness of a six-year-old doing something important. Dad helped him set up the app on the first day and has not needed to help since. The rabbit avatar (the same one Linh chose in Scenario 1 — it is the most popular) sits in the top-left corner. The capture button pulses. Bảo knows exactly what to do with it.

This afternoon, dad said they could go into the garden. Bảo brought the phone.

---

## The Session

### The Blurry Bush

Bảo is standing near the garden wall, where a thick green bush grows up against the concrete. He holds the phone in both hands — it is large relative to his grip, and his thumbs barely reach the capture button. He frames the bush, or tries to. The phone tilts. The bush is close and fills the viewfinder with undifferentiated green. He taps the capture button.

The screen freezes on his photo. The sonar animation begins — concentric circles, the mascot squinting at the image with exaggerated curiosity. Behind the animation, the image travels to the AI vision pipeline. The multimodal LLM examines what Bảo sent: a wall of green blur, one branch vaguely in focus, the rest a wash of overlapping leaves rendered soft by motion and proximity. The response comes back:

```json
{
  "object_vi": "bụi cây",
  "object_en": "bush",
  "confidence": 0.43
}
```

Confidence: 0.43. Below the 0.7 threshold. The system cannot reliably tell whether this is a bush, a hedge, a close-up of a single leaf, or a poorly lit photo of broccoli. It does not guess. It does not display the card. It does not show Bảo an error message.

What happens instead is this: the sonar animation dissolves, and the mascot appears center-screen — not the small corner version, but the full-body illustration. The mascot is tilting its head, one paw raised to its chin, eyes scrunched in a friendly, exaggerated squint. The expression says *I'm trying really hard to see, but I can't quite make it out*. It is drawn the way a picture book character would be drawn — soft lines, round shapes, maximum legibility at a glance.

And then the voice:

*"Hmm, mình chưa rõ lắm — thử lại gần hơn nhé!"*
("Hmm, I'm not sure — try getting closer!")

The voice is gentle. Not apologetic, not robotic, not a system error notification. It sounds like an older friend squinting at something far away and suggesting you both walk a little closer. The tone goes up at the end — a question, an invitation, not an instruction.

Below the mascot illustration, a single round button appears: a camera icon with a small circular arrow around it. The retry button. No text label. Just the icon, pulsing softly, waiting for Bảo's thumb.

> 🔊 **Audio-first moment:** There is no text error message anywhere on this screen. No "Error: image quality too low." No "Please try again with a clearer photo." A six-year-old who cannot read would gain nothing from such text. Instead, the error state is communicated entirely through three channels: (1) the mascot's expressive illustration, (2) the mascot's spoken Vietnamese, and (3) a single, obvious retry icon. Bảo understands immediately what happened and what to do next. He does not feel confused. He does not feel like he failed. The mascot is the one who couldn't see — not Bảo who did something wrong.

> 💡 **Design principle — Error states as character moments (§2.7 + §3.1):** Every error state in SnapLearn is an opportunity for the mascot to express personality. The blurry-photo state is not a system dialog — it is the mascot squinting, struggling, asking for help. The child's relationship with the mascot deepens through these small failures. The mascot is fallible, endearing, trying its best. This is by design. A perfect mascot is a tool. A mascot that sometimes can't see clearly is a friend.

Bảo does not hesitate. He taps the retry button. The camera viewfinder returns. This time, he takes a small step back. The bush comes into focus — distinct leaves, the shape of the whole plant visible against the garden wall. He holds the phone as steady as a six-year-old can, takes a breath the way dad told him to when drawing a straight line, and taps the capture button.

The sonar animation plays again. This time the confidence comes back:

```json
{
  "object_vi": "bụi cây",
  "object_en": "bush",
  "phonetic_en": "/bʊʃ/",
  "category": "nature",
  "fun_fact_vi": "Một số bụi cây có thể sống hơn 100 năm!",
  "difficulty_en": 2,
  "confidence": 0.89
}
```

Confidence: 0.89. Well above threshold. The card is ready.

A white shimmer. Common ⚪. The card rises from the bottom of the screen — Bảo's second photograph, the clear one, framed and cropped. The bush against the wall, green and distinct.

The mascot is back to its cheerful self, bouncing:

*"Đây là bụi cây. Tiếng Anh là:"*
("This is a bush. In English:")

And the English TTS, clear and measured:

**"Bush."**

The word appears on the card. Common ⚪ · 10 pts. The point counter ticks upward. Bảo's thirteenth word.

> 🗺️ **Flow mapping — §3.1 Vision confidence threshold:** The retry flow follows the product vision's specification exactly. Confidence below 0.7 triggers the mascot-led retry prompt. Confidence above 0.7 proceeds to card reveal. The system never shows a low-confidence guess — it asks the child to try again. This prevents the pedagogically harmful case where a child learns the wrong word for an object because the AI guessed incorrectly. Better to retry than to misteach.

---

### Learning "Bush"

The card is on screen. The TTS has played. Now comes the part that will test Bảo and, more importantly, test the app's ability to guide him through difficulty without breaking his spirit.

The "Say it!" prompt appears — the microphone button pulsing at the bottom of the card, the mascot's voice bright and inviting:

*"Nào, nói thử đi!"*
("Now, try saying it!")

The phonetic guide displays beside the English word: **/bʊʃ/**. Bảo cannot read phonetic notation. He does not need to — the guide is there for an older child or a parent looking over a shoulder. For Bảo, the learning happens through his ears. He heard "bush" three seconds ago. He knows what it sounds like. He presses the PTT button with his thumb and holds.

"Boos," he says. Short, sharp, the vowel too far forward, the final consonant dropped entirely. He releases the button.

The audio travels to Google Cloud STT. The transcription comes back: `"boo"` — or possibly `"boost"` — neither matching the target word `"bush"`. The ASR matching logic runs:

- Expected: "bush"
- Received: no match
- Result: **⭐** (1 star — attempt acknowledged, no match)

A single small star appears on screen, not with a cascade but with a gentle float — it drifts down like a leaf. The star is gold. It is still a star. One star is not zero stars. One star is not a red X. One star is not a buzzer sound. One star means *you tried, and that counts*.

The mascot appears, expression warm, one paw raised in a "let's try again" gesture:

*"Hãy nghe lại nhé!"*
("Let's listen again!")

The English TTS replays, slower this time, with a slight pause between the onset and the vowel: **"Bush."**

And now something new appears on the card — a small illustration beside the phonetic guide. It is a simple, child-friendly diagram showing a mouth in profile: lips slightly rounded, pushed forward. The /ʊ/ vowel shape. Below it, the /ʃ/ — lips pursed, air flowing. It is not an anatomical diagram. It is a cartoon mouth, drawn in the same style as the mascot, making the shape of the sound. Bảo looks at it the way he might look at a picture in a book — not reading, just seeing a mouth making a face.

> 🔊 **Audio-first moment:** The retry flow after a failed pronunciation attempt is audio-led at every step. The mascot speaks the encouragement in Vietnamese. The TTS replays the target word in English. The phonetic guide and mouth diagram are visual supplements, not requirements — a child who is not looking at the screen would still receive the critical information (the correct pronunciation) through audio alone. The mouth diagram is a bonus for children who learn visually, not a gate for children who don't.

> 💡 **Design principle — Stars, never strikes (§3.2):** The star system is deliberately designed so that every attempt earns at least one star. There is no zero-star state. There is no failure animation. There is no sad sound effect. The difference between a poor attempt and a perfect one is the *number* of stars, not the *presence or absence* of reward. A six-year-old who says "boos" instead of "bush" still sees gold on the screen. The app is telling him: I heard you. You tried. Let's try again. This is not participation-trophy logic — it is language acquisition pedagogy. Correction without discouragement is the foundation of communicative language teaching.

The "Say it!" button pulses again. Bảo is already pressing it. He heard the TTS replay. He saw the mouth shape. He pushes his lips forward the way the cartoon mouth does.

"Boosh," he says. Closer. The vowel is rounder now, the final consonant is present — a /ʃ/ sound, soft and sibilant. He releases the button.

ASR returns: `"boosh"` — or possibly `"bush"` with low confidence. The fuzzy matching logic runs:

- Expected: "bush"
- Received: partial/fuzzy match (phonetically close, ASR confidence between 0.4–0.7)
- Result: **⭐⭐** (2 stars — recognizable attempt, close but not exact)

Two stars float down, side by side. The mascot bounces:

*"Gần đúng rồi! Giỏi lắm!"*
("Almost! Good job!")

The TTS replays one more time: **"Bush."** The mouth diagram stays on screen. The "Say it!" button pulses for a third and final attempt.

> 🗺️ **Flow mapping — §3.2 ASR matching logic:** The three-tier star system maps directly to ASR confidence: exact match (high confidence transcription matches target) → ⭐⭐⭐; partial/fuzzy match (transcription is phonetically close or ASR confidence is moderate) → ⭐⭐; no match (transcription is a different word entirely or ASR fails) → ⭐. After ⭐ or ⭐⭐, the TTS automatically replays and the phonetic guide appears. After ⭐⭐⭐, celebration plays immediately. The child never needs to manually request a replay — the app knows when to offer help.

Bảo presses the button a third time. He has now heard "bush" spoken clearly three times — once on the initial card reveal, once after the first attempt, once after the second. The sound is living in his ear. He pushes his lips forward. He makes the /b/. He rounds the vowel. He lets the /ʃ/ hiss out softly.

"Bush," he says.

He releases the button. The audio travels. The ASR processes. The transcription returns: `"bush"`. Exact match. High confidence.

**⭐⭐⭐**

Three gold stars burst from the center of the screen — not floating gently this time but exploding outward in a shower of light. Confetti rains from the top of the screen. The mascot leaps into the air, arms raised, face split in a wide-open grin:

*"Tuyệt vời! Bạn nói đúng rồi!"*
("Amazing! You said it right!")

A triumphant chime plays — the same one Linh heard in Scenario 1 when she nailed "cup" on the first try. Bảo did not nail it on the first try. Bảo needed three attempts. He gets the same chime. He gets the same stars. He gets the same celebration. The app does not remember that he struggled. The app remembers that he succeeded.

The mastery indicator on the card updates: **1/5**. The bush is his.

> 💡 **Design principle — The destination matters more than the path (§3.2):** A child who gets ⭐⭐⭐ on the first attempt and a child who gets ⭐⭐⭐ on the third attempt both end up at the same mastery increment. The progressive retry flow (⭐ → ⭐⭐ → ⭐⭐⭐) is designed to build *within-session momentum* — each attempt is better than the last, and the child can feel their own improvement in real time. But the final reward is identical. Bảo is not penalized for needing practice. He is rewarded for completing it.

> **Note on the 3-attempt limit (§3.2):** If all three attempts had failed — if Bảo had received ⭐ or ⭐⭐ on every try without reaching ⭐⭐⭐ — the app would not loop indefinitely. After the third sub-⭐⭐⭐ attempt, the mascot would say warmly: *"Không sao đâu! Mình sẽ luyện lại từ này sau nhé!"* ("No worries! We'll practice this one again later!") The card would still be added to the collection at mastery 0/5, and it would surface again in spaced review. The child moves on. No child is ever stuck. In this scenario, Bảo does not hit the limit — he succeeds on attempt three. But the safety net exists for the attempt that doesn't land.

---

### Sweet Success with "Flower"

The card slides away. The camera viewfinder returns. Bảo is still in the garden. Dad glances up from his phone, sees Bảo pointing the camera at something new, and goes back to reading. He does not need to intervene. He has not needed to intervene once during this session. The app is doing what it was designed to do — guide a six-year-old through the entire loop, ears and taps, without requiring an adult's hands or an adult's literacy.

Bảo has spotted a flower. A red hibiscus, growing in a pot near the garden gate. He walks over, bends down slightly, and frames it in the viewfinder. The flower is bright and clear against the dark green leaves. He taps the capture button. His grip is steadier now — maybe because the flower is at a better angle, maybe because he just learned that closer and clearer works better.

The sonar animation plays. The confidence comes back high — 0.94. The card rises.

A white shimmer. Common ⚪.

*"Đây là hoa. Tiếng Anh là:"*
("This is a flower. In English:")

**"Flower."**

**hoa** → **flower** · /ˈflaʊ.ər/ · Common ⚪ · 10 pts

The "Say it!" prompt appears. The microphone pulses. Bảo presses and holds without hesitating — he is familiar with this rhythm now, this small ritual of listening and repeating that sits at the heart of every capture.

"Flower," he says. The /fl/ onset is slightly soft, the diphthong a little narrow, but the word is unmistakably "flower." A Vietnamese six-year-old saying an English word he has never said before, and saying it well enough that a speech-to-text engine trained on native English speakers transcribes it correctly on the first pass.

ASR returns: `"flower"`. Exact match.

⭐⭐⭐.

Three stars. First try.

Bảo smiles — a different smile than the one after "bush." The bush smile was relief, accomplishment, the satisfaction of having climbed a small hill. The flower smile is ease. Confidence. He said a new word and he got it right immediately. The contrast between the two captures — three attempts for "bush," one attempt for "flower" — is the contrast between difficulty and fluency, and Bảo can feel the difference even if he cannot name it.

*"Tuyệt vời! Giỏi lắm!"*
("Wonderful! Great job!")

The mascot cheers. Points tick upward. The collection counter reads 14. The camera returns. The garden is full of things.

> 🔊 **Audio-first moment:** Across the entire session — the blurry photo, the three pronunciation attempts for "bush," the first-try success with "flower" — Bảo has not read a single word. Not one. Every instruction, every piece of feedback, every celebration, every error recovery has arrived through the mascot's Vietnamese voice, the English TTS, sound effects, and visual illustrations. The text on the cards exists for children who can read it and for parents who glance at the screen. For Bảo, it is decoration. The app works without it. This is what §2.7 Audio-first UX means in practice: not "we also have audio," but "audio is the entire interface, and text is a progressive enhancement."

> 💡 **Design principle — Confidence through contrast:** The session arc — struggle with "bush," then ease with "flower" — is not engineered by the app. It is a natural consequence of phonetic difficulty (the /ʊʃ/ in "bush" is genuinely harder for Vietnamese speakers than the /flaʊ.ər/ in "flower," where the diphthong maps more closely to Vietnamese vowel patterns). But the effect on the child is real and important. Bảo ends the session on a high. His last memory is not the struggle — it is the success. This is the power of a capture-based system where the child controls what they photograph: the sequence of difficulty is organic, varied, and almost always ends with something the child can do well, simply because most common words are phonetically accessible.

---

## ASR Matching Reference

The pronunciation scoring system used throughout this scenario, as specified in §3.2:

| ASR Result | Star Rating | Visual | Mascot Response | What Happens Next |
|-----------|-------------|--------|-----------------|-------------------|
| Exact match (high confidence) | ⭐⭐⭐ | Stars explode, confetti, celebration | *"Tuyệt vời!"* — ecstatic | Mastery +1, card complete |
| Partial/fuzzy match (moderate confidence) | ⭐⭐ | Stars float gently, warm tone | *"Gần đúng rồi!"* — encouraging | TTS replays + phonetic guide shown |
| No match (wrong word or fail) | ⭐ | Single star drifts like a leaf | *"Hãy nghe lại nhé!"* — gentle | TTS replays + phonetic guide + mouth diagram |
| Three sub-⭐⭐⭐ attempts | — | Mascot hugs the card | *"Không sao đâu! Mình sẽ luyện lại sau nhé!"* — warm, forward-looking | Card saved at mastery 0, surfaces in spaced review |

---

## Session Summary

| Metric | Before session | After session |
|--------|---------------|---------------|
| **Total captures** | 12 | 14 |
| **Unique words** | 12 | 14 (bush, flower) |
| **Points** | 98 pts | 118 pts (+20) |
| **Level** | 3 (Beginner Explorer) | 3 (Beginner Explorer) |
| **XP toward next level** | 98 / 200 | 118 / 200 |
| **Streak** | 🔥 2 days | 🔥 3 days |
| **Cards at mastery 1+** | 10 | 12 |
| **Categories unlocked** | 3 (Household, Animals, Nature) | 3 (Nature expanded) |
| **Blurry photo retries** | — | 1 (bush, succeeded on retry) |
| **Pronunciation attempts** | — | 4 total (bush: 3 attempts, flower: 1 attempt) |
| **Pronunciation first-try rate** | — | 50% this session (1 of 2 words) |
| **Adult assistance required** | — | None |
| **Reading required** | — | None |
| **Session duration** | — | ~4 minutes |
| **Session arc** | — | Struggle → mastery → confidence |

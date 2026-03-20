# Scenario 3 — "Pronunciation Power-Up"

| Field               | Detail                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Character**       | Hà, age 8, Grade 3                                                                          |
| **Target language** | Mandarin Chinese                                                                            |
| **Profile**         | Level 9 · 62 words captured · 猫 (māo / cat) at mastery level 4/5                          |
| **Setting**         | At home after dinner, family tablet on the living-room sofa                                  |
| **Flow mapping**    | §2.3 Collection Mechanics · §3.2 Speech / ASR-as-pronunciation-judge                        |
| **Sections covered**| Collection Book browsing · TTS pronunciation sequence · PTT + ASR matching · Card evolution  |
| **Session duration**| ~8 minutes                                                                                   |

---

## Context

The first two scenarios showed children outdoors — Linh discovering her very first word in the kitchen, Minh hunting through the noise and heat of Bến Thành market. Scenario 3 is the opposite. It is evening. The house is quiet. Hà has already eaten dinner, already brushed her teeth, and now she is sitting cross-legged on the sofa with the family tablet balanced on her knees. The TV is off. Her little brother is playing with Lego on the floor. This is the kind of moment that SnapLearn needs to fill: the calm, unhurried ten minutes between dinner and bedtime when a child might scroll aimlessly through videos — or might, instead, open a book of words she has collected herself and feel the satisfaction of watching her own progress grow.

Hà is not capturing anything tonight. She is reviewing. And the app must make that feel just as rewarding as the thrill of a new catch.

---

## Browsing the Collection

Hà taps the **📖** icon on the bottom navigation bar. A soft chime sounds. The Collection Book opens.

> 🗺️ **Flow mapping — §2.3 Collection Mechanics**
> The Collection Book is the second most-accessed screen after the camera viewfinder. It organizes every captured word by category and surfaces mastery progress, completion percentages, and evolution status. It is designed to be browsable and beautiful — a gallery the child is proud to show off.

The screen shows a grid of category tiles: **Animals**, **Food**, **Nature**, **School**, **Home**, **Vehicles**. Each tile has a small circular progress ring indicating completion. Hà's Animals tile shows **9/12** — she is three words away from completing the category page and earning the Animal Master badge. The tile pulses gently, drawing her attention.

She taps Animals.

The category page fans open like a collector's album. Nine cards are face-up, rendered in full color with their rarity badges glowing softly. Three slots are empty — grey silhouettes with a small **?** icon, hinting at words she has not yet found. The mascot's voice narrates as the page loads:

*"Bộ sưu tập Động vật của bạn! Chín trên mười hai — sắp đầy rồi!"*
("Your Animal collection! Nine out of twelve — almost full!")

> 🔊 **Audio-first moment**
> The Collection Book narrates its own state. Hà does not need to read "9/12" — she hears it. The completion count is spoken with rising excitement in the TTS voice, reinforcing how close she is to a milestone.

Hà scans her cards. There is 狗 (gǒu / dog) at mastery 5 — fully evolved, bordered in gold, tiny animated sparkles drifting upward from its corners. There is 鸟 (niǎo / bird) at mastery 2, still in its basic frame. And there, near the bottom-right corner of the grid, is **猫** (māo / cat). Mastery level 4. One step away from evolution.

The card's border has a faint amber glow — the app's visual cue that a card is one successful practice away from evolving. Hà has seen this glow before, on her dog card, right before it transformed. She knows what it means.

She taps 猫.

---

## The Final Practice

The card expands to fill the screen. Hà's own photograph fills the top half — a tabby cat she spotted at the park near her school two weeks ago, mid-yawn, one paw stretched out. Below the photo, the card displays three layers of text:

| Layer     | Content      |
| --------- | ------------ |
| Character | **猫**       |
| Pinyin    | māo          |
| Vietnamese| con mèo      |

The moment the card opens, the TTS sequence begins automatically. This is not optional — it is the heartbeat of the audio-first design.

> 🔊 **Audio-first moment — TTS pronunciation sequence**
> Every card tap triggers a three-part audio sequence. Vietnamese comes first (the child's native language, the scaffolding), followed by a bridging phrase, followed by the target language word. The child *hears* the word in context before they are asked to produce it. This sequence — native → bridge → target — is consistent across every card, every session, building an auditory routine the child can rely on without thinking.

The tablet speaks:

1. *"Con mèo"* — Vietnamese, in the warm familiar voice of the mascot
2. *"Tiếng Trung là:"* — ("In Chinese it's:") — the scaffolding bridge, still in Vietnamese
3. *"Māo"* — Chinese, in a clear native-speaker TTS voice, with the first tone held just slightly longer than natural speech for emphasis

A beat of silence. Then the prompt appears: a large **🎤** icon pulses in the center of the screen, and the mascot says:

*"Đến lượt bạn! Nói đi!"*
("Your turn! Say it!")

> 💡 **Design principle — Spaced repetition as "powering up," not studying**
> Hà does not think of this as a review session. She thinks of it as powering up her cat card. The language of the app reinforces this framing at every turn: "practice" is "power up," mastery levels are "stars," and the evolution mechanic gives the practice a destination that feels like a reward, not an assignment. This is §5.1's pedagogical framework made tangible — intrinsic motivation via collection, with spaced repetition embedded invisibly.

Hà presses and holds the push-to-talk button. The screen dims slightly around the edges, and a subtle recording indicator — a pulsing red ring around the microphone icon — confirms the app is listening. She takes a small breath.

"Māo."

She releases the button. The audio is captured cleanly — the quiet living room, the tablet's close microphone, the absence of market noise or playground chatter. This is the advantage of the indoor practice session: pronunciation attempts here are crisp, unambiguous, ideal for ASR processing.

The audio packet travels to Google Cloud STT (zh-CN). The ASR engine receives a short, clear utterance. It transcribes: **猫 (māo)**. Exact match. First tone correctly identified.

> 🗺️ **Flow mapping — §3.2 ASR fuzzy matching on Chinese tones**
> For non-evolved cards (mastery 0–4), the ASR matching logic is **tone-insensitive** — if the child says "mao" with any tone, it counts as a match, because the pedagogical goal at this stage is word-level recognition and confidence-building. However, for the **evolution capture** — the attempt that would push mastery from 4 to 5 — the system switches to **tone-sensitive** matching. The child must produce the correct tone to earn the evolution. This creates a gentle difficulty ramp: easy practice builds confidence, and the final "boss battle" demands precision. Hà's first tone on māo is correct, so both checks pass.

Three gold stars fly onto the screen in sequence — ⭐⭐⭐ — each accompanied by a bright chime that rises in pitch. The mascot cheers:

*"Tuyệt vời! Phát âm chuẩn luôn!"*
("Amazing! Perfect pronunciation!")

And then the mastery counter ticks over. **4 → 5.** Five out of five.

The screen holds still for one deliberate beat — a half-second of anticipation, the app's way of saying *something is about to happen* — and then the card begins to change.

---

## Evolution!

The transformation is not subtle. It is designed to be the single most emotionally satisfying moment in the entire mastery loop — the payoff for five successful pronunciation attempts spread across different sessions, the reward that makes a child want to power up every card in her collection.

The card's border flashes white, then melts into **gold**. The gold border is not flat; it has a dimensional sheen, like foil on a trading card held up to the light. Tiny animated sparkles begin to drift upward from the card's edges — the same effect Hà has seen on her evolved 狗 card, but now it is happening live, right now, to *her* cat card. A short celebratory jingle plays, distinct from the normal star chimes — a melody that Hà will come to associate specifically with evolution, a Pavlovian trigger for pride.

The mascot's voice rises with genuine excitement:

*"Wow! Thẻ của bạn đã tiến hóa! 猫 bây giờ là thẻ vàng!"*
("Wow! Your card has evolved! 猫 is now a gold card!")

> 💡 **Design principle — Card evolution as emotional climax**
> Evolution is the culmination of the collection-and-mastery loop described in §2.3. It is deliberately modeled on the evolution mechanic in Pokémon: a creature you have invested time in transforms into something visually superior, permanently. The gold border and sparkle effect are not cosmetic — they are status symbols within the Collection Book, visible to the child every time she browses. Evolved cards sit alongside un-evolved cards, creating a visual contrast that motivates further practice. The evolution animation itself is 3–4 seconds of pure spectacle — long enough to feel momentous, short enough not to interrupt flow.

The gold border settles. The sparkles slow to a gentle drift. And now, two new elements appear on the card that were not there before.

**Fun fact unlock:**

A small speech bubble emerges below the card image, containing text in Vietnamese:

*"Mèo có thể ngủ 16 giờ mỗi ngày!"*
("Cats can sleep 16 hours a day!")

The mascot reads it aloud, in Vietnamese, with an exaggerated tone of surprise. Hà giggles. She looks over at her brother on the floor and says, "Did you know cats sleep sixteen hours?" He ignores her. She does not care.

> 💡 **Design principle — Fun facts in the scaffolding language**
> The fun fact is delivered in Vietnamese, not Chinese. This is intentional. The fun fact serves two purposes: (1) it rewards evolution with a piece of genuinely interesting content, and (2) it keeps the child's native language as the frame of understanding. At age 8, Hà cannot read a fun fact in Chinese. Delivering it in Vietnamese ensures she actually absorbs it, talks about it with family, and associates the evolved card with something memorable. The Chinese language learning stays focused on the word and sentence level; world-knowledge stays in Vietnamese.

**Sentence unlock:**

Below the fun fact, a new section appears labeled with a small 📝 icon:

**这是一只猫 — Zhè shì yī zhī māo**

And underneath, the Vietnamese translation:

*"Đây là một con mèo"* ("This is a cat")

The TTS plays the full Chinese sentence slowly, with natural pauses between each word. Then the Vietnamese translation. Hà mouths along with the Chinese sentence silently, not ready to try it aloud, but absorbing the rhythm of it.

> 🗺️ **Flow mapping — Sentence unlock extends learning beyond single words**
> The sentence is the bridge between vocabulary collection (§2.1–§2.3) and actual language use. It appears only on evolved cards — a reward for mastery, not a default feature. This gating is deliberate: if every card showed sentences from the start, the screen would feel cluttered and the child would ignore them. By locking sentences behind evolution, the app ensures that by the time the child sees a sentence, she has already internalized the word deeply enough to understand it in context. The sentence itself is simple and formulaic — "This is a [noun]" — appropriate for the HSK 1 level referenced in §5.2.

Hà stares at the evolved card for a few seconds. The gold border. The sparkles. The fun fact. The sentence. This card is different now. It is *hers* in a way it was not before — she earned every star, across multiple evenings just like this one, and now it has transformed. She swipes back to the Animals category grid.

The evolved 猫 card sits in the grid, gold-bordered and sparkling, next to her other evolved card (狗) and seven un-evolved cards. The visual contrast is immediate: two gold cards glowing among seven plain ones. Seven more to evolve. Three more animals to find.

---

## Winding Down

Hà taps 鸟 (niǎo / bird), mastery 2. The TTS sequence plays:

*"Con chim. Tiếng Trung là: niǎo."*

She presses and holds PTT. "Niǎo." Releases. The ASR processes. Partial match — the third tone's dip was not quite deep enough, but at mastery level 2 the system is tone-insensitive, so it counts. ⭐⭐⭐. Mastery ticks to 3.

She taps 兔子 (tùzi / rabbit), mastery 1. Listens. Practices. "Tùzi." ⭐⭐ — the ASR caught "tuzi" but the tone was flat. The mascot encourages her:

*"Gần đúng rồi! Nghe lại nhé!"*
("Almost! Listen again!")

The TTS replays *"tùzi"* with the fourth tone exaggerated slightly. Hà tries again. "Tùzi." ⭐⭐⭐ this time. Mastery to 2.

She browses a few more cards — flipping through Food, tapping 苹果 (píngguǒ / apple) to hear it again without practicing, just listening — and then she closes the app. Eight minutes. No new captures. No missions completed. No leaderboard movement. Just a quiet evening with her collection, one evolution earned, two cards powered up, and the faint glow of gold on a cat that sleeps sixteen hours a day.

> 💡 **Design principle — The Collection Book as "quiet practice" mode**
> Not every session needs to be an expedition. The Collection Book provides a low-energy, self-directed practice mode that complements the high-energy outdoor capture mode. A child can browse, listen, and practice at their own pace, in their own space, with no missions pressuring them and no timer running. This is where spaced repetition actually happens — not as a forced review queue, but as a child voluntarily revisiting words she cares about because her cards are beautiful and she wants them all to evolve. The quiet session is also where ASR performs best: no background noise, close microphone distance, calm and focused speech. Indoor practice produces the cleanest pronunciation data, which feeds back into more accurate mastery assessments.

---

## Session Summary

| Metric                    | Value                                                                 |
| ------------------------- | --------------------------------------------------------------------- |
| **Session type**          | Collection Book review (no captures)                                  |
| **Duration**              | ~8 minutes                                                            |
| **Words practiced**       | 3 (猫, 鸟, 兔子)                                                      |
| **Pronunciation attempts**| 4 (猫 x1, 鸟 x1, 兔子 x2)                                            |
| **Mastery changes**       | 猫: 4 → 5 (EVOLVED) · 鸟: 2 → 3 · 兔子: 1 → 2                       |
| **XP earned**             | 0 (mastery practice awards stars, not XP — XP comes from captures)   |
| **Cards evolved**         | 1 (猫 — gold border, fun fact unlocked, sentence unlocked)            |
| **New words captured**    | 0                                                                     |
| **Mission progress**      | No change                                                             |
| **Leaderboard movement**  | No change                                                             |
| **Key product moments**   | Evolution animation · Fun fact delivery · Sentence unlock · Quiet browse |

---

## Product & Technical Notes

### Chinese Card Display
All Chinese vocabulary cards display three layers: **character** (猫), **pinyin** (māo), and **Vietnamese** (con mèo). The character is rendered largest, as the primary visual anchor. Pinyin appears below in a smaller but legible font. Vietnamese appears at the bottom as the scaffolding reference. On evolved cards, the fun fact and sentence appear as expandable sections beneath the core card content.

### TTS Sequence for Chinese
The TTS sequence for Chinese-learning users follows a fixed pattern: Vietnamese word → Vietnamese bridge phrase (*"Tiếng Trung là:"*) → Chinese word. This mirrors the English-learning sequence (*"Tiếng Anh là:"*) described in §3.2. Vietnamese always comes first because it is the child's language of understanding. The Chinese TTS voice uses Azure Neural TTS (zh-CN) for natural tonal pronunciation.

### ASR Tone Sensitivity Ramp
| Mastery level | Tone matching | Rationale |
| ------------- | ------------- | --------- |
| 0–4           | Tone-insensitive (pinyin syllable match only) | Build confidence; reward word-level recognition |
| 5 (evolution attempt) | Tone-sensitive (full pinyin with tone match) | Evolution is the "boss battle" — demand precision |

This ramp is specific to tonal languages (Chinese). For English, the difficulty ramp is implemented through phoneme-level fuzzy matching thresholds that tighten as mastery increases.

### Evolution Requirements
A card evolves at mastery level 5. Each mastery increment requires a successful pronunciation (⭐⭐⭐) in a **separate session** — the child cannot grind all five stars in one sitting. This enforces the spaced repetition principle described in §5.1 without exposing the mechanism. From the child's perspective, the rule is simple: "Practice your card once each day, and it will evolve in about a week."

### Evolution Unlocks
| Unlock | Content | Language |
| ------ | ------- | -------- |
| Visual upgrade | Gold border + animated sparkle effect | N/A (visual) |
| Fun fact | A short, interesting fact about the object | Vietnamese (scaffolding language) |
| Sentence | A simple sentence using the word, with pinyin and Vietnamese translation | Target language + Vietnamese |

Fun facts and sentences are generated by the LLM during initial capture (see §3.1 vision prompt — the `fun_fact_vi` field) and cached. They are not generated at evolution time — they are *revealed* at evolution time, reducing latency to zero for the evolution moment.

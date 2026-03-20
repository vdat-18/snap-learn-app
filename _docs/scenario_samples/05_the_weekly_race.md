# Scenario 5 — "The Weekly Race"

## Metadata

| Field                | Detail                                                                          |
| -------------------- | ------------------------------------------------------------------------------- |
| **Character**        | Mai, age 8, Grade 3                                                             |
| **Profile**          | Level 10 Vocab Hunter · 71 words · #4 on class leaderboard, 30 pts behind #3   |
| **Target language**  | English                                                                         |
| **Setting**          | Sunday evening at home, end of the week                                         |
| **Flow mapping**     | §2.5 Leaderboard → §2.4 Missions → §4.2 Primary Flow (Capture) → §7.5 Parent Notifications |
| **Sections covered** | Class leaderboard view, weekly expedition progress, capture flow, mission completion, badge award, leaderboard rank change, parent weekly summary notification |

---

## The Story

### Checking the Board

It is Sunday evening. Mai is sitting cross-legged on the sofa with her phone balanced on one knee, dinner settling in her stomach, the week almost over. She opens SnapLearn. The camera viewfinder appears — the living room ceiling fan, the edge of the TV cabinet — but she does not capture anything. She taps the 🏆 icon in the bottom navigation bar.

The leaderboard slides into view. The mascot's voice accompanies it, casual and warm, like a sports commentator who genuinely likes everyone on the field:

*"Bảng xếp hạng lớp tuần này!"*
("This week's class leaderboard!")

The screen shows a clean vertical list. At the top, three podium slots with small avatar icons and weekly point totals. Below, the rest of the class in descending order. Mai's rabbit avatar sits at position four. She can see everything she needs without reading a single number — her avatar's vertical position on the screen tells the whole story. But she reads the numbers anyway, because Mai is the kind of eight-year-old who reads the numbers.

| Rank | Avatar    | Name         | Points this week |
| ---- | --------- | ------------ | ---------------- |
| #1   | 🐯 Tiger  | Tuấn         | 410              |
| #2   | 🐬 Dolphin| Hương        | 385              |
| #3   | 🐱 Cat    | Lan          | 340              |
| **#4** | **🐰 Rabbit** | **Mai** | **310**          |
| #5   | 🦜 Parrot | Đức          | 290              |

Thirty points. That is the gap between her and Lan. Mai chews her lip. Thirty points is not a canyon. Thirty points is a single Uncommon word and a completed mission.

> 🗺️ **Flow mapping** — This is §2.5 Leaderboard: "Toggle between class/friends/global/category views. See your rank, streak, and points this period." The class leaderboard is visible because Mai is Level 10 Vocab Hunter, which unlocks the friend leaderboard at Level 10 and class leaderboard at Level 20 — however, her school deployment grants class leaderboard access to all students in the program. The leaderboard shows weekly totals, not all-time, because of §2.5's seasonal reset principle: "Monthly leaderboard resets keep things fresh and give new players a chance."

> 💡 **Design principle — Social motivation without toxicity.** The leaderboard shows only classmates — people Mai knows, sits next to, trades jokes with at recess. This is not an anonymous global ranking that reduces children to numbers. It is a small, familiar competition where everyone's face is known. The gap between positions is visible but not punishing. There is no "you are losing" language. The mascot's narration is warm. The design creates aspiration, not anxiety.

Mai taps the "Category" tab at the top of the leaderboard. A horizontal row of category icons appears: Animals, Food, Kitchen, Nature, School, Household. She taps Kitchen. A different list appears. On this one, Mai is already #2 — she has captured eleven kitchen words this week. Only Hương has more, with thirteen.

*"Bạn đang hạng nhì từ vựng nhà bếp!"*
("You're ranked second in kitchen vocabulary!")

Mai smiles. She knows where the kitchen is.

> 💡 **Design principle — Category leaderboards let every child win.** Per §2.5: "'Most animals captured,' 'Most kitchen words,' etc. — so every child can find a leaderboard they can win." A child who lives near a park dominates Nature. A child whose grandmother runs a market dominates Food. Mai, who practices every evening after dinner, dominates Kitchen. The system creates multiple axes of success so that the overall leaderboard is not the only story.

### The Kitchen Sprint

Mai backs out of the leaderboard and taps the 🎯 Missions icon. Her active missions appear. The mascot reads the top one aloud:

*"Nhiệm vụ tuần: Chụp 5 từ trong nhà bếp!"*
("Weekly mission: Capture 5 words from the kitchen!")

A progress bar stretches across the mission card. Four of five segments are filled. Four words captured: `tủ lạnh` (refrigerator), `nồi cơm` (rice cooker), `đũa` (chopsticks), `bồn rửa` (sink). One segment remains empty. One word stands between Mai and 200 XP, a kitchen badge, and — she has already done the math — a realistic shot at passing Lan.

Mai unfolds herself from the sofa. She walks to the kitchen. Then she walks faster. Her mom, cleaning up after dinner, looks up and sees Mai enter with her phone raised like a periscope, scanning the countertop with the intensity of someone who has a plan.

The camera viewfinder is alive. Mai pans across the kitchen. The gas stove — already captured last Tuesday. The cutting board — captured on Wednesday. The rice cooker — one of her four mission words. She keeps scanning. Her eyes land on the microwave sitting on the counter beside the refrigerator, its digital clock blinking 7:42 PM.

She has never captured the microwave.

Mai steadies the phone and frames the shot. The microwave fills the viewfinder — boxy, silver-grey, its door handle catching the kitchen light. She taps the capture button.

The screen freezes on her photo. The mascot appears center-screen, squinting with theatrical curiosity, the dotted processing circle spinning around the microwave.

*"Hmm... bạn tìm thấy gì thế...?"*
("Hmm... what did you find...?")

Behind the animation, the image is compressed and sent to the AI vision pipeline. The multimodal LLM analyzes the photograph and returns structured JSON:

```json
{
  "object_vi": "lò vi sóng",
  "object_en": "microwave",
  "phonetic_en": "/ˈmaɪkrəweɪv/",
  "category": "kitchen",
  "fun_fact_vi": "Lò vi sóng được phát minh tình cờ bởi một kỹ sư đang làm việc với radar!",
  "difficulty_en": 3,
  "confidence": 0.94
}
```

Confidence 0.94 — well above the 0.7 threshold. The card is ready.

### The Reveal

The loading animation dissolves. From the bottom of the screen, a card slides upward with a soft green glow rippling along its edges — the Uncommon 🟢 rarity shimmer. Not the plain white of a Common word. Green. Mai's eyes widen slightly. She knows what green means.

The card fills the center of the screen. On it: Mai's photograph of the microwave, neatly cropped and framed. Below the photo, the Vietnamese word in large, friendly type: **lò vi sóng**. Below that, the English word: **microwave**. A small green circle with the 🟢 badge marks the rarity. The phonetic guide sits beside the English word: `/ˈmaɪkrəweɪv/`.

The mascot begins the scaffolding sequence:

*"Đây là lò vi sóng."*
("This is a microwave.")

A beat. The mascot shifts tone:

*"Tiếng Anh là:"*
("In English, it is:")

A different voice — the English TTS, clean and unhurried:

**"Microwave."**

The word pulses on the card as the audio plays. Twenty-five points appear in the counter at the top of the screen, ticking upward with a small chime. Uncommon 🟢 — twenty-five points. Mai's total for the week climbs from 310 to 335.

> 🔊 **Audio-first moment** — The card reveal follows the same scaffolding sequence as every capture: Vietnamese name → bridge phrase → English name, all auto-played via TTS. Mai hears the word before she reads it. The Vietnamese-first pedagogy is consistent whether the child is capturing their first word or their seventy-first. Per §3.2: "The child hears the card before they need to read it."

The "Say it!" prompt appears below the card. The microphone button pulses.

*"Nào, nói thử đi!"*
("Now, try saying it!")

Mai presses and holds the PTT button. The screen dims at the edges, the word enlarges, and the waveform animation begins.

"Microwave!" Mai says, leaning into the phone.

She releases the button. The waveform freezes. The audio is sent to Google Cloud STT for transcription. The ASR returns: `"microwave"`. Exact match.

Three gold stars cascade onto the screen: ⭐⭐⭐. The mascot cheers:

*"Tuyệt vời! Phát âm chuẩn luôn!"*
("Wonderful! Perfect pronunciation!")

The card's mastery indicator updates — one star filled out of five. Word seventy-one is in the collection.

### Victory

The stars have barely faded when the screen changes. The mission progress bar reappears at the bottom, and the fifth segment fills with a satisfying click-into-place animation. All five segments glow. The mission card flips.

*"Hoàn thành nhiệm vụ! Bạn đã khám phá nhà bếp!"*
("Mission complete! You've explored the kitchen!")

A badge materializes at the center of the screen: a small golden pan with a chef's hat, the Kitchen badge 🏅. It spins once, catches light, and settles into Mai's badge gallery. Below it, the XP counter ticks upward: +200 XP. The celebration animation is bigger than a single-capture celebration — confetti drifts from the top of the screen, the mascot does a small dance, and a triumphant jingle plays. This is not a quiet personal achievement. This is a fanfare.

> 🗺️ **Flow mapping** — This is §2.4 Missions, "Weekly expedition" type: "Capture 5 words from the kitchen → 200 XP + kitchen badge." The mission completion triggers independently of the capture flow — the capture awards its own points (25 for Uncommon), and the mission awards its bonus XP (200) on top. The two reward streams stack deliberately: the child feels the capture reward AND the mission reward as separate, compounding moments of satisfaction.

> 💡 **Design principle — Missions as strategy, not busywork.** Mai did not complete this mission by accident. She checked the leaderboard, identified the gap, reviewed her mission progress, calculated that one more kitchen capture would complete the expedition AND close the points gap, and then physically walked to the kitchen with a plan. The mission system creates this kind of intentional, strategic play. It transforms vocabulary practice from a chore assigned by an adult into a move in a game the child is choosing to play.

The confetti clears. The leaderboard icon in the bottom bar pulses with a small notification dot. Mai taps it.

The class leaderboard reloads. The list rearranges itself with a smooth animation — avatars sliding up and down like an elevator panel. Mai watches her rabbit avatar rise. It passes Lan's cat avatar. It settles into position three.

| Rank | Avatar    | Name         | Points this week |
| ---- | --------- | ------------ | ---------------- |
| #1   | 🐯 Tiger  | Tuấn         | 410              |
| #2   | 🐬 Dolphin| Hương        | 385              |
| **#3** | **🐰 Rabbit** | **Mai** | **335**          |
| #4   | 🐱 Cat    | Lan          | 340              |
| #5   | 🦜 Parrot | Đức          | 290              |

Wait — 335 versus 340. Mai has 335 points. Lan has 340. That is still a five-point deficit. But Mai is now at #3.

The leaderboard does not rank by points alone. It factors in diversity — how many different categories a child's captures span. Mai has captured words across eight categories this week: Kitchen, Animals, Household, Nature, School, Food, Clothing, and Transport. Lan has focused heavily on Animals, with forty of her points coming from the same category. The diversity weighting nudges Mai ahead. The system rewards breadth, not repetition.

The mascot's voice, warm and a little breathless, as if it ran up the leaderboard alongside her:

*"Chúc mừng! Bạn lên hạng ba rồi!"*
("Congratulations! You moved up to rank three!")

Mai grins. She does not pump her fist or shout. She just grins — the quiet, private grin of an eight-year-old who had a plan and watched it work.

> 💡 **Design principle — Anti-gaming through diversity weighting.** Per §2.5: "Points are weighted by diversity. Photographing the same chair 100 times doesn't help. The system detects and devalues repeated captures of the same object." And from §8 risk mitigations: "Anti-gaming: image similarity detection (perceptual hash), diminishing returns on same-category captures, duplicate detection via CLIP embeddings." The leaderboard ranking blends raw points with a diversity multiplier, which means a child who explores broadly is rewarded over a child who grinds a single category. This is pedagogically sound — vocabulary breadth matters more than depth in a single domain — and it prevents the leaderboard from being gamed by repetitive behavior.

### Mom's Phone Buzzes

Mai has already moved on. She is back on the sofa, flipping through her Collection Book, admiring the new microwave card with its green Uncommon border. But in the other room, her mom's phone vibrates. A push notification appears on the lock screen:

**SnapLearn — Weekly Summary**
"This week: 23 words captured, 4 missions completed, Rank #3 in class 🏅"

Mai's mom taps the notification. It opens the parent dashboard's weekly summary view — a clean, single-screen digest of the week. A sparkline chart shows captures by day: a spike on Tuesday (market trip with grandma), a dip on Thursday (school exam prep), a small cluster tonight. Below, the mission log shows four green checkmarks: "3 Red Things," "5 Kitchen Words," "Animals Page Progress," and "Capture from 3 Categories." Below that, the leaderboard position: #3, with an upward arrow and the note "up from #4."

Mai's mom does not fully understand the points system or the diversity weighting or the difference between an Uncommon and a Rare word. She does not need to. She sees three things: her daughter learned twenty-three English words this week, she completed four missions, and she is third in her class. That is enough. She smiles and puts the phone down.

> 🗺️ **Flow mapping** — This is §7.5 Notifications for parents: "Weekly summary (Sunday evening): 'This week: 23 words captured, 4 missions completed, Rank #3 in class' — Push + in-app." The notification arrives on Sunday evening by design, timed to land when parents are likely winding down for the week and receptive to a positive update about their child. It serves as proof-of-value: the parent sees concrete evidence that the app is producing learning outcomes, reinforcing the decision to keep it installed.

> 💡 **Design principle — The parent notification loop closes the retention cycle.** The child plays, earns, and climbs. The parent receives a summary, feels reassured, and does not uninstall the app. The weekly summary is not surveillance — it does not report screen time minute-by-minute or flag missed days with alarm language. It is a highlight reel. It shows what went right. It turns the parent into an ally: "I saw you made it to third place this week!" becomes a conversation starter at breakfast Monday morning, which becomes social reinforcement, which becomes another week of engagement.

---

## Session Summary

| Metric                          | Before session       | After session                     |
| ------------------------------- | -------------------- | --------------------------------- |
| **Total captures**              | 71                   | 72                                |
| **Unique words**                | 71                   | 72 ("microwave")                  |
| **Points (weekly)**             | 310                  | 335 (+25 capture)                 |
| **XP earned this session**      | —                    | 225 (25 capture + 200 mission)    |
| **Level**                       | 10 (Vocab Hunter)    | 10 (Vocab Hunter)                 |
| **Streak**                      | Active               | Active                            |
| **Missions completed (weekly)** | 3                    | 4 ("5 Kitchen Words")             |
| **Badges earned**               | —                    | Kitchen badge 🏅                  |
| **Leaderboard position**        | #4 in class          | **#3 in class** ↑                 |
| **Category leaderboard**        | #2 Kitchen words     | #2 Kitchen words (12 words)       |
| **Categories captured (week)**  | 8                    | 8 (Kitchen word added to existing)|
| **Parent notification sent**    | —                    | Weekly summary (Push + in-app)    |
| **Time elapsed**                | —                    | ~3 minutes                        |

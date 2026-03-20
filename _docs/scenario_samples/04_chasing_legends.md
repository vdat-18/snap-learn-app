# Scenario 4 — "Chasing Legends"

## Metadata

| Field             | Detail                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| **Character**     | Tuấn, age 10, Grade 5                                                    |
| **Profile**       | Level 19 Language Scout · 234 words captured · 7,800 XP (needs 8,000 for Level 20) |
| **Target language**| English                                                                   |
| **Setting**       | School field trip to the Ho Chi Minh City Science Museum, mid-morning     |
| **Flow mapping**  | §2.2 Rarity & Points → §2.6 Levels & Progression → §2.5 Leaderboard     |
| **Sections covered** | Rarity tier dynamics, point escalation, Legendary capture animation, level-up fanfare, unlock notifications, competitive social play, teacher-facilitated challenges |

---

## The Story

### The challenge

The bus idles in the parking lot and thirty-two fifth-graders pour down the steps into bright sunlight, backpacks bouncing, voices overlapping. The Ho Chi Minh City Science Museum rises behind them — concrete and glass, three floors of exhibits they've been told about all week. But Ms. Thanh isn't done talking. She stands at the front of the group and raises her phone.

"Lắng nghe nào!" she calls. Silence, mostly. "Today's SnapLearn challenge: whoever captures the rarest word inside the museum wins this."

She holds up a holographic sticker sheet — custom imports, the kind you can't buy at the school bookshop. Thirty-two pairs of eyes lock on. The stickers catch the light and throw tiny rainbows across Ms. Thanh's wrist. That's all it takes.

Tuấn already has his phone out. He thumbs the app open — straight to the camera viewfinder, no onboarding, no splash screen, just the live feed of the museum entrance and his stats in the corner. Level 19. 7,800 XP. Two hundred and thirty-four words. He's been grinding for a week and a half to reach Level 20, and he's two hundred points short. Today could be the day, if he finds the right word.

Around him, phones appear from pockets and waistband pouches. The museum lobby fills with the faint, overlapping chimes of SnapLearn viewfinders activating. It sounds like thirty wind chimes struck at once.

> 💡 **Design principle — Social mission as gameplay amplifier.** The product vision (§2.4) lists social missions ("Capture 3 words at a friend's house — 150 XP + Adventurer badge") as a mission type, but the most powerful social dynamic isn't app-generated — it's teacher-facilitated. Ms. Thanh didn't use an in-app feature. She used a sticker sheet and a sentence. The app's rarity system provides the scoring; the teacher provides the stakes. Stretch goal: teacher dashboard (§7.4) with custom mission creation, so Ms. Thanh could push a formal "Museum Hunt" challenge to every student's mission feed.

### The opening find

Tuấn moves fast. He knows from experience that Common words are everywhere and worth nothing in a competition like this. Chairs, tables, doors — the lobby is full of them and they're all ten-point captures his classmates will snap in the first thirty seconds. He needs to get deeper into the museum, past the obvious, into the exhibits where the strange things live.

He pushes through the Earth Sciences hall without stopping, past the mineral display cases, past a model volcano that half the class has already clustered around. He turns a corner into the Astronomy wing and stops.

A telescope stands on a black pedestal behind a velvet rope. Not a toy — a real brass refractor, maybe sixty years old, with a long tube and a wooden tripod darkened by age. The label beside it is in Vietnamese and English, but Tuấn doesn't need the label. He raises his phone, frames the telescope in the viewfinder, and taps the capture button.

The mascot appears, squinting at the photo with exaggerated curiosity:

*"Hmm... bạn tìm thấy gì thế...?"*
("Hmm... what did you find...?")

The processing beat feels longer than usual — or maybe that's just Tuấn's pulse. The AI vision pipeline analyzes the image, identifies the brass instrument, checks global capture frequency. Telescopes are not common household objects, but they're not unheard of in science museums. The rarity engine calculates.

The card slides up from the bottom of the screen. The edges pulse with a steady blue light — not white, not green. Blue.

**Rare 🔵.**

The card reads: Tuấn's own photo of the telescope, the brass catching the exhibit lighting. Below it:

*"Đây là kính thiên văn."*
("This is a telescope.")

*"Tiếng Anh là:"*

**"Telescope."** `/ˈtɛlɪskoʊp/`

The blue pulse ripples outward from the card. Fifty points. The counter in the corner ticks from 7,800 to 7,850 XP. The card tucks itself into the Collection icon. Camera returns.

Tuấn exhales. Rare is good. Rare is respectable. But Rare doesn't win sticker sheets.

> 🔊 **Audio-first moment** — Even in a competitive scenario with a ten-year-old who can read fluently, the TTS scaffolding sequence plays automatically: Vietnamese name → bridge phrase → English name with phonetic guide. The audio-first design isn't just for pre-literate children — it reinforces pronunciation for every user at every level. Tuấn hears "telescope" spoken aloud before he ever attempts to say it himself.

> 🗺️ **Flow mapping** — This is §2.2 Rarity & Points in action. The Rare tier (🔵, 50 pts) sits in the middle of the rarity spectrum. The product vision specifies that rarity is determined dynamically: "If only 2% of users have captured 'sundial,' it's Legendary." A telescope in a museum is uncommon enough to register as Rare, but enough science museum visitors have captured telescopes to keep it out of Epic territory.

### The rival

Tuấn is scanning the Astronomy wing for something rarer when he hears it — a sound he recognizes instantly. Not from across the room. From three meters away.

A deep, resonant chime. A purple glow reflecting off the glass of a display case. The unmistakable audio signature of an Epic capture.

He turns. Phong — his classmate, his friend, his rival on the class leaderboard for the last six weeks — is staring at his phone with his mouth open. The purple aura radiates from the screen, painting his face violet. The card on his screen shows a stethoscope mounted inside a History of Medicine display.

**Epic 🟣.** One hundred points.

Phong looks up and catches Tuấn's eye. He doesn't say anything. He just grins — the slow, insufferable grin of someone who knows he's winning. He tilts his phone so Tuấn can see the card:

*"Ống nghe — stethoscope."*

One hundred points. Tuấn's telescope suddenly feels small. The blue glow of Rare dims in memory next to that purple aura. Around them, other classmates are capturing Common and Uncommon words — chairs, light switches, a fire extinguisher (Uncommon 🟢, 25 pts), a wall clock (Uncommon 🟢, 25 pts). Nobody else has cracked Epic yet. Phong is in the lead, and he knows it.

Tuấn turns away from the Astronomy wing. He needs to go deeper. He needs something Phong can't match.

> 💡 **Design principle — Rarity as social currency.** The rarity system (§2.2) isn't just a points mechanic — it's a social language. When Phong's phone emits the Epic chime and purple glow, every child within earshot knows what happened without seeing the screen. The audio and visual signatures of each rarity tier function as public announcements. This is deliberate. The rarity glow effects and audio cues (§2.7: "Rarity tiers are communicated via color-coded glow effects and badge icons") create shared moments of excitement, jealousy, and ambition. The competitive energy isn't manufactured by a leaderboard algorithm. It emerges naturally from children seeing and hearing each other's captures in real time.

### The hunt

Tuấn moves through the museum with purpose now. He passes the Biology hall — too crowded, too many classmates already swarming the skeleton display. He skips the Technology wing — computers and circuit boards, likely Uncommon at best. He needs something old, something strange, something that most children in Ho Chi Minh City never encounter in their daily lives.

The rarity engine (§2.2) calculates dynamically based on global capture frequency. Tuấn doesn't know the algorithm, but he has the instincts of a ten-year-old who has been playing this game for months. He knows that common household objects are worth nothing. He knows that the weird, the obscure, the forgotten — those are where the points live. He's not looking for things he recognizes. He's looking for things he doesn't.

He finds a staircase near the back of the museum that descends to a lower level. A sign reads "Thiên văn học cổ đại" — Ancient Astronomy. The stairwell is dim and cool. None of his classmates are down here.

The exhibit is small — a single room with six glass cases arranged in a semicircle. Astrolabes. Armillary spheres. Star charts on yellowed paper. And in the center of the room, mounted on a stone pedestal under a single overhead light: a sundial.

Tuấn has never seen a real sundial. He's seen pictures in textbooks — a flat disc with a triangular fin casting a shadow. But this one is bronze, green with patina, maybe two hundred years old. The gnomon casts a thin shadow across Roman numerals that are barely legible. It sits under glass, lit from above, and it looks like something from another century because it is.

His hands are steady. He raises the phone. He frames the sundial — the bronze disc, the gnomon shadow, the Roman numerals, the single overhead light catching the patina. He taps the capture button.

*"Hmm... bạn tìm thấy gì thế...?"*

The processing beat. The mascot squints. The dotted circle spins. But this time, the pause stretches. One second. Two. The AI is analyzing — brass instrument, circular form, triangular gnomon, Roman numerals, museum context. Cross-referencing global capture frequency. How many SnapLearn users have ever photographed a sundial?

Almost none.

### The Legendary capture

The screen detonates.

There is no other word for it. The card doesn't slide up from the bottom of the screen — it erupts. A shockwave of gold light radiates outward from the center, filling the screen edge to edge. The card materializes inside the blast, its borders blazing with a gold so saturated it looks molten. Particle effects cascade — not the gentle sparkles of a Common capture or the steady pulse of Rare. These are explosions. Miniature starbursts. Showers of gold fragments tumbling down the screen like coins from a broken vault. The phone vibrates in Tuấn's hand — a deep, resonant buzz synchronized to the visual eruption.

**Legendary 🟡.**

The audio hits at the same moment. Not a chime. Not a tone. A full orchestral sting — brass and percussion swelling for two seconds, then resolving into a sustained, shimmering note that hangs in the air while the gold particles settle. It's loud enough that the sound bounces off the glass cases in the quiet exhibit room.

The card hovers at the center of the screen, still radiating gold light at its edges. Tuấn's photo of the sundial fills the upper half — the green-bronze disc, the shadow of the gnomon, the Roman numerals. Below it, the TTS sequence begins, but slower than usual, more deliberate, as if the mascot itself is awed:

*"Đây là... đồng hồ mặt trời."*
("This is... a sundial.")

A pause. The bridge phrase:

*"Tiếng Anh là:"*

And the English TTS, clear and unhurried:

**"Sundial."** `/ˈsʌndaɪəl/`

The point counter doesn't tick. It explodes. 7,850 becomes 8,100 in a single jump — 250 points, a quarter of a thousand, the maximum any single capture can award. The gold particles are still falling when the counter finishes its animation.

Tuấn's hands are shaking. He stares at the card. The Legendary badge — a gold circle with a star — pulses at the bottom right corner. He has 234 words in his collection and this is his first Legendary. Some players go months without seeing one. Some never do.

> 🔊 **Audio-first moment** — The Legendary capture audio signature is the most dramatic sound in the entire app. It is designed to be unmistakable from across a room — an orchestral sting followed by a sustained shimmer. This matters in a social context: if any classmate is within earshot, they know a Legendary was just found. The audio is as much a social signal as a personal reward. Combined with the gold explosion visual, this is the single most intense sensory moment the app can deliver — reserved exclusively for the rarest captures.

> 🗺️ **Flow mapping** — This is §2.2 Rarity & Points at its apex and §4.2 Primary Flow step 3: "Reveal animation — Card slides in from bottom with rarity glow effect (Common = white shimmer, Legendary = gold explosion)." The product vision explicitly names "gold explosion" as the Legendary visual treatment. The 250-point award is the highest in the rarity table. Rarity is dynamic: a sundial in a museum basement, captured by almost no users globally, sits at the extreme tail of the capture frequency distribution.

### "Say it!"

The gold particles settle. The "Say it!" prompt appears with its pulsing microphone button. The phonetic guide reads `/ˈsʌndaɪəl/` beside the word on the card. Tuấn is still running on adrenaline, but the pronunciation flow is the same as every other capture — the app doesn't skip steps for Legendary words. If anything, the mastery points matter more here.

He presses and holds the PTT button. The screen dims. The waveform animation appears.

"Sundial," he says. His voice is steadier than his hands.

He releases. The audio routes to Google Cloud STT (en-US). The ASR returns: `"sundial"`. Exact match.

⭐⭐⭐

*"Tuyệt vời! Giỏi lắm!"*
("Wonderful! Great job!")

The mastery indicator fills its first star. The card is at mastery 1 of 5. Four more perfect pronunciations across different sessions, and this card will evolve — visual upgrade, sentence unlock, fun fact. But that's a future session's concern. Right now, something else is happening.

### The level-up

The three pronunciation stars have barely finished their cascade when the screen transitions again. The card slides away, but the camera viewfinder doesn't return. Instead, the screen goes dark for a half-beat — a dramatic pause the app has never shown Tuấn before, because he's never hit this threshold before.

Then: light.

A horizontal banner unfurls across the center of the screen, glowing white-gold, with the mascot standing on top of it in a new pose — arms raised, triumphant, wearing a tiny explorer's hat that wasn't there at Level 19. The banner reads, in large type:

**LEVEL 20**

The mascot's voice booms — louder than normal, pitched with genuine excitement:

*"Chúc mừng! Bạn đã lên Cấp 20 — Language Scout!"*
("Congratulations! You've reached Level 20 — Language Scout!")

Confetti rains from the top of the screen. Not the subtle sparkles of a card reveal — full confetti, multicolored ribbons tumbling in simulated physics, bouncing off the banner and drifting to the edges. A fanfare plays beneath the mascot's voice: a bright, ascending trumpet phrase that resolves on a major chord. The phone vibrates twice — two short, celebratory pulses.

Below the banner, two unlock notifications slide into view, one after the other, each with its own chime:

🟣 **Epic Word Bonus Multiplier — Unlocked!**
*"Từ giờ, mỗi từ Epic sẽ nhân đôi điểm!"*
("From now on, every Epic word doubles its points!")

🏆 **Class Leaderboard — Unlocked!**
*"Bạn có thể xem bảng xếp hạng lớp rồi!"*
("You can now view the class leaderboard!")

Tuấn reads the unlocks. The Epic bonus multiplier means every future Epic capture is worth 200 points instead of 100. The class leaderboard — the one Ms. Thanh has been projecting on the classroom smartboard every Friday — is now visible directly in his app, no longer just a teacher's screen. He can check his rank whenever he wants.

> 🗺️ **Flow mapping** — This is §2.6 Levels & Progression. The product vision's level table specifies Level 20 (Language Scout) at 8,000 XP, unlocking "Epic word bonus multiplier, class leaderboard." Tuấn entered the museum at 7,800 XP. The telescope (Rare, 50 pts) brought him to 7,850. The sundial (Legendary, 250 pts) brought him to 8,100 — clearing the 8,000 threshold. The level-up is triggered by the XP crossing the threshold, not by a separate action. The celebration interrupts the normal capture flow to mark the occasion.

> 💡 **Design principle — Progression unlocks create anticipation loops.** Tuấn has been aware of the Level 20 threshold for days — the XP bar on his profile screen has been creeping toward 8,000 all week. The unlocks aren't surprises; they're anticipated rewards. The product vision's level table (§2.6) is designed so that each tier grants meaningful new capabilities, not just cosmetic changes. The Epic bonus multiplier changes Tuấn's strategy going forward — he'll prioritize Epic-or-higher captures differently now. The class leaderboard changes his social relationship with the app. These are not decorations. They're behavioral pivots.

### The aftermath

The confetti clears. The camera viewfinder returns. Tuấn stands in the quiet of the Ancient Astronomy exhibit, phone in hand, heart pounding. Level 20. First Legendary. 8,100 XP. The sundial sits under its glass case, indifferent to the fact that it just changed a ten-year-old's entire week.

He climbs the stairs back to the main floor. The Biology hall is still crowded. He finds Phong near the mineral display, showing his Epic stethoscope card to a cluster of classmates. Tuấn doesn't say anything. He walks up, opens his Collection Book, and taps the sundial card.

The gold border flares. The Legendary badge pulses. The TTS plays automatically:

*"Đồng hồ mặt trời — sundial."*

Phong's grin disappears. The cluster of classmates goes silent, then erupts. Someone grabs Tuấn's arm. Someone else yells for Ms. Thanh. The word "Legendary" bounces off the museum walls in three different children's voices, Vietnamese and English jumbled together.

Ms. Thanh arrives. She looks at the card — the gold border, the 250-point indicator, the sundial photograph with its ancient bronze and shadow. She looks at Tuấn.

"Đồng hồ mặt trời," she says, impressed. "Where on earth did you find that?"

Tuấn points toward the back staircase. "Ancient Astronomy. Downstairs."

Within two minutes, half the class is heading for the staircase. They won't find another Legendary there — the armillary spheres might register as Epic, the star charts probably Rare — but they'll find words none of them have ever encountered before, in a part of the museum none of them knew existed, driven there by the social shockwave of one gold-bordered card.

The sticker sheet goes to Tuấn. But the real prize is the card, and the level, and the story he'll tell on the bus ride back — the one about the staircase nobody else took, the room with six glass cases, and the bronze disc that turned out to be worth more than everything else in the museum combined.

> 💡 **Design principle — Real-world exploration driving rare discoveries.** The rarity system's most powerful effect isn't individual. It's social. Tuấn's Legendary find didn't just reward him — it sent half the class into a part of the museum they would never have visited otherwise. The app didn't direct them there. No mission said "Go to the Ancient Astronomy exhibit." The rarity engine (§2.2: "rarity is determined dynamically based on global capture frequency") naturally assigns higher value to objects in obscure locations, because fewer users encounter them. The result: children who explore further, look harder, and discover more. The museum becomes a richer educational experience not because the app curates it, but because the incentive structure rewards curiosity. This is the Pokémon Go mechanic at its purest — the game doesn't tell you where to go, but the rarity system means the players who wander furthest find the best things.

---

## Rarity Reference

| Rarity         | Points  | Visual treatment   | Audio signature                     |
| -------------- | ------- | ------------------ | ----------------------------------- |
| Common ⚪      | 10 pts  | White shimmer      | Soft chime                          |
| Uncommon 🟢    | 25 pts  | Green glow         | Ascending two-note tone             |
| Rare 🔵        | 50 pts  | Blue pulse          | Resonant bell                       |
| Epic 🟣        | 100 pts | Purple aura         | Deep chime with reverb              |
| Legendary 🟡   | 250 pts | Gold explosion      | Orchestral sting + sustained shimmer|

## Level Progression Reference

| Level | Title             | XP required | Unlocks                                            |
| ----- | ----------------- | ----------- | -------------------------------------------------- |
| 19    | Language Scout    | ~7,500      | (Tuấn's starting level)                            |
| 20    | Language Scout    | 8,000       | Epic word bonus multiplier, class leaderboard      |
| 35    | Word Master       | 25,000      | Custom card backgrounds, global leaderboard        |
| 50    | Polyglot Champion | 60,000      | Legendary word radar (hints for rare words nearby) |

---

## Session Summary

| Metric                     | Before session         | After session                      |
| -------------------------- | ---------------------- | ---------------------------------- |
| **Total captures**         | 234                    | 236                                |
| **Unique words**           | 234                    | 236 (+telescope, +sundial)         |
| **Points**                 | 7,800                  | 8,100                              |
| **Level**                  | 19 (Language Scout)    | 20 (Language Scout)                |
| **XP toward next level**   | 7,800 / 8,000          | 8,100 / 25,000 (next: Level 35)   |
| **Streak**                 | Maintained             | Maintained                         |
| **Cards at mastery 1+**    | +2 (telescope, sundial)| Both at mastery 1                  |
| **Categories unlocked**    | +1 (Astronomy, if new) | Telescope + sundial in Astronomy   |
| **Rarity captures**        | 0 Legendary (lifetime) | 1 Legendary (sundial), 1 Rare (telescope) |
| **Unlocks earned**         | —                      | Epic bonus multiplier, class leaderboard |
| **Competition result**     | —                      | Highest rarity in class (Legendary 🟡) |
| **Time elapsed**           | —                      | ~12 minutes (museum exploration)   |

// =============================================================
// BAML Safety Functions — SnapLearn
// =============================================================
// Pre-flight and post-flight content safety checks.
// Runs as a fast gate before/after vision to catch edge cases
// that the vision prompt's built-in filter might miss.
// =============================================================

// ── Pre-Flight Safety Check ───────────────────────────────────
// Quick image safety scan BEFORE full vision inference.
// Uses a fast/cheap model to minimize latency on blocked content.

function CheckImageSafety(photo: image, filter_level: FilterLevel) -> ImageSafetyResult {
  client FastFallback

  prompt #"
    You are a child safety content moderator for an educational app
    used by Vietnamese children aged 6–10.

    Analyze this image for safety. Be STRICT — when in doubt, block.

    STANDARD FILTER blocks:
    - Weapons: guns, knives, swords, bombs, any weapon
    - Substances: alcohol, beer, wine, tobacco, cigarettes, drugs
    - Adult content: nudity, sexual content, suggestive imagery
    - Violence: blood, gore, fighting, injuries
    - Hate: hate symbols, racist imagery, offensive gestures
    - Gambling: cards, chips, slot machines, betting

    STRICT FILTER additionally blocks:
    - Creepy creatures: spiders, insects, snakes (close-up)
    - Medical: syringes, needles, blood draws, surgical images
    - Scary: skulls, skeletons, monsters, dark/frightening imagery

    Current filter level: {{ filter_level }}

    RESPOND:
    - status: "safe" if image is appropriate for children
    - confidence: 0.0–1.0 how confident you are in the assessment

    {{ ctx.output_format }}

    {{ photo }}
  "#
}

// ── Post-Flight Word Safety Check ─────────────────────────────
// Validates vision output words against safety rules.
// Catches cases where the AI identifies an object by an unsafe name.

function CheckWordSafety(
  word_en: string,
  word_vi: string,
  word_zh: string,
  category: ObjectCategory,
  filter_level: FilterLevel
) -> SafetyCheckResult {
  client FastFallback

  prompt #"
    You are a child safety word filter for an educational app
    used by Vietnamese children aged 6–10.

    Check if these words are safe to show to a child:
    - English: "{{ word_en }}"
    - Vietnamese: "{{ word_vi }}"
    - Chinese: "{{ word_zh }}"
    - Category: {{ category }}

    STANDARD FILTER blocks words related to:
    - Weapons, violence, alcohol, tobacco, drugs
    - Adult/sexual content, profanity, slurs
    - Hate speech, offensive terms
    - Person names (privacy)

    STRICT FILTER additionally blocks:
    - Scary animals (spiders, snakes — except in "animals" educational context)
    - Medical terms (syringe, blood)
    - Words that might frighten young children (5–7 years)

    Current filter level: {{ filter_level }}

    Be STRICT. If ANY of the three words is inappropriate, block ALL.

    {{ ctx.output_format }}
  "#
}

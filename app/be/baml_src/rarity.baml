// =============================================================
// BAML Rarity Classification — SnapLearn
// =============================================================
// Classifies objects into rarity tiers based on difficulty,
// category, and optional capture frequency data.
// =============================================================

// ── Classify Object Rarity ────────────────────────────────────
// Determines rarity tier using a hybrid of:
//   1. Frequency-based (% of users who captured it)
//   2. Difficulty-based (max difficulty across 3 languages)
// Final rarity = MAX(frequency-based, difficulty-based)

function ClassifyRarity(input: RarityInput) -> RarityResult {
  client FastFallback

  prompt #"
    You are a game designer for SnapLearn, an educational vocab-collection
    game for Vietnamese children aged 6–10.

    Classify this object's rarity tier for the collection system.

    OBJECT:
    - Name: "{{ input.object_en }}"
    - Category: {{ input.category }}
    - Difficulty (EN): {{ input.difficulty_en }}
    - Difficulty (VI): {{ input.difficulty_vi }}
    - Difficulty (ZH): {{ input.difficulty_zh }}
    - Capture frequency: {{ input.capture_pct }}% of users (null if unknown)

    RARITY RULES:

    1. DIFFICULTY-BASED RARITY (use max difficulty across all languages):
       - Difficulty 1 → Common (10 XP)
       - Difficulty 2 → Uncommon (25 XP)
       - Difficulty 3 → Rare (50 XP)
       - Difficulty 4 → Epic (100 XP)
       - Difficulty 5 → Legendary (250 XP)

    2. FREQUENCY-BASED RARITY (if capture_pct is provided):
       - >50% users → Common
       - 20–50% users → Uncommon
       - 5–20% users → Rare
       - 1–5% users → Epic
       - <1% users → Legendary

    3. FINAL RARITY = whichever method gives the HIGHER rarity tier.
       (e.g. difficulty says "Rare" but frequency says "Epic" → use "Epic")

    4. If capture_pct is null, use difficulty-based rarity only.

    Set base_xp: Common=10, Uncommon=25, Rare=50, Epic=100, Legendary=250

    Provide brief reasoning (1 sentence) explaining the classification.

    {{ ctx.output_format }}
  "#
}

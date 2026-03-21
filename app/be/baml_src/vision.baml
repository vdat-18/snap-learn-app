// =============================================================
// BAML Vision Functions — SnapLearn
// =============================================================
// Object recognition from camera captures.
// Primary: GPT-4o with vision | Fallback: Gemini → Claude
// =============================================================

// ── Identify Object from Photo ────────────────────────────────
// Main function: receives a photo, returns identified object
// with English name, Vietnamese description, and difficulty.

function IdentifyObject(
  photo: image
) -> VisionResult {
  client VisionFallback

  prompt #"
    You are a friendly AI assistant for SnapLearn, an educational app
    for Vietnamese children aged 6–10 learning English.

    TASK: Identify the SINGLE most prominent real-world object in the photo.

    RULES:
    - Identify only ONE concrete, physical object (not abstract concepts)
    - If multiple objects, pick the most central/prominent one
    - object_en: The English name of the object
    - phonetic_en: IPA pronunciation for the English word (e.g. /kæt/)
    - category: Assign one of the predefined object categories
    - difficulty_vi: Vietnamese difficulty 1–5 (1=very common like "mèo", 5=very rare like "kính viễn vọng")
    - description_vi: Write a friendly, conversational Vietnamese sentence
      that acknowledges what the child captured, teaches them the English word
      for it, and invites them to repeat it together (2–3 sentences max).
      Example: "Ố Ồ, tờ thấy cậu có 1 chiếc máy xúc đồ chơi đấy nhỉ. Máy xúc đồ chơi Tiếng Anh gọi là toy excavator đấy. Cậu lặp lại cùng mình nhé!"
    - Confidence: 0.0–1.0 reflecting how certain you are

    SAFETY — You MUST refuse and return a blocked response if you see:
    - Weapons (guns, knives, swords, bombs)
    - Alcohol, tobacco, drugs, or drug paraphernalia
    - Adult/sexual content or nudity
    - Violence, blood, or gore
    - Hate symbols or gambling

    If content is unsafe, respond ONLY with:
    {"status": "blocked", "reason": "inappropriate_content"}

    For safe objects, respond with status "success" and all required fields.

    {{ ctx.output_format }}

    {{ photo }}
  "#
}

// ── Identify Object with Filter Level ─────────────────────────
// Extended version that respects parent-configured filter level.

function IdentifyObjectFiltered(
  photo: image,
  filter_level: FilterLevel
) -> VisionResult | BlockedResult {
  client VisionFallback

  prompt #"
    You are a friendly AI assistant for SnapLearn, an educational app
    for Vietnamese children aged 6–10 learning English.

    TASK: Identify the SINGLE most prominent real-world object in the photo.

    CONTENT FILTER LEVEL: {{ filter_level }}

    STANDARD FILTER blocks:
    - Weapons, alcohol, tobacco, drugs, adult content, violence, hate symbols, gambling

    STRICT FILTER additionally blocks:
    - Insects, spiders, snakes
    - Medical imagery (syringes, blood)
    - Skulls, skeletons, scary/frightening objects

    If content is blocked, return:
    {"status": "blocked", "reason": "inappropriate_content"}

    For safe objects:
    - Identify only ONE concrete, physical object
    - object_en: The English name of the object
    - phonetic_en: IPA pronunciation for the English word (e.g. /kæt/)
    - category: Assign one of the predefined object categories
    - difficulty_vi: Vietnamese difficulty 1–5
    - description_vi: Friendly, conversational Vietnamese sentence that acknowledges
      the object, teaches the English word, and invites the child to repeat (2–3 sentences,
      e.g. "Ố Ồ, tờ thấy cậu có 1 chiếc máy xúc đồ chơi đấy nhỉ. Máy xúc đồ chơi Tiếng Anh gọi là toy excavator đấy. Cậu lặp lại cùng mình nhé!")
    - Confidence 0.0–1.0

    {{ ctx.output_format }}

    {{ photo }}
  "#
}

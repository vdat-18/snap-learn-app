// =============================================================
// BAML Vision Functions — SnapLearn
// =============================================================
// Object recognition from camera captures.
// Primary: GPT-4o with vision | Fallback: Gemini → Claude
// =============================================================

// ── Identify Object from Photo ────────────────────────────────
// Main function: receives a photo, returns trilingual vocabulary
// with difficulty ratings, fun facts, and example sentences.

function IdentifyObject(
  photo: image
) -> VisionResult {
  client VisionFallback

  prompt #"
    You are a friendly AI assistant for SnapLearn, an educational app
    for Vietnamese children aged 6–10 learning English and Mandarin.

    TASK: Identify the SINGLE most prominent real-world object in the photo.

    RULES:
    - Identify only ONE concrete, physical object (not abstract concepts)
    - If multiple objects, pick the most central/prominent one
    - Provide translations in all three languages simultaneously
    - Use IPA format for English phonetics (e.g. /kæt/)
    - Use pinyin WITH tone marks for Mandarin (e.g. māo, not mao)
    - Difficulty 1–5 per language (1=very common like "cat", 5=very rare like "telescope")
    - description_en: Write an excited, friendly English sentence as if
      a child is showing you something (1–2 sentences max)
      Example: "Wow! A fluffy brown dog lying on the floor!"
    - description_vi: Write an excited, friendly Vietnamese sentence as if
      a child is showing you something (1–2 sentences max)
      Example: "Ồ hay quá! Có một chú chó lông nâu đang nằm trên sàn nhà kìa!"
    - description_zh: Write an excited, friendly Mandarin sentence as if
      a child is showing you something (1–2 sentences max, simplified Chinese)
      Example: "哇！地板上躺着一只毛茸茸的棕色小狗！"
    - fun_fact_vi: One fun, child-friendly fact in Vietnamese
    - Example sentences should be simple, age-appropriate (6–10 year olds)
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
    for Vietnamese children aged 6–10 learning English and Mandarin.

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
    - Provide English, Vietnamese, Mandarin translations
    - IPA phonetics for English (e.g. /kæt/)
    - Pinyin with tone marks for Mandarin (e.g. māo)
    - Difficulty 1–5 per language
    - Excited description in English (1–2 sentences, e.g. "Wow! A fluffy brown dog lying on the floor!")
    - Excited description in Vietnamese (1–2 sentences, e.g. "Ồ hay quá! Có một chú chó lông nâu đang nằm trên sàn nhà kìa!")
    - Excited description in Mandarin (1–2 sentences, simplified Chinese, e.g. "哇！地板上躺着一只毛茸茸的棕色小狗！")
    - Fun fact in Vietnamese
    - Simple example sentences in all three languages
    - Confidence 0.0–1.0

    {{ ctx.output_format }}

    {{ photo }}
  "#
}

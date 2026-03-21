// =============================================================
// BAML Type Definitions — SnapLearn
// =============================================================
// Shared types used across all LLM inference functions.
// Types generate Pydantic v2 models via baml_client/.
// =============================================================

// ── Object Categories ─────────────────────────────────────────
enum ObjectCategory {
  animals      @alias("animals")      @description("Living creatures: mammals, birds, fish, insects")
  food         @alias("food")         @description("Edible items: fruits, vegetables, dishes, snacks")
  nature       @alias("nature")       @description("Natural world: plants, flowers, trees, rocks, water")
  household    @alias("household")    @description("Home items: furniture, appliances, kitchenware")
  school       @alias("school")       @description("School items: books, pens, backpacks, desks")
  vehicles     @alias("vehicles")     @description("Transportation: cars, bicycles, buses, boats")
  clothing     @alias("clothing")     @description("Wearables: shirts, pants, shoes, hats")
  body_parts   @alias("body_parts")   @description("Human body: hand, eye, nose, ear")
  toys         @alias("toys")         @description("Play items: dolls, balls, blocks, puzzles")
  tools        @alias("tools")        @description("Implements: hammer, scissors, ruler, brush")
  buildings    @alias("buildings")    @description("Structures: house, school, temple, bridge")
  weather      @alias("weather")      @description("Weather phenomena: rain, sun, cloud, snow")
  colors       @alias("colors")       @description("Color objects: rainbow, paint, crayon")
  instruments  @alias("instruments")  @description("Musical: piano, guitar, drum, flute")
  sports       @alias("sports")       @description("Athletic: ball, racket, goal, pool")
  technology   @alias("technology")   @description("Tech items: phone, computer, tablet, camera")
}

// ── Rarity Tiers ──────────────────────────────────────────────
enum RarityTier {
  common       @alias("common")       @description("White ⚪ — very common, >50% of users captured, 10 XP")
  uncommon     @alias("uncommon")     @description("Green 🟢 — somewhat common, 20-50% of users, 25 XP")
  rare         @alias("rare")         @description("Blue 🔵 — infrequent, 5-20% of users, 50 XP")
  epic         @alias("epic")         @description("Purple 🟣 — hard to find, 1-5% of users, 100 XP")
  legendary    @alias("legendary")    @description("Gold 🟡 — extremely rare, <1% of users, 250 XP")
}

// ── Supported Languages ───────────────────────────────────────
enum Language {
  en @description("English")
  vi @description("Vietnamese")
  zh @description("Mandarin Chinese")
}

// ── Safety Status ─────────────────────────────────────────────
enum SafetyStatus {
  safe    @description("Content is appropriate for children aged 6-10")
  blocked @description("Content is inappropriate or contains a person")
}

enum BlockReason {
  inappropriate_content @description("Weapons, alcohol, tobacco, drugs, adult, violence, hate, gambling")
  person_detected       @description("Human face or person detected — privacy protection")
  low_confidence        @description("AI confidence below 0.7 threshold")
}

// ── Content Filter Level ──────────────────────────────────────
enum FilterLevel {
  standard @description("Blocks weapons, alcohol, tobacco, drugs, adult, violence, hate, gambling")
  strict   @description("Standard + insects, medical imagery, skulls, scary items for ages 5-7")
}

// ── Vision Service Types ──────────────────────────────────────

class VisionResult {
  status          string        @description("'success' or 'blocked'")
  object_en       string        @description("English name of the identified object")
  phonetic_en     string        @description("IPA pronunciation for English word")
  object_vi       string        @description("Vietnamese translation")
  object_zh       string        @description("Chinese characters (Simplified)")
  pinyin          string        @description("Pinyin with tone marks, e.g. māo")
  category        ObjectCategory @description("Object category from 16 predefined categories")
  difficulty_en   int           @description("English difficulty 1-5 (1=very easy, 5=legendary)")
  difficulty_vi   int           @description("Vietnamese difficulty 1-5")
  difficulty_zh   int           @description("Mandarin difficulty 1-5")
  description_vi  string        @description("Friendly Vietnamese sentence, 1-2 sentences max, excited tone")
  fun_fact_vi     string        @description("Fun fact about the object in Vietnamese, child-friendly")
  example_sentence_en string    @description("Simple English sentence using the word")
  example_sentence_vi string    @description("Simple Vietnamese sentence using the word")
  example_sentence_zh string    @description("Simple Mandarin sentence using the word")
  confidence      float         @description("Recognition confidence 0.0-1.0")
}

class BlockedResult {
  status  string      @description("Always 'blocked'")
  reason  BlockReason @description("Why the content was blocked")
}

// ── Safety Check Types ────────────────────────────────────────

class SafetyCheckResult {
  status       SafetyStatus  @description("Whether content is safe for children")
  reason       BlockReason?  @description("Reason for blocking, null if safe")
  confidence   float         @description("Safety assessment confidence 0.0-1.0")
}

// ── Rarity Classification Types ───────────────────────────────

class RarityInput {
  object_en      string         @description("English name of the object")
  category       ObjectCategory @description("Object category")
  difficulty_en  int            @description("English difficulty 1-5")
  difficulty_vi  int            @description("Vietnamese difficulty 1-5")
  difficulty_zh  int            @description("Mandarin difficulty 1-5")
  capture_pct    float?         @description("Percentage of users who captured this (0-100), null if unknown")
}

class RarityResult {
  rarity         RarityTier  @description("Assigned rarity tier")
  base_xp        int         @description("Base XP for this rarity: 10/25/50/100/250")
  reasoning      string      @description("Brief explanation of rarity assignment")
}

// ── Speech/Pronunciation Types ────────────────────────────────

class PronunciationResult {
  transcribed_text  string  @description("What Whisper heard from the audio")
  target_word       string  @description("The word the child was trying to say")
  is_match          bool    @description("Whether transcription matches target (case-insensitive)")
  stars             int     @description("Star rating: 3 for match, 1 for no match")
  feedback_vi       string  @description("Encouraging Vietnamese feedback for the child")
}

class TTSRequest {
  text      string    @description("Text to synthesize")
  language  Language  @description("Target language for synthesis")
}

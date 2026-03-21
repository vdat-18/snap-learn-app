// =============================================================
// BAML Type Definitions — SnapLearn
// =============================================================
// Shared types used across all LLM inference functions.
// Types generate Pydantic v2 models via baml_client/.
// =============================================================

// ── Object Categories ─────────────────────────────────────────
enum ObjectCategory {
  Animals      @alias("animals")      @description("Living creatures: mammals, birds, fish, insects")
  Food         @alias("food")         @description("Edible items: fruits, vegetables, dishes, snacks")
  Nature       @alias("nature")       @description("Natural world: plants, flowers, trees, rocks, water")
  Household    @alias("household")    @description("Home items: furniture, appliances, kitchenware")
  School       @alias("school")       @description("School items: books, pens, backpacks, desks")
  Vehicles     @alias("vehicles")     @description("Transportation: cars, bicycles, buses, boats")
  Clothing     @alias("clothing")     @description("Wearables: shirts, pants, shoes, hats")
  BodyParts    @alias("body_parts")   @description("Human body: hand, eye, nose, ear")
  Toys         @alias("toys")         @description("Play items: dolls, balls, blocks, puzzles")
  Tools        @alias("tools")        @description("Implements: hammer, scissors, ruler, brush")
  Buildings    @alias("buildings")    @description("Structures: house, school, temple, bridge")
  Weather      @alias("weather")      @description("Weather phenomena: rain, sun, cloud, snow")
  Colors       @alias("colors")       @description("Color objects: rainbow, paint, crayon")
  Instruments  @alias("instruments")  @description("Musical: piano, guitar, drum, flute")
  Sports       @alias("sports")       @description("Athletic: ball, racket, goal, pool")
  Technology   @alias("technology")   @description("Tech items: phone, computer, tablet, camera")
}

// ── Rarity Tiers ──────────────────────────────────────────────
enum RarityTier {
  Common       @alias("common")       @description("Very common, captured by >50% of users, worth 10 XP")
  Uncommon     @alias("uncommon")     @description("Somewhat common, captured by 20-50% of users, worth 25 XP")
  Rare         @alias("rare")         @description("Infrequent, captured by 5-20% of users, worth 50 XP")
  Epic         @alias("epic")         @description("Hard to find, captured by 1-5% of users, worth 100 XP")
  Legendary    @alias("legendary")    @description("Extremely rare, captured by <1% of users, worth 250 XP")
}

// ── Supported Languages ───────────────────────────────────────
enum Language {
  En @alias("en") @description("English")
  Vi @alias("vi") @description("Vietnamese")
  Zh @alias("zh") @description("Mandarin Chinese")
}

// ── Safety Status ─────────────────────────────────────────────
enum SafetyStatus {
  Safe    @description("Content is appropriate for children aged 6-10")
  Blocked @description("Content is inappropriate or contains a person")
}

enum BlockReason {
  InappropriateContent @alias("inappropriate_content") @description("Weapons, alcohol, tobacco, drugs, adult, violence, hate, gambling")
  LowConfidence        @alias("low_confidence")        @description("AI confidence below 0.7 threshold")
}

// ── Content Filter Level ──────────────────────────────────────
enum FilterLevel {
  Standard @description("Blocks weapons, alcohol, tobacco, drugs, adult, violence, hate, gambling")
  Strict   @description("Standard + insects, medical imagery, skulls, scary items for ages 5-7")
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

class ImageSafetyResult {
  status       SafetyStatus  @description("Whether content is safe for children")
  confidence   float         @description("Safety assessment confidence 0.0-1.0")
}

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

// =============================================================
// BAML Speech & Pronunciation Functions — SnapLearn
// =============================================================
// Pronunciation feedback generation.
// Note: Whisper STT and OpenAI TTS are REST APIs called directly
// in Python (not LLM inference). This file handles the LLM-based
// pronunciation feedback and encouragement generation.
// =============================================================

// ── Generate Pronunciation Feedback ───────────────────────────
// After ASR comparison, generate child-friendly encouragement.
// This runs ONLY when we need richer feedback than simple star logic.

function GeneratePronunciationFeedback(
  target_word: string,
  transcribed_text: string,
  language: Language,
  attempt_number: int
) -> PronunciationResult {
  client FastFallback

  prompt #"
    You are a warm, encouraging language tutor for a Vietnamese child
    aged 6–10 who is learning {{ language }}.

    The child tried to pronounce: "{{ target_word }}"
    Whisper transcribed their speech as: "{{ transcribed_text }}"
    This is attempt {{ attempt_number }} of 3.

    MATCHING RULES:
    - Case-insensitive comparison
    - Ignore leading/trailing whitespace
    - If transcription CONTAINS the target word (e.g. "the cat" vs "cat"), it IS a match
    - Exact or contains match = 3 stars ⭐⭐⭐
    - No match = 1 star ★

    FEEDBACK RULES (feedback_vi in Vietnamese):
    - If match (3 stars): Celebrate enthusiastically! Use fun expressions.
      Examples: "Tuyệt vời! 🎉", "Giỏi lắm! Phát âm chuẩn luôn! 👏"
    - If no match, attempt 1-2: Gently encourage retry.
      Examples: "Gần đúng rồi! Thử lại nha! 💪", "Cố lên! Mình thử lại nhé! 🌟"
    - If no match, attempt 3: Praise effort, suggest moving on.
      Examples: "Giỏi lắm vì đã cố gắng! Mình học từ tiếp theo nha! 🌈"
    - Keep feedback SHORT (1 sentence), WARM, AGE-APPROPRIATE (6–10)
    - Always in Vietnamese regardless of target language

    {{ ctx.output_format }}
  "#
}

// ── Generate Batch Pronunciation Hints ────────────────────────
// Pre-generate pronunciation tips for a list of words.

function GeneratePronunciationHint(
  word: string,
  language: Language
) -> string {
  client FastFallback

  prompt #"
    You are a language tutor for Vietnamese children aged 6–10.

    Give a SHORT (max 15 words) pronunciation hint in Vietnamese
    for how to say "{{ word }}" in {{ language }}.

    Use simple Vietnamese that a 6-year-old can understand.
    Reference familiar Vietnamese sounds when possible.

    Examples:
    - "cat" (English) → "Đọc giống 'cét' nhưng nhẹ hơn nha!"
    - "māo" (Mandarin) → "Đọc giống 'mao' nhưng kéo dài tiếng nha!"

    Return ONLY the hint text, nothing else.
  "#
}

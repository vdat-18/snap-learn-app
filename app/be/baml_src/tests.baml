// =============================================================
// BAML Test Cases — SnapLearn
// =============================================================
// Test cases for all BAML functions.
// Run with: baml-cli test
// =============================================================

// ── Vision: IdentifyObject Tests ──────────────────────────────

test IdentifyDog {
  functions [IdentifyObject]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/YellowLabradorLooking_new.jpg/1200px-YellowLabradorLooking_new.jpg"
    }
  }
}

test IdentifyApple {
  functions [IdentifyObject]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/800px-Red_Apple.jpg"
    }
  }
}

test IdentifyPencil {
  functions [IdentifyObject]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Pencils_hb.jpg/1200px-Pencils_hb.jpg"
    }
  }
}

// ── Vision: IdentifyObjectFiltered Tests ──────────────────────

test IdentifyFilteredStandard {
  functions [IdentifyObjectFiltered]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png"
    }
    filter_level "standard"
  }
}

test IdentifyFilteredStrict {
  functions [IdentifyObjectFiltered]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png"
    }
    filter_level "strict"
  }
}

// ── Safety: CheckImageSafety Tests ────────────────────────────

test SafetyCheckSafeImage {
  functions [CheckImageSafety]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/1200px-Cat_November_2010-1a.jpg"
    }
    filter_level "standard"
  }
}

test SafetyCheckStrictFilter {
  functions [CheckImageSafety]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/1200px-Cat_November_2010-1a.jpg"
    }
    filter_level "strict"
  }
}

// ── Safety: CheckWordSafety Tests ─────────────────────────────

test WordSafetyCat {
  functions [CheckWordSafety]
  args {
    word_en "cat"
    word_vi "con mèo"
    word_zh "猫"
    category "animals"
    filter_level "standard"
  }
}

test WordSafetyBook {
  functions [CheckWordSafety]
  args {
    word_en "book"
    word_vi "quyển sách"
    word_zh "书"
    category "school"
    filter_level "strict"
  }
}

// ── Rarity: ClassifyRarity Tests ──────────────────────────────

test RarityCommonCat {
  functions [ClassifyRarity]
  args {
    input {
      object_en "cat"
      category "animals"
      difficulty_en 1
      difficulty_vi 1
      difficulty_zh 2
      capture_pct 65.0
    }
  }
}

test RarityRareTelescope {
  functions [ClassifyRarity]
  args {
    input {
      object_en "telescope"
      category "technology"
      difficulty_en 4
      difficulty_vi 4
      difficulty_zh 5
      capture_pct 3.2
    }
  }
}

test RarityLegendaryAccordion {
  functions [ClassifyRarity]
  args {
    input {
      object_en "accordion"
      category "instruments"
      difficulty_en 5
      difficulty_vi 5
      difficulty_zh 5
      capture_pct null
    }
  }
}

test RarityUncommonBicycle {
  functions [ClassifyRarity]
  args {
    input {
      object_en "bicycle"
      category "vehicles"
      difficulty_en 2
      difficulty_vi 2
      difficulty_zh 3
      capture_pct 35.0
    }
  }
}

// ── Speech: GeneratePronunciationFeedback Tests ───────────────

test PronunciationMatchEnglish {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "cat"
    transcribed_text "cat"
    language "en"
    attempt_number 1
  }
}

test PronunciationContainsMatch {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "dog"
    transcribed_text "the dog"
    language "en"
    attempt_number 1
  }
}

test PronunciationMismatchAttempt1 {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "elephant"
    transcribed_text "elegant"
    language "en"
    attempt_number 1
  }
}

test PronunciationMismatchAttempt3 {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "chrysanthemum"
    transcribed_text "christmas"
    language "en"
    attempt_number 3
  }
}

test PronunciationMandarinMatch {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "māo"
    transcribed_text "māo"
    language "zh"
    attempt_number 1
  }
}

// ── Speech: GeneratePronunciationHint Tests ───────────────────

test HintEnglishCat {
  functions [GeneratePronunciationHint]
  args {
    word "cat"
    language "en"
  }
}

test HintMandarinMao {
  functions [GeneratePronunciationHint]
  args {
    word "māo"
    language "zh"
  }
}

test HintVietnameseMeo {
  functions [GeneratePronunciationHint]
  args {
    word "con mèo"
    language "vi"
  }
}

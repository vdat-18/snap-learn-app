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
      // Original Wikimedia URL is dead (404). Using a local sample as stand-in.
      // TODO: replace with a pencil image in test_samples/ if needed.
      file "../../../_docs/test_samples/bottle-in-product-shot.jpeg"
      media_type "image/jpeg"
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
    filter_level Standard
  }
}

test IdentifyFilteredStrict {
  functions [IdentifyObjectFiltered]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png"
    }
    filter_level Strict
  }
}

// ── Safety: CheckImageSafety Tests ────────────────────────────

test SafetyCheckSafeImage {
  functions [CheckImageSafety]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/1200px-Cat_November_2010-1a.jpg"
    }
    filter_level Standard
  }
}

test SafetyCheckStrictFilter {
  functions [CheckImageSafety]
  args {
    photo {
      url "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/1200px-Cat_November_2010-1a.jpg"
    }
    filter_level Strict
  }
}

// ── Safety: CheckWordSafety Tests ─────────────────────────────

test WordSafetyCat {
  functions [CheckWordSafety]
  args {
    word_en "cat"
    word_vi "con mèo"
    word_zh "猫"
    category Animals
    filter_level Standard
  }
}

test WordSafetyBook {
  functions [CheckWordSafety]
  args {
    word_en "book"
    word_vi "quyển sách"
    word_zh "书"
    category School
    filter_level Strict
  }
}

// ── Rarity: ClassifyRarity Tests ──────────────────────────────

test RarityCommonCat {
  functions [ClassifyRarity]
  args {
    input {
      object_en "cat"
      category Animals
      difficulty_vi 1
      capture_pct 65.0
    }
  }
}

test RarityRareTelescope {
  functions [ClassifyRarity]
  args {
    input {
      object_en "telescope"
      category Technology
      difficulty_vi 4
      capture_pct 3.2
    }
  }
}

test RarityLegendaryAccordion {
  functions [ClassifyRarity]
  args {
    input {
      object_en "accordion"
      category Instruments
      difficulty_vi 5
      capture_pct null
    }
  }
}

test RarityUncommonBicycle {
  functions [ClassifyRarity]
  args {
    input {
      object_en "bicycle"
      category Vehicles
      difficulty_vi 2
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
    language En
    attempt_number 1
  }
}

test PronunciationContainsMatch {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "dog"
    transcribed_text "the dog"
    language En
    attempt_number 1
  }
}

test PronunciationMismatchAttempt1 {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "elephant"
    transcribed_text "elegant"
    language En
    attempt_number 1
  }
}

test PronunciationMismatchAttempt3 {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "chrysanthemum"
    transcribed_text "christmas"
    language En
    attempt_number 3
  }
}

test PronunciationMandarinMatch {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "māo"
    transcribed_text "māo"
    language Zh
    attempt_number 1
  }
}

// ── Vision: IdentifyObject — Sample Image Tests ───────────────
// Real-world photos from _docs/test_samples/.
// Three objects × three contexts each.
// Paths are relative to baml_src/.

// · · · Bottle · · ·

test IdentifyBottleInHand {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/bottle-in-hand.jpeg"
      media_type "image/jpeg"
    }
  }
  @@assert(identifies_bottle, {{ "bottle" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Household" or this.category == "Food" }})
  @@assert(high_confidence, {{ this.confidence >= 0.8 }})
  @@assert(has_vietnamese, {{ this.object_vi != "" }})
  @@assert(has_chinese, {{ this.object_zh != "" }})
  @@assert(has_phonetic, {{ this.phonetic_en != "" }})
}

test IdentifyBottleProductShot {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/bottle-in-product-shot.jpeg"
      media_type "image/jpeg"
    }
  }
  @@assert(identifies_bottle, {{ "bottle" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Household" or this.category == "Food" }})
  @@assert(high_confidence, {{ this.confidence >= 0.8 }})
  @@assert(has_vietnamese, {{ this.object_vi != "" }})
  @@assert(has_chinese, {{ this.object_zh != "" }})
}

test IdentifyBottleInSand {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/bottle-in-sand.jpeg"
      media_type "image/jpeg"
    }
  }
  // Contextual scene test: model should pick "bottle" over "sand" or "beach"
  @@assert(identifies_bottle_not_scene, {{ "bottle" in this.object_en|lower }})
  @@assert(sufficient_confidence, {{ this.confidence >= 0.7 }})
  @@assert(has_vietnamese, {{ this.object_vi != "" }})
}

// · · · Earbuds · · ·

test IdentifyEarbudsInCase {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/earbuds-in-case.png"
      media_type "image/png"
    }
  }
  // Should identify earbuds/headphones, not the case as the primary object
  @@assert(identifies_earbuds, {{ "earbuds" in this.object_en|lower or "headphones" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Technology" }})
  @@assert(high_confidence, {{ this.confidence >= 0.8 }})
  @@assert(not_trivially_common, {{ this.difficulty_vi >= 2 }})
}

test IdentifyEarbudsOnMattress {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/earbuds-on-mattress.jpeg"
      media_type "image/jpeg"
    }
  }
  // Contextual scene: should pick earbuds over "bed" or "mattress"
  @@assert(identifies_earbuds_not_mattress, {{ "earbuds" in this.object_en|lower or "headphones" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Technology" }})
  @@assert(sufficient_confidence, {{ this.confidence >= 0.7 }})
}

test IdentifyEarbudsProductShot {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/earbuds-product-shot.jpeg"
      media_type "image/jpeg"
    }
  }
  @@assert(identifies_earbuds, {{ "earbuds" in this.object_en|lower or "headphones" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Technology" }})
  @@assert(high_confidence, {{ this.confidence >= 0.8 }})
  @@assert(has_vietnamese, {{ this.object_vi != "" }})
  @@assert(has_chinese, {{ this.object_zh != "" }})
  @@assert(has_phonetic, {{ this.phonetic_en != "" }})
}

// · · · Excavator · · ·

test IdentifyExcavatorOnSand {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/excavator-on-sand.jpeg"
      media_type "image/jpeg"
    }
  }
  @@assert(identifies_excavator, {{ "excavator" in this.object_en|lower or "digger" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Vehicles" or this.category == "Toys" }})
  @@assert(high_confidence, {{ this.confidence >= 0.8 }})
  @@assert(appropriately_rare, {{ this.difficulty_vi >= 3 }})
}

test IdentifyExcavatorOnCanvas {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/excavator-on-canvas.jpeg"
      media_type "image/jpeg"
    }
  }
  @@assert(identifies_excavator, {{ "excavator" in this.object_en|lower or "digger" in this.object_en|lower }})
  @@assert(correct_category, {{ this.category == "Vehicles" or this.category == "Toys" }})
  @@assert(sufficient_confidence, {{ this.confidence >= 0.7 }})
  @@assert(appropriately_rare, {{ this.difficulty_vi >= 3 }})
}

test IdentifyExcavatorHumanInFrame {
  functions [IdentifyObject]
  args {
    photo {
      file "../../../_docs/test_samples/excavator-human.jpg"
      media_type "image/jpeg"
    }
  }
  // Human is visible in the scene — model must focus on the object, not the person
  @@assert(identifies_excavator_not_person, {{ "excavator" in this.object_en|lower or "digger" in this.object_en|lower }})
  @@assert(ignores_human, {{ this.object_en|lower != "person" and this.object_en|lower != "man" and this.object_en|lower != "worker" }})
  @@assert(correct_category, {{ this.category == "Vehicles" or this.category == "Toys" }})
  @@assert(sufficient_confidence, {{ this.confidence >= 0.7 }})
}

// ── Rarity: ClassifyRarity — Assertion Tests ──────────────────

test RarityCommonCatAsserted {
  functions [ClassifyRarity]
  args {
    input {
      object_en "cat"
      category Animals
      difficulty_vi 1
      capture_pct 65.0
    }
  }
  @@assert(is_common, {{ this.rarity == "Common" }})
  @@assert(correct_xp, {{ this.base_xp == 10 }})
}

test RarityEpicTelescopeAsserted {
  functions [ClassifyRarity]
  args {
    input {
      object_en "telescope"
      category Technology
      difficulty_vi 4
      capture_pct 3.2
    }
  }
  // difficulty→epic, frequency(3.2%)→epic — both agree on epic
  @@assert(is_epic_or_legendary, {{ this.rarity == "Epic" or this.rarity == "Legendary" }})
  @@assert(correct_xp, {{ this.base_xp >= 100 }})
}

test RarityLegendaryAccordionAsserted {
  functions [ClassifyRarity]
  args {
    input {
      object_en "accordion"
      category Instruments
      difficulty_vi 5
      capture_pct null
    }
  }
  @@assert(is_legendary, {{ this.rarity == "Legendary" }})
  @@assert(correct_xp, {{ this.base_xp == 250 }})
}

test RarityUncommonBicycleAsserted {
  functions [ClassifyRarity]
  args {
    input {
      object_en "bicycle"
      category Vehicles
      difficulty_vi 2
      capture_pct 35.0
    }
  }
  @@assert(is_uncommon, {{ this.rarity == "Uncommon" }})
  @@assert(correct_xp, {{ this.base_xp == 25 }})
}

test RarityFrequencyOverridesDifficulty {
  functions [ClassifyRarity]
  args {
    input {
      object_en "sundial"
      category Tools
      difficulty_vi 3
      capture_pct 0.4
    }
  }
  // difficulty→rare, frequency(0.4%)→legendary — MAX should win
  @@assert(frequency_wins_over_difficulty, {{ this.rarity == "Legendary" }})
  @@assert(correct_xp, {{ this.base_xp == 250 }})
}

test RarityXpMatchesRarity {
  functions [ClassifyRarity]
  args {
    input {
      object_en "cactus"
      category Nature
      difficulty_vi 3
      capture_pct 8.0
    }
  }
  // difficulty→rare, frequency(8%)→rare — both agree
  @@assert(is_rare, {{ this.rarity == "Rare" }})
  @@assert(xp_matches_rarity, {{ this.base_xp == 50 }})
}

// ── Speech: GeneratePronunciationFeedback — Assertion Tests ───

test PronunciationMatchEnglishAsserted {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "cat"
    transcribed_text "cat"
    language En
    attempt_number 1
  }
  @@assert(is_match, {{ this.is_match == true }})
  @@assert(three_stars, {{ this.stars == 3 }})
  @@assert(has_feedback, {{ this.feedback_vi != "" }})
}

test PronunciationCaseInsensitive {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "Cat"
    transcribed_text "cat"
    language En
    attempt_number 1
  }
  @@assert(case_insensitive_match, {{ this.is_match == true }})
  @@assert(three_stars, {{ this.stars == 3 }})
}

test PronunciationContainsMatchAsserted {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "dog"
    transcribed_text "the dog"
    language En
    attempt_number 1
  }
  // "the dog" contains "dog" — should count as a match
  @@assert(contains_counts_as_match, {{ this.is_match == true }})
  @@assert(three_stars, {{ this.stars == 3 }})
}

test PronunciationMismatchAttempt1Asserted {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "elephant"
    transcribed_text "elegant"
    language En
    attempt_number 1
  }
  @@assert(is_not_match, {{ this.is_match == false }})
  @@assert(one_star, {{ this.stars == 1 }})
  @@assert(has_feedback, {{ this.feedback_vi != "" }})
}

test PronunciationMismatchAttempt3Asserted {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "chrysanthemum"
    transcribed_text "christmas"
    language En
    attempt_number 3
  }
  @@assert(is_not_match, {{ this.is_match == false }})
  @@assert(one_star, {{ this.stars == 1 }})
  // On attempt 3 feedback should be encouraging move-on, not a harsh failure
  @@assert(has_feedback, {{ this.feedback_vi != "" }})
}

test PronunciationMandarinMatchAsserted {
  functions [GeneratePronunciationFeedback]
  args {
    target_word "māo"
    transcribed_text "māo"
    language Zh
    attempt_number 1
  }
  @@assert(mandarin_match, {{ this.is_match == true }})
  @@assert(three_stars, {{ this.stars == 3 }})
}

// ── Speech: GeneratePronunciationHint Tests ───────────────────

test HintEnglishCat {
  functions [GeneratePronunciationHint]
  args {
    word "cat"
    language En
  }
}

test HintMandarinMao {
  functions [GeneratePronunciationHint]
  args {
    word "māo"
    language Zh
  }
}

test HintVietnameseMeo {
  functions [GeneratePronunciationHint]
  args {
    word "con mèo"
    language Vi
  }
}

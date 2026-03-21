"""Game constants — level thresholds, XP values, category icons, error codes."""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Level progression (6 tiers)
# ---------------------------------------------------------------------------
LEVEL_THRESHOLDS: list[dict] = [
    {"level": 1, "xp_required": 0, "name_en": "Beginner Explorer", "name_vi": "Nhà thám hiểm mới"},
    {"level": 5, "xp_required": 500, "name_en": "Word Collector", "name_vi": "Nhà sưu tầm từ"},
    {"level": 10, "xp_required": 2000, "name_en": "Vocab Hunter", "name_vi": "Thợ săn từ vựng"},
    {"level": 20, "xp_required": 8000, "name_en": "Language Scout", "name_vi": "Hướng đạo ngôn ngữ"},
    {"level": 35, "xp_required": 25000, "name_en": "Word Master", "name_vi": "Bậc thầy từ vựng"},
    {"level": 50, "xp_required": 60000, "name_en": "Polyglot Champion", "name_vi": "Nhà vô địch đa ngữ"},
]


def get_level_name(level: int, lang: str = "vi") -> str:
    """Return the tier name for a given level."""
    key = f"name_{lang}"
    result = LEVEL_THRESHOLDS[0][key]
    for tier in LEVEL_THRESHOLDS:
        if level >= tier["level"]:
            result = tier[key]
    return result


# ---------------------------------------------------------------------------
# XP by rarity tier
# ---------------------------------------------------------------------------
RARITY_XP: dict[str, int] = {
    "common": 10,
    "uncommon": 25,
    "rare": 50,
    "epic": 100,
    "legendary": 250,
}

# Duplicate captures earn 25% of original XP
DUPLICATE_XP_MULTIPLIER = 0.25

# Evolution bonus XP when a card evolves (mastery reaches 5)
EVOLUTION_BONUS_XP = 50

# Pronunciation: 3 stars = 5 XP bonus
PRONUNCIATION_PERFECT_XP = 5

# Max mastery level per language
MAX_MASTERY = 2

# Mastery threshold for evolution
EVOLUTION_MASTERY_THRESHOLD = 2


# ---------------------------------------------------------------------------
# Category icons
# ---------------------------------------------------------------------------
CATEGORY_ICONS: dict[str, str] = {
    "animals": "🐾",
    "food": "🍎",
    "nature": "🌿",
    "household": "🏠",
    "school": "📚",
    "vehicles": "🚗",
    "clothing": "👕",
    "body_parts": "🫁",
    "toys": "🧸",
    "tools": "🔧",
    "buildings": "🏛️",
    "weather": "🌤️",
    "colors": "🎨",
    "instruments": "🎵",
    "sports": "⚽",
    "technology": "💻",
}

# Vietnamese display names for categories
CATEGORY_DISPLAY_NAMES: dict[str, str] = {
    "animals": "Động vật",
    "food": "Đồ ăn",
    "nature": "Tự nhiên",
    "household": "Nhà cửa",
    "school": "Trường học",
    "vehicles": "Giao thông",
    "clothing": "Quần áo",
    "body_parts": "Cơ thể",
    "toys": "Đồ chơi",
    "tools": "Dụng cụ",
    "buildings": "Công trình",
    "weather": "Thời tiết",
    "colors": "Màu sắc",
    "instruments": "Nhạc cụ",
    "sports": "Thể thao",
    "technology": "Công nghệ",
}

# Reference totals per category for collection progress
CATEGORY_TOTALS: dict[str, int] = {
    "animals": 50,
    "food": 40,
    "nature": 35,
    "household": 30,
    "school": 25,
    "vehicles": 20,
    "clothing": 20,
    "body_parts": 15,
    "toys": 15,
    "tools": 15,
    "buildings": 15,
    "weather": 10,
    "colors": 12,
    "instruments": 15,
    "sports": 15,
    "technology": 20,
}


# ---------------------------------------------------------------------------
# Error codes
# ---------------------------------------------------------------------------
ERROR_CODES: dict[str, dict[str, str]] = {
    "CAPTURE_LOW_CONFIDENCE": {
        "message_vi": "Không nhận ra được. Thử chụp lại rõ hơn nha!",
        "message_en": "Could not identify the object. Try a clearer photo!",
    },
    "CAPTURE_RATE_LIMITED": {
        "message_vi": "Hôm nay chụp nhiều rồi! Mai quay lại nha!",
        "message_en": "You've reached today's capture limit. Come back tomorrow!",
    },
    "PRONUNCIATION_RATE_LIMITED": {
        "message_vi": "Hôm nay luyện phát âm nhiều rồi! Mai quay lại nha!",
        "message_en": "You've reached today's pronunciation limit. Come back tomorrow!",
    },
    "TIME_LIMIT_REACHED": {
        "message_vi": "Hôm nay học đủ rồi! Mai quay lại nha!",
        "message_en": "You've studied enough for today. Come back tomorrow!",
    },
    "AUTH_EMAIL_EXISTS": {
        "message_vi": "Email này đã được đăng ký.",
        "message_en": "This email is already registered.",
    },
    "AUTH_CREDENTIALS_INVALID": {
        "message_vi": "Email hoặc mật khẩu không đúng.",
        "message_en": "Invalid email or password.",
    },
    "AUTH_INVALID": {
        "message_vi": "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        "message_en": "Session expired. Please log in again.",
    },
    "AI_SERVICE_ERROR": {
        "message_vi": "Dịch vụ AI đang bận. Thử lại sau nhé!",
        "message_en": "AI service is temporarily unavailable. Please try again.",
    },
    "PARENT_GATE_FAILED": {
        "message_vi": "Câu trả lời không đúng. Thử lại nhé!",
        "message_en": "Incorrect answer. Please try again.",
    },
    "IMAGE_INVALID": {
        "message_vi": "Ảnh không hợp lệ. Hãy chụp ảnh JPEG hoặc PNG.",
        "message_en": "Invalid image. Please use JPEG or PNG format.",
    },
    "AUDIO_INVALID": {
        "message_vi": "Âm thanh không hợp lệ. Hãy thử lại.",
        "message_en": "Invalid audio. Please try again.",
    },
    "INTERNAL_ERROR": {
        "message_vi": "Có lỗi rồi! Thử lại nhé!",
        "message_en": "Something went wrong. Please try again.",
    },
}

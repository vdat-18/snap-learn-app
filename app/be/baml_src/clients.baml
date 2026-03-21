// =============================================================
// BAML Client Configuration — SnapLearn
// =============================================================
// LLM provider clients with fallback chains.
// Environment variables are read at runtime by baml_client.
// =============================================================

// ── Primary Vision Client: OpenAI GPT-4o ──────────────────────
client<llm> GPT4o {
  provider openai
  options {
    model "gpt-4o"
    api_key env.OPENAI_API_KEY
    temperature 0.2
    max_tokens 1024
  }
}

// ── Fast/Cheap Client: GPT-4o-mini ────────────────────────────
client<llm> GPT4oMini {
  provider openai
  options {
    model "gpt-4o-mini"
    api_key env.OPENAI_API_KEY
    temperature 0.1
    max_tokens 512
  }
}

// ── OpenRouter Fallback: Gemini Flash 2.5 ─────────────────────
client<llm> GeminiFlash {
  provider "openai-generic"
  options {
    model "google/gemini-2.5-flash"
    api_key env.OPENROUTER_API_KEY
    base_url "https://openrouter.ai/api/v1"
    temperature 0.2
    max_tokens 1024
  }
}

// ── OpenRouter Fallback: Claude Sonnet ────────────────────────
client<llm> ClaudeSonnet {
  provider "openai-generic"
  options {
    model "anthropic/claude-sonnet-4"
    api_key env.OPENROUTER_API_KEY
    base_url "https://openrouter.ai/api/v1"
    temperature 0.2
    max_tokens 1024
  }
}

// ── Fallback Chain: Vision (GPT-4o → Gemini → Claude) ─────────
client<llm> VisionFallback {
  provider fallback
  options {
    strategy [GPT4o, GeminiFlash, ClaudeSonnet]
  }
}

// ── Fallback Chain: Fast Tasks (Mini → Gemini) ────────────────
client<llm> FastFallback {
  provider fallback
  options {
    strategy [GPT4o, GeminiFlash]
  }
}

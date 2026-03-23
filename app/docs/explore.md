████████████████████████████████████████████████████████████████████████████████
█                                                                              █
█  SnapLearn App - COMPREHENSIVE CODEBASE EXPLORATION COMPLETE                █
█  ═══════════════════════════════════════════════════════════════════        █
█                                                                              █
████████████████████████████████████████████████████████████████████████████████

📊 EXPLORATION SUMMARY
═════════════════════════════════════════════════════════════════════════════════

✅ SECTIONS ANALYZED (ALL 10 REQUESTED):

  1️⃣  OVERALL PROJECT STRUCTURE
      └─ 3 main directories: app/{ai,be,fe}, _docs, openspec
      └─ Docker & Makefile for orchestration
      
  2️⃣  FRONTEND FRAMEWORK & DEPENDENCIES  
      └─ React 19.2.4 + TypeScript 5.9.3 + Vite 7.0
      └─ Zustand (state), Framer Motion (animations), Tailwind (styles)
      └─ 8 direct production dependencies
      
  3️⃣  VOICE/AUDIO HANDLING ✨ KEY FEATURE
      └─ Recording: MediaRecorder API (3-sec WebM/MP4)
      └─ Playback: Web Audio API singleton (mobile-safe)
      └─ TTS: ElevenLabs (primary) + OpenAI fallback
      └─ ASR: OpenAI gpt-4o-transcribe
      └─ Components: RevealCard, VocabDetail handle recording
      
  4️⃣  REAL-TIME COMMUNICATION
      └─ Status: NOT IMPLEMENTED ❌
      └─ No WebSocket, WebRTC, LiveKit, or socket.io
      └─ REST API only (Axios with JWT token refresh)
      
  5️⃣  BACKEND/API INTEGRATION
      └─ FastAPI (Python 3.12) + async/await
      └─ PostgreSQL + Redis + ChromaDB
      └─ 13 service modules (capture, speech, vision, game, etc.)
      └─ BAML for AI orchestration (8 .baml files)
      
  6️⃣  UI COMPONENTS
      └─ 20+ React components (all in app/fe/src/components/ui/)
      └─ Key screens: RevealCard, VocabDetail, Collection, Profile, Leaderboard
      └─ Animations via Framer Motion
      
  7️⃣  STATE MANAGEMENT
      └─ Zustand store: gameStore.ts (13KB)
      └─ Global state: XP, level, collections, auth, UI flags
      └─ localStorage persistence (6 keys)
      
  8️⃣  iOS/MOBILE SUPPORT
      └─ PWA ready (manifest, meta tags, standalone)
      └─ Responsive + touch-friendly ✅
      └─ Camera & microphone access ✅
      └─ iOS MediaRecorder format issue ⚠️ (MP4 vs WebM)
      
  9️⃣  ENVIRONMENT VARIABLES & CONFIG
      └─ 20+ env vars (API keys, DB, rate limits, TTS)
      └─ 2 env examples (.env.example, .env.production.example)
      └─ Settings via Pydantic BaseSettings
      
  🔟 LIVEKIT INTEGRATION
      └─ Status: NOT INTEGRATED ❌
      └─ Only appears in ElevenLabs SDK types (unused)
      └─ No real-time features needed for MVP

═════════════════════════════════════════════════════════════════════════════════

🎯 KEY FINDINGS - AUDIO HANDLING (MOST CRITICAL)
═════════════════════════════════════════════════════════════════════════════════

RECORDING FLOW (Frontend → Backend):
  
  🎤 User taps microphone button
     ↓
  📱 navigator.mediaDevices.getUserMedia({ audio: true })
     ↓
  🔊 new MediaRecorder(stream, { mimeType })
     ↓
  ⏱️  3-second recording (auto-stop)
     ↓
  📦 Create Blob: { type: 'audio/webm' } or 'audio/mp4' (Safari)
     ↓
  📄 FileReader.readAsDataURL() → base64 encode
     ↓
  🌐 POST /api/pronounce { vocab_id, language, audio_base64 }
     ↓
  🧠 Backend:
     ├─ Decode base64 → bytes
     ├─ OpenAI Whisper transcription
     ├─ Fuzzy match target word
     ├─ Generate Vietnamese feedback
     └─ Return { stars: 1|2|3, transcript, feedback_vi, xp }
     ↓
  🎉 Frontend updates UI + sound effects

PLAYBACK FLOW (Backend → Frontend):

  ✨ Fetch TTS audio from /api/tts/{vocab_id}/{lang}
     ↓
  💾 Streaming fetch → ArrayBuffer → Blob → blob URL
     ↓
  🔓 Unlock AudioContext during user gesture
     ↓
  🎧 playAudioFromUrl(blobUrl) via AudioBufferSourceNode
     ↓
  ✅ Plays through speakers

═════════════════════════════════════════════════════════════════════════════════

📈 STATISTICS
═════════════════════════════════════════════════════════════════════════════════

Frontend:
  • 20+ UI components
  • 10 API services
  • Zustand store
  • 4+ hooks
  • ~50 total .tsx files
  
Backend:
  • 11 API routes (capture, speech, auth, profile, leaderboard, etc.)
  • 13 service modules
  • 12+ SQLAlchemy models
  • 8 BAML files (AI functions)
  • 5 utility modules
  
Database:
  • PostgreSQL (primary)
  • Redis (caching)
  • ChromaDB (vector search)
  
AI Models:
  • Vision: GPT-4o (fallback: Gemini, Claude)
  • Speech: OpenAI gpt-4o-transcribe
  • TTS: ElevenLabs eleven_v3 (fallback: OpenAI)

═════════════════════════════════════════════════════════════════════════════════

🚨 CRITICAL GAPS IDENTIFIED
═════════════════════════════════════════════════════════════════════════════════

1. iOS Audio Format Handling ⚠️
   └─ MediaRecorder produces MP4 on Safari (not handled)
   └─ Recommendation: Add platform detection + MIME type selection
   
2. Real-Time Communication ❌
   └─ No WebSocket (marked as "NOT IMPLEMENTED")
   └─ All async operations via REST polling
   └─ LiveKit: Not integrated (no need for MVP)
   
3. Offline Support ⚠️
   └─ Service Worker disabled in index.html
   └─ No PWA caching strategy
   
4. iOS-Specific Optimizations ⚠️
   └─ No Capacitor/native iOS code
   └─ AudioContext unlock timing needs testing
   
5. Missing iOS Audio MIME Detection
   └─ Current code hardcodes 'audio/webm'
   └─ iOS Safari may fail silently with format mismatch

═════════════════════════════════════════════════════════════════════════════════

✨ STRENGTHS OF THE ARCHITECTURE
═════════════════════════════════════════════════════════════════════════════════

✅ Type Safety
   └─ TypeScript throughout frontend
   └─ Pydantic for backend validation
   
✅ Async-First Design
   └─ Python async/await everywhere
   └─ JavaScript promises + AbortController for cancellation
   
✅ Smart Fallbacks
   └─ Vision: GPT-4o → Gemini → Claude
   └─ TTS: ElevenLabs → OpenAI
   └─ Graceful degradation built-in
   
✅ Mobile-Optimized Audio
   └─ Shared AudioContext singleton (prevents mobile blocking)
   └─ Unlock on user gesture
   └─ MIME type detection for cross-browser support
   
✅ Clean Separation
   └─ Service layer pattern (backend)
   └─ Component composition (frontend)
   └─ Zustand store (centralized state)
   
✅ Pre-Generated Content
   └─ Mascot audio manifest (200+ trilingual phrases)
   └─ Server-side TTS caching (MP3, 90-day TTL)
   └─ Background task pre-generation

═════════════════════════════════════════════════════════════════════════════════

📁 OUTPUT FILES CREATED
═════════════════════════════════════════════════════════════════════════════════

✅ /tmp/snap-learn-codebase-exploration.md
   └─ 1,052 lines | 30.4 KB
   └─ 17 detailed sections + reference tables
   
✅ /tmp/snap-learn-quick-summary.md
   └─ 367 lines | Emoji-formatted quick ref
   └─ 10 key sections for fast lookup

═════════════════════════════════════════════════════════════════════════════════

🎓 KEY TAKEAWAYS FOR iOS/MOBILE DEVELOPMENT
═════════════════════════════════════════════════════════════════════════════════

1. Audio Recording Format Issue (CRITICAL for iOS)
   ├─ Problem: iOS Safari uses MP4/AAC, Chrome uses WebM/Opus
   ├─ Current: Code hardcodes 'audio/webm' (breaks on iOS)
   └─ Fix: Detect platform and select appropriate MIME type

2. AudioContext Unlock Timing
   ├─ Current: Unlock on camera button tap (correct approach)
   ├─ Testing: Verify this works after async gap (API response)
   └─ Fallback: May need explicit unlock on audio playback

3. Service Worker (Offline Support)
   ├─ Current: Commented out in index.html
   ├─ Impact: No offline support, no app caching
   └─ Future: Could enable for improved UX

4. Microphone & Camera Permissions
   ├─ iOS: Requires explicit user permission (PWA model)
   ├─ Status: getUserMedia handles this
   └─ Note: Must be served over HTTPS (enforced by iOS)

5. Storage Limits
   ├─ localStorage: 5-10MB per origin (iOS may be lower)
   ├─ Current: gameStore persists via localStorage
   └─ Risk: Large vocab collections could exceed quota

═════════════════════════════════════════════════════════════════════════════════

🚀 NEXT STEPS
═════════════════════════════════════════════════════════════════════════════════

For iOS Production Deployment:

  1. Add iOS audio MIME type detection
  2. Test AudioContext unlock on real iOS devices
  3. Verify microphone access permissions
  4. Enable Service Worker for offline support
  5. Test localStorage size limits
  6. Add haptic feedback for iOS 13+
  7. Optimize for home screen PWA installation

For Real-Time Features (if needed in future):

  1. Implement WebSocket via socket.io or ws
  2. Add LiveKit for video/voice features
  3. Implement real-time messaging/notifications
  4. Add multiplayer game modes

════════════════════════════════════════════════════════════════════════════════

EXPLORATION COMPLETE ✅

All 10 requested areas analyzed thoroughly.
Audio handling documented in detail.
LiveKit status: NOT INTEGRATED (REST API only).
iOS considerations identified.

════════════════════════════════════════════════════════════════════════════════
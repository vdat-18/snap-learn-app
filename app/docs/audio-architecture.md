╔════════════════════════════════════════════════════════════════════════════╗
║                     SNAPLEARN AUDIO ARCHITECTURE                          ║
╚════════════════════════════════════════════════════════════════════════════╝

AUDIO FLOW DIAGRAM
═════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│  RECORDING FLOW (User speaks → Stored in Collection)                   │
└─────────────────────────────────────────────────────────────────────────┘

    [User on RevealCard]
            │
            ├─→ Sees word (TTS plays first)
            │   └─→ playWordTTS() 
            │       └─→ /api/tts/{vocab_id}/{lang}
            │           └─→ ElevenLabs or OpenAI TTS
            │               └─→ Streaming → Blob URL
            │                   └─→ AudioContext.playAudioFromUrl()
            │
            ├─→ Taps microphone button
            │   └─→ unlockAudioContext() ← KEY: user gesture unlock
            │
            ├─→ startSpeechRecognition()
            │   ├─→ navigator.mediaDevices.getUserMedia({ audio: true })
            │   │   └─→ Request microphone permission
            │   ├─→ new MediaRecorder(stream, { mimeType })
            │   │   └─→ pickPronunciationRecorderMimeType()
            │   │       ├─→ WebM (Chrome/Firefox) ✅
            │   │       └─→ MP4 (iOS Safari) ⚠️
            │   └─→ 3-second recording window
            │       └─→ mediaRecorder.stop()
            │
            └─→ Audio captured as Blob
                └─→ FileReader.readAsDataURL() → base64
                    └─→ speechApi.pronounce(vocab_id, language, audio_base64)
                        └─→ POST /api/pronounce
                            └─→ Backend processes...


    [Backend Processing]
            │
            ├─→ Decode base64 → audio bytes
            ├─→ transcribe_audio() via OpenAI gpt-4o-transcribe
            │   └─→ Returns: "cat" / "gato" / etc.
            ├─→ Compare to target_word (fuzzy matching)
            ├─→ Generate BAML pronunciation feedback
            │   └─→ GeneratePronunciationFeedback()
            ├─→ Award stars (1-3) + XP
            └─→ Return PronunciationResponse
                ├─→ stars: 1 | 2 | 3
                ├─→ transcript: "cat"
                ├─→ feedback_vi: "Tuyệt vời! 🎉"
                ├─→ xp_earned: 10
                └─→ evolved: true (if card evolved)


    [Frontend Updates]
            │
            ├─→ Update game state
            │   ├─→ Add to collection
            │   ├─→ Increment XP
            │   └─→ Check level up
            ├─→ Play success sound effect
            ├─→ Trigger confetti + XP particles
            └─→ Show feedback to user


┌─────────────────────────────────────────────────────────────────────────┐
│  PLAYBACK FLOW (Stored Audio → Speaker)                                │
└─────────────────────────────────────────────────────────────────────────┘

    [User Views Word in Collection/VocabDetail]
            │
            ├─→ Taps speaker icon
            │   └─→ unlockAudioContext() (if not already unlocked)
            │
            └─→ playWordTTS() or playDescriptionTTS()
                ├─→ Check cached TTS URL from capture response
                ├─→ fallback: GET /api/tts/{vocab_id}/{lang}
                │   └─→ Server lookup cached MP3 or generate fresh
                │       └─→ ElevenLabs (preferred)
                │       └─→ OpenAI (fallback)
                │           └─→ Return streaming MP3
                ├─→ Streaming fetch → ArrayBuffer → Blob → blob URL
                ├─→ ctx.decodeAudioData(arrayBuffer)
                │   └─→ Decode MP3 → PCM audio buffer
                ├─→ source = ctx.createBufferSource()
                ├─→ source.buffer = decodedAudio
                ├─→ source.connect(ctx.destination)
                ├─→ source.start()
                └─→ Plays through speakers ✅


┌─────────────────────────────────────────────────────────────────────────┐
│  MASCOT AUDIO FLOW (Motivation Phrases)                                 │
└─────────────────────────────────────────────────────────────────────────┘

    [App Initializes]
            │
            ├─→ fetchManifest()
            │   └─→ GET /api/mascot/manifest
            │       └─→ Manifest.json: 200+ trilingual phrases
            │           └─→ Categories: random_motivational, app_shell, login, etc.
            │               ├─→ vi: "Tuyệt vời! 🎉"
            │               ├─→ en: "Awesome! 🎉"
            │               └─→ zh: "太棒了! 🎉"
            │
            ├─→ preloadCriticalAudio('vi')
            │   └─→ Pre-download key audio files for instant playback
            │
            └─→ On events: mascotSpeak(phrase, lang)
                ├─→ Look up key in textToKey map
                ├─→ getMascotAudioUrl(key, lang)
                │   └─→ /api/mascot/{key}/{lang}
                ├─→ playAudioFromUrl(blobUrl)
                └─→ Mascot speaks encouragement ✨


┌─────────────────────────────────────────────────────────────────────────┐
│  TTS GENERATION & CACHING (Server-Side)                                 │
└─────────────────────────────────────────────────────────────────────────┘

    [After Capture Success]
            │
            └─→ Background task: tts_service.ensure_cached()
                ├─→ For each language (en, vi, zh):
                │   └─→ synthesize_speech(word_text, language)
                │       ├─→ TRY: ElevenLabs.generate()
                │       │   └─→ Model: eleven_v3
                │       │   └─→ Voice: {ELEVENLABS_VOICE_ID}
                │       │   └─→ Speed: 0.80 (vi) | 0.85 (en) | 0.75 (zh)
                │       │   └─→ Format: mp3_44100_128
                │       │
                │       ├─→ CATCH ERROR → TRY: OpenAI TTS
                │       │   └─→ Model: gpt-4o-mini-tts
                │       │   └─→ Voice: "nova"
                │       │   └─→ Speed: 0.85 (en) | 0.85 (vi) | 0.8 (zh)
                │       │
                │       └─→ Save to cache: ./tts_cache/{lang}/{hash}.mp3
                │           └─→ TTL: 90 days
                │
                ├─→ Also cache description_vi TTS
                └─→ Mark in response: tts_urls: { en, vi, zh }


═════════════════════════════════════════════════════════════════════════════

KEY ARCHITECTURAL DECISIONS
═════════════════════════════════════════════════════════════════════════════

1. AUDIOCONTEXT SINGLETON
   Problem:   Mobile browsers block audio outside user gestures
   Solution:  Single shared AudioContext instance
   Unlock:    On camera button tap (user gesture)
   Benefit:   All subsequent audio plays allowed (even after async)

2. STREAMING FETCH FOR TTS
   Problem:   Large audio files could timeout / block UI
   Solution:  Streaming fetch → ArrayBuffer → Blob URL
   Benefit:   Progressive loading, AbortSignal support

3. SERVER-SIDE TTS CACHE
   Problem:   Real-time TTS synthesis is slow + expensive
   Solution:  Pre-generate + cache MP3 on background task
   Benefit:   Instant playback, cost reduction

4. BAML FALLBACK CHAINS
   Problem:   Any single AI provider could fail
   Solution:  Vision: GPT-4o → Gemini → Claude
   Benefit:   Resilient, graceful degradation

5. MIME TYPE DETECTION (INCOMPLETE ⚠️)
   Problem:   Different browsers produce different audio formats
   Current:   Assumes WebM everywhere
   Issue:     iOS Safari produces MP4 (silent failure)
   Fix:       Add platform detection + MIME selection


═════════════════════════════════════════════════════════════════════════════

CRITICAL FILES FOR AUDIO FUNCTIONALITY
═════════════════════════════════════════════════════════════════════════════

Frontend:
  📄 utils/audioContext.ts (90 lines)
     └─ getAudioContext(), unlockAudioContext(), playAudioFromUrl()
  
  📄 utils/pronunciationRecording.ts (27 lines)
     └─ pickPronunciationRecorderMimeType(), createMediaRecorder()
  
  📄 services/speechApi.ts (173 lines)
     └─ pronounce(), getTTSAudio(), synthesizeTTS()
  
  📄 components/ui/RevealCard.tsx (48 KB - LARGEST)
     └─ startSpeechRecognition(), playWordTTS(), playDescriptionTTS()
  
  📄 components/ui/VocabDetail.tsx (27 KB)
     └─ handlePractice(), audio feedback integration

Backend:
  📄 app/services/speech_service.py (150+ lines)
     └─ transcribe_audio(), judge_pronunciation(), synthesize_speech()
  
  📄 app/services/tts_service.py (209 lines)
     └─ ensure_cached(), clear_cache(), warm_cache(), get_urls()
  
  📄 app/api/speech.py (150+ lines)
     └─ @router.post("/pronounce"), @router.get("/tts/*")
  
  📄 baml_src/speech.baml (76 lines)
     └─ GeneratePronunciationFeedback()
  
  📄 app/voice_instructions.yml (244 lines)
     └─ 200+ trilingual mascot phrases manifest


═════════════════════════════════════════════════════════════════════════════

SUMMARY: AUDIO ARCHITECTURE EXCELLENCE
═════════════════════════════════════════════════════════════════════════════

✅ MOBILE-SAFE RECORDING
   └─ 3-second fixed duration, getUserMedia, MediaRecorder

✅ MOBILE-SAFE PLAYBACK
   └─ AudioContext singleton with gesture-based unlock

✅ FALLBACK CHAINS
   └─ ElevenLabs → OpenAI for TTS; GPT-4o → Gemini → Claude for vision

✅ CACHING STRATEGY
   └─ Server-side MP3 cache (90-day TTL); Pre-generation on background

✅ STREAMING
   └─ Progressive audio loading with AbortSignal support

⚠️  TODO: iOS AUDIO FORMAT DETECTION
   └─ Need platform detection + dynamic MIME type selection
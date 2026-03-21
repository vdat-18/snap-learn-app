# Audio Recording & Pronunciation Endpoint Analysis
## Snap Learn App - Frontend Audio Flow

---

## EXECUTIVE SUMMARY

The Snap Learn frontend records user pronunciation using the **MediaRecorder API** and sends it to the `/pronounce` endpoint. The flow captures audio in **WebM format** (audio/webm), encodes it as **base64**, and transmits it with the vocabulary ID and language for backend evaluation.

---

## 1. HOW AUDIO IS RECORDED IN THE BROWSER/MOBILE

### Recording Method: **MediaRecorder API**

**Files involved:**
- `RevealCard.tsx` (lines 312-398)
- `VocabDetail.tsx` (lines 69-136)

### Implementation Details:

```typescript
// Step 1: Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// Step 2: Create MediaRecorder instance
const mediaRecorder = new MediaRecorder(stream);

// Step 3: Collect audio chunks as they're recorded
const audioChunks: Blob[] = [];
mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
        audioChunks.push(event.data);
    }
};

// Step 4: Auto-stop recording after 3 seconds
setTimeout(() => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
}, 3000);

// Step 5: Start recording
mediaRecorder.start();
```

### Recording Parameters:
- **Duration**: Fixed 3 seconds (auto-stops)
- **Audio device**: System default microphone
- **getUserMedia options**: `{ audio: true }` (minimal constraints)

---

## 2. MIME TYPE / CODEC USED

### Primary Format: **WebM (audio/webm)**

**Used in both components:**

**RevealCard.tsx (line 337):**
```typescript
const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
```

**VocabDetail.tsx (line 84):**
```typescript
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
```

### Browser Support:
- **Desktop**: ✅ Chrome, Firefox, Edge, Opera (full WebM support)
- **Mobile**: 
  - **Android Chrome**: ✅ Full WebM support
  - **iOS Safari**: ⚠️ **May use MP4/AAC** (MediaRecorder fallback)

### Why WebM?
- Industry standard for web audio recording
- Efficiently compressed using Opus codec
- Good quality-to-size ratio
- Well-supported in modern browsers

### iOS Compatibility Note:
iOS Safari's MediaRecorder implementation may automatically use:
- **MIME type**: `audio/mp4` or `audio/aac`
- **Codec**: AAC (Advanced Audio Codec)

The code doesn't explicitly handle this, so iOS users will send whatever the OS provides via MediaRecorder, which the backend must be able to handle.

---

## 3. HOW AUDIO IS ENCODED & SENT TO BACKEND

### Encoding Process: **Base64 String Encoding**

**Location:** Both RevealCard.tsx (lines 336-382) and VocabDetail.tsx (lines 81-113)

### Step-by-Step Encoding:

```typescript
// Step 1: Create Blob from audio chunks
const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

// Step 2: Read Blob as DataURL (automatically base64 encodes)
const reader = new FileReader();
reader.onload = async () => {
    // Result format: "data:audio/webm;base64,<BASE64_STRING>"
    const base64 = (reader.result as string).split(',')[1];
    // Extract only the base64 part after the comma
    
    // Step 3: Send to backend
    const result = await speechApi.pronounce(
        vocabId || '',
        language,
        base64  // <-- base64-encoded audio string
    );
};
reader.readAsDataURL(audioBlob);
```

### API Request Structure (via `/pronounce` endpoint):

```typescript
// From speechApi.ts (lines 81-92)
pronounce: async (
    vocab_id: string,
    language: string,
    audio_base64: string
): Promise<PronunciationResponse> => {
    const { data } = await api.post('/pronounce', {
        vocab_id,
        language,
        audio_base64,  // base64-encoded WebM audio
    });
    return data;
}
```

### Request Payload Example:
```json
{
    "vocab_id": "vocab-12345",
    "language": "en",
    "audio_base64": "//NExAAR3qIIBEEQAP8AAH+QAAf//..." 
}
```

### Authentication Headers (via api.ts):
- **Authorization**: `Bearer <JWT_TOKEN>` (from localStorage)
- **X-Child-Id**: Child ID header (from localStorage)

---

## 4. AUDIO-RELATED HOOKS, UTILITIES & COMPONENTS

### Main Components Handling Audio Recording:

#### **RevealCard.tsx**
- **Purpose**: Record pronunciation from newly captured vocabulary
- **Key refs**: `mediaRecorderRef`, `audioChunksRef`
- **Function**: `startSpeechRecognition()` (lines 312-398)
- **Features**:
  - 3-second auto-stop recording
  - Real-time listening indicator
  - Stores result (transcript, stars, feedback)
  - Plays "Pop" sound effect on recording
  - Triggers XP flyover on success (3 stars)

#### **VocabDetail.tsx**
- **Purpose**: Practice pronunciation of already-captured vocabulary
- **Function**: `handlePractice()` (lines 69-136)
- **Features**:
  - 1200ms delay before recording starts
  - 3-second recording duration
  - Auto-speaks the word before recording (mascot)
  - Shows success/fail overlay on completion
  - Triggers haptic feedback

### Audio API Service (speechApi.ts):

```typescript
export const speechApi = {
    // Send user-recorded pronunciation
    pronounce: async (
        vocab_id: string,
        language: string,
        audio_base64: string
    ): Promise<PronunciationResponse>
    
    // Get pre-recorded TTS for the word
    getTTSAudio: async (
        vocab_id: string,
        language: string,
        signal?: AbortSignal
    ): Promise<string>  // Returns blob URL
    
    // Get TTS for description
    getDescriptionTTSAudio: async (
        vocab_id: string,
        language: string,
        signal?: AbortSignal
    ): Promise<string>  // Returns blob URL
    
    // Synthesize TTS from text
    synthesizeTTS: async (
        text: string,
        language: string,
        signal?: AbortSignal
    ): Promise<string>  // Returns blob URL
}
```

### Utilities for Audio Feedback:

#### **feedbackUtils.ts**
- `mascotSpeak(phrase, lang, forceInterrupt?)` - Vietnamese TTS feedback
- `triggerHaptic(duration)` - Haptic feedback on mobile

#### **useSoundEffects Hook** (hooks/useSoundEffects.ts)
- `playChime()` - Success sound
- `playPop()` - Button press sound
- `playChamp()` - Victory sound

### Response Type (from speechApi.ts):

```typescript
interface PronunciationResponse {
    stars: 1 | 2 | 3;              // Rating (1=poor, 3=perfect)
    match_type: 'exact' | 'contains' | 'no_match';
    transcript: string;             // What was recognized
    feedback_vi: string;            // Vietnamese feedback
    mastery: number;                // Updated mastery level
    evolved: boolean;               // Card leveled up?
    xp_earned: number;              // XP reward
    total_xp: number;               // Total user XP
}
```

---

## 5. PLATFORM-SPECIFIC CONSIDERATIONS

### Desktop Browsers (Chrome, Firefox, Edge):
✅ **WebM/Opus** - Full support, standard implementation

### Android Mobile:
✅ **WebM/Opus** - Chrome on Android uses WebM natively
- MediaRecorder produces native WebM files
- No codec compatibility issues

### iOS Safari:
⚠️ **Potential Issue**: MediaRecorder behavior differs
- May produce **MP4/AAC** instead of WebM
- Requires backend to handle multiple audio formats
- Current code hardcodes `audio/webm` - may need platform detection

**Potential iOS Fix Needed:**
```typescript
// Check for iOS and use appropriate MIME type
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const mimeType = isSafari ? 'audio/mp4' : 'audio/webm';
const audioBlob = new Blob(audioChunks, { type: mimeType });
```

---

## 6. FLOW DIAGRAM: FROM RECORDING TO API

```
User taps Microphone Button
    ↓
navigator.mediaDevices.getUserMedia({ audio: true })
    ↓
new MediaRecorder(stream) created
    ↓
mediaRecorder.start()
    ↓
[3 second recording window]
    ↓
mediaRecorder.onstop triggered
    ↓
Blob created: { type: 'audio/webm' }
    ↓
FileReader.readAsDataURL(blob)
    ↓
Extract base64 from "data:audio/webm;base64,<BASE64>"
    ↓
speechApi.pronounce(vocab_id, language, base64)
    ↓
POST /api/pronounce {
    "vocab_id": "...",
    "language": "...",
    "audio_base64": "..."
}
    ↓
Backend processes audio, returns PronunciationResponse
    ↓
Update UI with transcript, stars, feedback
    ↓
Trigger animations/sounds based on stars rating
```

---

## 7. KEY FILES SUMMARY

| File | Purpose | Key Lines |
|------|---------|-----------|
| `services/speechApi.ts` | API endpoints for pronunciation | 77-92 (pronounce endpoint) |
| `components/ui/RevealCard.tsx` | New card pronunciation practice | 312-398 (startSpeechRecognition) |
| `components/ui/VocabDetail.tsx` | Existing vocab practice | 69-136 (handlePractice) |
| `services/api.ts` | Axios setup with auth | 27-33 (base config) |
| `utils/feedbackUtils.ts` | TTS and feedback sounds | - |
| `hooks/useSoundEffects.ts` | Sound effect triggers | - |

---

## 8. IMPORTANT IMPLEMENTATION NOTES

1. **Audio is always WebM** - No format detection or fallback currently
2. **3-second fixed duration** - No user control over recording length
3. **Base64 encoding** - Audio is sent as a large text string in JSON
4. **Single attempt per request** - Each button press = one API call
5. **Auth via JWT + Child-ID** - Inherited from axios interceptor
6. **Mobile haptic + sound feedback** - Limited to supported browsers
7. **TTS is played for guidance** - User hears word before recording (VocabDetail only)

---

## 9. MOBILE SAFARI COMPATIBILITY RISK

**Current Risk Level: MEDIUM**

The code assumes all browsers use WebM, but iOS Safari may produce MP4/AAC format:
- The app will still send the audio to the backend
- Backend must be configured to accept both WebM and MP4/AAC
- If backend only accepts WebM, iOS users will get silent failures

**Recommendation**: Verify backend audio format support and potentially add platform detection.


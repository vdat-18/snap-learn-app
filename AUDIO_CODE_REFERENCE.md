# Audio Recording - Code Reference Guide
## Quick Copy-Paste Implementation Details

---

## RECORDING IMPLEMENTATION (Both Components)

### RevealCard.tsx - startSpeechRecognition() Function

**Location**: Lines 312-398

```typescript
const startSpeechRecognition = async () => {
    if (stars === 3) setStars(null);

    setIsListening(true);
    setTranscript('Tớ đang nghe...');
    setFeedbackText('');

    try {
        // 1. Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        // 2. Collect audio data
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        // 3. When recording stops, send to API
        mediaRecorder.onstop = async () => {
            // Stop all audio tracks (cleanup)
            stream.getTracks().forEach(track => track.stop());

            // 4. Create WebM blob
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // 5. Convert to base64
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const language = target_language === 'zh' ? 'zh' : 'en';

                try {
                    // 6. Send to /pronounce endpoint
                    const result = await speechApi.pronounce(
                        vocabId || '',
                        language,
                        base64
                    );

                    // 7. Handle response
                    setTranscript(result.transcript || '...');
                    setIsListening(false);

                    const scoredStars = result.stars as PronunciationTier;
                    setFeedbackText(result.feedback_vi || '');

                    const newAttemptCount = attemptCount + 1;
                    setAttemptCount(newAttemptCount);

                    // If perfect (3 stars), show success
                    if (scoredStars === 3) {
                        setStars(scoredStars);
                        if (result.evolved) {
                            triggerLegendaryBurst();
                            playChime();
                        }
                        handleSaveCollection(scoredStars, newAttemptCount);
                        setTimeout(() => {
                            setShowPostRevealOptions(true);
                        }, 1500);
                    } else {
                        setStars(null);
                    }
                } catch (err) {
                    console.error('Pronunciation API error:', err);
                    setIsListening(false);
                    setTranscript('Có lỗi xảy ra, thử lại nhé!');
                }
            };
            reader.readAsDataURL(audioBlob);
        };

        // 8. Start recording
        mediaRecorder.start();

        // 9. Auto-stop after 3 seconds
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }, 3000);
    } catch (err) {
        console.error('Microphone error:', err);
        setIsListening(false);
        setTranscript('Cho tớ nghe giọng bạn nhé!');
    }
};
```

### VocabDetail.tsx - handlePractice() Function

**Location**: Lines 69-136

```typescript
const handlePractice = async () => {
    setIsPracticing(true);

    try {
        // 1. Request microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        // 2. Collect audio chunks
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        // 3. Handle recording stop
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());

            // 4. Create WebM blob
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // 5. Convert to base64
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const language = target_language === 'zh' ? 'zh' : 'en';

                try {
                    // 6. Send to API
                    const result = await speechApi.pronounce(vocab.id, language, base64);

                    // 7. Update practice status
                    practiceWord(vocab.id, result.stars);

                    if (result.evolved) {
                        setJustEvolved(true);
                        setVocab(prev => prev ? { ...prev, evolved: true } : prev);
                        playChime();
                        triggerHaptic(200);
                    } else {
                        playPop();
                        triggerHaptic(50);
                    }
                } catch (err) {
                    console.error('Practice API error:', err);
                    practiceWord(vocab.id, 1);
                    playPop();
                    triggerHaptic(50);
                } finally {
                    setIsPracticing(false);
                }
            };
            reader.readAsDataURL(audioBlob);
        };

        // 8. Speak word (audio guidance)
        mascotSpeak(vocab.word_en, 'en-US');

        // 9. Start recording after 1.2 second delay
        setTimeout(() => {
            mediaRecorder.start();
            
            // 10. Auto-stop after 3 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 3000);
        }, 1200);
    } catch (err) {
        console.error('Microphone error:', err);
        mascotSpeak(vocab.word_en, 'en-US');
        setTimeout(() => {
            practiceWord(vocab.id, 1);
            playPop();
            triggerHaptic(50);
            setIsPracticing(false);
        }, 1200);
    }
};
```

---

## API SERVICE

### speechApi.ts - pronounce() Endpoint

**Location**: Lines 81-92

```typescript
export const speechApi = {
    /**
     * Send pronunciation audio for evaluation
     */
    pronounce: async (
        vocab_id: string,
        language: string,
        audio_base64: string
    ): Promise<PronunciationResponse> => {
        const { data } = await api.post('/pronounce', {
            vocab_id,
            language,
            audio_base64,
        });
        return data;
    },
    
    // ... other methods
};
```

**Request Format:**
```typescript
POST /api/pronounce

Headers:
  Authorization: Bearer <JWT_TOKEN>
  X-Child-Id: <CHILD_ID>
  Content-Type: application/json

Body:
{
    "vocab_id": "123e4567-e89b-12d3-a456-426614174000",
    "language": "en",  // or "zh"
    "audio_base64": "//NExAAR3qIIBEEQAP8AAH+QAAf5/9/+f/n/5/+f/n/5/+f/n/5/+f/5/+f/5/+f/5/..."
}
```

**Response Format:**
```typescript
interface PronunciationResponse {
    stars: 1 | 2 | 3;                              // Rating
    match_type: 'exact' | 'contains' | 'no_match'; // Match quality
    transcript: string;                             // Recognized text
    feedback_vi: string;                            // Vietnamese feedback
    mastery: number;                                // Updated mastery (0-3)
    evolved: boolean;                               // Card evolved?
    xp_earned: number;                              // XP gained
    total_xp: number;                               // User's total XP
}
```

---

## KEY DATA STRUCTURES

### Audio Recording State (RevealCard.tsx)

```typescript
// Refs for managing recording
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);

// UI State
const [isListening, setIsListening] = useState(false);      // Recording in progress
const [transcript, setTranscript] = useState('');           // Recognized text
const [stars, setStars] = useState<PronunciationTier | null>(null);
const [feedbackText, setFeedbackText] = useState('');       // Backend feedback
const [attemptCount, setAttemptCount] = useState(0);        // Number of attempts
```

### Audio Recording State (VocabDetail.tsx)

```typescript
// Simple state for practice screen
const [isPracticing, setIsPracticing] = useState(false);
const [practiceStatus, setPracticeStatus] = useState<'idle' | 'listening' | 'success' | 'fail'>('idle');
const [justEvolved, setJustEvolved] = useState(false);
```

---

## MIME TYPE / CODEC REFERENCE

### Current Implementation

```typescript
// Both components use:
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
```

### Browser Support Matrix

| Browser | Desktop | Mobile | Format | Codec |
|---------|---------|--------|--------|-------|
| Chrome | ✅ | ✅ | WebM | Opus |
| Firefox | ✅ | ⚠️ | WebM | Opus |
| Safari | ❌ | ⚠️ | MP4 | AAC |
| Edge | ✅ | ✅ | WebM | Opus |

### iOS Safari Workaround

```typescript
// Detect iOS Safari
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

const mimeType = isIOS && isSafari ? 'audio/mp4' : 'audio/webm';
const audioBlob = new Blob(audioChunks, { type: mimeType });
```

---

## BASE64 ENCODING PROCESS

### Step-by-Step

```typescript
// Step 1: Audio data is collected as Blob
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

// Step 2: FileReader converts to DataURL (auto base64 encodes)
const reader = new FileReader();
reader.onload = async () => {
    // reader.result = "data:audio/webm;base64,//NExAAR3qIIBEEQ..."
    
    // Step 3: Extract base64 string (everything after comma)
    const fullDataUrl = reader.result as string;
    const base64 = fullDataUrl.split(',')[1];
    
    // base64 = "//NExAAR3qIIBEEQAP8AAH+QAAf..."
    
    // Step 4: Send to backend
    await speechApi.pronounce(vocab_id, language, base64);
};

reader.readAsDataURL(audioBlob);
```

### Why Base64?

1. **JSON compatibility** - Binary data can't be sent in JSON
2. **Stateless** - Single API call, no multipart uploads needed
3. **Simple** - No special header configurations required
4. **Trade-off** - File size increases ~33% (base64 overhead)

### Size Estimation

- **3 seconds of WebM audio**: ~15-30 KB (raw)
- **Base64 encoded**: ~20-40 KB (JSON payload)
- **Plus metadata**: ~200 bytes (vocab_id, language)
- **Total request size**: ~20-40 KB

---

## AUDIO FORMATS & CONTAINER TYPES

### WebM (Current Choice)

```
Container: WebM (Matroska-based)
Audio Codec: Opus (state-of-the-art)
Sample Rate: 48 kHz (default)
Bit Rate: ~32 kbps (default)
Quality: Excellent for speech
Browser Support: Chrome, Firefox, Edge (desktop & Android)
```

### MP4 (iOS Fallback)

```
Container: MP4 (MPEG-4)
Audio Codec: AAC (Advanced Audio Codec)
Sample Rate: 44.1 kHz (typical)
Bit Rate: ~96 kbps (typical)
Quality: Good for speech
Browser Support: Safari (iOS & macOS)
```

### Comparison

| Aspect | WebM | MP4 |
|--------|------|-----|
| Compression | Excellent (Opus) | Good (AAC) |
| File Size (3s) | 15-20 KB | 25-35 KB |
| Latency | Low | Low |
| Browser Support | Chrome, Firefox, Edge | Safari, Chrome, Firefox |
| License | Open | Requires licensing |

---

## AUTHENTICATION FLOW

### JWT Token Management (api.ts)

```typescript
// Tokens stored in localStorage
localStorage.getItem('snap-learn-access-token')   // JWT
localStorage.getItem('snap-learn-refresh-token')  // Refresh token
localStorage.getItem('snap-learn-child-id')       // Child ID

// Automatically added to every request via axios interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('snap-learn-access-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    const childId = localStorage.getItem('snap-learn-child-id');
    if (childId) {
        config.headers['X-Child-Id'] = childId;
    }
    
    return config;
});
```

### /pronounce Endpoint Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Child-Id: child-12345
Content-Type: application/json
```

---

## ERROR HANDLING

### Microphone Permission Errors

```typescript
try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Success
} catch (err) {
    if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
            // User denied permission
            console.error('Microphone permission denied');
        } else if (err.name === 'NotFoundError') {
            // No microphone connected
            console.error('No microphone found');
        } else if (err.name === 'NotReadableError') {
            // Already in use by another app
            console.error('Microphone already in use');
        }
    }
    // UI fallback: show error message
    setTranscript('Cho tớ nghe giọng bạn nhé!');
}
```

### API Errors

```typescript
try {
    const result = await speechApi.pronounce(vocab_id, language, base64);
} catch (err) {
    console.error('Pronunciation API error:', err);
    
    // Fallback behavior
    setIsListening(false);
    setTranscript('Có lỗi xảy ra, thử lại nhé!');
    
    // Or use AppError from api.ts for structured errors
    if (err instanceof AppError) {
        console.error(err.message_vi, err.message_en);
    }
}
```

---

## CLEANUP & RESOURCE MANAGEMENT

### Stream Cleanup

```typescript
// CRITICAL: Always stop audio tracks
stream.getTracks().forEach(track => track.stop());
```

### Cleanup on Component Unmount

```typescript
// RevealCard.tsx lines 297-309
useEffect(() => {
    if (!isOpen) {
        // Abort any in-flight TTS fetches
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        
        // Cancel speech synthesis
        window.speechSynthesis.cancel();
        
        // Revoke blob URLs
        blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        blobUrlsRef.current = [];
    }
}, [isOpen]);
```

### Blob URL Management

```typescript
// Creating blob URLs (for TTS audio playback)
const blobUrl = URL.createObjectURL(blob);
const audio = new Audio(blobUrl);
await audio.play();

// Cleanup (very important!)
URL.revokeObjectURL(blobUrl);  // Free memory
```

---

## PERFORMANCE CONSIDERATIONS

### Recording Overhead

| Operation | Time | Notes |
|-----------|------|-------|
| getUserMedia request | 100-500ms | User permission dialog |
| MediaRecorder creation | < 5ms | Instant |
| 3-second recording | 3000ms | Fixed duration |
| Base64 encoding | 10-50ms | ~20KB file |
| API request (network) | 100-2000ms | Depends on latency |
| **Total per attempt** | ~3500-5500ms | Mostly waiting for user |

### Payload Size

```
audio_base64: 20-40 KB (3 seconds of speech)
+ vocab_id: ~40 bytes
+ language: ~5 bytes
= ~20-40 KB total JSON payload
```

### Network Optimization

- Base64 encoding adds ~33% size overhead
- Could use multipart/form-data instead (smaller)
- Could stream audio instead (complex, stateful)
- Current method is simple and reliable

---

## TESTING TIPS

### Simulate Recording

```typescript
// Mock audio for testing
const mockAudioBase64 = "//NExAAR3qIIBEEQAP8AAH+QAAf5/..."; // Actual WebM audio

// Test pronunciation endpoint
const result = await speechApi.pronounce('vocab-id', 'en', mockAudioBase64);
console.log(result);
```

### Browser DevTools

```javascript
// Check if microphone access works
navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => console.log(device));
});

// Check localStorage tokens
console.log(localStorage.getItem('snap-learn-access-token'));
console.log(localStorage.getItem('snap-learn-child-id'));
```

---

## POTENTIAL IMPROVEMENTS

1. **Platform-specific MIME types** - Detect iOS and use MP4/AAC
2. **Streaming upload** - Use multipart/form-data for smaller payloads
3. **Recording controls** - Let user stop recording early
4. **Audio level monitoring** - Show volume levels during recording
5. **Network retry logic** - Retry failed API calls
6. **Offline support** - Queue recordings and sync when online
7. **Audio format detection** - Query browser capabilities
8. **Quality settings** - Allow users to choose audio quality


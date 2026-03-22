import { useGameStore } from '../store/gameStore';
import { getTextToKeyMap, getMascotAudioUrl, getRandomMotivationalEntries } from '../services/mascotAudioApi';
import { speechApi } from '../services/speechApi';

/**
 * Triggers a vibration on supported devices (Android/WebXR)
 */
export const triggerHaptic = (pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn('Haptics not supported or blocked by user policy');
        }
    }
};

/**
 * Mascot motivational phrases in Vietnamese (Short & Sweet)
 * Used as fallback when manifest is not loaded.
 */
const MOTIVATIONAL_PHRASES = [
    "Oa! Quà xịn đây rồi nè!",
    "Tuyệt quá! Tìm thêm từ nữa đi!",
    "Bạn tinh mắt thật! Tiếp thôi!",
    "Từ này hay quá! Tập nói nha!",
    "Bạn nhạy bén thật! Sâu ơi!",
    "Sắp đầy kho báu rồi! Cố lên!"
];

/**
 * Map FE language codes to BE language codes.
 */
const LANG_CODE_MAP: Record<string, string> = {
    'vi-VN': 'vi',
    'en-US': 'en',
    'zh-CN': 'zh',
};

/**
 * Currently playing Audio element (for interrupt support).
 */
let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using pre-generated ElevenLabs audio (primary) or backend TTS API (fallback).
 *
 * The function signature is backward-compatible — no changes needed in call sites.
 */
export const mascotSpeak = (text?: string, lang: 'vi-VN' | 'en-US' | 'zh-CN' = 'vi-VN', forceInterrupt = false) => {
    const textToKey = getTextToKeyMap();
    const beLang = LANG_CODE_MAP[lang] || 'vi';

    // Determine the phrase to speak
    let phrase: string;
    let audioKey: string | undefined;

    if (!text) {
        // No text: pick a random motivational phrase
        const motivationalEntries = getRandomMotivationalEntries();
        if (motivationalEntries.length > 0) {
            const entry = motivationalEntries[Math.floor(Math.random() * motivationalEntries.length)];
            phrase = entry.vi; // Display text is always Vietnamese
            audioKey = entry.key;
        } else {
            // Fallback to hardcoded phrases if manifest not loaded
            phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
        }
    } else {
        phrase = text;
        audioKey = textToKey[text];
    }

    // Update UI first (always, regardless of audio source)
    useGameStore.getState().setMascotMessage({
        text: phrase,
        state: 'talking'
    });

    // Always stop previous audio to prevent overlap
    _stopCurrentAudio();

    // Try pre-generated audio first, fall back to backend TTS
    if (audioKey) {
        _playPreGeneratedAudio(audioKey, beLang, phrase, lang, forceInterrupt);
    } else {
        // No matching key — use backend TTS directly
        console.log(`[MascotTTS] No pre-generated audio for: "${phrase.substring(0, 40)}..." — using backend TTS`);
        _speakWithBackendTTS(phrase, lang, forceInterrupt);
    }
};

/**
 * Play pre-generated audio from the backend.
 * Falls back to backend TTS on error.
 */
function _playPreGeneratedAudio(
    key: string,
    beLang: string,
    phrase: string,
    feLang: 'vi-VN' | 'en-US' | 'zh-CN',
    forceInterrupt: boolean,
): void {
    const url = getMascotAudioUrl(key, beLang);

    const audio = new Audio(url);
    currentAudio = audio;
    let didFallback = false;

    const fallbackOnce = () => {
        if (didFallback || currentAudio !== audio) return;
        didFallback = true;
        _speakWithBackendTTS(phrase, feLang, forceInterrupt);
    };

    audio.addEventListener('error', () => {
        console.warn(`[MascotTTS] Pre-generated audio failed for ${key}/${beLang} — falling back to backend TTS`);
        fallbackOnce();
    });

    audio.addEventListener('ended', () => {
        if (currentAudio === audio) {
            currentAudio = null;
        }
    });

    audio.play().then(() => {
        console.log(`[MascotTTS] Playing pre-generated: ${key}/${beLang}`);
    }).catch((err) => {
        if (currentAudio !== audio) {
            console.log(`[MascotTTS] Audio interrupted for ${key}/${beLang} — skipping fallback`);
            return;
        }
        console.warn(`[MascotTTS] Audio play() failed for ${key}/${beLang}:`, err);
        fallbackOnce();
    });
}

/**
 * Stop currently playing mascot audio.
 * Exported for component cleanup (e.g. unmount).
 */
export function stopMascotAudio(): void {
    _stopCurrentAudio();
}

function _stopCurrentAudio(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

/**
 * Fallback: Speak text using backend TTS API (ElevenLabs / OpenAI).
 * Fire-and-forget — errors are logged but don't propagate.
 */
function _speakWithBackendTTS(phrase: string, lang: 'vi-VN' | 'en-US' | 'zh-CN', _forceInterrupt: boolean): void {
    const beLang = LANG_CODE_MAP[lang] || 'vi';

    // Mark that we're starting a new TTS request — clear any stale reference
    // (e.g. a failed pre-generated audio element that triggered this fallback)
    _stopCurrentAudio();

    // Fire-and-forget async — callers remain synchronous
    (async () => {
        try {
            console.log(`[MascotTTS:Backend] Synthesizing: "${phrase.substring(0, 40)}..." (${beLang})`);
            const blobUrl = await speechApi.synthesizeTTS(phrase, beLang);

            // If another audio started while we were fetching, bail out
            if (currentAudio !== null) {
                URL.revokeObjectURL(blobUrl);
                return;
            }

            const audio = new Audio(blobUrl);
            currentAudio = audio;

            audio.addEventListener('ended', () => {
                if (currentAudio === audio) {
                    currentAudio = null;
                }
                URL.revokeObjectURL(blobUrl);
            });

            audio.addEventListener('error', () => {
                console.warn(`[MascotTTS:Backend] Audio playback error for: "${phrase.substring(0, 40)}..."`);
                if (currentAudio === audio) {
                    currentAudio = null;
                }
                URL.revokeObjectURL(blobUrl);
            });

            await audio.play();
            console.log(`[MascotTTS:Backend] Playing synthesized audio for: "${phrase.substring(0, 40)}..."`);
        } catch (err) {
            console.warn(`[MascotTTS:Backend] TTS synthesis failed for: "${phrase.substring(0, 40)}..."`, err);
        }
    })();
}

import { useGameStore } from '../store/gameStore';
import { getTextToKeyMap, getMascotAudioUrl, getRandomMotivationalEntries } from '../services/mascotAudioApi';

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
 * Speak text using pre-generated ElevenLabs audio (primary) or Web Speech API (fallback).
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

    // Try pre-generated audio first, fall back to Web Speech API
    if (audioKey) {
        _playPreGeneratedAudio(audioKey, beLang, phrase, lang, forceInterrupt);
    } else {
        // No matching key — use Web Speech API directly
        console.log(`[MascotTTS] No pre-generated audio for: "${phrase.substring(0, 40)}..." — using Web Speech API`);
        _speakWithWebSpeechAPI(phrase, lang, forceInterrupt);
    }
};

/**
 * Play pre-generated audio from the backend.
 * Falls back to Web Speech API on error.
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
        _speakWithWebSpeechAPI(phrase, feLang, forceInterrupt);
    };

    audio.addEventListener('error', () => {
        console.warn(`[MascotTTS] Pre-generated audio failed for ${key}/${beLang} — falling back to Web Speech API`);
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
 * Stop currently playing mascot audio (both Audio element and Web Speech API).
 * Exported for component cleanup (e.g. unmount).
 */
export function stopMascotAudio(): void {
    _stopCurrentAudio();
}

function _stopCurrentAudio(): void {
    // Stop Audio element
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Also cancel Web Speech API
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Fallback: Speak text using Web Speech API (TTS).
 * This is the original implementation, kept as fallback.
 */
function _speakWithWebSpeechAPI(phrase: string, lang: 'vi-VN' | 'en-US' | 'zh-CN', forceInterrupt: boolean): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const startSpeak = () => {
        // Force engine to resume
        window.speechSynthesis.resume();

        // Optional interrupt (can cause skipping if triggered too fast)
        if (forceInterrupt) {
            window.speechSynthesis.cancel();
        }

        console.log(`[MascotTTS:WebSpeech] Speaking: ${phrase} (${lang})`);

        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = lang;
        utterance.rate = 1.0;

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(v =>
            v.lang.replace('_', '-').includes(lang) &&
            (v.name.includes('Google') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.replace('_', '-').includes(lang)) ||
            voices.find(v => v.lang.startsWith(lang.split('-')[0]));

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.pitch = 1.1;

        // Small delay for stability before calling speak
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);

        // Extra insurance for Desktop Chrome
        setTimeout(() => {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        }, 150);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            startSpeak();
        }, { once: true });
        window.speechSynthesis.getVoices();
    } else {
        startSpeak();
    }
}

import { useGameStore } from '../store/gameStore';
import { getTextToKeyMap, getMascotAudioUrl } from '../services/mascotAudioApi';
import { speechApi } from '../services/speechApi';
import { playAudioFromUrl, stopCurrentAudioContext } from './audioContext';

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
 * Map FE language codes to BE language codes.
 */
const LANG_CODE_MAP: Record<string, string> = {
    'vi-VN': 'vi',
    'en-US': 'en',
    'zh-CN': 'zh',
};

/**
 * Track whether audio is currently playing (for interrupt support).
 * Incremented each time a new audio starts; if the value changes
 * during an async gap, the stale playback should bail out.
 */
let playbackGeneration = 0;

/**
 * Speak text using pre-generated ElevenLabs audio (primary) or backend TTS API (fallback).
 *
 * The function signature is backward-compatible — no changes needed in call sites.
 */
export const mascotSpeak = (text?: string, lang: 'vi-VN' | 'en-US' | 'zh-CN' = 'vi-VN', forceInterrupt = false) => {
    const textToKey = getTextToKeyMap();
    const beLang = LANG_CODE_MAP[lang] || 'vi';

    // If no text provided, do nothing
    if (!text) return;

    // Determine the phrase to speak
    const phrase: string = text;
    const audioKey: string | undefined = textToKey[text];

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
 * Play pre-generated audio from the backend via shared AudioContext.
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
    const gen = ++playbackGeneration;

    (async () => {
        try {
            await playAudioFromUrl(url);
            console.log(`[MascotTTS] Playing pre-generated: ${key}/${beLang}`);
        } catch (err) {
            // If we've been superseded by newer playback, don't fallback
            if (playbackGeneration !== gen) {
                console.log(`[MascotTTS] Audio interrupted for ${key}/${beLang} — skipping fallback`);
                return;
            }
            console.warn(`[MascotTTS] Pre-generated audio failed for ${key}/${beLang} — falling back to backend TTS`, err);
            _speakWithBackendTTS(phrase, feLang, forceInterrupt);
        }
    })();
}

/**
 * Stop currently playing mascot audio.
 * Exported for component cleanup (e.g. unmount).
 */
export function stopMascotAudio(): void {
    _stopCurrentAudio();
}

function _stopCurrentAudio(): void {
    playbackGeneration++;
    stopCurrentAudioContext();
}

/**
 * Fallback: Speak text using backend TTS API (ElevenLabs / OpenAI).
 * Fire-and-forget — errors are logged but don't propagate.
 */
function _speakWithBackendTTS(phrase: string, lang: 'vi-VN' | 'en-US' | 'zh-CN', _forceInterrupt: boolean): void {
    const beLang = LANG_CODE_MAP[lang] || 'vi';

    // Mark that we're starting a new TTS request — clear any stale playback
    _stopCurrentAudio();
    const gen = ++playbackGeneration;

    // Fire-and-forget async — callers remain synchronous
    (async () => {
        try {
            console.log(`[MascotTTS:Backend] Synthesizing: "${phrase.substring(0, 40)}..." (${beLang})`);
            const blobUrl = await speechApi.synthesizeTTS(phrase, beLang);

            // If another audio started while we were fetching, bail out
            if (playbackGeneration !== gen) {
                URL.revokeObjectURL(blobUrl);
                return;
            }

            await playAudioFromUrl(blobUrl);
            console.log(`[MascotTTS:Backend] Playing synthesized audio for: "${phrase.substring(0, 40)}..."`);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.warn(`[MascotTTS:Backend] TTS synthesis failed for: "${phrase.substring(0, 40)}..."`, err);
        }
    })();
}

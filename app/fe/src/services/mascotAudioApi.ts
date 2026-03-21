/**
 * Mascot Audio API — fetch pre-generated mascot voice audio from the backend.
 *
 * Provides:
 * - fetchManifest(): loads the manifest of available audio keys
 * - Module-level cache for manifest + text→key reverse lookup
 * - getMascotAudioUrl(): build audio URL from key + language
 * - preloadAudio(): preload critical audio files into browser cache
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// --- Types ---

export interface MascotManifestEntry {
    key: string;
    vi: string;
    en: string;
    zh: string;
    urls: Record<string, string>; // { vi: "/api/tts/mascot/...", en: "...", zh: "..." }
    template: boolean;
}

export interface MascotManifest {
    categories: Record<string, MascotManifestEntry[]>;
    textToKey: Record<string, string>;
}

// --- Module-level cache ---

let cachedManifest: MascotManifest | null = null;
let manifestLoading: Promise<MascotManifest | null> | null = null;

/**
 * Get the cached manifest (null if not yet loaded or load failed).
 */
export function getManifest(): MascotManifest | null {
    return cachedManifest;
}

/**
 * Get the text→key reverse lookup map.
 */
export function getTextToKeyMap(): Record<string, string> {
    return cachedManifest?.textToKey ?? {};
}

/**
 * Get all entries for random_motivational category (for random phrase selection).
 */
export function getRandomMotivationalEntries(): MascotManifestEntry[] {
    return cachedManifest?.categories?.random_motivational ?? [];
}

/**
 * Build the full audio URL for a mascot key + language.
 */
export function getMascotAudioUrl(key: string, lang: string): string {
    return `${BASE_URL}/tts/mascot/${key}/${lang}`;
}

/**
 * Fetch the mascot audio manifest from the backend.
 * Results are cached in module-level state.
 * Returns null on failure (graceful degradation).
 */
export async function fetchManifest(): Promise<MascotManifest | null> {
    // Return cached result if available
    if (cachedManifest) return cachedManifest;

    // Deduplicate concurrent calls
    if (manifestLoading) return manifestLoading;

    manifestLoading = _doFetchManifest();
    const result = await manifestLoading;
    manifestLoading = null;
    return result;
}

async function _doFetchManifest(): Promise<MascotManifest | null> {
    try {
        const response = await fetch(`${BASE_URL}/tts/mascot/manifest`);
        if (!response.ok) {
            console.warn(`[MascotAudio] Manifest fetch failed: ${response.status}`);
            return null;
        }

        const data: MascotManifest = await response.json();
        cachedManifest = data;

        const keyCount = Object.keys(data.textToKey || {}).length;
        const categoryCount = Object.keys(data.categories || {}).length;
        console.log(`[MascotAudio] Manifest loaded: ${keyCount} text mappings across ${categoryCount} categories`);

        return data;
    } catch (error) {
        console.warn('[MascotAudio] Failed to fetch manifest, falling back to Web Speech API:', error);
        return null;
    }
}

/**
 * Preload critical mascot audio files into browser cache.
 * Called after manifest loads to ensure instant playback for key screens.
 */
export function preloadCriticalAudio(lang: string = 'vi'): void {
    if (!cachedManifest) return;

    // Critical keys: splash screen, camera default, camera return
    const criticalKeys = ['app_shell__6', 'app_shell__4', 'app_shell__5'];

    for (const key of criticalKeys) {
        const textToKey = cachedManifest.textToKey;
        // Verify this key actually exists in the manifest
        const hasKey = Object.values(textToKey).includes(key);
        if (!hasKey) continue;

        const url = getMascotAudioUrl(key, lang);

        // Preload by creating an Audio element
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;
            // Don't need to keep reference — browser caches the request
            console.log(`[MascotAudio] Preloading: ${key}/${lang}`);
        } catch (error) {
            console.warn(`[MascotAudio] Preload failed for ${key}:`, error);
        }
    }
}

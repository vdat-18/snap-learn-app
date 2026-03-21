import api from './api';

// --- Types ---

export interface PronunciationResponse {
    stars: 1 | 2 | 3;
    match_type: 'exact' | 'contains' | 'no_match';
    transcript: string;
    feedback_vi: string;
    mastery: number;
    evolved: boolean;
    xp_earned: number;
    total_xp: number;
    image_url: string | null;
}

// --- Helpers ---

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Build auth headers matching the axios interceptor pattern.
 */
function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('snap-learn-access-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const childId = localStorage.getItem('snap-learn-child-id');
    if (childId) headers['X-Child-Id'] = childId;
    return headers;
}

/**
 * Fetch audio via streaming ReadableStream, accumulate into Blob URL.
 * Supports AbortSignal for cancellation on component unmount.
 */
async function fetchAudioStream(url: string, signal?: AbortSignal): Promise<string> {
    const response = await fetch(`${BASE_URL}${url}`, {
        headers: getAuthHeaders(),
        signal,
    });

    if (!response.ok) {
        throw new Error(`TTS fetch failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        // Fallback: read as blob directly
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.length;
    }

    // Combine chunks into a single ArrayBuffer → Blob
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }

    const blob = new Blob([combined], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
}

// --- Speech API ---

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

    /**
     * Get TTS audio for a vocab word via streaming fetch.
     * Returns a blob URL for audio playback.
     * Supports AbortSignal for cancellation.
     */
    getTTSAudio: async (
        vocab_id: string,
        language: string,
        signal?: AbortSignal
    ): Promise<string> => {
        return fetchAudioStream(`/tts/${vocab_id}/${language}`, signal);
    },

    /**
     * Get TTS audio for a vocab description via streaming fetch.
     * Returns a blob URL for audio playback.
     * Supports AbortSignal for cancellation.
     */
    getDescriptionTTSAudio: async (
        vocab_id: string,
        language: string,
        signal?: AbortSignal
    ): Promise<string> => {
        return fetchAudioStream(`/tts/description/${vocab_id}/${language}`, signal);
    },

    /**
     * Synthesize TTS audio for arbitrary text via ElevenLabs.
     * POST /tts/synthesize with { text, language }.
     * Returns a blob URL for audio playback.
     * Uses server-side cache — repeated calls for the same text are instant.
     */
    synthesizeTTS: async (
        text: string,
        language: string,
        signal?: AbortSignal
    ): Promise<string> => {
        const response = await fetch(`${BASE_URL}/tts/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ text, language }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`TTS synthesize failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }

        const chunks: Uint8Array[] = [];
        let totalLength = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalLength += value.length;
        }

        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        const blob = new Blob([combined], { type: 'audio/mpeg' });
        return URL.createObjectURL(blob);
    },
};

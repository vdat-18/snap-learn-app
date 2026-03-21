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
     * Get TTS audio for a vocab word
     * Returns a blob URL for audio playback
     */
    getTTSAudio: async (vocab_id: string, language: string): Promise<string> => {
        const response = await api.get(`/tts/${vocab_id}/${language}`, {
            responseType: 'blob',
        });
        return URL.createObjectURL(response.data);
    },
};

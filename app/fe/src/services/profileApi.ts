import api from './api';

// --- Types ---

export interface Badge {
    id: string;
    name_vi: string;
    icon: string;
    description_vi: string;
    earned: boolean;
    earned_at?: string;
}

export interface ProfileStats {
    total_words: number;
    total_categories: number;
    words_this_week: number;
    pronunciations_total: number;
    missions_completed: number;
}

export interface ProfileResponse {
    id: string;
    name: string;
    avatar_id: string;
    target_language: string;
    secondary_language?: string;
    total_xp: number;
    level: number;
    level_name: string;
    current_streak: number;
    longest_streak: number;
    badges: Badge[];
    stats: ProfileStats;
}

// --- Profile API ---

export const profileApi = {
    /**
     * Get the current child's profile
     */
    getProfile: async (): Promise<ProfileResponse> => {
        const { data } = await api.get('/profile');
        return data;
    },
};

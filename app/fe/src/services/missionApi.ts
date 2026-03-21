import api from './api';

// --- Types ---

export interface Mission {
    id: string;
    type: string;
    description_vi: string;
    description_en: string;
    target_count: number;
    current_count: number;
    reward_xp: number;
    reward_badge?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'claimed';
    expires_at?: string;
}

export interface MissionsResponse {
    daily: Mission[];
    weekly: Mission[];
    category_challenges: Mission[];
}

export interface ClaimResponse {
    mission_id: string;
    xp_earned: number;
    total_xp: number;
    level: number;
    level_up: boolean;
    badge_earned?: string;
}

// --- Mission API ---

export const missionApi = {
    /**
     * Get all active missions
     */
    getMissions: async (): Promise<MissionsResponse> => {
        const { data } = await api.get('/missions');
        return data;
    },

    /**
     * Claim a completed mission reward
     */
    claimMission: async (missionId: string): Promise<ClaimResponse> => {
        const { data } = await api.post(`/missions/${missionId}/claim`);
        return data;
    },
};

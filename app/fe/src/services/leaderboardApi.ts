import api from './api';

// --- Types ---

export interface RankEntry {
    rank: number;
    child_id: string;
    name: string;
    avatar_id: string;
    points: number;
}

export interface LeaderboardResponse {
    scope: string;
    period: string;
    entries: RankEntry[];
    my_rank: number;
    my_score: number;
    reset_date: string;
}

// --- Leaderboard API ---

export const leaderboardApi = {
    /**
     * Get leaderboard for a given scope
     */
    getLeaderboard: async (scope: string, limit?: number): Promise<LeaderboardResponse> => {
        const params = limit ? { limit } : {};
        const { data } = await api.get(`/leaderboard/${scope}`, { params });
        return data;
    },
};

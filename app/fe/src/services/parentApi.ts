import api from './api';

// --- Types ---

export interface ChallengeResponse {
    challenge_id: string;
    question: string;
}

export interface VerifyResponse {
    verified: boolean;
    parent_token?: string;
}

export interface DashboardResponse {
    overview: any;
    word_trends: any;
    language_breakdown: any;
    pronunciation_mastery: any;
}

export interface ActivityEntry {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    details: any;
}

export interface ActivityFeedResponse {
    entries: ActivityEntry[];
    total: number;
    offset: number;
}

// --- Parent API ---

export const parentApi = {
    /**
     * Get a parent gate challenge (math problem)
     */
    getChallenge: async (): Promise<ChallengeResponse> => {
        const { data } = await api.post('/parent-gate/challenge');
        return data;
    },

    /**
     * Verify the parent gate challenge answer
     */
    verifyChallenge: async (challenge_id: string, answer: number): Promise<VerifyResponse> => {
        const { data } = await api.post('/parent-gate/verify', { challenge_id, answer });
        return data;
    },

    /**
     * Get parent dashboard data
     */
    getDashboard: async (child_id: string): Promise<DashboardResponse> => {
        const { data } = await api.get('/parent/dashboard', { params: { child_id } });
        return data;
    },

    /**
     * Get activity feed for a child
     */
    getActivityFeed: async (child_id: string, limit = 50, offset = 0): Promise<ActivityFeedResponse> => {
        const { data } = await api.get('/parent/activity-feed', {
            params: { child_id, limit, offset },
        });
        return data;
    },

    /**
     * Update parental controls
     */
    updateControls: async (child_id: string, updates: Record<string, any>): Promise<any> => {
        const { data } = await api.patch('/parent/controls', { child_id, ...updates });
        return data;
    },

    /**
     * Export child data as CSV
     */
    exportCSV: async (child_id: string): Promise<void> => {
        const response = await api.get('/parent/export', {
            params: { child_id },
            responseType: 'blob',
        });
        // Trigger file download
        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snaplearn-export-${child_id}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
};

import api from './api';

// --- Types ---

export interface ChildProfile {
    id: string;
    name: string;
    avatar_id: string;
    target_language: string;
    secondary_language?: string;
    level: number;
    total_xp: number;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    parent_id: string;
    children: ChildProfile[];
}

export interface RegisterResponse extends TokenResponse {}

export interface LoginResponse extends TokenResponse {}

// --- Auth API ---

export const authApi = {
    /**
     * Register a new parent account
     */
    register: async (email: string, password: string): Promise<RegisterResponse> => {
        const { data } = await api.post('/auth/register', { email, password });
        return data;
    },

    /**
     * Login with existing parent account
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
        const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
        return data;
    },

    /**
     * Create a child profile under the parent account
     */
    createChild: async (
        name: string,
        avatar_id: string,
        target_language: string
    ): Promise<ChildProfile> => {
        const { data } = await api.post('/children', { name, avatar_id, target_language });
        return data;
    },
};

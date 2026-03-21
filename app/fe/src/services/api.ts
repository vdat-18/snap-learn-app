import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// --- Types ---

export interface ApiError {
    code: string;
    message_vi: string;
    message_en: string;
}

export class AppError extends Error {
    code: string;
    message_vi: string;
    message_en: string;

    constructor(error: ApiError) {
        super(error.message_en);
        this.code = error.code;
        this.message_vi = error.message_vi;
        this.message_en = error.message_en;
    }
}

// --- Axios Instance ---

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// --- Token Management (read from localStorage, synced with gameStore) ---

const getAccessToken = (): string | null => {
    return localStorage.getItem('snap-learn-access-token');
};

const getRefreshToken = (): string | null => {
    return localStorage.getItem('snap-learn-refresh-token');
};

const getChildId = (): string | null => {
    return localStorage.getItem('snap-learn-child-id');
};

export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('snap-learn-access-token', accessToken);
    localStorage.setItem('snap-learn-refresh-token', refreshToken);
};

export const setChildId = (childId: string) => {
    localStorage.setItem('snap-learn-child-id', childId);
};

export const clearTokens = () => {
    localStorage.removeItem('snap-learn-access-token');
    localStorage.removeItem('snap-learn-refresh-token');
    localStorage.removeItem('snap-learn-child-id');
    localStorage.removeItem('snap-learn-parent-id');
};

// --- Request Interceptor: Attach JWT & Child-Id ---

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const childId = getChildId();
    if (childId) {
        config.headers['X-Child-Id'] = childId;
    }

    return config;
});

// --- Response Interceptor: Token Refresh & Error Parsing ---

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any | null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
            reject(error);
        } else {
            resolve(api(config));
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 — attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                isRefreshing = false;
                clearTokens();
                window.location.reload();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                setTokens(data.access_token, data.refresh_token);
                isRefreshing = false;
                processQueue(null);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                clearTokens();
                window.location.reload();
                return Promise.reject(refreshError);
            }
        }

        // Parse backend AppError format
        if (error.response?.data) {
            const responseData = error.response.data as any;
            if (responseData.error) {
                throw new AppError({
                    code: responseData.error.code || 'UNKNOWN',
                    message_vi: responseData.error.message_vi || 'Đã xảy ra lỗi',
                    message_en: responseData.error.message_en || 'An error occurred',
                });
            }
            // Alternative error format: { detail: string }
            if (responseData.detail) {
                throw new AppError({
                    code: 'API_ERROR',
                    message_vi: responseData.detail,
                    message_en: responseData.detail,
                });
            }
        }

        throw error;
    }
);

export default api;

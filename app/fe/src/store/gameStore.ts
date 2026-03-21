import { create } from 'zustand';
import { setTokens, setChildId, clearTokens } from '../services/api';
import type { ChildProfile } from '../services/authApi';

// --- Types ---

export interface Quest {
    id: string;
    title: string;
    description: string;
    progress: number;
    total: number;
    rewardXP: number;
    rewardBadge?: string;
    status: 'in-progress' | 'completed' | 'claimed';
    category: 'Today' | 'Weekly' | 'Challenge';
    createdAt: string;
    expiresAt?: string;
}

export interface CaptureResponse {
    status: 'new_capture' | 'duplicate' | 'low_confidence';
    vocab_card: {
        id: string;
        word_en: string;
        word_vi: string;
        word_zh: string;
        pinyin: string;
        phonetic_en: string;
        category: string;
        rarity_tier: string;
        description_en: string | null;
        description_vi: string | null;
        description_zh: string | null;
        fun_fact_vi: string | null;
        example_sentence_en: string | null;
        example_sentence_vi: string | null;
        example_sentence_zh: string | null;
        confidence: number;
        photo_url: string;
    };
    xp_earned: number;
    total_xp: number;
    level: number;
    level_up: boolean;
    mission_updates: Array<{
        mission_id: string;
        description_vi: string;
        current_count: number;
        target_count: number;
        completed: boolean;
    }>;
    tts_urls: { en: string; vi: string; zh: string };
    description_tts_urls: { en: string | null; vi: string | null; zh: string | null } | null;
    message_vi: string;
}

export interface CapturedWord {
    id: string;
    word_en: string;
    word_vi: string;
    word_zh: string;
    image: string;
    stars: number;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    category: string;
    capturedAt: string;
    practiceCount: number;
    isEvolved: boolean;
    description_en?: string | null;
    description_vi?: string | null;
    description_zh?: string | null;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    points: number;
    rank: number;
    avatar: string;
}

// --- State Interface ---

interface GameState {
    // Server-synced state
    xp: number;
    streak: number;
    level: number;
    lastCapturedAt: string | null;
    capturedCount: number;
    collections: CapturedWord[];
    quests: Quest[];
    levelUpMessage: { newLevel: number; xpGained: number } | null;

    // Mascot UI state
    mascotMessage: { text: string; state: 'talking' | 'idle' } | null;
    setMascotMessage: (msg: { text: string; state: 'talking' | 'idle' }) => void;
    clearMascotMessage: () => void;

    // Auth state
    accessToken: string | null;
    refreshToken: string | null;
    parentId: string | null;
    childId: string | null;
    childProfile: ChildProfile | null;

    // Auth actions
    setAuth: (tokens: { accessToken: string; refreshToken: string }, parentId: string) => void;
    setChild: (childId: string, profile: ChildProfile) => void;
    clearAuth: () => void;
    hydrateFromStorage: () => void;

    // Server state sync
    setFromCaptureResponse: (response: CaptureResponse) => void;

    // User profile
    userName: string | null;
    userAvatar: string | null;
    setUserName: (name: string) => void;
    setUserAvatar: (avatar: string) => void;

    // Language settings
    target_language: 'en' | 'zh' | null;
    secondary_language: 'en' | 'zh' | null;
    setTargetLanguage: (lang: 'en' | 'zh') => void;
    setSecondaryLanguage: (lang: 'en' | 'zh' | null) => void;

    // Local-only UI state
    hasSeenOnboarding: boolean;
    setOnboardingSeen: () => void;
    clearLevelUpMessage: () => void;

    // Daily Time Limit (client-side tracking)
    dailyLimitMinutes: number;
    todayUsageSeconds: number;
    lastUsageDate: string | null;
    setDailyLimitMinutes: (minutes: number) => void;
    incrementUsageSeconds: () => void;
    isTimeLimitExceeded: () => boolean;
    checkAndResetDailyUsage: () => void;

    // Online status
    isOnline: boolean;
    setIsOnline: (online: boolean) => void;

    // Local cache helpers (update local state after server confirms)
    addCollection: (word: CapturedWord) => void;
    practiceWord: (wordId: string, stars: number) => void;

    // Reset
    resetAll: () => void;
}

// --- Store Implementation ---

export const useGameStore = create<GameState>()((set, get) => ({
    // Server-synced state (defaults)
    xp: 0,
    streak: 0,
    level: 1,
    lastCapturedAt: null,
    capturedCount: 0,
    collections: [],
    quests: [],
    levelUpMessage: null,

    // Auth state
    accessToken: null,
    refreshToken: null,
    parentId: null,
    childId: null,
    childProfile: null,

    // Local UI state
    hasSeenOnboarding: false,
    dailyLimitMinutes: 30,
    todayUsageSeconds: 0,
    lastUsageDate: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    mascotMessage: null,

    // --- Auth Actions ---

    setAuth: (tokens, parentId) => {
        setTokens(tokens.accessToken, tokens.refreshToken);
        localStorage.setItem('snap-learn-parent-id', parentId);
        set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            parentId,
        });
    },

    setChild: (childId, profile) => {
        setChildId(childId);
        set({
            childId,
            childProfile: profile,
            userName: profile.name,
            userAvatar: profile.avatar_id,
            target_language: (profile.target_language === 'en' || profile.target_language === 'zh') ? profile.target_language : 'en',
            secondary_language: profile.secondary_language === 'en' || profile.secondary_language === 'zh' ? profile.secondary_language : null,
            xp: profile.total_xp,
            level: profile.level,
        });
    },

    clearAuth: () => {
        clearTokens();
        set({
            accessToken: null,
            refreshToken: null,
            parentId: null,
            childId: null,
            childProfile: null,
            userName: null,
            userAvatar: null,
            xp: 0,
            level: 1,
            streak: 0,
            collections: [],
            quests: [],
        });
    },

    hydrateFromStorage: () => {
        const accessToken = localStorage.getItem('snap-learn-access-token');
        const refreshToken = localStorage.getItem('snap-learn-refresh-token');
        const parentId = localStorage.getItem('snap-learn-parent-id');
        const childId = localStorage.getItem('snap-learn-child-id');

        if (accessToken && refreshToken && parentId) {
            set({
                accessToken,
                refreshToken,
                parentId,
                childId,
            });
        }
    },

    // --- Server State Sync ---

    setFromCaptureResponse: (response: CaptureResponse) => {
        const previousLevel = get().level;
        const levelUpMessage = response.level_up && response.level > previousLevel
            ? { newLevel: response.level, xpGained: response.xp_earned }
            : null;

        const rarityMap: Record<string, CapturedWord['rarity']> = {
            'common': 'Common', 'uncommon': 'Uncommon', 'rare': 'Rare',
            'epic': 'Epic', 'legendary': 'Legendary',
        };
        const categoryMap: Record<string, string> = {
            'animals': 'Animals', 'food': 'Food', 'nature': 'Nature',
            'school': 'School', 'home': 'Home', 'vehicles': 'Vehicles',
        };

        set((state) => {
            const updates: Partial<GameState> = {
                xp: response.total_xp,
                level: response.level,
                levelUpMessage,
                capturedCount: state.capturedCount + 1,
                lastCapturedAt: new Date().toISOString(),
            };

            if (response.status === 'new_capture' && response.vocab_card) {
                const vc = response.vocab_card;
                const newWord: CapturedWord = {
                    id: vc.id,
                    word_en: vc.word_en,
                    word_vi: vc.word_vi,
                    word_zh: vc.word_zh,
                    image: vc.photo_url,
                    stars: 1,
                    rarity: rarityMap[vc.rarity_tier] || 'Common',
                    category: categoryMap[vc.category] || vc.category,
                    capturedAt: new Date().toISOString(),
                    practiceCount: 0,
                    isEvolved: false,
                };
                updates.collections = [...state.collections, newWord];
            }

            return updates as any;
        });
    },

    // --- User Profile ---

    userName: null,
    userAvatar: null,
    setUserName: (name: string) => set({ userName: name }),
    setUserAvatar: (avatar: string) => set({ userAvatar: avatar }),

    // --- Language ---

    target_language: null,
    secondary_language: null,
    setTargetLanguage: (lang: 'en' | 'zh') => set({ target_language: lang }),
    setSecondaryLanguage: (lang: 'en' | 'zh' | null) => set({ secondary_language: lang }),

    // --- Local UI Actions ---

    setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
    clearLevelUpMessage: () => set({ levelUpMessage: null }),

    // --- Daily Time Limit (client-side tracking) ---

    setDailyLimitMinutes: (minutes: number) => set({ dailyLimitMinutes: Math.max(15, Math.min(minutes, 120)) }),

    incrementUsageSeconds: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastUsageDate !== today) {
            set({ todayUsageSeconds: 1, lastUsageDate: today });
        } else {
            set({ todayUsageSeconds: state.todayUsageSeconds + 1 });
        }
    },

    isTimeLimitExceeded: (): boolean => {
        const state = get();
        return state.todayUsageSeconds >= state.dailyLimitMinutes * 60;
    },

    checkAndResetDailyUsage: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastUsageDate && state.lastUsageDate !== today) {
            set({ todayUsageSeconds: 0, lastUsageDate: today });
        }
    },

    // --- Online Status ---

    setIsOnline: (online: boolean) => set({ isOnline: online }),

    // --- Mascot UI ---

    setMascotMessage: (msg) => set({ mascotMessage: msg }),
    clearMascotMessage: () => set({ mascotMessage: null }),

    // --- Local Cache Helpers ---
    // These update the local collections cache after the server has confirmed.
    // No XP calculations — XP comes from server responses.

    addCollection: (word: CapturedWord) => {
        set((state) => {
            const existing = state.collections.find(w => w.word_en === word.word_en);
            if (existing) {
                return {
                    collections: state.collections.map(w =>
                        w.word_en === word.word_en
                            ? { ...w, stars: Math.max(w.stars, word.stars) }
                            : w
                    )
                };
            }
            return { collections: [...state.collections, { ...word, practiceCount: 1, isEvolved: false }] };
        });
    },

    practiceWord: (id: string, stars: number) => {
        set((state) => {
            const word = state.collections.find(w => String(w.id) === String(id));
            if (!word) return state;

            const newCount = word.practiceCount + 1;
            const newlyEvolved = !word.isEvolved && newCount >= 3;

            return {
                collections: state.collections.map(w =>
                    String(w.id) === String(id) ? {
                        ...w,
                        practiceCount: newCount,
                        stars: Math.max(w.stars, stars),
                        isEvolved: word.isEvolved || newlyEvolved
                    } : w
                )
            };
        });
    },

    // --- Reset ---

    resetAll: () => {
        clearTokens();
        set({
            xp: 0,
            streak: 0,
            level: 1,
            lastCapturedAt: null,
            capturedCount: 0,
            hasSeenOnboarding: false,
            collections: [],
            quests: [],
            levelUpMessage: null,
            userName: null,
            userAvatar: null,
            target_language: null,
            secondary_language: null,
            todayUsageSeconds: 0,
            lastUsageDate: null,
            accessToken: null,
            refreshToken: null,
            parentId: null,
            childId: null,
            childProfile: null,
        });
    },
}));

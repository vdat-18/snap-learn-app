import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// XP Milestones for levels as per Product Vision Section 2.6
const LEVEL_REQUIREMENTS = [
    { level: 1, xp: 0 },
    { level: 5, xp: 500 },
    { level: 10, xp: 2000 },
    { level: 20, xp: 8000 },
    { level: 35, xp: 25000 },
    { level: 50, xp: 60000 },
];

// XP rewards by rarity
const RARITY_XP_MAP: Record<string, number> = {
    'Common': 10,
    'Uncommon': 25,
    'Rare': 50,
    'Epic': 100,
    'Legendary': 250,
};

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

interface GameState {
    xp: number;
    streak: number;
    level: number;
    lastCapturedAt: string | null;
    capturedCount: number;
    hasSeenOnboarding: boolean;
    collections: CapturedWord[];
    quests: Quest[];
    lastStreakUpdateDate: string | null;
    levelUpMessage: { newLevel: number; xpGained: number } | null;

    // User profile
    userName: string | null;
    userAvatar: string | null;
    setUserName: (name: string) => void;
    setUserAvatar: (avatar: string) => void;

    // Language settings (required + optional)
    target_language: 'en' | 'zh' | null;
    secondary_language: 'en' | 'zh' | null;
    setTargetLanguage: (lang: 'en' | 'zh') => void;
    setSecondaryLanguage: (lang: 'en' | 'zh' | null) => void;
    
    // XP & Progression
    addXP: (amount: number, rarity?: string) => void;
    addXPByRarity: (rarity: string) => void;
    
    // Streak management
    incrementStreak: () => void;
    resetStreak: () => void;
    checkAndUpdateStreak: () => void;
    
    // Capture & Collection
    recordCapture: (rarity?: string) => void;
    isDuplicate: (wordEn: string) => boolean;
    
    // Quests
    setQuests: (quests: Quest[]) => void;
    updateQuestProgress: (questId: string, progress: number) => void;
    completeQuest: (questId: string) => void;
    
    // Level management
    syncLevel: () => void;
    clearLevelUpMessage: () => void;
    
    // General
    setOnboardingSeen: () => void;
    addCollection: (word: CapturedWord) => void;
    practiceWord: (wordId: string, stars: number) => void;
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
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            xp: 142, // Starting value from mock
            streak: 7,
            level: 5,
            lastCapturedAt: null,
            capturedCount: 42,
            hasSeenOnboarding: false,
            collections: [],
            quests: [],
            lastStreakUpdateDate: null,
            levelUpMessage: null,

            setOnboardingSeen: () => set({ hasSeenOnboarding: true }),

            // Check and update streak based on date
            checkAndUpdateStreak: () => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const today = now.toISOString().split('T')[0];
                
                const state = get();
                const lastUpdateDate = state.lastStreakUpdateDate?.split('T')[0];

                if (lastUpdateDate === today) {
                    // Already updated today, don't reset
                    return;
                }

                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                // If last capture was yesterday, maintain streak
                // Otherwise reset it
                if (state.lastCapturedAt?.startsWith(yesterdayStr)) {
                    get().incrementStreak();
                } else if (!state.lastCapturedAt?.startsWith(today)) {
                    get().resetStreak();
                }

                set({ lastStreakUpdateDate: new Date().toISOString() });
            },

            addCollection: (word: CapturedWord) => set((state) => {
                const existing = state.collections.find(w => w.word_en === word.word_en);
                if (existing) {
                    return {
                        collections: state.collections.map(w =>
                            w.word_en === word.word_en ? {
                                ...w,
                                stars: Math.max(w.stars, word.stars)
                            } : w
                        )
                    };
                }
                return { collections: [...state.collections, { ...word, practiceCount: 1, isEvolved: false }] };
            }),

            isDuplicate: (wordEn: string): boolean => {
                return get().collections.some(w => w.word_en === wordEn);
            },

            practiceWord: (id: string, stars: number) => set((state) => {
                const word = state.collections.find(w => w.id === id);
                if (!word) return state;

                const newCount = word.practiceCount + 1;
                const newlyEvolved = !word.isEvolved && newCount >= 5;

                if (newlyEvolved) {
                    get().addXP(100); // Evolution bonus
                }

                return {
                    collections: state.collections.map(w =>
                        w.id === id ? {
                            ...w,
                            practiceCount: newCount,
                            stars: Math.max(w.stars, stars),
                            isEvolved: word.isEvolved || newlyEvolved
                        } : w
                    )
                };
            }),

            userAvatar: null,
            setUserAvatar: (avatar: string) => set({ userAvatar: avatar }),

            userName: null,
            setUserName: (name: string) => set({ userName: name }),

            target_language: null,
            secondary_language: null,
            setTargetLanguage: (lang: 'en' | 'zh') => set({ target_language: lang }),
            setSecondaryLanguage: (lang: 'en' | 'zh' | null) => set({ secondary_language: lang }),

            // XP Management
            addXPByRarity: (rarity: string) => {
                const xpAmount = RARITY_XP_MAP[rarity] || 10;
                get().addXP(xpAmount, rarity);
            },

            addXP: (amount: number, rarity?: string) => {
                set((state) => {
                    const previousLevel = state.level;
                    const newXP = state.xp + amount;

                    // Calculate new level
                    let newLevel = 1;
                    for (const req of LEVEL_REQUIREMENTS) {
                        if (newXP >= req.xp) {
                            newLevel = req.level;
                        } else {
                            break;
                        }
                    }

                    const levelUpMessage = newLevel > previousLevel
                        ? { newLevel, xpGained: amount }
                        : null;

                    return {
                        xp: newXP,
                        level: newLevel,
                        levelUpMessage
                    };
                });
            },

            syncLevel: () => {
                const currentXP = get().xp;
                let newLevel = 1;

                for (const req of LEVEL_REQUIREMENTS) {
                    if (currentXP >= req.xp) {
                        newLevel = req.level;
                    } else {
                        break;
                    }
                }

                if (newLevel !== get().level) {
                    set({ level: newLevel });
                }
            },

            clearLevelUpMessage: () => set({ levelUpMessage: null }),

            // Streak management
            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

            resetStreak: () => set({ streak: 0 }),

            // Capture & recording with XP by rarity
            recordCapture: (rarity?: string) => {
                set((state) => ({
                    capturedCount: state.capturedCount + 1,
                    lastCapturedAt: new Date().toISOString()
                }));

                // Award XP based on rarity if provided
                if (rarity) {
                    get().addXPByRarity(rarity);
                }

                // Trigger streak check
                get().checkAndUpdateStreak();
            },

            // Quest management
            setQuests: (quests: Quest[]) => set({ quests }),

            updateQuestProgress: (questId: string, progress: number) => {
                set((state) => ({
                    quests: state.quests.map(q =>
                        q.id === questId
                            ? {
                                ...q,
                                progress: Math.min(progress, q.total),
                                status: progress >= q.total && q.status !== 'claimed'
                                    ? 'completed'
                                    : q.status
                            }
                            : q
                    )
                }));
            },

            completeQuest: (questId: string) => {
                set((state) => {
                    const quest = state.quests.find(q => q.id === questId);
                    if (!quest) return state;

                    // Award XP for completing the quest
                    get().addXP(quest.rewardXP);

                    return {
                        quests: state.quests.map(q =>
                            q.id === questId ? { ...q, status: 'claimed' } : q
                        )
                    };
                });
            }
        }),
        {
            name: 'snap-learn-storage', // Persist data to localStorage
        }
    )
);

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

interface GameState {
    xp: number;
    streak: number;
    level: number;
    lastCapturedAt: string | null;
    capturedCount: number;
    hasSeenOnboarding: boolean;
    collections: CapturedWord[];

    // Actions
    userName: string | null;
    setUserName: (name: string) => void;
    addXP: (amount: number) => void;
    incrementStreak: () => void;
    resetStreak: () => void;
    recordCapture: () => void;
    syncLevel: () => void;
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

            setOnboardingSeen: () => set({ hasSeenOnboarding: true }),

            addCollection: (word) => set((state) => {
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

            practiceWord: (id, stars) => set((state) => {
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

            userName: null,
            setUserName: (name) => set({ userName: name }),

            addXP: (amount: number) => {
                set((state) => ({ xp: state.xp + amount }));
                get().syncLevel();
            },

            syncLevel: () => {
                const currentXP = get().xp;
                let newLevel = 1;

                // Find the highest level achieved based on current XP
                // Simplified: Level = achieved milestone level
                for (const req of LEVEL_REQUIREMENTS) {
                    if (currentXP >= req.xp) {
                        newLevel = req.level;
                    } else {
                        break;
                    }
                }

                // Logic for intermediate levels if needed can be added here
                // For POC, we'll stick to milestones
                if (newLevel !== get().level) {
                    set({ level: newLevel });
                }
            },

            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

            resetStreak: () => set({ streak: 0 }),

            recordCapture: () => {
                set((state) => ({
                    capturedCount: state.capturedCount + 1,
                    lastCapturedAt: new Date().toISOString()
                }));
            },
        }),
        {
            name: 'snap-learn-storage', // Persist data to localStorage
        }
    )
);

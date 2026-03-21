import api from './api';

// --- Types (aligned with backend schemas/collection.py) ---

export interface CategoryProgress {
    name: string;
    display_name: string;
    icon: string;
    captured: number;
    total: number;
    progress: number;
}

export interface CollectionOverview {
    total_words: number;
    categories: CategoryProgress[];
}

export interface VocabCard {
    id: string;
    word_en: string;
    word_vi: string;
    word_zh: string;
    phonetic_en: string | null;
    category: string;
    rarity_tier: string;
    mastery_en: number;
    mastery_vi: number;
    mastery_zh: number;
    evolved: boolean;
    photo_url: string | null;
    captured_at: string;
}

export interface CategoryDetail {
    category: string;
    captured_words: VocabCard[];
    undiscovered_count: number;
}

export interface VocabDetail {
    id: string;
    word_en: string;
    word_vi: string;
    word_zh: string;
    phonetic_en: string | null;
    category: string;
    rarity_tier: string;
    mastery_en: number;
    mastery_vi: number;
    mastery_zh: number;
    evolved: boolean;
    photo_url: string | null;
    confidence: number;
    captured_at: string;
    last_practiced_at: string | null;
}

// --- Collection API ---

export const collectionApi = {
    /**
     * Get collection overview with categories and progress
     */
    getCollection: async (): Promise<CollectionOverview> => {
        const { data } = await api.get('/collection');
        return data;
    },

    /**
     * Get detailed view of a category
     */
    getCategoryDetail: async (category: string): Promise<CategoryDetail> => {
        const { data } = await api.get(`/collection/${category}`);
        return data;
    },

    /**
     * Get full detail for a single vocab word
     */
    getVocabDetail: async (vocabId: string): Promise<VocabDetail> => {
        const { data } = await api.get(`/vocab/${vocabId}`);
        return data;
    },
};

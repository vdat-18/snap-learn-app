import api from './api';

// --- Types ---

export interface CategoryProgress {
    name: string;
    icon: string;
    captured: number;
    total: number;
    progress: number;
}

export interface CollectionOverview {
    total_words: number;
    categories: CategoryProgress[];
}

export interface CategoryDetail {
    category: string;
    captured_words: any[];
    undiscovered_count: number;
}

export interface VocabDetail {
    id: string;
    word_en: string;
    word_vi: string;
    word_zh: string;
    pinyin: string;
    phonetic_en: string;
    category: string;
    rarity_tier: string;
    fun_fact_vi: string;
    sentence_en?: string;
    sentence_vi?: string;
    mastery: number;
    evolved: boolean;
    practice_count: number;
    photo_url: string;
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

import type { CapturedWord, Quest, LeaderboardEntry } from './gameStore';
// @ts-ignore
import capturedVocabJSON from '../../../../_docs/mock_data/captured_vocab.json';
// @ts-ignore
import missionsJSON from '../../../../_docs/mock_data/missions.json';
// @ts-ignore
import leaderboardJSON from '../../../../_docs/mock_data/leaderboard.json';

// Mapping RARITY from json (common) to store (Common)
const rarityMap: Record<string, string> = {
    'common': 'Common',
    'uncommon': 'Uncommon',
    'rare': 'Rare',
    'epic': 'Epic',
    'legendary': 'Legendary'
};

// Mapping CATEGORY from json (animals) to store (Animals)
const categoryMap: Record<string, string> = {
    'animals': 'Animals',
    'food': 'Food',
    'nature': 'Nature',
    'school': 'School',
    'home': 'Home',
    'vehicles': 'Vehicles'
};

export const MOCK_COLLECTIONS: CapturedWord[] = capturedVocabJSON.slice(0, 20).map((item: any) => ({
    id: item.id,
    word_vi: item.word_vi,
    word_en: item.word_en,
    word_zh: item.word_zh,
    // Replace .jpg with .svg as the mock_data folder actually contains SVG
    image: item.photo_url.replace('.jpg', '.svg'),
    stars: Math.min(3, item.mastery_level || 1),
    rarity: rarityMap[item.rarity_tier] || 'Common',
    category: categoryMap[item.category] || item.category,
    capturedAt: item.captured_at,
    practiceCount: item.practice_count || 0,
    isEvolved: item.evolved || false
}));

export const MOCK_QUESTS: Quest[] = missionsJSON.missions.map((m: any) => ({
    id: m.id,
    title: m.description_vi,
    description: m.description_en,
    progress: m.current_count,
    total: m.target_count,
    rewardXP: m.reward_xp,
    rewardBadge: m.reward_badge ? '🏆' : undefined,
    status: m.status === 'completed' ? 'completed' : m.status === 'not_started' ? 'in-progress' : 'in-progress',
    category: m.type === 'daily' ? 'Today' : m.type === 'weekly' ? 'Weekly' : 'Challenge',
    createdAt: m.created_at
}));

export const MOCK_LEADERBOARD: Record<string, LeaderboardEntry[]> = {
    Class: leaderboardJSON.scopes.class.map((p: any) => ({
        id: p.user_id,
        name: p.name,
        points: p.total_points,
        rank: p.rank,
        avatar: p.avatar_id === 'owl' ? '🦉' : p.avatar_id === 'rabbit' ? '🐰' : p.avatar_id === 'cat' ? '🐱' : p.avatar_id === 'bear' ? '🐻' : p.avatar_id === 'fox' ? '🦊' : '🐼'
    })),
    Friends: leaderboardJSON.scopes.friends.map((p: any) => ({
        id: p.user_id,
        name: p.name,
        points: p.total_points,
        rank: p.rank,
        avatar: p.avatar_id === 'owl' ? '🦉' : p.avatar_id === 'rabbit' ? '🐰' : p.avatar_id === 'cat' ? '🐱' : p.avatar_id === 'bear' ? '🐻' : p.avatar_id === 'fox' ? '🦊' : '🐼'
    })),
    All: leaderboardJSON.scopes.global.map((p: any) => ({
        id: p.user_id,
        name: p.name,
        points: p.total_points,
        rank: p.rank,
        avatar: p.avatar_id === 'owl' ? '🦉' : p.avatar_id === 'rabbit' ? '🐰' : p.avatar_id === 'cat' ? '🐱' : p.avatar_id === 'bear' ? '🐻' : p.avatar_id === 'fox' ? '🦊' : '🐼'
    }))
};

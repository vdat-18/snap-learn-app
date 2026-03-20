import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, type Quest } from '../../store/gameStore';

interface MissionOverlayProps {
    userName?: string;
}

// Mock missions - in production these would come from API
const mockMissions: Quest[] = [
    {
        id: 'quest_daily_001',
        title: 'Tìm 3 vật màu đỏ 🔴',
        description: 'Chụp ảnh các đồ vật có màu đỏ xung quanh bạn.',
        progress: 1,
        total: 3,
        rewardXP: 50,
        status: 'in-progress',
        category: 'Today',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'quest_daily_002',
        title: 'Luyện tập 3 từ 🎤',
        description: 'Phát âm đúng 3 từ vựng bất kỳ.',
        progress: 0,
        total: 3,
        rewardXP: 40,
        status: 'in-progress',
        category: 'Today',
        createdAt: new Date().toISOString(),
    },
];

const MissionOverlay: React.FC<MissionOverlayProps> = () => {
    const { quests, setQuests } = useGameStore();
    const [currentMission, setCurrentMission] = useState<Quest | null>(null);

    // Initialize with mock missions if no quests
    useEffect(() => {
        if (quests.length === 0) {
            setQuests(mockMissions);
            setCurrentMission(mockMissions[0]);
        } else {
            // Get the first in-progress mission
            const inProgress = quests.find(q => q.status === 'in-progress');
            setCurrentMission(inProgress || quests[0]);
        }
    }, []);

    if (!currentMission) return null;

    const progressPercent = (currentMission.progress / currentMission.total) * 100;

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute top-32 left-6 z-40 max-w-[220px]"
        >
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/40 backdrop-blur-2xl p-4 rounded-[32px] border border-white/50 shadow-level-3 hover:bg-white/50 transition-colors"
            >
                {/* Mission icon + emoji (icon-driven, minimal text) */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl drop-shadow-md">
                        {currentMission.title.includes('🔴') ? '🔴' :
                            currentMission.title.includes('🎤') ? '🎤' :
                                currentMission.title.includes('🐾') ? '🐾' : '⭐'}
                    </span>
                    <span className="text-white font-black text-sm drop-shadow-md tracking-tight flex-1 line-clamp-2">
                        {currentMission.title.split(' ').slice(0, 3).join(' ')}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-3.5 bg-white/40 rounded-full overflow-hidden p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-skyBlue rounded-full shadow-[0_0_12px_rgba(77,168,255,0.9)]"
                        />
                    </div>
                    <span className="text-white font-black text-xs whitespace-nowrap">
                        {currentMission.progress}/{currentMission.total}
                    </span>
                </div>

                {/* Reward info (icon-driven: ⭐ instead of "Reward" text) */}
                <div className="flex items-center justify-between bg-white/20 rounded-lg px-2 py-1">
                    <span className="text-sunshineYellow text-lg drop-shadow-md">⭐</span>
                    <span className="text-sunshineYellow font-black text-sm">+{currentMission.rewardXP}</span>
                </div>

                {/* Completion indicator */}
                {currentMission.status === 'completed' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-mintGreen w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-lg"
                    >
                        ✓
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default MissionOverlay;

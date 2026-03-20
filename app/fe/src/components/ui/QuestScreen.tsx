import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Gift } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface QuestScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Quest {
    id: string;
    title: string;
    description: string;
    progress: number;
    total: number;
    rewardXP: number;
    rewardBadge?: string;
    status: 'in-progress' | 'completed' | 'claimed';
    category: 'Today' | 'Weekly' | 'Challenge';
}

const mockQuests: Quest[] = [
    {
        id: '1',
        title: 'Tìm 3 vật màu đỏ 🔴',
        description: 'Chụp ảnh các đồ vật có màu đỏ xung quanh bạn.',
        progress: 1,
        total: 3,
        rewardXP: 50,
        status: 'in-progress',
        category: 'Today'
    },
    {
        id: '2',
        title: 'Luyện tập phát âm 🗣️',
        description: 'Phát âm đúng 3 từ vựng bất kỳ.',
        progress: 3,
        total: 3,
        rewardXP: 30,
        status: 'completed',
        category: 'Today'
    },
    {
        id: '3',
        title: 'Thợ săn ảnh 📷',
        description: 'Chụp tổng cộng 10 bức ảnh mới.',
        progress: 7,
        total: 10,
        rewardXP: 100,
        status: 'in-progress',
        category: 'Weekly'
    },
    {
        id: '4',
        title: 'Bậc thầy Động vật 🐾',
        description: 'Hoàn thành bộ sưu tập chủ đề Động vật.',
        progress: 8,
        total: 20,
        rewardXP: 500,
        rewardBadge: '🏆',
        status: 'in-progress',
        category: 'Challenge'
    }
];

const QuestScreen: React.FC<QuestScreenProps> = ({ isOpen, onClose }) => {
    const { xp, addXP } = useGameStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[160] bg-snowWhite flex flex-col font-outfit"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 bg-white shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="p-2 -ml-2">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-deepNavy uppercase tracking-tight flex items-center gap-2">
                                    ⚔️ Quests
                                </h1>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    Complete mission to get XP
                                </p>
                            </div>
                        </div>
                        <div className="bg-sunshineYellow/20 px-4 py-2 rounded-2xl border border-sunshineYellow/30">
                            <span className="font-black text-deepNavy text-sm">⭐ {xp}</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
                        {/* Categories */}
                        {['Today', 'Weekly', 'Challenge'].map((cat) => (
                            <section key={cat} className="space-y-4">
                                <h2 className="text-lg font-black text-slate-400 uppercase tracking-[3px]">
                                    {cat === 'Today' ? '── Today ──' : cat === 'Weekly' ? '── This Week ──' : '── Real Challenge ──'}
                                </h2>

                                <div className="space-y-4">
                                    {mockQuests.filter(q => q.category === cat).map((quest) => (
                                        <QuestCard
                                            key={quest.id}
                                            quest={quest}
                                            onClaim={() => addXP(quest.rewardXP)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const QuestCard: React.FC<{ quest: Quest; onClaim: () => void }> = ({ quest, onClaim }) => {
    const isCompleted = quest.status === 'completed';
    const isClaimed = quest.status === 'claimed';
    const progressPercent = (quest.progress / quest.total) * 100;

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            className={`rounded-[28px] p-5 shadow-level-2 border-b-4 transition-all ${isCompleted
                ? 'bg-mintGreen/10 border-mintGreen/30'
                : isClaimed
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className={`text-lg font-black leading-tight ${isCompleted ? 'text-mintGreen' : 'text-deepNavy'}`}>
                        {quest.title}
                    </h3>
                    <p className={`text-sm font-medium mt-1 ${isCompleted ? 'text-mintGreen/70' : 'text-slate-400'}`}>
                        {quest.description}
                    </p>
                </div>
                {isClaimed && <CheckCircle2 className="w-8 h-8 text-mintGreen" />}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                    <span className={isCompleted ? 'text-mintGreen' : 'text-skyBlue'}>
                        Progress {quest.progress}/{quest.total}
                    </span>
                    <span className="flex items-center gap-1 text-sunshineYellow">
                        Reward: {quest.rewardXP} XP {quest.rewardBadge}
                    </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className={`h-full rounded-full ${isCompleted ? 'bg-mintGreen shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-skyBlue'}`}
                    />
                </div>

                {isCompleted && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClaim();
                        }}
                        className="w-full mt-2 bg-sunshineYellow text-deepNavy font-black py-3 rounded-2xl shadow-[0_5px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[5px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/30"
                    >
                        <Gift className="w-5 h-5" />
                        CLAIM REWARD!
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default QuestScreen;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { useGameStore, type Quest } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic } from '../../utils/feedbackUtils';

interface QuestScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuestScreen: React.FC<QuestScreenProps> = ({ isOpen, onClose }) => {
    const { xp, quests, completeQuest } = useGameStore();
    const { playPop } = useSoundEffects();

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
                    {/* Header (icon-driven, minimal text) */}
                    <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { playPop(); onClose(); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                            <h1 className="text-2xl font-black text-deepNavy tracking-tight flex items-center gap-3">
                                <img src="/icon-quest.png" alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
                                Nhiệm vụ
                            </h1>
                        </div>
                        <div className="bg-sunshineYellow/20 px-4 py-2 rounded-2xl border border-sunshineYellow/30">
                            <span className="font-black text-deepNavy text-sm">⭐ {xp}</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
                        {/* Categories */}
                        {['Today', 'Weekly', 'Challenge'].map((cat) => (
                            <section key={cat} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl drop-shadow-lg p-3 bg-white rounded-2xl shadow-level-1">
                                        {cat === 'Today' ? '🌅' : cat === 'Weekly' ? '📅' : '🏆'}
                                    </span>
                                    <h2 className="text-2xl font-black text-deepNavy">
                                        {cat === 'Today' ? 'Hàng ngày' : cat === 'Weekly' ? 'Hàng tuần' : 'Thử thách'}
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    {quests.filter(q => q.category === cat).map((quest) => (
                                        <QuestCard
                                            key={quest.id}
                                            quest={quest}
                                            onClaim={() => completeQuest(quest.id)}
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
    const { playChime } = useSoundEffects();

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
                    <span className={isCompleted ? 'text-mintGreen text-lg' : 'text-skyBlue text-lg'}>
                        {isCompleted ? '✓' : '◉'}
                    </span>
                    <span className="flex items-center gap-1 text-sunshineYellow">
                        ⭐ +{quest.rewardXP} {quest.rewardBadge}
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
                            playChime();
                            triggerHaptic(100);
                            onClaim();
                        }}
                        className="w-full mt-2 bg-sunshineYellow text-deepNavy font-black py-4 rounded-[24px] shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/40"
                    >
                        <span className="text-2xl mr-1">🎁</span> Nhận thưởng!
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default QuestScreen;

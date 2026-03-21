import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Trophy, Star, Sparkles, MessageCircle } from 'lucide-react';
import { useGameStore, type Quest } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from '../../utils/feedbackUtils';

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
                    className="fixed inset-0 z-[160] bg-snowWhite flex flex-col font-sans overflow-hidden"
                >
                    {/* Background Decorative Sparkles */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-yellow-400"
                                style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                                animate={{
                                    scale: [0, 1, 0],
                                    rotate: [0, 180],
                                } as any}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            >
                                <Star fill="currentColor" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-md relative z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { playPop(); onClose(); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                            <h1 className="text-lg font-black text-deepNavy tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 bg-sunshineYellow rounded-xl flex items-center justify-center shadow-level-1">
                                    <Trophy className="w-6 h-6 text-deepNavy" />
                                </div>
                                🌟 Thử thách vui
                            </h1>
                        </div>
                        <div className="bg-sunshineYellow/20 px-4 py-2 rounded-2xl border border-sunshineYellow/30 flex items-center gap-2">
                            <span className="text-sm">⭐</span>
                            <span className="font-black text-deepNavy text-xs">{xp}</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 relative z-10">
                        {/* Mascot Greeting / Tip */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-skyBlue/10 p-5 rounded-[32px] border-2 border-skyBlue/20 flex items-center gap-4 relative"
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden border-2 border-skyBlue/30">
                                <img src="/owl-mascot.png" alt="Owl" className="w-full h-full object-contain mix-blend-multiply scale-110" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-skyBlue uppercase tracking-wider mb-1">Cú thông thái bảo là:</p>
                                <p className="text-[13px] font-bold text-deepNavy leading-snug">Cố gắng lên bé ơi! Hoàn thành nhiệm vụ để nhận những ngôi sao lấp lánh nhé! ✨</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => mascotSpeak("Bé hãy hoàn thành các thử thách này để nhận được thật nhiều sao may mắn nhé!", 'vi-VN')}
                                className="absolute -top-2 -right-2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center text-skyBlue"
                            >
                                <MessageCircle className="w-4 h-4 fill-skyBlue/10" />
                            </motion.button>
                        </motion.div>
                        {/* Categories */}
                        {['Today', 'Weekly', 'Challenge'].map((cat) => (
                            <section key={cat} className={`space-y-4 p-5 -mx-5 rounded-[40px] transition-colors ${cat === 'Today' ? 'bg-orange-50/50' : cat === 'Weekly' ? 'bg-purple-50/50' : 'bg-blue-50/50'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-level-2 border-b-4 ${cat === 'Today' ? 'border-orange-200' : cat === 'Weekly' ? 'border-purple-200' : 'border-blue-200'
                                        }`}>
                                        <span className="text-3xl drop-shadow-sm">
                                            {cat === 'Today' ? '🌅' : cat === 'Weekly' ? '📅' : '🏆'}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-black text-deepNavy tracking-tight">
                                        {cat === 'Today' ? '🌅 Mỗi ngày mới' : cat === 'Weekly' ? '📅 Cả tuần vui' : '🏆 Siêu thợ săn'}
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
            className={`rounded-[32px] p-6 shadow-level-2 border-b-8 transition-all relative overflow-hidden ${isCompleted
                ? 'bg-mintGreen/10 border-mintGreen/30 scale-[1.02]'
                : isClaimed
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100 active:border-b-4'
                }`}
        >
            {/* Completion Sparkle Background */}
            {isCompleted && (
                <div className="absolute top-0 right-0 p-2 text-mintGreen">
                    <Sparkles className="w-12 h-12 opacity-20 animate-pulse" />
                </div>
            )}

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex-1">
                    <h3 className={`text-sm font-black leading-tight ${isCompleted ? 'text-mintGreen' : 'text-deepNavy'}`}>
                        {quest.title}
                    </h3>
                    <p className={`text-xs font-medium mt-1 ${isCompleted ? 'text-mintGreen/70' : 'text-slate-400'}`}>
                        {quest.description}
                    </p>
                </div>
                {isClaimed && <CheckCircle2 className="w-8 h-8 text-mintGreen" />}
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[2px]">
                    <span className={`px-3 py-1 rounded-full ${isCompleted ? 'bg-mintGreen text-white' : 'bg-skyBlue/10 text-skyBlue'}`}>
                        {isCompleted ? 'XONG RỒI! 🎉' : 'ĐANG LÀM...'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-sunshineYellow text-deepNavy px-3 py-1 rounded-full shadow-sm">
                        ⭐ +{quest.rewardXP}
                    </span>
                </div>

                <div className="relative pt-2">
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className={`h-full rounded-full relative ${isCompleted ? 'bg-gradient-to-r from-mintGreen to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.6)]' : 'bg-gradient-to-r from-skyBlue to-blue-500'}`}
                        />
                    </div>
                    {/* Running Emoji based on progress */}
                    <motion.span
                        animate={{ left: `${Math.max(0, progressPercent - 5)}%` }}
                        className="absolute -top-1.5 text-2xl transition-all duration-500 pointer-events-none"
                    >
                        <span className={isCompleted ? '' : 'inline-block scale-x-[-1]'}>
                            {isCompleted ? '🚩' : '🏃'}
                        </span>
                    </motion.span>
                </div>

                {isCompleted && (
                    <motion.button
                        initial={{ scale: 0.9 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            playChime();
                            triggerHaptic(100);
                            onClaim();
                        }}
                        className="w-full mt-4 bg-sunshineYellow text-deepNavy font-black py-4 rounded-[32px] shadow-[0_10px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/40 group overflow-hidden"
                    >
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-2xl"
                        >
                            🎁
                        </motion.span>
                        NHẬN QUÀ NGAY!
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                    </motion.button>
                )}
            </div>
        </motion.div >
    );
};

export default QuestScreen;

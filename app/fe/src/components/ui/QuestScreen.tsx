import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Trophy, Star, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from '../../utils/feedbackUtils';
import { missionApi, type Mission } from '../../services/missionApi';
import { QuestSkeleton } from './Skeleton';

interface QuestScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

interface DisplayQuest {
    id: string;
    title: string;
    description: string;
    progress: number;
    total: number;
    rewardXP: number;
    status: 'in-progress' | 'completed' | 'claimed';
    category: 'Today' | 'Weekly' | 'Challenge';
}

const mapMissionToQuest = (m: Mission, category: 'Today' | 'Weekly' | 'Challenge'): DisplayQuest => ({
    id: m.id,
    title: m.description_vi,
    description: m.description_en,
    progress: m.current_count,
    total: m.target_count,
    rewardXP: m.reward_xp,
    status: m.status === 'claimed' ? 'claimed' : m.status === 'completed' ? 'completed' : 'in-progress',
    category,
});

const QuestScreen: React.FC<QuestScreenProps> = ({ isOpen, onClose }) => {
    const { xp } = useGameStore();
    const { playPop } = useSoundEffects();
    const [quests, setQuests] = useState<DisplayQuest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const loadMissions = () => {
        setIsLoading(true);
        setFetchError(false);
        missionApi.getMissions()
            .then(data => {
                const mapped: DisplayQuest[] = [
                    ...data.daily.map(m => mapMissionToQuest(m, 'Today')),
                    ...data.weekly.map(m => mapMissionToQuest(m, 'Weekly')),
                    ...data.category_challenges.map(m => mapMissionToQuest(m, 'Challenge')),
                ];
                setQuests(mapped);
            })
            .catch(() => setFetchError(true))
            .finally(() => setIsLoading(false));
    };

    // Fetch missions from API when opened
    useEffect(() => {
        if (isOpen) {
            loadMissions();
        }
    }, [isOpen]);

    const handleClaim = async (questId: string, event: React.MouseEvent, rewardXP: number) => {
        try {
            const result = await missionApi.claimMission(questId);

            // Trigger XP Fly Animation from the button click position
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
            window.dispatchEvent(new CustomEvent('trigger-xp-fly', {
                detail: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    count: Math.min(10, Math.max(3, Math.floor(rewardXP / 10)))
                }
            }));

            // Play sound and haptic
            playPop();
            triggerHaptic([50, 100, 50]);

            // Update local quest state immediately to show claimed state
            setQuests(prev => prev.map(q =>
                q.id === questId ? { ...q, status: 'claimed' as const } : q
            ));

            // Wait for particles to somewhat finish before updating state to allow animation
            setTimeout(() => {
                useGameStore.setState({
                    xp: result.total_xp,
                    level: result.level,
                    levelUpMessage: result.level_up ? { newLevel: result.level, xpGained: result.xp_earned } : null,
                });
            }, 1500);

        } catch (err) {
            console.error('Failed to claim mission:', err);
            mascotSpeak("Ui cha, có lỗi mạng rồi. Bạn thử lại nhé!", "vi-VN");
        }
    };

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
                                animate={{ scale: [0, 1, 0], rotate: [0, 180] } as any}
                                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
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
                                Thử thách vui
                            </h1>
                        </div>
                        <div className="bg-sunshineYellow/20 px-4 py-2 rounded-2xl border border-sunshineYellow/30 flex items-center gap-2">
                            <span className="text-sm">⭐</span>
                            <span className="font-black text-deepNavy text-xs">{xp}</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 relative z-10">
                        {/* Mascot Greeting */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-skyBlue/10 p-5 rounded-[32px] border-2 border-skyBlue/20 flex items-center gap-4 relative"
                        >
                            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <img src="/owl-mascot.png" alt="Owl" className="w-full h-full object-contain scale-110" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-skyBlue uppercase tracking-wider mb-1">Cú thông thái bảo là:</p>
                                <p className="text-[13px] font-bold text-deepNavy leading-snug">Cố gắng lên bạn ơi! Hoàn thành nhiệm vụ để nhận những ngôi sao lấp lánh nhé! ✨</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => mascotSpeak("Bạn hãy hoàn thành các thử thách này để nhận được thật nhiều sao may mắn nhé!", 'vi-VN')}
                                className="absolute -top-2 -right-2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center text-skyBlue"
                            >
                                <MessageCircle className="w-4 h-4 fill-skyBlue/10" />
                            </motion.button>
                        </motion.div>

                        {isLoading && (
                            <QuestSkeleton />
                        )}

                        {fetchError && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <span className="text-5xl">😴</span>
                                <p className="text-base font-black text-deepNavy">Ối! Không tải được nhiệm vụ</p>
                                <p className="text-sm text-slate-400 font-bold">Kiểm tra kết nối mạng rồi thử lại nhé!</p>
                                <button onClick={loadMissions} className="bg-skyBlue text-white px-6 py-3 rounded-2xl font-black text-sm shadow-level-2">
                                    🔄 Thử lại
                                </button>
                            </div>
                        )}

                        {!isLoading && !fetchError && ['Today', 'Weekly', 'Challenge'].map((cat) => {
                            const categoryQuests = quests.filter(q => q.category === cat);
                            if (categoryQuests.length === 0) return null;

                            return (
                                <section key={cat} className={`space-y-4 p-5 -mx-5 rounded-[40px] transition-colors ${cat === 'Today' ? 'bg-orange-50/50' : cat === 'Weekly' ? 'bg-purple-50/50' : 'bg-blue-50/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-level-2 border-b-4 ${cat === 'Today' ? 'border-orange-200' : cat === 'Weekly' ? 'border-purple-200' : 'border-blue-200'}`}>
                                            <span className="text-3xl drop-shadow-sm">
                                                {cat === 'Today' ? '🌅' : cat === 'Weekly' ? '📅' : '🏆'}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-black text-deepNavy tracking-tight">
                                            {cat === 'Today' ? '🌅 Mỗi ngày mới' : cat === 'Weekly' ? '📅 Cả tuần vui' : '🏆 Siêu thợ săn'}
                                        </h2>
                                    </div>

                                    <div className="space-y-5">
                                        {categoryQuests.map((quest) => (
                                            <QuestCard
                                                key={quest.id}
                                                quest={quest}
                                                onClaim={(e) => handleClaim(quest.id, e, quest.rewardXP)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const QuestCard: React.FC<{ quest: DisplayQuest; onClaim: (e: React.MouseEvent) => void }> = ({ quest, onClaim }) => {
    const [isClaiming, setIsClaiming] = useState(false);
    const isCompleted = quest.status === 'completed';
    const isClaimed = quest.status === 'claimed';
    const progressPercent = (quest.progress / quest.total) * 100;
    const { playChime } = useSoundEffects();

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            className={`rounded-[32px] p-6 shadow-level-2 border-b-8 transition-all duration-300 relative overflow-hidden ${isCompleted
                ? 'bg-gradient-to-b from-white to-mintGreen/10 border-mintGreen/40 ring-4 ring-mintGreen/20 shadow-[0_10px_30px_rgba(52,211,153,0.4)] scale-[1.02] z-10'
                : isClaimed
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100 active:border-b-4'
                }`}
        >
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

                <div className="relative pt-3 pb-1 mt-2">
                    {/* The 3D Progress Bar */}
                    <div className="h-5 w-full bg-slate-100/80 backdrop-blur-sm rounded-full overflow-hidden p-[3px] shadow-inner border border-slate-200/50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ type: 'spring', bounce: 0.4, duration: 1.5 }}
                            className={`h-full rounded-full relative overflow-hidden ${isCompleted ? 'bg-gradient-to-r from-mintGreen via-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : 'bg-gradient-to-r from-sky-400 via-skyBlue to-blue-500 shadow-sm'}`}
                        >
                            {/* Animated Shine/Glare inside the bar */}
                            <motion.div
                                animate={{ x: ['-100%', '300%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg]"
                            />
                            {/* Top highlight to make it look 3D/Glossy */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />
                        </motion.div>
                    </div>

                    {/* The Runner / Trophy Emoji tracking the progress */}
                    <motion.div
                        animate={{ left: `calc(${progressPercent}% - 14px)` }}
                        transition={{ type: 'spring', bounce: 0.4, duration: 1.5 }}
                        className="absolute -top-2 transition-all duration-500 pointer-events-none drop-shadow-md z-10"
                    >
                        {isCompleted ? (
                            <motion.div
                                animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="text-[28px]"
                            >
                                🏆
                            </motion.div>
                        ) : (
                            <motion.div
                                animate={{ y: [0, -4, 0], rotate: [0, -10, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 0.4 }}
                                className="text-2xl inline-block scale-x-[-1]"
                            >
                                🏃
                            </motion.div>
                        )}
                    </motion.div>

                    {/* The flag at 100% mark (target) */}
                    {!isCompleted && !isClaimed && (
                        <div className="absolute right-0 -top-2 text-xl opacity-50 drop-shadow-sm grayscale">
                            🚩
                        </div>
                    )}
                </div>

                <AnimatePresence mode="popLayout">
                    {isCompleted && !isClaiming && (
                        <motion.button
                            key="claim-btn"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsClaiming(true);
                                playChime();
                                onClaim(e);
                            }}
                            className="w-full mt-4 bg-sunshineYellow text-deepNavy font-black py-4 rounded-[32px] shadow-[0_10px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/40 group overflow-hidden"
                        >
                            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-2xl">
                                🎁
                            </motion.span>
                            NHẬN QUÀ NGAY!
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                        </motion.button>
                    )}

                    {isClaiming && !isClaimed && (
                        <motion.div
                            key="claiming-btn"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full mt-4 bg-mintGreen text-white font-black py-4 rounded-[32px] flex items-center justify-center gap-2 shadow-inner"
                        >
                            <Loader2 className="w-6 h-6 animate-spin" />
                            ĐANG NHẬN...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default QuestScreen;

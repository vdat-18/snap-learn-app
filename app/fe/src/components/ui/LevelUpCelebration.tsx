import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from '../../utils/feedbackUtils';
import { triggerLegendaryBurst, triggerPerfectBurst } from '../../utils/confetti';

const LevelUpCelebration: React.FC = () => {
    const { levelUpMessage, clearLevelUpMessage } = useGameStore();
    const { playEpicLevelUp, playPop } = useSoundEffects();

    useEffect(() => {
        if (levelUpMessage) {
            playEpicLevelUp();
            triggerHaptic([100, 50, 100, 50, 200]); // Epic haptic pattern
            setTimeout(() => {
                triggerLegendaryBurst();
                triggerPerfectBurst();
            }, 300);
            mascotSpeak(`Tuyệt vời! Chúc mừng bạn đã lên cấp ${levelUpMessage.newLevel}!`, "vi-VN");
        }
    }, [levelUpMessage, playEpicLevelUp]);

    const handleClose = () => {
        playPop();
        clearLevelUpMessage();
    };

    // Map levels to titles
    const levelTitles: Record<number, { vi: string; en: string; icon: string }> = {
        1: { vi: 'Nhà thám hiểm mới', en: 'Beginner Explorer', icon: '🌱' },
        5: { vi: 'Nhà sưu tầm từ', en: 'Word Collector', icon: '📖' },
        10: { vi: 'Thợ săn từ vựng', en: 'Vocab Hunter', icon: '🎯' },
        20: { vi: 'Hướng đạo ngôn ngữ', en: 'Language Scout', icon: '🏅' },
        35: { vi: 'Bậc thầy Đa ngôn ngữ', en: 'Polyglot Master', icon: '⭐' },
        50: { vi: 'Nhà vô địch đa ngữ', en: 'Polyglot Champion', icon: '👑' },
    };

    const levelInfo = levelUpMessage && levelTitles[levelUpMessage.newLevel]
        ? levelTitles[levelUpMessage.newLevel]
        : { vi: 'Cấp mới!', en: 'New Level!', icon: '🎉' };

    return (
        <AnimatePresence>
            {levelUpMessage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-deepNavy/90 backdrop-blur-xl"
                >
                    {/* Star particle effect background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -50, x: Math.random() * window.innerWidth - window.innerWidth / 2 }}
                                animate={{
                                    y: window.innerHeight + 50,
                                    x: Math.random() * 200 - 100,
                                    rotate: Math.random() * 360,
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 1,
                                    ease: 'easeIn',
                                }}
                                className="absolute"
                                style={{
                                    filter: `drop-shadow(0 0 10px ${['#FFD700', '#FFFFFF', '#FFB400'][i % 3]})`
                                }}
                            >
                                <div className={`text-${i % 2 === 0 ? '4xl' : '2xl'} opacity-80`}>
                                    {['⭐', '✨', '🌟'][i % 3]}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ scale: 0.5, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0.5, rotate: 20 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                        className="text-center z-10"
                    >
                        {/* Icon with pulse */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-8xl mb-6"
                        >
                            {levelInfo?.icon || '🎉'}
                        </motion.div>

                        {/* Level number */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-8xl font-black text-sunshineYellow mb-4 uppercase italic drop-shadow-[0_10px_0_rgb(161,98,7)]"
                        >
                            CẤP {levelUpMessage.newLevel}!
                        </motion.h1>

                        {/* Level title in Vietnamese */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-black text-white mb-2 uppercase tracking-wide"
                        >
                            {levelInfo.vi}
                        </motion.p>

                        {/* English title smaller */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl font-bold text-skyBlue mb-8"
                        >
                            {levelInfo.en}
                        </motion.p>

                        {/* XP gained */}
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md rounded-3xl px-10 py-5 mb-8 border border-white/30 shadow-[0_0_30px_rgba(255,214,52,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                            <p className="text-white/90 text-sm font-black uppercase tracking-widest mb-1 drop-shadow-md">Thưởng thăng cấp</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-4xl">⭐</span>
                                <p className="text-sunshineYellow text-5xl font-black drop-shadow-[0_2px_10px_rgba(255,214,52,0.6)]">+{levelUpMessage.xpGained}</p>
                            </div>
                        </motion.div>

                        {/* Close button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClose}
                            className="bg-white text-deepNavy font-black px-12 py-5 rounded-3xl text-3xl shadow-level-3 border-t-4 border-slate-100 active:shadow-none active:translate-y-1 transition-all"
                        >
                            TUYỆT VỜI! 🚀
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpCelebration;

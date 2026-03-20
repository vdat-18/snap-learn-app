import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const LevelUpCelebration: React.FC = () => {
    const { levelUpMessage, clearLevelUpMessage } = useGameStore();

    const handleClose = () => {
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
                    {/* Confetti effect background */}
                    <div className="absolute inset-0">
                        {Array.from({ length: 12 }).map((_, i) => (
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
                                className="absolute w-4 h-4 pointer-events-none"
                            >
                                <div className="text-2xl">
                                    {['🎉', '⭐', '✨', '🌟'][i % 4]}
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
                            {levelInfo.icon}
                        </motion.div>

                        {/* Level number */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-7xl font-black text-sunshineYellow mb-4 uppercase italic"
                        >
                            LEVEL {levelUpMessage.newLevel}!
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
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/10 backdrop-blur-sm rounded-3xl px-8 py-4 mb-8 border-2 border-white/20"
                        >
                            <p className="text-white text-sm font-bold uppercase tracking-widest mb-1">XP Gained</p>
                            <p className="text-sunshineYellow text-4xl font-black">+{levelUpMessage.xpGained} XP</p>
                        </motion.div>

                        {/* Close button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClose}
                            className="bg-white text-deepNavy font-black px-12 py-5 rounded-2xl text-2xl shadow-level-3 border-t-4 border-white/30 active:shadow-none active:translate-y-1 transition-all"
                        >
                            AWESOME! 🚀
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpCelebration;

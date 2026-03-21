import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { mascotSpeak, triggerHaptic } from '../../utils/feedbackUtils';
const LanguageSelectScreen: React.FC = () => {
    const { setTargetLanguage, setLanguageSelected } = useGameStore();
    const { playPop } = useSoundEffects();

    useEffect(() => {
        // Welcoming voice instruction specifically for language selection
        mascotSpeak("Bạn muốn học ngôn ngữ nào nhỉ? Chọn tiếng Anh nha!", 'vi-VN');
    }, []);

    const handleSelectEnglish = () => {
        triggerHaptic(50);
        playPop();
        setTargetLanguage('en');
        setLanguageSelected(true);
    };

    const handleSelectChinese = () => {
        triggerHaptic(50);
        playPop();
        // Option is frozen, so it doesn't navigate away.
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 flex flex-col items-center justify-center p-6 text-white overflow-hidden z-[200]">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 left-10 text-6xl">☁️</motion.div>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute top-40 right-10 text-5xl">☁️</motion.div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }} className="absolute bottom-40 left-20 text-4xl">✨</motion.div>
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="relative z-10 w-full max-w-sm"
            >
                <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_0_rgba(0,0,0,0.1),0_0_50px_rgba(255,255,255,0.3)] border-[6px] border-white text-center">
                    
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-24 h-24 mx-auto mb-6 bg-sunshineYellow rounded-full p-2 shadow-inner border-4 border-white"
                    >
                        <img src="/owl-mascot.png" alt="Mascot" className="w-full h-full object-contain" />
                    </motion.div>

                    <h1 className="text-2xl font-black text-deepNavy mb-2">Học tiếng gì đây?</h1>
                    <p className="text-slate-500 font-medium mb-8">Chọn ngôn ngữ để bắt đầu nhé!</p>

                    <div className="space-y-4">
                        {/* English Option - Active */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSelectEnglish}
                            className="w-full relative group bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 flex items-center gap-4 shadow-[0_6px_0_rgb(49,46,129)] active:shadow-none active:translate-y-[6px] transition-all border-t-2 border-white/20"
                        >
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">
                                🇺🇸
                            </div>
                            <div className="flex-1 text-left">
                                <h2 className="text-white font-black text-xl">Tiếng Anh</h2>
                                <p className="text-blue-100 font-medium text-sm">English</p>
                            </div>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                                ➜
                            </div>
                        </motion.button>

                        {/* Chinese Option - Frozen */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSelectChinese}
                            className="w-full relative group bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-4 flex items-center gap-4 shadow-[0_6px_0_rgb(159,18,57)] active:shadow-none active:translate-y-[6px] transition-all border-t-2 border-white/20"
                        >
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">
                                🇨🇳
                            </div>
                            <div className="flex-1 text-left">
                                <h2 className="text-white font-black text-xl">Tiếng Trung</h2>
                                <p className="text-red-100 font-medium text-sm">中文</p>
                            </div>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                                ➜
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LanguageSelectScreen;

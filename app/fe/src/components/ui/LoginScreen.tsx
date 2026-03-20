import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { Rocket } from 'lucide-react';

// Animal avatars for child selection — visual, not text
const avatars = [
    { emoji: '🦊', sound: 'Cáo tinh nghịch!' },
    { emoji: '🦁', sound: 'Sư tử dũng cảm!' },
    { emoji: '🐼', sound: 'Gấu trúc đáng yêu!' },
    { emoji: '🐰', sound: 'Thỏ nhanh nhẹn!' },
    { emoji: '🐯', sound: 'Hổ mạnh mẽ!' },
    { emoji: '🐨', sound: 'Koala thông thái!' },
];

// Helper: speak text using Web Speech API
const speak = (text: string, lang = 'vi-VN') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
};

const LoginScreen: React.FC = () => {
    const { setUserName, setUserAvatar } = useGameStore();
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
    const [isJoining, setIsJoining] = useState(false);
    const [nameError, setNameError] = useState(false);
    const { playPop } = useSoundEffects();

    // Auto-play TTS greeting on mount (audio-first principle)
    useEffect(() => {
        const timer = setTimeout(() => {
            speak('Xin chào! Tên gọi ở nhà của bé là gì?');
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleAvatarSelect = (avatar: typeof avatars[0]) => {
        playPop();
        setSelectedAvatar(avatar);
        speak(avatar.sound);
    };

    const handleStartClick = () => {
        if (!name.trim()) {
            setNameError(true);
            speak('Bé ơi, điền tên vào nhé!');
            return;
        }
        setNameError(false);
        setIsJoining(true);
        playPop();
        speak(`Xin chào ${name}! Bắt đầu khám phá nào!`);
        setTimeout(() => {
            setUserName(name.trim());
            setUserAvatar(selectedAvatar.emoji);
        }, 1800);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (nameError) setNameError(false);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 flex flex-col items-center justify-center p-6 font-outfit overflow-hidden">

            {/* Decorative floating bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{
                            width: `${40 + i * 20}px`,
                            height: `${40 + i * 20}px`,
                            left: `${10 + i * 15}%`,
                            bottom: `-${60 + i * 10}px`,
                        }}
                        animate={{ y: [0, -(600 + i * 100)], opacity: [0.6, 0] }}
                        transition={{
                            duration: 6 + i * 2,
                            repeat: Infinity,
                            delay: i * 1.2,
                            ease: 'linear',
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-sm relative flex flex-col items-center">

                {/* App title */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-black text-white drop-shadow-lg tracking-tight">SnapLearn</h1>
                    <p className="text-white/80 font-bold text-sm tracking-widest uppercase mt-1">Khám phá · Học · Vui</p>
                </motion.div>

                {/* Selected avatar display */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                    className="relative mb-6"
                >
                    <div className="w-36 h-36 bg-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-center border-8 border-white/60">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={selectedAvatar.emoji}
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 20 }}
                                transition={{ type: 'spring', damping: 14 }}
                                className="text-7xl"
                            >
                                {selectedAvatar.emoji}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    {/* "Tap to change" hint */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-deepNavy/70 backdrop-blur px-3 py-1 rounded-full">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Chọn linh vật</span>
                    </div>
                </motion.div>

                {/* Avatar grid — 3 columns, bigger targets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-3 gap-3 mb-8 w-full"
                >
                    {avatars.map((a) => (
                        <motion.button
                            key={a.emoji}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleAvatarSelect(a)}
                            className={`h-16 rounded-[20px] flex items-center justify-center text-3xl transition-all duration-200 ${selectedAvatar.emoji === a.emoji
                                    ? 'bg-white shadow-[0_6px_0_rgba(0,0,0,0.15)] scale-105 ring-4 ring-white/60'
                                    : 'bg-white/30 backdrop-blur-sm hover:bg-white/50 active:bg-white/70'
                                }`}
                        >
                            {a.emoji}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Name input — single field, no password */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full mb-6"
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="✏️  Tên gọi ở nhà của bé..."
                            value={name}
                            onChange={handleNameChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
                            maxLength={20}
                            className={`w-full h-16 bg-white rounded-2xl px-5 text-xl font-black text-deepNavy placeholder:text-slate-300 placeholder:font-medium shadow-[0_6px_0_rgba(0,0,0,0.1)] border-[3px] transition-all focus:outline-none ${nameError
                                    ? 'border-coralRed ring-4 ring-coralRed/20 animate-bounce-scale'
                                    : 'border-white/0 focus:border-skyBlue focus:ring-4 focus:ring-skyBlue/20'
                                }`}
                        />
                    </div>
                    {nameError && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white font-black text-sm mt-2 ml-2 drop-shadow"
                        >
                            👆 Điền tên vào nhé bé!
                        </motion.p>
                    )}
                </motion.div>

                {/* CTA Button — prominent, no "login" language */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full"
                >
                    <motion.button
                        whileTap={{ scale: 0.95, y: 6 }}
                        onClick={handleStartClick}
                        disabled={isJoining}
                        className="w-full bg-sunshineYellow text-deepNavy h-18 py-4 rounded-[24px] font-black text-2xl shadow-[0_8px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[8px] transition-all disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3 border-t-2 border-white/40"
                    >
                        <AnimatePresence mode="wait">
                            {isJoining ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-7 h-7 border-4 border-deepNavy border-t-transparent rounded-full animate-spin" />
                                    <span>Đang vào...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="start"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <Rocket className="w-7 h-7 stroke-[3px]" />
                                    <span>BẮT ĐẦU CHƠI!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.div>

                {/* TTS hint */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => {
                        playPop();
                        speak('Xin chào! Tên gọi ở nhà của bé là gì? Hãy chọn một linh vật nhé!');
                    }}
                    className="mt-6 flex items-center gap-2 text-white/70 font-bold text-sm active:text-white transition-colors"
                >
                    🔊 Nghe lại hướng dẫn
                </motion.button>

                {/* Footer note */}
                <p className="mt-8 text-[10px] font-black text-white/40 uppercase tracking-[3px]">
                    SnapLearn • LotusHack 2026
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;

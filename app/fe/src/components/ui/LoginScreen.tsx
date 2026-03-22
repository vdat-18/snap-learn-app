import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { mascotSpeak } from '../../utils/feedbackUtils';
import { authApi } from '../../services/authApi';
import { AppError } from '../../services/api';
import { Rocket, Volume2 } from 'lucide-react';

// Animal avatars for child selection — static config, no backend needed
const avatars: { id: string; emoji: string; sound: string }[] = [
    { id: 'owl', emoji: '🦉', sound: 'Cú mèo tới đây!' },
    { id: 'rabbit', emoji: '🐰', sound: 'Thỏ con tới đây!' },
    { id: 'cat', emoji: '🐱', sound: 'Mèo con tới đây!' },
    { id: 'bear', emoji: '🐻', sound: 'Gấu bông tới đây!' },
    { id: 'fox', emoji: '🦊', sound: 'Cáo nhỏ tới đây!' },
    { id: 'panda', emoji: '🐼', sound: 'Gấu trúc tới đây!' },
];

type Step = 'auth' | 'create-child';

const LoginScreen: React.FC = () => {
    const { setAuth, setChild, setOnboardingSeen } = useGameStore();
    const [step, setStep] = useState<Step>('auth');

    // Auth fields
    const [email, setEmail] = useState('');
    const [password] = useState('12345678');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Child creation fields
    const [childName, setChildName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
    const [nameError, setNameError] = useState(false);

    const { playPop } = useSoundEffects();

    // Generate random email on mount
    useEffect(() => {
        const randomString = Math.random().toString(36).substring(2, 8);
        setEmail(`${randomString}@gmail.com`);
    }, []);

    const handleAvatarSelect = (avatar: typeof avatars[0]) => {
        playPop();
        setSelectedAvatar(avatar);
        mascotSpeak(avatar.sound);
    };

    const handleAuthSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            setAuthError('Vui lòng nhập email và mật khẩu');
            return;
        }
        setAuthError(null);
        setIsSubmitting(true);
        playPop();

        try {
            const response = await authApi.register(email.trim(), password);

            // Store auth tokens
            setAuth(
                { accessToken: response.access_token, refreshToken: response.refresh_token },
                response.parent_id
            );

            // If parent has children, select the first one
            if (response.children && response.children.length > 0) {
                const child = response.children[0];
                setChild(child.id, child);
                setOnboardingSeen(); // Skip onboarding if child already exists
                mascotSpeak(`Chào mừng trở lại! Chúng mình cùng khám phá tiếp nhé!`);
            } else {
                // No children — show child creation form
                setStep('create-child');
                mascotSpeak('Tuyệt vời! Bây giờ hãy tạo hồ sơ cho bé nhé!');
            }
        } catch (err) {
            if (err instanceof AppError) {
                setAuthError(err.message_vi);
            } else {
                setAuthError('Không thể kết nối. Vui lòng thử lại!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateChild = async () => {
        if (!childName.trim()) {
            setNameError(true);
            mascotSpeak('Bạn ơi, đừng quên điền tên của mình vào nhé!');
            return;
        }
        setNameError(false);
        setIsSubmitting(true);
        playPop();

        try {
            const child = await authApi.createChild(
                childName.trim(),
                selectedAvatar.id,
                'en' // Defaulting to en for child creation since they choose language in LanguageSelectScreen later. Alternatively we can rely on what language they select later.
            );
            setChild(child.id, child);
            mascotSpeak(`Xin chào ${childName}! Chúng mình cùng bắt đầu khám phá nào!`);
        } catch (err) {
            if (err instanceof AppError) {
                setAuthError(err.message_vi);
            } else {
                setAuthError('Không thể tạo hồ sơ. Vui lòng thử lại!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- CHILD CREATION STEP ---
    if (step === 'create-child') {
        return (
            <div className="fixed inset-0 z-[300] bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
                {/* Decorative floating bubbles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white/10"
                            style={{ width: `${40 + i * 20}px`, height: `${40 + i * 20}px`, left: `${10 + i * 15}%`, bottom: `-${60 + i * 10}px` }}
                            animate={{ y: [0, -(600 + i * 100)], opacity: [0.6, 0] }}
                            transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.2, ease: 'linear' }}
                        />
                    ))}
                </div>

                <div className="w-full max-w-sm relative flex flex-col items-center">
                    <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6">
                        <h1 className="text-2xl font-black text-white drop-shadow-lg tracking-tight">Tạo Hồ Sơ Bé</h1>
                        <p className="text-white/80 font-bold text-xs tracking-widest uppercase mt-1">Chọn linh vật và đặt tên</p>
                    </motion.div>

                    {/* Selected avatar display */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }} className="relative mb-4 group cursor-pointer">
                        <div className="w-28 h-28 bg-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-center border-6 border-white/60 relative">
                            <AnimatePresence mode="wait">
                                <motion.span key={selectedAvatar.emoji} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-5xl">
                                    {selectedAvatar.emoji}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Avatar grid */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 mb-6 w-full">
                        {avatars.map((a) => (
                            <motion.button
                                key={a.emoji}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleAvatarSelect(a)}
                                className={`h-14 rounded-[20px] flex items-center justify-center text-2xl transition-all duration-200 ${selectedAvatar.emoji === a.emoji
                                    ? 'bg-white shadow-[0_6px_0_rgba(0,0,0,0.15)] scale-105 ring-4 ring-white/60'
                                    : 'bg-white/30 backdrop-blur-sm hover:bg-white/50'
                                    }`}
                            >
                                {a.emoji}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Child name input */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full mb-6">
                        <input
                            type="text"
                            placeholder="✏️  Bạn tên là gì nhỉ?..."
                            value={childName}
                            onChange={(e) => { setChildName(e.target.value); setNameError(false); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateChild()}
                            maxLength={20}
                            className={`w-full h-14 bg-white rounded-2xl px-5 text-lg font-black text-deepNavy placeholder:text-slate-300 placeholder:font-medium shadow-[0_6px_0_rgba(0,0,0,0.1)] border-[3px] transition-all focus:outline-none ${nameError
                                ? 'border-coralRed ring-4 ring-coralRed/20'
                                : 'border-white/0 focus:border-skyBlue focus:ring-4 focus:ring-skyBlue/20'
                                }`}
                        />
                        {nameError && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white font-black text-sm mt-2 ml-2 drop-shadow">
                                👆 Điền tên vào nhé bạn!
                            </motion.p>
                        )}
                    </motion.div>

                    {authError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-coralRed bg-white/90 px-4 py-2 rounded-xl font-bold text-sm mb-4 w-full text-center">
                            {authError}
                        </motion.p>
                    )}

                    {/* Create button */}
                    <motion.button
                        whileTap={{ scale: 0.95, y: 6 }}
                        onClick={handleCreateChild}
                        disabled={isSubmitting}
                        className="w-full bg-sunshineYellow text-deepNavy py-4 rounded-[24px] font-black text-xl shadow-[0_8px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[8px] transition-all disabled:opacity-70 flex items-center justify-center gap-3 border-t-2 border-white/40"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 border-4 border-deepNavy border-t-transparent rounded-full animate-spin" />
                                <span>Đang tạo...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Rocket className="w-7 h-7 stroke-[3px]" />
                                <span>BẮT ĐẦU CHƠI!</span>
                            </div>
                        )}
                    </motion.button>

                    <p className="mt-8 text-[10px] font-black text-white/40 uppercase tracking-[3px]">
                        SnapLearn • LotusHack 2026
                    </p>
                </div>
            </div>
        );
    }

    // --- AUTH STEP (LOGIN / REGISTER) ---
    return (
        <div className="fixed inset-0 z-[300] bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
            {/* Decorative floating bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{ width: `${40 + i * 20}px`, height: `${40 + i * 20}px`, left: `${10 + i * 15}%`, bottom: `-${60 + i * 10}px` }}
                        animate={{ y: [0, -(600 + i * 100)], opacity: [0.6, 0] }}
                        transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.2, ease: 'linear' }}
                    />
                ))}
            </div>

            <div className="w-full max-w-sm relative flex flex-col items-center">
                {/* App title */}
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                        <img src="/owl-mascot.png" alt="SnapLearn Mascot" className="w-full h-full object-contain mix-blend-multiply scale-110" />
                    </div>
                    <h1 className="text-2xl font-black text-white drop-shadow-lg tracking-tight">SnapLearn</h1>
                    <p className="text-white/80 font-bold text-xs tracking-widest uppercase mt-1">Khám phá · Học · Vui</p>
                </motion.div>

                {/* Error message */}
                {authError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-coralRed bg-white/90 px-4 py-2 rounded-xl font-bold text-sm mb-4 w-full text-center">
                        {authError}
                    </motion.p>
                )}

                {/* Submit button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full">
                    <motion.button
                        whileTap={{ scale: 0.95, y: 6 }}
                        onClick={handleAuthSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-sunshineYellow text-deepNavy py-4 rounded-[24px] font-black text-xl shadow-[0_8px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[8px] transition-all disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3 border-t-2 border-white/40"
                    >
                        <AnimatePresence mode="wait">
                            {isSubmitting ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                    <div className="w-7 h-7 border-4 border-deepNavy border-t-transparent rounded-full animate-spin" />
                                    <span>Đang xử lý...</span>
                                </motion.div>
                            ) : (
                                <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                    <Rocket className="w-7 h-7 stroke-[3px]" />
                                    <span>ĐĂNG NHẬP</span>
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
                        mascotSpeak('Chào bạn! Hãy đăng nhập hoặc tạo tài khoản mới nhé!');
                    }}
                    className="mt-6 flex items-center gap-2 text-white/70 font-bold text-sm active:text-white transition-colors"
                >
                    <Volume2 className="w-4 h-4" /> Nghe lại hướng dẫn
                </motion.button>

                <p className="mt-8 text-[10px] font-black text-white/40 uppercase tracking-[3px]">
                    SnapLearn • LotusHack 2026
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;

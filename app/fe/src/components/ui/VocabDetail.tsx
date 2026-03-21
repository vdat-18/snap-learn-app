import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, BookOpen, Mic, Loader2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from '../../utils/feedbackUtils';
import { speechApi } from '../../services/speechApi';
import { collectionApi, type VocabDetail as VocabDetailData } from '../../services/collectionApi';
import BackgroundParallax from './BackgroundParallax';

interface VocabDetailProps {
    vocabId: string;
    onClose: () => void;
}

const VocabDetail: React.FC<VocabDetailProps> = ({ vocabId, onClose }) => {
    const { practiceWord, target_language } = useGameStore();
    const { playPop, playChime } = useSoundEffects();
    const [isPracticing, setIsPracticing] = useState(false);
    const [justEvolved, setJustEvolved] = useState(false);
    const [practiceStatus] = useState<'idle' | 'listening' | 'success' | 'fail'>('idle');

    const [vocab, setVocab] = useState<VocabDetailData | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);
    const [detailError, setDetailError] = useState(false);

    useEffect(() => {
        setIsLoadingDetail(true);
        setDetailError(false);
        collectionApi.getVocabDetail(vocabId)
            .then(data => setVocab(data))
            .catch(() => setDetailError(true))
            .finally(() => setIsLoadingDetail(false));
    }, [vocabId]);

    if (isLoadingDetail) {
        return (
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                className="fixed inset-0 z-[180] bg-white flex flex-col items-center justify-center font-sans"
            >
                <Loader2 className="w-10 h-10 text-skyBlue animate-spin" />
                <p className="mt-4 text-sm font-bold text-slate-400">Đang tải...</p>
            </motion.div>
        );
    }

    if (detailError || !vocab) {
        return (
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                className="fixed inset-0 z-[180] bg-white flex flex-col items-center justify-center font-sans gap-4"
            >
                <span className="text-5xl">😴</span>
                <p className="text-base font-black text-deepNavy">Không tải được thẻ bài</p>
                <button onClick={onClose} className="bg-skyBlue text-white px-6 py-3 rounded-2xl font-black text-sm shadow-level-2">
                    Quay lại
                </button>
            </motion.div>
        );
    }

    const masteryMax = Math.max(vocab.mastery_en, vocab.mastery_vi, vocab.mastery_zh);

    const handlePractice = async () => {
        setIsPracticing(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    const language = target_language === 'zh' ? 'zh' : 'en';

                    try {
                        const result = await speechApi.pronounce(vocab.id, language, base64);

                        practiceWord(vocab.id, result.stars);

                        if (result.evolved) {
                            setJustEvolved(true);
                            setVocab(prev => prev ? { ...prev, evolved: true } : prev);
                            playChime();
                            triggerHaptic(200);
                        } else {
                            playPop();
                            triggerHaptic(50);
                        }
                    } catch (err) {
                        console.error('Practice API error:', err);
                        practiceWord(vocab.id, 1);
                        playPop();
                        triggerHaptic(50);
                    } finally {
                        setIsPracticing(false);
                    }
                };
                reader.readAsDataURL(audioBlob);
            };

            mascotSpeak(vocab.word_en, 'en-US');

            setTimeout(() => {
                mediaRecorder.start();
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                }, 3000);
            }, 1200);
        } catch (err) {
            console.error('Microphone error:', err);
            mascotSpeak(vocab.word_en, 'en-US');
            setTimeout(() => {
                practiceWord(vocab.id, 1);
                playPop();
                triggerHaptic(50);
                setIsPracticing(false);
            }, 1200);
        }
    };

    const progressPercent = Math.min((masteryMax / 3) * 100, 100);

    const tier = vocab.rarity_tier.toLowerCase();
    const rarityLabels: Record<string, string> = {
        'common': 'Thường nè',
        'uncommon': 'Đặc biệt đó',
        'rare': 'Hiếm quá đi',
        'epic': 'Siêu hiếm',
        'legendary': 'Huyền thoại luôn',
    };

    return (
        <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="fixed inset-0 z-[180] bg-white flex flex-col font-sans"
        >
            <header className="px-6 pt-12 pb-4 flex items-center justify-between">
                <button onClick={onClose} className="p-2 -ml-2">
                    <X className="w-8 h-8 text-deepNavy" />
                </button>
                <div className={`px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${
                    tier === 'legendary' ? 'bg-amber-100 border-amber-400 text-amber-600' : 'bg-slate-100 border-slate-300 text-slate-500'
                }`}>
                    {rarityLabels[tier] || 'Thường'} {vocab.evolved && '• TIẾN HÓA ✨'}
                </div>
                <div className="w-12 h-12" />
            </header>

            <BackgroundParallax className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 pb-10">
                    <div className="relative mb-8">
                        <motion.div
                            className={`rounded-[40px] overflow-hidden shadow-level-3 border-8 border-white aspect-square relative ${vocab.evolved ? 'ring-8 ring-sunshineYellow/20' : ''}`}
                            animate={vocab.evolved ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 3 }}
                        >
                            {vocab.photo_url ? (
                                <img src={vocab.photo_url} alt={vocab.word_en} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl bg-slate-50">📷</div>
                            )}
                            {vocab.evolved && <div className="absolute inset-0 bg-gradient-to-t from-sunshineYellow/20 to-transparent" />}

                            <AnimatePresence>
                                {(practiceStatus === 'success' || practiceStatus === 'fail') && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.2 }}
                                        className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${practiceStatus === 'success' ? 'bg-mintGreen/60' : 'bg-coralRed/60'}`}
                                    >
                                        <div className="bg-white/90 backdrop-blur px-8 py-6 rounded-[32px] shadow-2xl">
                                            <span className="text-5xl block mb-4">
                                                {practiceStatus === 'success' ? '🎯' : '💪'}
                                            </span>
                                            <h4 className={`text-xl font-black ${practiceStatus === 'success' ? 'text-mintGreen' : 'text-coralRed'}`}>
                                                {practiceStatus === 'success' ? 'TUYỆT VỜI!' : 'GẦN ĐÚNG RỒI!'}
                                            </h4>
                                            <p className="text-sm font-bold text-slate-600 mt-2">
                                                {practiceStatus === 'success' ? '+20 XP Thưởng' : 'Hãy nói to hơn xíu nhé!'}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <div className="flex flex-col items-center gap-1 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🇬🇧</span>
                            <span className="text-2xl font-black text-deepNavy">{vocab.word_en}</span>
                            <button onClick={() => mascotSpeak(vocab.word_en, 'en-US')} className="p-3 rounded-full bg-deepNavy/5 text-deepNavy active:scale-95 transition-all">
                                <Volume2 className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-base font-bold text-slate-400">{vocab.word_vi}</p>
                    </div>

                    <section className="bg-white rounded-[32px] p-6 shadow-level-2 mb-6 border-b-4 border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">🌱 Lớn lên nào!</h3>
                            <span className="text-base font-black text-skyBlue">{masteryMax}/3</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                            <motion.div animate={{ width: `${progressPercent}%` }} className={`h-full rounded-full ${vocab.evolved ? 'bg-sunshineYellow' : 'bg-skyBlue'}`} />
                        </div>
                    </section>

                    <section className={`rounded-[32px] p-6 ${vocab.evolved ? 'bg-lavenderPurple/10' : 'bg-slate-50 opacity-60'}`}>
                        <h3 className="font-black uppercase text-sm mb-4">Bí mật thẻ bài {vocab.evolved ? '✨' : '🔒'}</h3>
                        {vocab.evolved ? (
                            <div className="space-y-4">
                                <p className="font-bold text-indigo-900/80">Thẻ đã tiến hoá!</p>
                            </div>
                        ) : (
                            <div className="flex justify-center py-4 text-slate-300"><BookOpen /></div>
                        )}
                    </section>
                </div>
            </BackgroundParallax>

            <div className="p-6 bg-white border-t border-slate-100 px-8">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePractice}
                    disabled={isPracticing}
                    className={`w-full flex items-center justify-center gap-3 py-5 rounded-[32px] font-black text-white shadow-level-2 transition-all ${practiceStatus === 'listening' ? 'bg-coralRed animate-pulse' :
                        practiceStatus === 'success' ? 'bg-mintGreen' :
                            practiceStatus === 'fail' ? 'bg-coralRed' : 'bg-skyBlue active:shadow-none'
                        }`}
                >
                    {practiceStatus === 'listening' ? (
                        <>
                            <div className="flex gap-1.5 h-6 items-center translate-y-[-1px]">
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [10, 24, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                        className="w-1.5 bg-white rounded-full"
                                    />
                                ))}
                            </div>
                            <span>ĐANG NGHE...</span>
                        </>
                    ) : practiceStatus === 'success' ? (
                        <><span>✅ ĐÚNG RỒI!</span></>
                    ) : practiceStatus === 'fail' ? (
                        <><span>❌ THỬ LẠI NHÉ!</span></>
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            <span>{masteryMax >= 3 ? 'LUYỆN TẬP THÊM' : 'LUYỆN TẬP ĐỂ TIẾN HÓA'}</span>
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {justEvolved && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-hidden"
                    >
                        {/* Sunburst background rays */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0.6, rotate: 360 }}
                            transition={{
                                scale: { delay: 1.8, duration: 0.5, type: 'spring' },
                                opacity: { delay: 1.8, duration: 0.5 },
                                rotate: { duration: 15, repeat: Infinity, ease: 'linear' }
                            }}
                            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                        >
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute w-[150%] h-12 bg-gradient-to-r from-transparent via-sunshineYellow to-transparent blur-md mix-blend-screen" style={{ transform: `rotate(${i * 30}deg)` }} />
                            ))}
                        </motion.div>

                        {/* Blinding White Flash */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0, 1, 0] }}
                            transition={{ duration: 3, times: [0, 0.6, 0.7, 1] }}
                            className="absolute inset-0 bg-white z-20 pointer-events-none"
                        />

                        {/* Simulated Crack Overlay (Lightning/fractal lines behind the card just before explosion) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1.2, 1.5] }}
                            transition={{ duration: 2, times: [0, 0.7, 0.9, 1] }}
                            className="absolute z-10 w-96 h-96 pointer-events-none flex items-center justify-center"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full stroke-orange-500 fill-none drop-shadow-[0_0_10px_rgba(249,115,22,1)]" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <motion.path d="M50 10 L55 30 L40 45 L60 65 L45 90" strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: [100, 0] }} transition={{ delay: 0.5, duration: 1 }} />
                                <motion.path d="M10 50 L30 45 L45 60 L65 40 L90 55" strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: [100, 0] }} transition={{ delay: 0.8, duration: 0.7 }} />
                            </svg>
                        </motion.div>

                        {/* The Evolving Card */}
                        <motion.div
                            className="relative z-10 w-64 h-64 rounded-[40px] shadow-[0_0_50px_rgba(255,210,52,0.8)] border-8 border-sunshineYellow overflow-hidden bg-white"
                            initial={{ scale: 0.8 }}
                            animate={{
                                scale: [0.8, 1, 1.05, 1.1, 1.2, 1],
                                x: [0, -10, 10, -15, 15, -20, 20, 0, 0],
                                y: [0, 10, -10, 15, -15, 20, -20, 0, 0],
                                filter: [
                                    "brightness(1) contrast(1)",
                                    "brightness(1.5) contrast(1.2) hue-rotate(90deg)",
                                    "brightness(2) contrast(1.5) hue-rotate(180deg)",
                                    "brightness(3) contrast(2) saturate(3)",
                                    "brightness(10)",
                                    "brightness(1) contrast(1.1) saturate(1.2)"
                                ]
                            }}
                            transition={{ duration: 3, times: [0, 0.3, 0.5, 0.6, 0.7, 0.8], ease: "easeInOut" }}
                        >
                            {vocab.photo_url ? (
                                <img src={vocab.photo_url} alt={vocab.word_en} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl bg-slate-50">📷</div>
                            )}
                            {/* Permanent Evolved Glow Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.2 }}
                                className="absolute inset-0 bg-gradient-to-t from-sunshineYellow/60 via-transparent to-transparent mix-blend-overlay pointer-events-none"
                            />
                        </motion.div>

                        {/* Victory Text & Action */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 2.4, type: 'spring', damping: 12 }}
                            className="relative z-30 text-center mt-12 w-full max-w-sm"
                        >
                            <h2 className="text-[32px] font-black mb-1 text-white drop-shadow-[0_0_15px_rgba(255,210,52,1)] tracking-widest uppercase italic">
                                Đã Tiến Hóa!
                            </h2>
                            <p className="text-sunshineYellow font-bold mb-10 uppercase tracking-[4px] text-xs opacity-90">Sức mạnh ngôn ngữ thức tỉnh ✨</p>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setJustEvolved(false)}
                                className="w-full bg-sunshineYellow text-deepNavy px-8 py-4 rounded-[28px] font-black text-lg shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[6px] border-t-2 border-white/40 flex justify-center items-center gap-2"
                            >
                                <span>THU THẬP NĂNG LƯỢNG</span>
                                <span className="text-2xl">⚡</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

export default VocabDetail;

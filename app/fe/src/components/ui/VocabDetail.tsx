import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Volume2, BookOpen, Sparkles } from 'lucide-react';
import { useGameStore, type CapturedWord } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from '../../utils/feedbackUtils';

interface VocabDetailProps {
    word: CapturedWord | null;
    isOpen: boolean;
    onClose: () => void;
}

const mockFunFacts: Record<string, string> = {
    'Cat': 'Mèo ngủ gật tới 16 tiếng mỗi ngày để nạp năng lượng!',
    'Dog': 'Mũi của chó có thể ngửi được cảm xúc của con người!',
    'Apple': 'Táo có thể nổi trên mặt nước vì 25% thể tích là không khí!',
    'Car': 'Chiếc xe hơi đầu tiên chỉ chạy với tốc độ 16 km/h thôi!'
};

const VocabDetail: React.FC<VocabDetailProps> = ({ word, isOpen, onClose }) => {
    const { practiceWord, addXP } = useGameStore();
    const { playPop, playChime } = useSoundEffects();
    const [isPracticing, setIsPracticing] = useState(false);
    const [justEvolved, setJustEvolved] = useState(false);

    if (!word) return null;

    const handlePractice = () => {
        setIsPracticing(true);
        // Simulate speech recognition success for POC
        setTimeout(() => {
            const wasEvolved = word.isEvolved;
            practiceWord(word.id, 1); // Increment count

            // Check if it just evolved
            if (!wasEvolved && word.practiceCount >= 4) {
                setJustEvolved(true);
                playChime();
                triggerHaptic(200);
            } else {
                playPop();
                triggerHaptic(50);
            }

            setIsPracticing(false);
            addXP(10);
        }, 1200);
    };

    const progressPercent = Math.min((word.practiceCount / 5) * 100, 100);

    const rarityLabels: Record<string, string> = {
        'Common': 'Thường nè',
        'Uncommon': 'Đặc biệt đó',
        'Rare': 'Hiếm quá đi',
        'Epic': 'Siêu hiếm',
        'Legendary': 'Huyền thoại luôn'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="fixed inset-0 z-[180] bg-snowWhite flex flex-col font-sans"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-4 flex items-center justify-between">
                        <button onClick={onClose} className="p-2 -ml-2">
                            <X className="w-8 h-8 text-deepNavy" />
                        </button>
                        <div className={`px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${word.rarity === 'Legendary' ? 'bg-amber-100 border-amber-400 text-amber-600' : 'bg-slate-100 border-slate-300 text-slate-500'
                            }`}>
                            {rarityLabels[word.rarity]} {word.isEvolved && '• TIẾN HÓA ✨'}
                        </div>
                        <div className="w-12 h-12" /> {/* Spacer */}
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 pb-10">
                        {/* Image Showcase */}
                        <div className="relative mb-8 group">
                            <motion.div
                                className={`rounded-[40px] overflow-hidden shadow-level-3 border-8 border-white aspect-square relative ${word.isEvolved ? 'ring-8 ring-sunshineYellow/20' : ''
                                    }`}
                                animate={word.isEvolved ? { scale: [1, 1.02, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                <img src={word.image} alt={word.word_en} className="w-full h-full object-cover" />
                                {word.isEvolved && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-sunshineYellow/20 to-transparent pointer-events-none" />
                                )}
                            </motion.div>

                            {word.isEvolved && (
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute -top-4 -right-4 bg-sunshineYellow w-14 h-14 rounded-full flex items-center justify-center shadow-level-3 border-4 border-white"
                                >
                                    <Sparkles className="w-7 h-7 text-deepNavy" />
                                </motion.div>
                            )}
                        </div>

                        {/* Words Info */}
                        <div className="text-center mb-8">
                            {/* Words with TTS */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl font-black text-deepNavy">{word.word_vi}</span>
                                    {/* Vietnamese voice button removed as requested by user to focus on learning EN/ZH */}
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-xl font-black text-skyBlue">{word.word_en}</span>
                                    <button onClick={() => mascotSpeak(word.word_en || '', 'en-US')} className="p-3 rounded-full bg-skyBlue/10 text-skyBlue active:scale-95 transition-all">
                                        <Volume2 className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl font-black text-lang-zh">{word.word_zh}</span>
                                    <button onClick={() => mascotSpeak(word.word_zh || '', 'zh-CN')} className="p-3 rounded-full bg-lang-zh/10 text-lang-zh active:scale-95 transition-all">
                                        <Volume2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-1">{word.word_vi === 'Con mèo' ? 'māo' : '...'}</p>
                        </div>

                        {/* Evolution Progress */}
                        <section className="bg-white rounded-[32px] p-6 shadow-level-2 border-b-4 border-slate-100 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    🌱 <span className="text-deepNavy">Lớn lên nào!</span>
                                </h3>
                                <span className="text-base font-black text-skyBlue bg-skyBlue/10 px-3 py-0.5 rounded-full">{word.practiceCount}/5</span>
                            </div>

                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-4 p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    className={`h-full rounded-full ${word.isEvolved ? 'bg-sunshineYellow' : 'bg-skyBlue'}`}
                                />
                            </div>

                            <p className="text-xs font-bold text-slate-400 leading-relaxed">
                                {word.isEvolved
                                    ? "Thẻ bài đã đạt hình thái tối thượng! ✨"
                                    : `Luyện tập thêm ${5 - word.practiceCount} lần nữa để mở khóa bí mật của thẻ bài này!`}
                            </p>
                        </section>

                        {/* Fun Facts (Unlocked if Evolved) */}
                        <section className={`rounded-[32px] p-6 transition-all duration-500 ${word.isEvolved
                            ? 'bg-lavenderPurple/10 border-b-4 border-lavenderPurple/20'
                            : 'bg-slate-50 border-2 border-dashed border-slate-200 opacity-60'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-2xl ${word.isEvolved ? 'bg-sunshineYellow text-white' : 'bg-slate-300 text-white shadow-inner'}`}>
                                    <span className="text-2xl">💡</span>
                                </div>
                                <h3 className={`font-black uppercase tracking-widest text-base ${word.isEvolved ? 'text-deepNavy' : 'text-slate-400'}`}>
                                    Bí mật thẻ bài {word.isEvolved ? '✨' : '🔒'}
                                </h3>
                            </div>

                            {word.isEvolved ? (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="text-indigo-900/80 font-bold leading-relaxed"
                                >
                                    {mockFunFacts[word.word_en] || "Vật thể này rất đặc biệt và chứa nhiều bí mật thú vị đang chờ bạn khám phá!"}
                                </motion.p>
                            ) : (
                                <div className="flex items-center justify-center py-4">
                                    <BookOpen className="w-6 h-6 text-slate-300" />
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePractice}
                            disabled={isPracticing}
                            className="flex-1 bg-skyBlue text-white font-black py-5 rounded-[24px] shadow-[0_8px_0_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:shadow-none active:translate-y-[8px] transition-all disabled:opacity-50"
                        >
                            {isPracticing ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Mic className="w-6 h-6" />
                                    LUYỆN TẬP LẠI
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Evolution Celebration Overlay */}
                    <AnimatePresence>
                        {justEvolved && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-deepNavy/90 backdrop-blur-xl"
                            >
                                <motion.div
                                    initial={{ scale: 0.5, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="text-center"
                                >
                                    <div className="text-8xl mb-6">✨🌟✨</div>
                                    <h2 className="text-4xl font-black text-sunshineYellow mb-4 uppercase italic">TIẾN HÓA THÀNH CÔNG!</h2>
                                    <p className="text-white text-lg font-bold mb-10">Thẻ bài của Bé đã biến hình rồi nè!</p>
                                    <button
                                        onClick={() => setJustEvolved(false)}
                                        className="bg-white text-deepNavy font-black px-10 py-4 rounded-2xl text-xl shadow-level-3"
                                    >
                                        TUYỆT VỜI! 🚀
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VocabDetail;

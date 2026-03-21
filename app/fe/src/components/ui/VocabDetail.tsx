import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, BookOpen, Mic } from 'lucide-react';
import { useGameStore, type CapturedWord } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from '../../utils/feedbackUtils';
import { MOCK_REFERENCE_VOCAB } from '../../store/mockData';

interface VocabDetailProps {
    word: CapturedWord | null;
    onClose: () => void;
}

const VocabDetail: React.FC<VocabDetailProps> = ({ word, onClose }) => {
    const { practiceWord, addXP, target_language } = useGameStore();
    const { playPop, playChime } = useSoundEffects();
    const [isPracticing, setIsPracticing] = useState(false);
    const [justEvolved, setJustEvolved] = useState(false);

    if (!word) return null;

    const wordEnLower = (word.word_en || '').toLowerCase();
    const refVocab = MOCK_REFERENCE_VOCAB.find((v: any) =>
        v.word_en && v.word_en.toLowerCase() === wordEnLower
    );

    const handlePractice = () => {
        setIsPracticing(true);
        const wasEvolved = word.isEvolved;

        mascotSpeak(word.word_en, 'en-US');

        setTimeout(() => {
            try {
                practiceWord(word.id, 1);
                addXP(10);

                if (!wasEvolved && word.practiceCount >= 2) {
                    setJustEvolved(true);
                    playChime();
                    triggerHaptic(200);
                } else {
                    playPop();
                    triggerHaptic(50);
                }
            } catch (err) {
                console.error('Practice error:', err);
            } finally {
                setIsPracticing(false);
            }
        }, 1200);
    };

    const progressPercent = Math.min((word.practiceCount / 3) * 100, 100);

    const rarityLabels: Record<string, string> = {
        'Common': 'Thường nè',
        'Uncommon': 'Đặc biệt đó',
        'Rare': 'Hiếm quá đi',
        'Epic': 'Siêu hiếm',
        'Legendary': 'Huyền thoại luôn'
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
                <div className={`px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${word.rarity === 'Legendary' ? 'bg-amber-100 border-amber-400 text-amber-600' : 'bg-slate-100 border-slate-300 text-slate-500'
                    }`}>
                    {rarityLabels[word.rarity] || 'Thường'} {word.isEvolved && '• TIẾN HÓA ✨'}
                </div>
                <div className="w-12 h-12" />
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
                <div className="relative mb-8">
                    <motion.div
                        className={`rounded-[40px] overflow-hidden shadow-level-3 border-8 border-white aspect-square relative ${word.isEvolved ? 'ring-8 ring-sunshineYellow/20' : ''}`}
                        animate={word.isEvolved ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        <img src={word.image} alt={word.word_en} className="w-full h-full object-cover" />
                        {word.isEvolved && <div className="absolute inset-0 bg-gradient-to-t from-sunshineYellow/20 to-transparent" />}
                    </motion.div>
                </div>

                <div className="text-center mb-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-xl">🇻🇳</span>
                            <span className="text-2xl font-black text-deepNavy">{word.word_vi || ''}</span>
                            <button onClick={() => mascotSpeak(word.word_vi, 'vi-VN')} className="p-3 rounded-full bg-deepNavy/5 text-deepNavy active:scale-95 transition-all">
                                <Volume2 className="w-6 h-6" />
                            </button>
                        </div>

                        {/* If English is chosen */}
                        {target_language === 'en' && (
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-xl">🇺🇸</span>
                                <span className="text-xl font-black text-skyBlue">{word.word_en}</span>
                                <button onClick={() => mascotSpeak(word.word_en, 'en-US')} className="p-3 rounded-full bg-skyBlue/10 text-skyBlue active:scale-95 transition-all">
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            </div>
                        )}

                        {/* If Chinese is chosen */}
                        {target_language === 'zh' && (
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-xl">🇨🇳</span>
                                <span className="text-2xl font-black text-lang-zh">{word.word_zh}</span>
                                <button onClick={() => mascotSpeak(word.word_zh, 'zh-CN')} className="p-3 rounded-full bg-lang-zh/10 text-lang-zh active:scale-95 transition-all">
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <section className="bg-white rounded-[32px] p-6 shadow-level-2 mb-6 border-b-4 border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">🌱 Lớn lên nào!</h3>
                        <span className="text-base font-black text-skyBlue">{word.practiceCount}/3</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <motion.div animate={{ width: `${progressPercent}%` }} className={`h-full rounded-full ${word.isEvolved ? 'bg-sunshineYellow' : 'bg-skyBlue'}`} />
                    </div>
                </section>

                <section className={`rounded-[32px] p-6 ${word.isEvolved ? 'bg-lavenderPurple/10' : 'bg-slate-50 opacity-60'}`}>
                    <h3 className="font-black uppercase text-sm mb-4">Bí mật thẻ bài {word.isEvolved ? '✨' : '🔒'}</h3>
                    {word.isEvolved ? (
                        <div className="space-y-4">
                            <p className="font-bold text-indigo-900/80">{refVocab?.fun_fact_vi || "Bí ẩn..."}</p>
                            {refVocab?.sentence_en && (
                                <div className="bg-white/50 p-4 rounded-2xl border border-white">
                                    <p className="font-black text-skyBlue text-sm">{refVocab.sentence_en}</p>
                                    <p className="text-xs text-slate-500">{refVocab.sentence_vi}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex justify-center py-4 text-slate-300"><BookOpen /></div>
                    )}
                </section>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 px-8">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePractice}
                    className={`w-full flex items-center justify-center gap-3 py-5 rounded-[32px] font-black text-white shadow-level-2 transition-all ${isPracticing ? 'bg-coralRed animate-pulse' : 'bg-skyBlue active:shadow-none'}`}
                >
                    {isPracticing ? (
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
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            <span>LUYỆN TẬP LẠI</span>
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {justEvolved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <div className="text-center bg-white p-8 rounded-[40px]">
                            <h2 className="text-3xl font-black mb-4 uppercase">TIẾN HÓA THÀNH CÔNG!</h2>
                            <button onClick={() => setJustEvolved(false)} className="bg-skyBlue text-white px-8 py-3 rounded-2xl font-black">TUYỆT VỜI!</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VocabDetail;

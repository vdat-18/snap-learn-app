import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface RevealCardProps {
    isOpen: boolean;
    onClose: () => void;
    word_vi: string;
    word_en: string;
    word_zh: string;
    pinyin: string;
    phonetic_en: string;
    rarity: Rarity;
    imageUrl: string;
    category: string;
}

const rarityGlowMap: Record<Rarity, string> = {
    Common: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
    Uncommon: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]',
    Rare: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    Epic: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    Legendary: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
};

const rarityBadgeColor: Record<Rarity, string> = {
    Common: 'bg-rarity-common',
    Uncommon: 'bg-rarity-uncommon',
    Rare: 'bg-rarity-rare',
    Epic: 'bg-rarity-epic',
    Legendary: 'bg-rarity-legendary',
};

const RevealCard: React.FC<RevealCardProps> = ({
    isOpen,
    onClose,
    word_vi,
    word_en,
    word_zh,
    pinyin,
    phonetic_en,
    rarity,
    imageUrl,
    category,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [transcript, setTranscript] = useState('');
    const { addCollection, target_language, secondary_language } = useGameStore();

    // Reset state when card opens
    useEffect(() => {
        if (isOpen) {
            setIsCorrect(false);
            setTranscript('');
        }
    }, [isOpen]);

    const startSpeechRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        // Determine language based on target_language
        const langCode = target_language === 'zh' ? 'zh-CN' : 'en-US';
        const targetWord = target_language === 'zh' ? word_zh.toLowerCase() : word_en.toLowerCase();

        const recognition = new SpeechRecognition();
        recognition.lang = langCode;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('Listening...');
        };

        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript.toLowerCase();
            setTranscript(speechResult);

            // Match logic: Check if speech contains the target language word
            if (speechResult.includes(targetWord)) {
                setIsCorrect(true);
                // Save to collection
                addCollection({
                    id: Date.now().toString(),
                    word_en,
                    word_vi,
                    word_zh,
                    image: imageUrl,
                    stars: 3,
                    rarity,
                    category,
                    capturedAt: new Date().toISOString(),
                    practiceCount: 1,
                    isEvolved: false
                });
            } else {
                setIsCorrect(false);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
            setTranscript('Error, try again');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Card Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-white rounded-t-[32px] p-8 pb-12 shadow-level-3"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
                        >
                            ✕
                        </button>

                        {/* Rarity Badge */}
                        <div className="flex justify-center mb-6">
                            <span className={`px-4 py-1.5 ${rarityBadgeColor[rarity]} text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-sm`}>
                                {rarity}
                            </span>
                        </div>

                        {/* Captured Image with Glow */}
                        <div className={`aspect-square w-full rounded-card overflow-hidden bg-slate-100 mb-8 border-4 border-white ${rarityGlowMap[rarity]}`}>
                            <img src={imageUrl} alt={word_en} className="w-full h-full object-cover" />
                            {!imageUrl && <div className="w-full h-full flex items-center justify-center text-4xl">📸</div>}
                        </div>

                        {/* Multilingual Details — filtered by target_language */}
                        <div className="text-center space-y-3 mb-8">
                            {/* Vietnamese — always shown as scaffold */}
                            <h2 className="text-3xl font-bold text-lang-vi">{word_vi}</h2>

                            <div className="flex flex-col gap-1">
                                {/* Target Language (Primary) */}
                                {target_language === 'en' && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xl font-bold text-lang-en">{word_en}</span>
                                        <span className="text-sm font-medium text-slate-400">{phonetic_en}</span>
                                        <button
                                            onClick={() => {
                                                const utterance = new SpeechSynthesisUtterance(word_en);
                                                utterance.lang = 'en-US';
                                                window.speechSynthesis.speak(utterance);
                                            }}
                                            className="w-8 h-8 rounded-full bg-skyBlue/10 flex items-center justify-center text-skyBlue text-sm"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                )}
                                {target_language === 'zh' && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xl font-bold text-lang-zh">{word_zh}</span>
                                        <span className="text-sm font-medium text-slate-400">{pinyin}</span>
                                        <button
                                            onClick={() => {
                                                const utterance = new SpeechSynthesisUtterance(word_zh);
                                                utterance.lang = 'zh-CN';
                                                window.speechSynthesis.speak(utterance);
                                            }}
                                            className="w-8 h-8 rounded-full bg-mintGreen/10 flex items-center justify-center text-mintGreen text-sm"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                )}

                                {/* Secondary Language (if enabled) */}
                                {secondary_language && (
                                    <>
                                        <div className="h-px bg-slate-200 my-2" />
                                        {secondary_language === 'en' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-lg font-semibold text-lang-en">{word_en}</span>
                                                <span className="text-xs font-medium text-slate-400">{phonetic_en}</span>
                                                <button
                                                    onClick={() => {
                                                        const utterance = new SpeechSynthesisUtterance(word_en);
                                                        utterance.lang = 'en-US';
                                                        window.speechSynthesis.speak(utterance);
                                                    }}
                                                    className="w-7 h-7 rounded-full bg-skyBlue/10 flex items-center justify-center text-skyBlue text-xs"
                                                >
                                                    🔊
                                                </button>
                                            </div>
                                        )}
                                        {secondary_language === 'zh' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-lg font-semibold text-lang-zh">{word_zh}</span>
                                                <span className="text-xs font-medium text-slate-400">{pinyin}</span>
                                                <button
                                                    onClick={() => {
                                                        const utterance = new SpeechSynthesisUtterance(word_zh);
                                                        utterance.lang = 'zh-CN';
                                                        window.speechSynthesis.speak(utterance);
                                                    }}
                                                    className="w-7 h-7 rounded-full bg-mintGreen/10 flex items-center justify-center text-mintGreen text-xs"
                                                >
                                                    🔊
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Practice Area (PTT) */}
                        <div className={`transition-all duration-300 rounded-[24px] p-6 border ${isCorrect ? 'bg-mintGreen/10 border-mintGreen/20' : 'bg-softCream border-sunshineYellow/20'}`}>
                            <span className={`block text-center text-sm font-bold mb-4 uppercase tracking-wider ${isCorrect ? 'text-mintGreen' : 'text-skyBlue'}`}>
                                {isCorrect ? 'Perfect! You got it.' : isListening ? 'Listening...' : 'Say it to capture!'}
                            </span>

                            <div className="flex flex-col items-center gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={startSpeechRecognition}
                                    disabled={isListening || isCorrect}
                                    className={`w-20 h-20 rounded-full shadow-level-2 flex items-center justify-center text-3xl transition-all ${isCorrect ? 'bg-mintGreen text-white' : isListening ? 'bg-coralRed text-white animate-pulse' : 'bg-skyBlue text-white hover:bg-skyBlue/90'}`}
                                >
                                    {isCorrect ? '✅' : isListening ? '🎤' : '🎤'}
                                </motion.button>

                                {transcript && !isListening && (
                                    <p className={`text-sm font-bold animate-in fade-in slide-in-from-bottom-1 ${isCorrect ? 'text-mintGreen' : 'text-coralRed'}`}>
                                        You said: "{transcript}"
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    {[1, 2, 3].map((s) => (
                                        <motion.span
                                            key={s}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: isCorrect ? 1.2 : 1 }}
                                            className={`text-2xl transition-colors ${isCorrect ? 'text-yellow-400' : 'text-slate-200'}`}
                                        >
                                            {isCorrect ? '★' : '☆'}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RevealCard;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { ArrowLeft, Book } from 'lucide-react';
import { triggerSparkles, triggerLegendaryBurst } from '../../utils/confetti';

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
    onCardFlyToCollection?: () => void;
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

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

type PronunciationTier = 3 | 2 | 1; // 3 stars, 2 stars, 1 star

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
    onCardFlyToCollection,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [stars, setStars] = useState<PronunciationTier | null>(null);
    const [showAutoCloseMessage, setShowAutoCloseMessage] = useState(false);
    const [isFlyingToCollection, setIsFlyingToCollection] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { addCollection, target_language, secondary_language } = useGameStore();
    const { playChime } = useSoundEffects();
    const rarityLabels: Record<string, string> = {
        'Common': 'Thường nè',
        'Uncommon': 'Đặc biệt đó',
        'Rare': 'Hiếm quá đi',
        'Epic': 'Siêu hiếm',
        'Legendary': 'Huyền thoại luôn'
    };

    // Helper to save common word data
    const handleSaveCollection = (scoredStars: PronunciationTier, practiceCount: number) => {
        addCollection({
            id: Date.now().toString(),
            word_en,
            word_vi,
            word_zh,
            image: imageUrl,
            stars: scoredStars,
            rarity,
            category,
            capturedAt: new Date().toISOString(),
            practiceCount,
            isEvolved: false
        });
    };

    // TTS Sequence: VI → Scaffolding → Target Language
    const playTTSSequence = useCallback(() => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const langLabel = target_language === 'zh' ? 'Tiếng Trung là:' : 'Tiếng Anh là:';
        const targetWord = target_language === 'zh' ? word_zh : word_en;
        const targetLang = target_language === 'zh' ? 'zh-CN' : 'en-US';

        // 1. Play Vietnamese word
        const viUtterance = new SpeechSynthesisUtterance(word_vi);
        viUtterance.lang = 'vi-VN';
        viUtterance.rate = 0.9;

        // 2. After VI word finishes, play scaffolding + target language
        viUtterance.onend = () => {
            setTimeout(() => {
                // Scaffolding narration
                const scaffoldUtterance = new SpeechSynthesisUtterance(langLabel);
                scaffoldUtterance.lang = 'vi-VN';
                scaffoldUtterance.rate = 0.9;

                scaffoldUtterance.onend = () => {
                    // Target language word
                    const targetUtterance = new SpeechSynthesisUtterance(targetWord);
                    targetUtterance.lang = targetLang;
                    targetUtterance.rate = 0.9;
                    window.speechSynthesis.speak(targetUtterance);
                };

                window.speechSynthesis.speak(scaffoldUtterance);
            }, 500);
        };

        window.speechSynthesis.speak(viUtterance);
    }, [target_language, word_en, word_vi, word_zh]);

    // Auto-play TTS sequence when card opens (audio-first principle)
    useEffect(() => {
        if (isOpen && !hasPlayedAudio) {
            setHasPlayedAudio(true);
            playTTSSequence();
        }
    }, [isOpen, hasPlayedAudio, playTTSSequence]);

    // Reset state when card opens
    useEffect(() => {
        if (isOpen) {
            setStars(null);
            setTranscript('');
            setHasPlayedAudio(false);
            setAttemptCount(0);
            setShowAutoCloseMessage(false);

            // Trigger Legendary celebration if rarity is Legendary
            if (rarity === 'Legendary') {
                setTimeout(() => {
                    triggerLegendaryBurst();
                    playChime();
                }, 500);
            }
        }
    }, [isOpen, rarity, playChime]);




    const startSpeechRecognition = () => {
        // Don't allow more than 3 attempts
        if (attemptCount >= 3) {
            return;
        }

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
            setTranscript('Tớ đang nghe...');
        };

        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript.toLowerCase();
            setTranscript(speechResult);

            // 3-tier Scoring Logic
            let scoredStars: PronunciationTier;

            // Exact match: ★★★
            if (speechResult === targetWord) {
                scoredStars = 3;
            }
            // Fuzzy match: includes target word OR Levenshtein distance ≤ 2 → ★★
            else if (
                speechResult.includes(targetWord) ||
                levenshteinDistance(speechResult, targetWord) <= 2
            ) {
                scoredStars = 2;
            }
            // No match: ★ (encouraging)
            else {
                scoredStars = 1;
            }

            setStars(scoredStars);
            const newAttemptCount = attemptCount + 1;
            setAttemptCount(newAttemptCount);

            // If all 3 attempts used and not yet 3-star, show auto-close message
            if (newAttemptCount >= 3 && scoredStars < 3) {
                setShowAutoCloseMessage(true);
                // Auto-close after 2 seconds
                setTimeout(() => {
                    handleSaveCollection(scoredStars, newAttemptCount);
                    onClose();
                }, 2000);
            }
            // If got 3 stars, save and allow card to stay for celebration
            else if (scoredStars === 3) {
                handleSaveCollection(scoredStars, newAttemptCount);

                // Trigger card fly-to-collection animation after 1.5 seconds
                setTimeout(() => {
                    setIsFlyingToCollection(true);
                    playChime();
                    triggerSparkles(window.innerWidth / 2, window.innerHeight / 2);

                    // Close after flight animation completes (1.2 seconds)
                    setTimeout(() => {
                        if (onCardFlyToCollection) {
                            onCardFlyToCollection();
                        }
                        onClose();
                    }, 1200);
                }, 1500);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
            setTranscript('Bé nói lại nhé!');
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
                        ref={cardRef}
                        initial={{ y: '100%' }}
                        animate={isFlyingToCollection ? {
                            scale: 0.1,
                            x: window.innerWidth - 100,
                            y: window.innerHeight - 140,
                            opacity: 0
                        } : { y: 0 }}
                        exit={{ y: '100%' }}
                        transition={isFlyingToCollection ? {
                            duration: 1.2,
                            ease: 'easeInOut'
                        } : {
                            type: 'spring',
                            damping: 25,
                            stiffness: 200
                        }}
                        className="relative w-full max-w-md bg-white rounded-t-[32px] p-8 pb-12 shadow-level-3"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 font-bold"
                        >
                            ✕
                        </button>

                        {/* Navigation Arrow to Collection */}
                        <button
                            onClick={() => {
                                if (onCardFlyToCollection) {
                                    onCardFlyToCollection();
                                }
                                onClose();
                            }}
                            className="absolute top-6 left-6 flex items-center gap-2 bg-skyBlue/10 hover:bg-skyBlue/20 px-3 py-2 rounded-2xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-skyBlue" />
                            <Book className="w-5 h-5 text-skyBlue" />
                            <span className="text-[10px] font-black text-skyBlue uppercase tracking-widest hidden sm:inline">Sổ của Bé</span>
                        </button>

                        {/* Rarity Badge */}
                        <div className="flex justify-center mb-6">
                            <span className={`px-4 py-1.5 ${rarityBadgeColor[rarity]} text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-sm`}>
                                {rarityLabels[rarity]}
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
                            <h2 className="text-2xl font-bold text-lang-vi">{word_vi}</h2>

                            <div className="flex flex-col gap-1">
                                {/* Target Language (Primary) */}
                                {target_language === 'en' && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-lg font-bold text-lang-en">{word_en}</span>
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
                                        <span className="text-lg font-bold text-lang-zh">{word_zh}</span>
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
                                                <span className="text-base font-semibold text-lang-en">{word_en}</span>
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
                                                <span className="text-base font-semibold text-lang-zh">{word_zh}</span>
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
                        <div className={`transition-all duration-300 rounded-[24px] p-6 border ${stars === 3 ? 'bg-mintGreen/10 border-mintGreen/20' : stars ? 'bg-skyBlue/10 border-skyBlue/20' : 'bg-softCream border-sunshineYellow/20'}`}>
                            {showAutoCloseMessage ? (
                                <div className="text-center space-y-3">
                                    <span className="block text-base font-bold text-coralRed">👏 Bé giỏi lắm! Làm lại sau nhé!</span>
                                    <p className="text-xs text-slate-600">Bé đã luyện tập {attemptCount} lần rồi đấy, thật tuyệt!</p>
                                </div>
                            ) : (
                                <>
                                    <span className={`block text-center text-xs font-bold mb-4 uppercase tracking-wider ${stars === 3 ? 'text-mintGreen' : stars ? 'text-skyBlue' : isListening ? 'text-coralRed' : 'text-skyBlue'}`}>
                                        {stars === 3 ? 'Tuyệt vời! Bé nói đúng rồi.' : stars === 2 ? 'Gần đúng rồi! 👍' : stars === 1 ? 'Cùng tớ tập nói nhé! 🎯' : isListening ? 'Tớ đang nghe bé nè...' : `Nói thật to để bắt bài nhé! (Lần ${attemptCount}/3)`}
                                    </span>

                                    <div className="flex flex-col items-center gap-4">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={startSpeechRecognition}
                                            disabled={isListening || stars === 3 || attemptCount >= 3}
                                            className={`w-20 h-20 rounded-full shadow-level-2 flex items-center justify-center text-3xl transition-all ${stars === 3 ? 'bg-mintGreen text-white' : stars === 2 ? 'bg-skyBlue text-white' : isListening ? 'bg-coralRed text-white animate-pulse' : attemptCount >= 3 ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-skyBlue text-white hover:bg-skyBlue/90'}`}
                                        >
                                            {stars === 3 ? '✅' : isListening ? '🎤' : '🎤'}
                                        </motion.button>

                                        {transcript && !isListening && (
                                            <p className={`text-xs font-bold animate-in fade-in slide-in-from-bottom-1 ${stars === 3 ? 'text-mintGreen' : stars === 2 ? 'text-skyBlue' : stars === 1 ? 'text-amber-500' : 'text-coralRed'}`}>
                                                Bé vừa nói: "{transcript}"
                                            </p>
                                        )}

                                        {/* 3-tier Stars with Staggered Pop-in Animation */}
                                        {stars && (
                                            <div className="flex gap-2">
                                                {[1, 2, 3].map((starIdx) => (
                                                    <motion.span
                                                        key={starIdx}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: starIdx <= stars ? 1.3 : 1 }}
                                                        transition={{
                                                            delay: starIdx <= stars ? (starIdx - 1) * 0.1 : 0,
                                                            type: 'spring',
                                                            stiffness: 300,
                                                            damping: 15
                                                        }}
                                                        className={`text-3xl transition-colors ${starIdx <= stars
                                                            ? 'text-yellow-400 drop-shadow-lg'
                                                            : 'text-slate-200'
                                                            }`}
                                                    >
                                                        {starIdx <= stars ? '★' : '☆'}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RevealCard;


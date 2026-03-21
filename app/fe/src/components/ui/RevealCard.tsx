import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { ArrowLeft, Book } from 'lucide-react';
import { triggerSparkles, triggerLegendaryBurst } from '../../utils/confetti';
import { mascotSpeak } from '../../utils/feedbackUtils';
import { speechApi } from '../../services/speechApi';

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
    vocabId?: string;
    tts_urls?: { en: string; vi: string; zh: string };
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

type PronunciationTier = 3 | 2 | 1;

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
    vocabId,
    tts_urls,
    onCardFlyToCollection,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [stars, setStars] = useState<PronunciationTier | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [showAutoCloseMessage, setShowAutoCloseMessage] = useState(false);
    const [isFlyingToCollection, setIsFlyingToCollection] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { addCollection, target_language, secondary_language } = useGameStore();
    const { playChime, playPop } = useSoundEffects();
    const rarityLabels: Record<string, string> = {
        'Common': 'Thường nè',
        'Uncommon': 'Đặc biệt đó',
        'Rare': 'Hiếm quá đi',
        'Epic': 'Siêu hiếm',
        'Legendary': 'Huyền thoại luôn'
    };

    // Helper to save word to collection
    const handleSaveCollection = (scoredStars: PronunciationTier, practiceCount: number) => {
        addCollection({
            id: vocabId || Date.now().toString(),
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

    // TTS playback — prefer server TTS, fallback to Web Speech API
    const playTTSSequence = useCallback(async () => {
        window.speechSynthesis.cancel();

        const targetWord = target_language === 'zh' ? word_zh : word_en;
        const targetLang = target_language === 'zh' ? 'zh-CN' : 'en-US';
        const ttsLangKey = target_language === 'zh' ? 'zh' : 'en';

        // Try server TTS URL from capture response first
        if (tts_urls && tts_urls[ttsLangKey]) {
            try {
                const audio = new Audio(tts_urls[ttsLangKey]);
                audio.play().catch(() => {
                    // Fallback to Web Speech API
                    const utterance = new SpeechSynthesisUtterance(targetWord);
                    utterance.lang = targetLang;
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                });
                return;
            } catch {
                // Fall through to Web Speech API
            }
        }

        // Try on-demand server TTS
        if (vocabId) {
            try {
                const blobUrl = await speechApi.getTTSAudio(vocabId, ttsLangKey);
                const audio = new Audio(blobUrl);
                await audio.play();
                return;
            } catch {
                // Fall through to Web Speech API
            }
        }

        // Fallback: Web Speech API
        const utterance = new SpeechSynthesisUtterance(targetWord);
        utterance.lang = targetLang;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }, [target_language, word_en, word_zh, tts_urls, vocabId]);

    // Auto-play TTS when card opens
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
            setFeedbackText('');
            setHasPlayedAudio(false);
            setAttemptCount(0);
            setShowAutoCloseMessage(false);
            setIsFlyingToCollection(false);

            if (rarity === 'Legendary') {
                setTimeout(() => {
                    triggerLegendaryBurst();
                    playChime();
                }, 500);
            }
        }
    }, [isOpen, rarity, playChime]);

    // Real speech recognition via MediaRecorder + backend API
    const startSpeechRecognition = async () => {
        if (stars === 3) setStars(null);

        setIsListening(true);
        setTranscript('Tớ đang nghe...');
        setFeedbackText('');

        try {
            // Start recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all audio tracks
                stream.getTracks().forEach(track => track.stop());

                // Convert to base64
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    const language = target_language === 'zh' ? 'zh' : 'en';

                    try {
                        const result = await speechApi.pronounce(
                            vocabId || '',
                            language,
                            base64
                        );

                        setTranscript(result.transcript || '...');
                        setIsListening(false);

                        const scoredStars = result.stars as PronunciationTier;
                        setStars(scoredStars);
                        setFeedbackText(result.feedback_vi || '');

                        const newAttemptCount = attemptCount + 1;
                        setAttemptCount(newAttemptCount);

                        // If evolved, trigger celebration
                        if (result.evolved) {
                            triggerLegendaryBurst();
                            playChime();
                        }

                        // If all 3 attempts used and not 3-star
                        if (newAttemptCount >= 3 && scoredStars < 3) {
                            setShowAutoCloseMessage(true);
                            setTimeout(() => {
                                handleSaveCollection(scoredStars, newAttemptCount);
                                onClose();
                            }, 2000);
                        }
                        // If got 3 stars
                        else if (scoredStars === 3) {
                            handleSaveCollection(scoredStars, newAttemptCount);
                            setTimeout(() => {
                                setIsFlyingToCollection(true);
                                playChime();
                                triggerSparkles(window.innerWidth / 2, window.innerHeight / 2);
                                setTimeout(() => {
                                    if (onCardFlyToCollection) onCardFlyToCollection();
                                    onClose();
                                }, 1200);
                            }, 1500);
                        }
                    } catch (err) {
                        console.error('Pronunciation API error:', err);
                        setIsListening(false);
                        setTranscript('Có lỗi xảy ra, thử lại nhé!');
                    }
                };
                reader.readAsDataURL(audioBlob);
            };

            mediaRecorder.start();

            // Auto-stop after 3 seconds of recording
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 3000);
        } catch (err) {
            console.error('Microphone error:', err);
            setIsListening(false);
            setTranscript('Cho tớ nghe giọng bạn nhé!');
        }
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
                                if (onCardFlyToCollection) onCardFlyToCollection();
                                onClose();
                            }}
                            className="absolute top-6 left-6 flex items-center gap-2 bg-skyBlue/10 hover:bg-skyBlue/20 px-3 py-2 rounded-2xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-skyBlue" />
                            <Book className="w-5 h-5 text-skyBlue" />
                            <span className="text-[10px] font-black text-skyBlue uppercase tracking-widest hidden sm:inline">Sổ của Bạn</span>
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

                        {/* Multilingual Details */}
                        <div className="text-center space-y-3 mb-8">
                            {/* Vietnamese — always shown */}
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-xl mr-1">🇻🇳</span>
                                <h2 className="text-xl font-bold text-lang-vi">{word_vi}</h2>
                                <button
                                    onClick={() => mascotSpeak(word_vi, 'vi-VN')}
                                    className="w-8 h-8 rounded-full bg-lang-vi/5 flex items-center justify-center text-lang-vi text-sm"
                                >
                                    🔊
                                </button>
                            </div>

                            <div className="flex flex-col gap-1">
                                {/* Target Language */}
                                {target_language === 'en' && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xl mr-1">🇺🇸</span>
                                        <span className="text-base font-bold text-lang-en">{word_en}</span>
                                        <span className="text-xs font-medium text-slate-400">{phonetic_en}</span>
                                        <button
                                            onClick={() => playTTSSequence()}
                                            className="w-10 h-10 rounded-full bg-skyBlue/10 flex items-center justify-center text-skyBlue text-base"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                )}
                                {target_language === 'zh' && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xl mr-1">🇨🇳</span>
                                        <span className="text-base font-bold text-lang-zh">{word_zh}</span>
                                        <span className="text-xs font-medium text-slate-400">{pinyin}</span>
                                        <button
                                            onClick={() => playTTSSequence()}
                                            className="w-10 h-10 rounded-full bg-mintGreen/10 flex items-center justify-center text-mintGreen text-base"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                )}

                                {/* Secondary Language */}
                                {secondary_language && (
                                    <>
                                        <div className="h-px bg-slate-200 my-2" />
                                        {secondary_language === 'en' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-base font-semibold text-lang-en">{word_en}</span>
                                                <span className="text-xs font-medium text-slate-400">{phonetic_en}</span>
                                                <button
                                                    onClick={() => mascotSpeak(word_en, 'en-US')}
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
                                                    onClick={() => mascotSpeak(word_zh, 'zh-CN')}
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
                                    <span className="block text-base font-bold text-coralRed">👏 Bạn giỏi lắm! Làm lại sau nhé!</span>
                                    <p className="text-xs text-slate-600">Bạn đã luyện tập {attemptCount} lần rồi đấy, thật tuyệt!</p>
                                </div>
                            ) : (
                                <>
                                    <span className={`block text-center text-xs font-bold mb-4 uppercase tracking-wider ${stars === 3 ? 'text-mintGreen' : stars ? 'text-skyBlue' : isListening ? 'text-coralRed' : 'text-skyBlue'}`}>
                                        {stars === 3 ? 'Tuyệt vời! Bạn nói đúng rồi.' : stars === 2 ? 'Gần đúng rồi! 👍' : stars === 1 ? 'Cùng tớ tập nói nhé! 🎯' : isListening ? 'Tớ đang nghe bạn nè...' : `Nói thật to để bắt bài nhé! (Lần ${attemptCount}/3)`}
                                    </span>

                                    {/* Feedback from server */}
                                    {feedbackText && !isListening && (
                                        <p className="text-center text-xs font-bold text-skyBlue mb-3">{feedbackText}</p>
                                    )}

                                    <div className="flex flex-col items-center gap-4">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                playPop();
                                                startSpeechRecognition();
                                            }}
                                            disabled={isListening}
                                            className={`w-20 h-20 rounded-full shadow-level-2 flex items-center justify-center text-3xl transition-all ${stars === 3 ? 'bg-mintGreen text-white' : stars === 2 ? 'bg-skyBlue text-white' : isListening ? 'bg-coralRed text-white animate-pulse' : attemptCount >= 3 ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-skyBlue text-white hover:bg-skyBlue/90'}`}
                                        >
                                            {stars === 3 ? '✅' : isListening ? '🎤' : '🎤'}
                                        </motion.button>

                                        {transcript && !isListening && (
                                            <p className={`text-xs font-bold animate-in fade-in slide-in-from-bottom-1 ${stars === 3 ? 'text-mintGreen' : stars === 2 ? 'text-skyBlue' : stars === 1 ? 'text-amber-500' : 'text-coralRed'}`}>
                                                Bạn vừa nói: "{transcript}"
                                            </p>
                                        )}

                                        {/* Stars display */}
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

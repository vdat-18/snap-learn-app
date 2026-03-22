import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { ArrowLeft } from 'lucide-react';
import { triggerSparkles, triggerLegendaryBurst } from '../../utils/confetti';
import { mascotSpeak, stopMascotAudio } from '../../utils/feedbackUtils';
import { speechApi } from '../../services/speechApi';
import {
    createPronunciationMediaRecorder,
    pronunciationBlobType,
} from '../../utils/pronunciationRecording';
import { triggerXPFly } from './XPFlyManager';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface RevealCardProps {
    isOpen: boolean;
    onClose: () => void;
    word_vi: string;
    word_en: string;
    word_zh: string;
    phonetic_en: string;
    rarity: Rarity;
    imageUrl: string;
    category: string;
    vocabId?: string;
    tts_urls?: { en: string; vi: string; zh: string };
    xpEarned?: number;
    onCardFlyToCollection?: () => void;
    description_vi?: string | null;
}

const rarityGlowMap: Record<Rarity, string> = {
    Common: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
    Uncommon: 'shadow-[0_0_25px_rgba(34,197,94,0.45)]',
    Rare: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    Epic: 'shadow-[0_0_40px_rgba(168,85,247,0.6),0_0_80px_rgba(168,85,247,0.3)]',
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
    phonetic_en,
    rarity,
    imageUrl,
    category,
    vocabId,
    tts_urls,
    xpEarned,
    onCardFlyToCollection,
    description_vi,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [stars, setStars] = useState<PronunciationTier | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [isFlyingToCollection, setIsFlyingToCollection] = useState(false);
    const [showPostRevealOptions, setShowPostRevealOptions] = useState(false);
    const [hasTriggeredXP, setHasTriggeredXP] = useState(false);
    const [isTTSLoading, setIsTTSLoading] = useState(false);
    const [showAchievementFlip, setShowAchievementFlip] = useState(false);
    const [achievementImageUrl, setAchievementImageUrl] = useState<string | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);
    const blobUrlsRef = useRef<string[]>([]);
    const { addCollection, target_language, secondary_language } = useGameStore();
    const { playChime, playPop } = useSoundEffects();
    const rarityLabels: Record<string, string> = {
        'Common': 'Thường nè',
        'Uncommon': 'Đặc biệt đó',
        'Rare': 'Hiếm quá đi',
        'Epic': 'Siêu hiếm',
        'Legendary': 'Huyền thoại luôn'
    };

    // Helper: track blob URLs for cleanup
    const trackBlobUrl = useCallback((url: string) => {
        blobUrlsRef.current.push(url);
    }, []);

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

        // Trigger XP Fly animation from the center of the card - Only once per session
        if (cardRef.current && !hasTriggeredXP && scoredStars >= 2) {
            const rect = cardRef.current.getBoundingClientRect();
            triggerXPFly(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
            setHasTriggeredXP(true);
        }
    };

    // TTS playback — word only (for manual speaker button tap)
    const playWordTTS = useCallback(async (signal?: AbortSignal) => {
        const targetWord = target_language === 'zh' ? word_zh : word_en;
        const ttsLangKey = target_language === 'zh' ? 'zh' : 'en';

        // Try server TTS URL from capture response first
        if (tts_urls && tts_urls[ttsLangKey]) {
            try {
                const blobUrl = await speechApi.getTTSAudio(vocabId || '', ttsLangKey, signal);
                trackBlobUrl(blobUrl);
                const audio = new Audio(blobUrl);
                await audio.play();
                return;
            } catch (err) {
                if (signal?.aborted) return;
                // Fall through to backend TTS
            }
        }

        // Try on-demand server TTS
        if (vocabId) {
            try {
                const blobUrl = await speechApi.getTTSAudio(vocabId, ttsLangKey, signal);
                trackBlobUrl(blobUrl);
                const audio = new Audio(blobUrl);
                await audio.play();
                return;
            } catch (err) {
                if (signal?.aborted) return;
                // Fall through to backend TTS
            }
        }

        // Fallback: Backend TTS synthesis
        if (!signal?.aborted) {
            try {
                const blobUrl = await speechApi.synthesizeTTS(targetWord, ttsLangKey, signal);
                if (signal?.aborted) return;
                trackBlobUrl(blobUrl);
                const audio = new Audio(blobUrl);
                await audio.play();
            } catch (err) {
                if (!signal?.aborted) {
                    console.warn('[TTS] All TTS methods failed for word:', targetWord, err);
                }
            }
        }
    }, [target_language, word_en, word_zh, tts_urls, vocabId, trackBlobUrl]);

    // Full TTS sequence: Vietnamese description narration → pause → word TTS
    const playTTSSequence = useCallback(async () => {
        stopMascotAudio();
        setIsTTSLoading(true);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const signal = abortController.signal;

        try {
            // Step 1: Play Vietnamese description TTS (mascot explains in child's native language)
            if (description_vi) {
                let descriptionPlayed = false;

                // Call POST /api/tts/synthesize with description_vi text
                try {
                    console.log('[TTS] Calling synthesizeTTS with description_vi:', description_vi.substring(0, 50) + '...');
                    const blobUrl = await speechApi.synthesizeTTS(description_vi, 'vi', signal);
                    if (signal.aborted) return;
                    console.log('[TTS] Got blob URL:', blobUrl);
                    trackBlobUrl(blobUrl);
                    const audio = new Audio(blobUrl);
                    await new Promise<void>((resolve, reject) => {
                        audio.onended = () => { console.log('[TTS] Description audio ended'); resolve(); };
                        audio.onerror = (e) => { console.error('[TTS] Audio playback error:', e); reject(new Error('Audio playback error')); };
                        audio.play().catch((e) => { console.error('[TTS] Audio play() rejected:', e); reject(e); });
                    });
                    descriptionPlayed = true;
                } catch (err) {
                    console.error('[TTS] synthesizeTTS failed:', err);
                    if (signal.aborted) return;
                    // Fall through to backend TTS fallback
                }

                // Fallback: retry via backend TTS synthesis
                if (!descriptionPlayed && !signal.aborted) {
                    try {
                        const blobUrl = await speechApi.synthesizeTTS(description_vi, 'vi', signal);
                        if (signal.aborted) return;
                        trackBlobUrl(blobUrl);
                        const audio = new Audio(blobUrl);
                        await new Promise<void>((resolve, reject) => {
                            audio.onended = () => resolve();
                            audio.onerror = () => reject(new Error('Fallback audio error'));
                            audio.play().catch(reject);
                        });
                    } catch {
                        // Continue to word TTS
                    }
                }

                // Step 2: Pause 500ms between description and word
                if (!signal.aborted) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Step 3: Play word TTS (in target learning language)
            if (!signal.aborted) {
                setIsTTSLoading(false);
                await playWordTTS(signal);
            }
        } catch (err) {
            if (!signal.aborted) {
                // If everything fails, try basic word TTS
                setIsTTSLoading(false);
                await playWordTTS(signal);
            }
        } finally {
            setIsTTSLoading(false);
        }
    }, [description_vi, playWordTTS, trackBlobUrl]);

    // Helper function to trigger rarity-specific reaction
    const triggerRarityReaction = useCallback(() => {
        if (rarity === 'Legendary') {
            triggerLegendaryBurst();
            playChime();
            mascotSpeak("TRỜI ƠI! BẠN VỪA BẮT ĐƯỢC THẺ HUYỀN THOẠI RỒI NÈ!", 'vi-VN', true);
        } else if (rarity === 'Epic') {
            triggerSparkles(window.innerWidth / 2, window.innerHeight / 3);
            playChime();
            mascotSpeak("UAAAA! THẺ SIÊU HIẾM NÈ! ĐỒ QUÝ LẮM ĐÓ!", 'vi-VN', true);
        } else if (rarity === 'Rare') {
            mascotSpeak("Oa! Đồ hiếm nha!", 'vi-VN', true);
        } else if (rarity === 'Uncommon') {
            mascotSpeak("Ồ! Cái này đặc biệt đó nha!", 'vi-VN', true);
        } else {
            mascotSpeak(); // Random phrase
        }
    }, [rarity, playChime]);

    // Reset state when card opens AND coordinate audio playback
    useEffect(() => {
        if (isOpen) {
            setStars(null);
            setTranscript('');
            setFeedbackText('');
            setAttemptCount(0);
            setIsFlyingToCollection(false);
            setHasTriggeredXP(false);
            setAchievementImageUrl(null);
            setShowAchievementFlip(false);

            // Only auto-play TTS if not already played
            if (!hasPlayedAudio) {
                setHasPlayedAudio(true);

                // Play TTS sequence FIRST (description + word), THEN rarity reaction
                playTTSSequence().then(() => {
                    // TTS completed, now play rarity reaction
                    triggerRarityReaction();
                }).catch(() => {
                    // TTS failed, still play rarity reaction
                    triggerRarityReaction();
                });
            }
        }
    }, [isOpen, hasPlayedAudio, playTTSSequence, triggerRarityReaction]);

    // Cleanup on close: abort TTS fetches, stop audio, revoke blob URLs
    useEffect(() => {
        if (!isOpen) {
            // Card just closed — abort any in-flight TTS fetches
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            stopMascotAudio();
            blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
            blobUrlsRef.current = [];
        }
    }, [isOpen]);

    // Real speech recognition via MediaRecorder + backend API
    const startSpeechRecognition = async () => {
        if (stars === 3) setStars(null);

        setIsListening(true);
        setTranscript('Tớ đang nghe...');
        setFeedbackText('');

        try {
            // Start recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = createPronunciationMediaRecorder(stream);
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
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: pronunciationBlobType(mediaRecorder),
                });
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
                        setFeedbackText(result.feedback_vi || '');

                        const newAttemptCount = attemptCount + 1;
                        setAttemptCount(newAttemptCount);

                        if (scoredStars === 3) {
                            setStars(scoredStars);

                            if (result.image_url) {
                                setAchievementImageUrl(result.image_url);
                                setTimeout(() => setShowAchievementFlip(true), 300);
                            }

                            if (result.evolved) {
                                triggerLegendaryBurst();
                                playChime();
                            } else if (cardRef.current) {
                                const rect = cardRef.current.getBoundingClientRect();
                                triggerSparkles(
                                    rect.left + rect.width / 2,
                                    rect.top + rect.height / 3,
                                );
                            }

                            handleSaveCollection(scoredStars, newAttemptCount);
                            setTimeout(() => {
                                setShowPostRevealOptions(true);
                            }, 2200);
                        } else {
                            setStars(null);
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

    const cardVariants = {
        idle: { y: 0, scale: 1 },
        shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.4 }
        },
        fly: {
            scale: [1, 1.1, 0.05],
            x: 180,
            y: -window.innerHeight / 2 - 100,
            opacity: [1, 1, 0],
            rotate: [0, -10, 720],
            transition: {
                duration: 1.1,
                ease: [0.6, 0.01, -0.05, 0.95] as any,
                times: [0, 0.2, 1]
            }
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
                        className={`absolute inset-0 backdrop-blur-sm ${
                            rarity === 'Epic' ? 'bg-purple-950/60'
                            : rarity === 'Uncommon' ? 'bg-emerald-950/45'
                            : 'bg-black/40'
                        }`}
                    />

                    {/* Epic ambient glow behind card */}
                    {rarity === 'Epic' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[70%] rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
                        />
                    )}

                    {/* Uncommon ambient glow behind card */}
                    {rarity === 'Uncommon' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.2, 0.35, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] h-[60%] rounded-full bg-emerald-400/15 blur-3xl pointer-events-none"
                        />
                    )}

                    {/* Card Content */}
                    <motion.div
                        ref={cardRef}
                        variants={cardVariants}
                        animate={isFlyingToCollection ? 'fly' : (stars === 1 ? 'shake' : 'idle')}
                        initial={{ y: '100%', scale: 0.8 }}
                        exit={{ y: '100%', scale: 0.8 }}
                        transition={isFlyingToCollection ? {
                            duration: 0.8,
                            ease: 'easeInOut'
                        } : {
                            type: 'spring',
                            damping: 20,
                            stiffness: 300
                        }}
                        className={`relative w-full max-w-md rounded-t-[32px] p-8 pb-12 max-h-[90vh] overflow-y-auto ${
                            rarity === 'Epic'
                                ? 'bg-gradient-to-b from-purple-50 via-white to-purple-50/80 shadow-[0_-4px_40px_rgba(168,85,247,0.3)] border-t-2 border-purple-300/50'
                                : rarity === 'Uncommon'
                                    ? 'bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40 shadow-[0_-4px_30px_rgba(34,197,94,0.2)] border-t-2 border-emerald-200/40'
                                    : 'bg-white shadow-level-3'
                        }`}
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
                            <img src="/icon-book.png" alt="" className="w-5 h-5 object-contain" />
                            <span className="text-[10px] font-black text-skyBlue uppercase tracking-widest hidden sm:inline">Kho báu</span>
                        </button>

                        {/* Rarity Badge & XP */}
                        <div className="flex justify-center items-center gap-2 mb-6 relative">
                            {rarity === 'Epic' ? (
                                <motion.span
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
                                    className="relative z-10 px-5 py-2 bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600 text-white text-[12px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5),0_4px_0_rgb(107,33,168)] border-t border-purple-300/40"
                                >
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                                    />
                                    <span className="relative">💎 {rarityLabels[rarity]}</span>
                                </motion.span>
                            ) : rarity === 'Uncommon' ? (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 14, delay: 0.1 }}
                                    className="relative z-10 px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_0_12px_rgba(34,197,94,0.35),0_3px_0_rgb(21,128,61)] border-t border-emerald-300/30"
                                >
                                    🌿 {rarityLabels[rarity]}
                                </motion.span>
                            ) : (
                                <span className={`px-4 py-1.5 ${rarityBadgeColor[rarity]} text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-sm relative z-10`}>
                                    {rarityLabels[rarity]}
                                </span>
                            )}
                            {xpEarned && xpEarned > 0 && stars === 3 ? (
                                <motion.div
                                    initial={{ scale: 0, x: -20 }}
                                    animate={{ scale: 1, x: 0 }}
                                    transition={{ type: 'spring', bounce: 0.6 }}
                                    className="bg-sunshineYellow text-deepNavy font-sans font-black text-xs px-2.5 py-1 rounded-full shadow-sm border-2 border-white"
                                >
                                    +{xpEarned} XP
                                </motion.div>
                            ) : null}
                        </div>

                        {/* Card Image — flips from camera photo to achievement card on 3 stars */}
                        <div className={`aspect-square w-full rounded-card overflow-hidden bg-slate-100 mb-6 relative ${showAchievementFlip
                            ? 'border-4 border-sunshineYellow shadow-[0_0_30px_rgba(255,210,52,0.6)]'
                            : rarity === 'Epic'
                                ? 'border-[3px] border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.4),inset_0_0_20px_rgba(168,85,247,0.1)]'
                                : rarity === 'Uncommon'
                                    ? 'border-[3px] border-emerald-300/60 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                    : `border-4 border-white ${rarityGlowMap[rarity]}`
                            }`}
                            style={{ perspective: '1200px' }}
                        >
                            {/* Background beams for Uncommon+ */}
                            {(rarity === 'Uncommon' || rarity === 'Rare' || rarity === 'Epic' || rarity === 'Legendary') && (
                                <motion.div
                                    className="absolute inset-0 z-0 overflow-hidden"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: rarity === 'Uncommon' ? 30 : 20, repeat: Infinity, ease: 'linear' }}
                                >
                                    {[...Array(rarity === 'Uncommon' ? 4 : 6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`absolute top-1/2 left-1/2 w-[200%] -translate-x-1/2 -translate-y-1/2 blur-xl ${
                                                rarity === 'Legendary' ? 'bg-sunshineYellow h-12 opacity-30'
                                                : rarity === 'Epic' ? 'bg-purple-400 h-12 opacity-30'
                                                : rarity === 'Uncommon' ? 'bg-emerald-300 h-8 opacity-15'
                                                : 'bg-skyBlue h-12 opacity-30'
                                            }`}
                                            style={{ rotate: `${i * (rarity === 'Uncommon' ? 45 : 30)}deg` }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            {/* Flip container */}
                            <motion.div
                                className="w-full h-full relative"
                                animate={{ rotateY: showAchievementFlip ? 180 : 0 }}
                                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Front face — camera photo */}
                                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                                    <motion.img
                                        initial={{ scale: 1.2, filter: 'blur(10px)' }}
                                        animate={{ scale: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        src={imageUrl}
                                        alt={word_en}
                                        className="w-full h-full object-cover"
                                    />
                                    {!imageUrl && <div className="w-full h-full flex items-center justify-center text-4xl">📸</div>}
                                </div>

                                {/* Back face — achievement card image */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    {achievementImageUrl && (
                                        <img
                                            src={achievementImageUrl}
                                            alt={word_en}
                                            className="w-full h-full object-contain p-4"
                                        />
                                    )}
                                </div>
                            </motion.div>

                            {/* Achievement badge overlay — shown after flip */}
                            <AnimatePresence>
                                {showAchievementFlip && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
                                        className="absolute top-3 right-3 z-30 bg-sunshineYellow text-deepNavy px-3 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider shadow-lg border-2 border-white"
                                    >
                                        THẺ BÀI ✨
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Shiny sweep for high rarity or achievement */}
                            {(rarity === 'Epic' || rarity === 'Legendary' || showAchievementFlip) && (
                                <motion.div
                                    initial={{ x: '-100%', opacity: 0 }}
                                    animate={{ x: '100%', opacity: [0, 0.5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: showAchievementFlip ? 2 : 3 }}
                                    className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                                />
                            )}

                            {/* Floating particles for Epic, Legendary, or achievement */}
                            {(rarity === 'Epic' || rarity === 'Legendary' || showAchievementFlip) && (
                                <div className="absolute inset-0 z-30 pointer-events-none">
                                    {[...Array(showAchievementFlip ? 8 : rarity === 'Epic' ? 6 : 5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ y: 0, opacity: 0 }}
                                            animate={{ y: -100, opacity: [0, 1, 0] }}
                                            transition={{
                                                duration: 2 + Math.random(),
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                                ease: "easeOut"
                                            }}
                                            className={`absolute w-2 h-2 rounded-full blur-[1px] ${
                                                showAchievementFlip ? 'bg-sunshineYellow'
                                                : rarity === 'Epic' ? 'bg-purple-400'
                                                : 'bg-yellow-300'
                                            }`}
                                            style={{ left: `${Math.random() * 100}%`, top: '80%' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mascot Description Speech Bubble (Vietnamese) */}
                        {description_vi && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="relative mb-6"
                            >
                                <div className={`rounded-2xl p-4 border ${
                                    rarity === 'Epic'
                                        ? 'bg-gradient-to-br from-purple-100/60 to-violet-50/40 border-purple-200/40'
                                        : rarity === 'Uncommon'
                                            ? 'bg-gradient-to-br from-emerald-50/60 to-green-50/30 border-emerald-200/30'
                                            : 'bg-gradient-to-br from-skyBlue/10 to-skyBlue/5 border-skyBlue/20'
                                }`}>
                                    {/* Speech bubble tail */}
                                    <div className={`absolute -top-2 left-8 w-4 h-4 rotate-45 ${
                                        rarity === 'Epic'
                                            ? 'bg-purple-100/60 border-l border-t border-purple-200/40'
                                            : rarity === 'Uncommon'
                                                ? 'bg-emerald-50/60 border-l border-t border-emerald-200/30'
                                                : 'bg-skyBlue/10 border-l border-t border-skyBlue/20'
                                    }`} />
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            rarity === 'Epic' ? 'bg-purple-200/40'
                                            : rarity === 'Uncommon' ? 'bg-emerald-100/50'
                                            : 'bg-skyBlue/20'
                                        }`}>
                                            <img src="/owl-mascot.png" alt="Mascot" className="w-8 h-8 object-contain" />
                                        </div>
                                        <p className={`text-sm font-medium leading-relaxed flex-1 ${
                                            rarity === 'Epic' ? 'text-purple-900/80'
                                            : rarity === 'Uncommon' ? 'text-emerald-900/70'
                                            : 'text-slate-700'
                                        }`}>
                                            {description_vi}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Multilingual Details */}
                        <div className="text-center space-y-3 mb-6">
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
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl mr-1">🇺🇸</span>
                                        <span className="text-base font-bold text-lang-en">{word_en}</span>
                                        <span className="text-xs font-medium text-slate-400">{phonetic_en}</span>
                                        <button
                                            onClick={() => playWordTTS()}
                                            className={`w-10 h-10 rounded-full bg-skyBlue/10 flex items-center justify-center text-skyBlue text-base ${isTTSLoading ? 'animate-pulse' : ''}`}
                                        >
                                            🔊
                                        </button>
                                    </motion.div>
                                )}
                                {target_language === 'zh' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl mr-1">🇨🇳</span>
                                        <span className="text-base font-bold text-lang-zh">{word_zh}</span>
                                        <button
                                            onClick={() => playWordTTS()}
                                            className={`w-10 h-10 rounded-full bg-mintGreen/10 flex items-center justify-center text-mintGreen text-base ${isTTSLoading ? 'animate-pulse' : ''}`}
                                        >
                                            🔊
                                        </button>
                                    </motion.div>
                                )}

                                {/* Secondary Language */}
                                {secondary_language && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
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
                                                <button
                                                    onClick={() => mascotSpeak(word_zh, 'zh-CN')}
                                                    className="w-7 h-7 rounded-full bg-mintGreen/10 flex items-center justify-center text-mintGreen text-xs"
                                                >
                                                    🔊
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Practice Area OR Post-Reveal Options */}
                        <div className={`transition-all duration-300 rounded-[24px] p-6 border ${stars === 3 ? 'bg-mintGreen/10 border-mintGreen/20' : stars ? 'bg-skyBlue/10 border-skyBlue/20' : 'bg-softCream border-sunshineYellow/20'}`}>
                            {showPostRevealOptions ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-3"
                                >
                                    <h3 className="text-center font-bold text-deepNavy mb-2">Bạn muốn làm gì tiếp theo?</h3>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setIsFlyingToCollection(true);
                                            playChime();
                                            // Close after flight animation completes (1.1 seconds)
                                            setTimeout(() => {
                                                if (onCardFlyToCollection) {
                                                    onCardFlyToCollection();
                                                }
                                                onClose();
                                            }, 1100);
                                        }}
                                        className="w-full bg-sunshineYellow text-deepNavy py-4 rounded-xl font-black shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2 border-t-2 border-white/40"
                                    >
                                        <img src="/icon-book.png" alt="" className="w-6 h-6 object-contain mix-blend-multiply" />
                                        VÀO KHO BÁU
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="w-full bg-white text-deepNavy py-4 rounded-xl font-black shadow-[0_4px_0_rgb(203,213,225)] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2 border-2 border-slate-100"
                                    >
                                        📷 CHỤP TIẾP
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <>
                                    <span className={`block text-center text-xs font-bold mb-4 uppercase tracking-wider ${stars === 3 ? 'text-mintGreen' : stars ? 'text-skyBlue' : isListening ? 'text-coralRed' : 'text-skyBlue'}`}>
                                        {stars === 3 ? 'Tuyệt vời! Bạn nói đúng rồi.' : stars === 2 ? 'Gần đúng rồi! 👍' : stars === 1 ? 'Cùng tớ tập nói nhé! 🎯' : isListening ? 'Push to stop' : `Nói thật to để bắt bài nhé!`}
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

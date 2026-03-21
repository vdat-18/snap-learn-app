import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { mascotSpeak } from '../../utils/feedbackUtils';

interface OnboardingProps {
    onFinish: () => void;
}

// Local speak helper removed to use central feedbackUtils

const slides = [
    {
        id: 'welcome',
        type: 'standard',
        title: "Chào mừng Bé yêu! 🦉",
        description: "Cùng tớ khám phá bí mật của thế giới nhé!",
        image: "/owl-mascot.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP THEO"
    },
    {
        id: 'language',
        type: 'language-select',
        title: "Bé thích tiếng gì nhất? 🌈",
        description: "Chọn ngôn ngữ bé muốn học nha!",
        image: null,
        bgClass: "from-purple-300 to-purple-500",
        btnLabel: null
    },
    {
        id: 'secondary-language',
        type: 'secondary-language-select',
        title: "Học song ngữ thật ngầu? 🚀",
        description: "Bé có muốn học thêm một thứ tiếng nữa không?",
        image: null,
        bgClass: "from-indigo-400 to-indigo-600",
        btnLabel: null
    },
    {
        id: 'camera',
        type: 'standard',
        title: "Bấm 'Tách' để bắt thẻ! 📸",
        description: "Đưa camera về phía vật và chụp ngay nào!",
        image: "/camera-kitten.png",
        bgClass: "from-yellow-400 to-green-500",
        btnLabel: "TIẾP TỤC"
    },
    {
        id: 'pronunciation',
        type: 'standard',
        title: "Nói to để thu thập! 🎤",
        description: "Bé hãy phát âm thật chuẩn để bắt bài nhé!",
        image: "/mic-waves.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP TỤC"
    },
    {
        id: 'collection',
        type: 'standard',
        title: "Lấp đầy kho báu! 💎",
        description: "Sưu tập thẻ hiếm và trở thành nhà vô địch!",
        image: "/collection-cards.png",
        bgClass: "from-yellow-400 to-yellow-500",
        btnLabel: "🚀 Khám phá ngay!",
        btnClass: "bg-coralRed text-white shadow-[0_6px_0_rgb(153,27,27)]"
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
    const { setTargetLanguage, setSecondaryLanguage } = useGameStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'zh' | null>(null);
    const [selectedSecondary, setSelectedSecondary] = useState<'en' | 'zh' | 'none' | null>(null);
    const [dragX, setDragX] = useState(0);
    const { playPop } = useSoundEffects();

    // Auto-play TTS on slide change (Mascot Narration)
    useEffect(() => {
        const activeSlide = slides[currentSlide];
        const timer = setTimeout(() => {
            if (activeSlide.id === 'welcome') {
                mascotSpeak("Chào mừng bạn đến với vương quốc SnapLearn! Hãy cùng tôi khám phá nhé.", 'vi-VN');
            } else if (activeSlide.id === 'language') {
                mascotSpeak("Bạn hãy lựa chọn ngôn ngữ mà mình muốn học nhất nào.", 'vi-VN');
            } else if (activeSlide.id === 'secondary-language') {
                mascotSpeak("Học thêm một ngôn ngữ nữa sẽ giúp bạn giỏi hơn đấy. Bạn thấy sao?", 'vi-VN');
            } else if (activeSlide.id === 'camera') {
                mascotSpeak("Dùng máy ảnh chụp mọi vật xung quanh để thu thập thẻ bài nhé.", 'vi-VN');
            } else if (activeSlide.id === 'pronunciation') {
                mascotSpeak("Hãy phát âm chính xác để nâng cấp thẻ bài của bạn.", 'vi-VN');
            } else if (activeSlide.id === 'collection') {
                mascotSpeak("Kho báu thẻ bài đang đợi bạn. Chúng ta bắt đầu thôi!", 'vi-VN');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [currentSlide]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            playPop();
            setCurrentSlide(currentSlide + 1);
        } else {
            playPop();
            onFinish();
        }
    };

    const previousSlide = () => {
        if (currentSlide > 0) {
            playPop();
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleLanguageSelect = (lang: 'en' | 'zh') => {
        setSelectedLanguage(lang);
        if (lang === 'en') {
            mascotSpeak('English', 'en-US');
        } else {
            mascotSpeak('Zhōngwén', 'zh-CN');
        }
        setTargetLanguage(lang);
        setTimeout(() => nextSlide(), 1000);
    };

    const handleSecondarySelect = (lang: 'en' | 'zh' | 'none') => {
        setSelectedSecondary(lang);
        if (lang === 'none') {
            mascotSpeak('Dạ không!', 'vi-VN');
            setSecondaryLanguage(null);
        } else {
            if (lang === 'en') mascotSpeak('English', 'en-US');
            else mascotSpeak('Zhōngwén', 'zh-CN');
            setSecondaryLanguage(lang);
        }
        setTimeout(() => nextSlide(), 1000);
    };

    const activeSlide = slides[currentSlide];
    const isLanguageSlide = activeSlide.type === 'language-select';
    const isSecondarySlide = activeSlide.type === 'secondary-language-select';

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-all duration-700 bg-gradient-to-b ${activeSlide.bgClass} font-sans`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
                <button onClick={() => { playPop(); onFinish(); }} className="w-10 h-10 flex items-center justify-center text-deepNavy/40 hover:text-deepNavy">
                    <X className="w-8 h-8" />
                </button>
                <h1 className="text-deepNavy font-black text-xl tracking-tight">SnapLearn</h1>
                <button onClick={() => { playPop(); onFinish(); }} className="text-deepNavy/40 font-bold text-base hover:text-deepNavy px-2">
                    Bỏ qua nè
                </button>
            </div>

            {/* Content - Swipe-enabled */}
            <div
                className="flex-1 flex flex-col items-center justify-center px-6 cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                        setDragX(moveEvent.clientX - startX);
                    };
                    const handleMouseUp = (upEvent: MouseEvent) => {
                        const endX = upEvent.clientX;
                        const distance = endX - startX;
                        if (distance > 50) {
                            previousSlide(); // Swiped right
                        } else if (distance < -50) {
                            nextSlide(); // Swiped left
                        }
                        setDragX(0);
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }}
                onTouchStart={(e) => {
                    const startX = e.touches[0].clientX;
                    const handleTouchMove = (moveEvent: React.TouchEvent) => {
                        setDragX(moveEvent.touches[0].clientX - startX);
                    };
                    const handleTouchEnd = (upEvent: React.TouchEvent) => {
                        const endX = upEvent.changedTouches[0].clientX;
                        const distance = endX - startX;
                        if (distance > 50) {
                            previousSlide(); // Swiped right
                        } else if (distance < -50) {
                            nextSlide(); // Swiped left
                        }
                        setDragX(0);
                    };
                    const element = e.currentTarget;
                    element.addEventListener('touchmove', handleTouchMove as any);
                    element.addEventListener('touchend', handleTouchEnd as any);
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: dragX }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center w-full"
                    >
                        {/* Standard slide with image */}
                        {!isLanguageSlide && !isSecondarySlide && (
                            <>
                                {activeSlide.image && (
                                    <div className="relative mb-8">
                                        <motion.div
                                            animate={{
                                                y: [0, -10, 0],
                                                rotate: [-1, 1, -1]
                                            }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-72 h-72 md:w-88 md:h-88 flex items-center justify-center overflow-hidden rounded-[40px]"
                                        >
                                            <img
                                                src={activeSlide.image}
                                                alt="Mascot"
                                                className="w-full h-full object-contain mix-blend-multiply scale-105"
                                            />
                                        </motion.div>
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className={`rounded-[32px] p-8 w-full max-w-sm text-center ${currentSlide === slides.length - 1 ? 'bg-transparent' : 'bg-white shadow-level-3 border-b-[8px] border-slate-200'}`}>
                                    <h2 className="text-deepNavy font-black text-xl mb-4 leading-tight">
                                        {activeSlide.title}
                                    </h2>
                                    <p className={`${currentSlide === slides.length - 1 ? 'text-deepNavy/80' : 'text-slate-500'} font-medium text-sm leading-snug mb-8`}>
                                        {activeSlide.description}
                                    </p>

                                    <button
                                        onClick={nextSlide}
                                        className={`w-full ${activeSlide.btnClass || 'bg-sunshineYellow text-deepNavy shadow-[0_6px_0_rgb(161,98,7)]'} hover:brightness-110 font-black text-base py-4 rounded-2xl active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/30`}
                                    >
                                        {activeSlide.btnLabel}
                                        {currentSlide !== slides.length - 1 && <ArrowRight className="w-6 h-6 stroke-[3px]" />}
                                    </button>

                                    {/* Swipe hint */}
                                    {currentSlide > 0 && currentSlide < slides.length - 1 && (
                                        <p className="text-xs text-slate-400 font-bold mt-4">
                                            ← Vuốt hoặc chạm → để xem tiếp nè
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Language Selection Slide */}
                        {isLanguageSlide && (
                            <div className="flex flex-col items-center w-full max-w-sm">
                                <h2 className="text-white font-black text-2xl mb-2 leading-tight text-center">
                                    {activeSlide.title}
                                </h2>
                                <p className="text-white/80 font-medium text-base mb-12 text-center">
                                    {activeSlide.description}
                                </p>

                                <div className="flex gap-6 w-full">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleLanguageSelect('en')}
                                        className={`flex-1 aspect-square rounded-[32px] flex flex-col items-center justify-center gap-4 font-black text-xl transition-all ${selectedLanguage === 'en'
                                            ? 'bg-white text-deepNavy shadow-[0_12px_0_rgba(0,0,0,0.2)] scale-105'
                                            : 'bg-white/40 backdrop-blur-sm text-white/70 hover:bg-white/60'
                                            }`}
                                    >
                                        <span className="text-5xl">🇬🇧</span>
                                        <span className="text-base tracking-tight">English</span>
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleLanguageSelect('zh')}
                                        className={`flex-1 aspect-square rounded-[32px] flex flex-col items-center justify-center gap-4 font-black text-xl transition-all ${selectedLanguage === 'zh'
                                            ? 'bg-white text-deepNavy shadow-[0_12px_0_rgba(0,0,0,0.2)] scale-105'
                                            : 'bg-white/40 backdrop-blur-sm text-white/70 hover:bg-white/60'
                                            }`}
                                    >
                                        <span className="text-5xl">🇨🇳</span>
                                        <span className="text-base tracking-tight">中文</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {/* Secondary Language Selection Slide */}
                        {isSecondarySlide && (
                            <div className="flex flex-col items-center w-full max-w-sm">
                                <h2 className="text-white font-black text-2xl mb-2 leading-tight text-center">
                                    {activeSlide.title}
                                </h2>
                                <p className="text-white/80 font-medium text-base mb-12 text-center">
                                    {activeSlide.description}
                                </p>

                                <div className="flex flex-col gap-4 w-full">
                                    {selectedLanguage === 'zh' ? (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSecondarySelect('en')}
                                            className={`w-full py-6 rounded-[24px] flex items-center justify-center gap-4 font-black text-xl transition-all ${selectedSecondary === 'en'
                                                ? 'bg-white text-deepNavy shadow-[0_8px_0_rgba(0,0,0,0.2)]'
                                                : 'bg-white/40 backdrop-blur-sm text-white hover:bg-white/60'
                                                }`}
                                        >
                                            <span className="text-3xl">🇬🇧</span>
                                            <span>Học cả Tiếng Anh nữa!</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSecondarySelect('zh')}
                                            className={`w-full py-6 rounded-[24px] flex items-center justify-center gap-4 font-black text-xl transition-all ${selectedSecondary === 'zh'
                                                ? 'bg-white text-deepNavy shadow-[0_8px_0_rgba(0,0,0,0.2)]'
                                                : 'bg-white/40 backdrop-blur-sm text-white hover:bg-white/60'
                                                }`}
                                        >
                                            <span className="text-3xl">🇨🇳</span>
                                            <span>Học cả Tiếng Trung nữa!</span>
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSecondarySelect('none')}
                                        className={`w-full py-6 rounded-[24px] flex items-center justify-center gap-4 font-black text-xl transition-all ${selectedSecondary === 'none'
                                            ? 'bg-white text-deepNavy shadow-[0_8px_0_rgba(0,0,0,0.2)]'
                                            : 'bg-white/20 backdrop-blur-sm text-white/60 hover:bg-white/40'
                                            }`}
                                    >
                                        <span>Dạ thôi, bé chỉ học một cái thôi à</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-3 pb-12">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide
                            ? `w-8 ${currentSlide === slides.length - 1 ? 'bg-deepNavy' : 'bg-sunshineYellow'}`
                            : 'w-3 bg-black/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Onboarding;

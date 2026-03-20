import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface OnboardingProps {
    onFinish: () => void;
}

// Helper: speak text using Web Speech API
const speak = (text: string, lang = 'vi-VN') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
};

const slides = [
    {
        id: 'welcome',
        type: 'standard',
        title: "Chào mừng đến SnapLearn!",
        description: "Khám phá thế giới và học từ mới mỗi ngày!",
        image: "/owl-mascot.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP THEO"
    },
    {
        id: 'language',
        type: 'language-select',
        title: "Chọn ngôn ngữ yêu thích",
        description: "Bạn muốn học tiếng gì?",
        image: null,
        bgClass: "from-purple-300 to-purple-500",
        btnLabel: null // No btn for this slide
    },
    {
        id: 'camera',
        type: 'standard',
        title: "Chụp vật xung quanh!",
        description: "Đưa camera về phía vật thể và nhấn nút chụp",
        image: "/camera-kitten.png",
        bgClass: "from-yellow-400 to-green-500",
        btnLabel: "TIẾP TỤC"
    },
    {
        id: 'pronunciation',
        type: 'standard',
        title: "Nói để thu thập!",
        description: "Phát âm đúng để thêm từ vào bộ sưu tập",
        image: "/mic-waves.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP TỤC"
    },
    {
        id: 'collection',
        type: 'standard',
        title: "Sưu tập & Thăng cấp!",
        description: "Thu thập từ hiếm, hoàn thành nhiệm vụ, trở thành nhà vô địch!",
        image: "/collection-cards.png",
        bgClass: "from-yellow-400 to-yellow-500",
        btnLabel: "🚀 Bắt đầu khám phá!",
        btnClass: "bg-coralRed text-white shadow-[0_6px_0_rgb(153,27,27)]"
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
    const { setTargetLanguage } = useGameStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'zh' | null>(null);
    const [dragX, setDragX] = useState(0);

    // Auto-play TTS on slide change (except language select)
    useEffect(() => {
        const activeSlide = slides[currentSlide];
        if (activeSlide.type === 'standard') {
            const timer = setTimeout(() => {
                speak(activeSlide.description, 'vi-VN');
            }, 400);
            return () => clearTimeout(timer);
        } else if (activeSlide.type === 'language-select') {
            const timer = setTimeout(() => {
                speak('Bạn muốn học tiếng gì?', 'vi-VN');
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [currentSlide]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onFinish();
        }
    };

    const previousSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleLanguageSelect = (lang: 'en' | 'zh') => {
        setSelectedLanguage(lang);
        if (lang === 'en') {
            speak('English', 'en-US');
        } else {
            speak('Zhōngwén', 'zh-CN');
        }
        // Save to store
        setTargetLanguage(lang);
        // Auto-proceed to next slide after 1s
        setTimeout(() => nextSlide(), 1200);
    };

    const activeSlide = slides[currentSlide];
    const isLanguageSlide = activeSlide.type === 'language-select';

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-all duration-700 bg-gradient-to-b ${activeSlide.bgClass} font-outfit`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
                <button onClick={onFinish} className="w-10 h-10 flex items-center justify-center text-deepNavy/40 hover:text-deepNavy">
                    <X className="w-8 h-8" />
                </button>
                <h1 className="text-deepNavy font-black text-2xl tracking-tight">SnapLearn</h1>
                <button onClick={onFinish} className="text-deepNavy/40 font-bold text-lg hover:text-deepNavy px-2">
                    Skip
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
                        {!isLanguageSlide && (
                            <>
                                {/* Mascot Illustration */}
                                <div className="relative mb-8">
                                    <div className="w-64 h-64 md:w-80 md:h-80 rounded-[40px] bg-white/40 backdrop-blur-sm border-4 border-white/60 flex items-center justify-center overflow-hidden shadow-level-3">
                                        <img
                                            src={activeSlide.image}
                                            alt="Mascot"
                                            className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-110"
                                        />
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className={`rounded-[32px] p-8 w-full max-w-sm text-center ${currentSlide === slides.length - 1 ? 'bg-transparent' : 'bg-white shadow-level-3 border-b-[8px] border-slate-200'}`}>
                                    <h2 className="text-deepNavy font-black text-3xl mb-4 leading-tight">
                                        {activeSlide.title}
                                    </h2>
                                    <p className={`${currentSlide === slides.length - 1 ? 'text-deepNavy/80' : 'text-slate-500'} font-medium text-lg leading-snug mb-8`}>
                                        {activeSlide.description}
                                    </p>

                                    <button
                                        onClick={nextSlide}
                                        className={`w-full ${activeSlide.btnClass || 'bg-sunshineYellow text-deepNavy shadow-[0_6px_0_rgb(161,98,7)]'} hover:brightness-110 font-black text-xl py-4 rounded-2xl active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/30`}
                                    >
                                        {activeSlide.btnLabel}
                                        {currentSlide !== slides.length - 1 && <ArrowRight className="w-6 h-6 stroke-[3px]" />}
                                    </button>

                                    {/* Swipe hint */}
                                    {currentSlide > 0 && currentSlide < slides.length - 1 && (
                                        <p className="text-xs text-slate-400 font-bold mt-4">
                                            ← Swipe or tap → to navigate
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Language Selection Slide */}
                        {isLanguageSlide && (
                            <div className="flex flex-col items-center w-full max-w-sm">
                                {/* Title */}
                                <h2 className="text-deepNavy font-black text-3xl mb-2 leading-tight text-center">
                                    {activeSlide.title}
                                </h2>
                                <p className="text-deepNavy/70 font-medium text-lg mb-12 text-center">
                                    {activeSlide.description}
                                </p>

                                {/* Language Cards */}
                                <div className="flex gap-6 w-full">
                                    {/* English Card */}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleLanguageSelect('en')}
                                        className={`flex-1 aspect-square rounded-[32px] flex flex-col items-center justify-center gap-4 font-black text-xl transition-all ${
                                            selectedLanguage === 'en'
                                                ? 'bg-white text-deepNavy shadow-[0_12px_0_rgba(0,0,0,0.2)] scale-105'
                                                : 'bg-white/70 backdrop-blur-sm text-deepNavy/70 hover:bg-white/90'
                                        }`}
                                    >
                                        <span className="text-5xl">🇬🇧</span>
                                        <span className="text-lg tracking-tight">English</span>
                                    </motion.button>

                                    {/* Chinese Card */}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleLanguageSelect('zh')}
                                        className={`flex-1 aspect-square rounded-[32px] flex flex-col items-center justify-center gap-4 font-black text-xl transition-all ${
                                            selectedLanguage === 'zh'
                                                ? 'bg-white text-deepNavy shadow-[0_12px_0_rgba(0,0,0,0.2)] scale-105'
                                                : 'bg-white/70 backdrop-blur-sm text-deepNavy/70 hover:bg-white/90'
                                        }`}
                                    >
                                        <span className="text-5xl">🇨🇳</span>
                                        <span className="text-lg tracking-tight">中文</span>
                                    </motion.button>
                                </div>

                                {/* Hint */}
                                {!selectedLanguage && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-8 text-deepNavy/60 font-bold text-sm text-center"
                                    >
                                        👆 Bấm vào để chọn
                                    </motion.p>
                                )}
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
                        className={`h-3 rounded-full transition-all duration-300 ${
                            index === currentSlide
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

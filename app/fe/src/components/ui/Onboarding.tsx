import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { mascotSpeak, stopMascotAudio } from '../../utils/feedbackUtils';

interface OnboardingProps {
    onFinish: () => void;
}

// Local speak helper removed to use central feedbackUtils

const slides = [
    {
        id: 'welcome',
        type: 'standard',
        title: "Chào mừng Bạn yêu! 🦉",
        description: "Cùng tớ khám phá bí mật của thế giới nhé!",
        image: "/owl-mascot.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP THEO"
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
        description: "Bạn hãy phát âm thật chuẩn để bắt bài nhé!",
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
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dragX, setDragX] = useState(0);
    const { playPop } = useSoundEffects();

    // Auto-play TTS on slide change
    useEffect(() => {
        const activeSlide = slides[currentSlide];
        const timer = setTimeout(() => {
            if (activeSlide.id === 'welcome') mascotSpeak("Chào bạn! Khám phá thế giới cùng tớ nhé!", 'vi-VN', true);
            else if (activeSlide.id === 'camera') mascotSpeak("Dùng camera tìm đồ vật nha!", 'vi-VN', true);
            else if (activeSlide.id === 'pronunciation') mascotSpeak("Phát âm chuẩn để thẻ tiến hóa!", 'vi-VN', true);
            else if (activeSlide.id === 'collection') mascotSpeak("Kho báu đang chờ. Bắt đầu thôi!", 'vi-VN', true);
        }, 500);
        return () => {
            clearTimeout(timer);
            stopMascotAudio();
        };
    }, [currentSlide]);

    const handleFinish = () => {
        stopMascotAudio();
        playPop();
        onFinish();
    };

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            playPop();
            setCurrentSlide(currentSlide + 1);
        } else {
            handleFinish();
        }
    };

    const previousSlide = () => {
        if (currentSlide > 0) {
            playPop();
            setCurrentSlide(currentSlide - 1);
        }
    };

    const activeSlide = slides[currentSlide];

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-all duration-700 bg-gradient-to-b ${activeSlide.bgClass} font-sans`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
                <button onClick={handleFinish} className="w-10 h-10 flex items-center justify-center text-deepNavy/40 hover:text-deepNavy">
                    <X className="w-8 h-8" />
                </button>
                <h1 className="text-deepNavy font-black text-xl tracking-tight">SnapLearn</h1>
                <button onClick={handleFinish} className="text-deepNavy/40 font-bold text-base hover:text-deepNavy px-2">
                    Bỏ qua
                </button>
            </div>

            {/* Content - Swipe-enabled (fixed: use refs to prevent duplicate handlers) */}
            <div
                className="flex-1 flex flex-col items-center justify-center px-6"
                onMouseDown={(e) => {
                    // Only handle if the target is not a button
                    if ((e.target as HTMLElement).closest('button')) return;
                    const startX = e.clientX;
                    let moved = false;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                        const dx = moveEvent.clientX - startX;
                        if (Math.abs(dx) > 10) moved = true;
                        setDragX(dx);
                    };
                    const handleMouseUp = (upEvent: MouseEvent) => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        if (!moved) { setDragX(0); return; }
                        const distance = upEvent.clientX - startX;
                        if (distance > 60) previousSlide();
                        else if (distance < -60) nextSlide();
                        setDragX(0);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }}
                onTouchStart={(e) => {
                    // Only handle if the target is not a button
                    if ((e.target as HTMLElement).closest('button')) return;
                    const startX = e.touches[0].clientX;
                    let moved = false;
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                        const dx = moveEvent.touches[0].clientX - startX;
                        if (Math.abs(dx) > 10) moved = true;
                        setDragX(dx);
                    };
                    const handleTouchEnd = (upEvent: TouchEvent) => {
                        e.currentTarget.removeEventListener('touchmove', handleTouchMove);
                        e.currentTarget.removeEventListener('touchend', handleTouchEnd);
                        if (!moved) { setDragX(0); return; }
                        const distance = upEvent.changedTouches[0].clientX - startX;
                        if (distance > 60) previousSlide();
                        else if (distance < -60) nextSlide();
                        setDragX(0);
                    };
                    e.currentTarget.addEventListener('touchmove', handleTouchMove);
                    e.currentTarget.addEventListener('touchend', handleTouchEnd);
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
                                        {/* Mascot Container */}
                                        <div className="relative w-full h-full">
                                            {/* Static/Subtle Mascot Wrapper */}
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={activeSlide.image}
                                                    alt="Mascot"
                                                    className="w-full h-full object-contain scale-105"
                                                />
                                            </div>

                                            {/* Musical Notes Decoration */}
                                            {activeSlide.id === 'pronunciation' && (
                                                <>
                                                    <motion.div
                                                        animate={{ y: -20, opacity: [0, 1, 0], x: 10 }}
                                                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                                                        className="absolute top-10 right-10 text-3xl"
                                                    >🎵</motion.div>
                                                    <motion.div
                                                        animate={{ y: -30, opacity: [0, 1, 0], x: -10 }}
                                                        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                                                        className="absolute top-20 left-10 text-2xl"
                                                    >🎶</motion.div>
                                                </>
                                            )}
                                        </div>
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

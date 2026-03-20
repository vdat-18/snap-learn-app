import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

interface OnboardingProps {
    onFinish: () => void;
}

const slides = [
    {
        title: "Chào mừng đến SnapLearn!",
        description: "Khám phá thế giới và học từ mới mỗi ngày!",
        image: "/owl-mascot.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP THEO"
    },
    {
        title: "Chụp vật xung quanh!",
        description: "Đưa camera về phía vật thể và nhấn nút chụp",
        image: "/camera-kitten.png",
        bgClass: "from-yellow-400 to-green-500",
        btnLabel: "TIẾP TỤC"
    },
    {
        title: "Nói để thu thập!",
        description: "Phát âm đúng để thêm từ vào bộ sưu tập",
        image: "/mic-waves.png",
        bgClass: "from-sky-300 to-sky-500",
        btnLabel: "TIẾP TỤC"
    },
    {
        title: "Sưu tập & Thăng cấp!",
        description: "Thu thập từ hiếm, hoàn thành nhiệm vụ, trở thành nhà vô địch!",
        image: "/collection-cards.png",
        bgClass: "from-yellow-400 to-yellow-500",
        btnLabel: "🚀 Bắt đầu khám phá!",
        btnClass: "bg-coralRed text-white shadow-[0_6px_0_rgb(153,27,27)]"
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onFinish();
        }
    };

    const activeSlide = slides[currentSlide];

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

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center"
                    >
                        {/* Mascot Illustration */}
                        <div className="relative mb-8">
                            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[40px] bg-white/40 backdrop-blur-sm border-4 border-white/60 flex items-center justify-center overflow-hidden shadow-level-3">
                                <img
                                    src={activeSlide.image}
                                    alt="Mascot"
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-110"
                                />
                            </div>

                            {/* Floating Decorative Elements could go here */}
                        </div>

                        {/* Info Box */}
                        <div className={`rounded-[32px] p-8 w-full max-w-sm text-center ${currentSlide === 3 ? 'bg-transparent' : 'bg-white shadow-level-3 border-b-[8px] border-slate-200'}`}>
                            <h2 className="text-deepNavy font-black text-3xl mb-4 leading-tight">
                                {activeSlide.title}
                            </h2>
                            <p className={`${currentSlide === 3 ? 'text-deepNavy/80' : 'text-slate-500'} font-medium text-lg leading-snug mb-8`}>
                                {activeSlide.description}
                            </p>

                            <button
                                onClick={nextSlide}
                                className={`w-full ${activeSlide.btnClass || 'bg-sunshineYellow text-deepNavy shadow-[0_6px_0_rgb(161,98,7)]'} hover:brightness-110 font-black text-xl py-4 rounded-2xl active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 border-t-2 border-white/30`}
                            >
                                {activeSlide.btnLabel}
                                {currentSlide !== 3 && <ArrowRight className="w-6 h-6 stroke-[3px]" />}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-3 pb-12">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? `w-8 ${currentSlide === 3 ? 'bg-deepNavy' : 'bg-sunshineYellow'}` : 'w-3 bg-black/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Onboarding;

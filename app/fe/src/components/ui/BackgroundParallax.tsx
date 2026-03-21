import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface BackgroundParallaxProps {
    children: React.ReactNode;
    className?: string;
}

const BackgroundParallax: React.FC<BackgroundParallaxProps> = ({ children, className = "" }) => {
    const { scrollYProgress } = useScroll();

    // Create slow moving layers
    const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className={`relative overflow-hidden bg-snowWhite ${className}`}>
            {/* Layer 1: Stars/Dust */}
            <motion.div
                style={{ y: layer1Y }}
                className="absolute inset-0 pointer-events-none opacity-20"
            >
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-2xl"
                        style={{
                            top: `${(i * 20) % 100}%`,
                            left: `${(i * 30) % 100}%`
                        }}
                    >
                        ✨
                    </div>
                ))}
            </motion.div>

            {/* Layer 2: Soft blobs */}
            <motion.div
                style={{ y: layer2Y }}
                className="absolute inset-0 pointer-events-none opacity-10"
            >
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-skyBlue rounded-full blur-[100px]" />
                <div className="absolute top-3/4 -right-20 w-64 h-64 bg-sunshineYellow rounded-full blur-[80px]" />
            </motion.div>

            {/* Main Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default BackgroundParallax;

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface TradingCardProps {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}

const TradingCard: React.FC<TradingCardProps> = ({ children, onClick, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring animation for the rotation
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // For touch devices, we'll just use a simpler subtle tilt or none
    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative perspective-[1000px] cursor-pointer ${className}`}
        >
            <div style={{ transform: "translateZ(30px)" }} className="w-full h-full">
                {children}
            </div>
            {/* Glossy Overlay */}
            <motion.div
                style={{
                    background: useTransform(
                        mouseXSpring,
                        [-0.5, 0.5],
                        ["linear-gradient(110deg, rgba(255,255,255,0.2) 0%, transparent 60%)", "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.2) 100%)"]
                    )
                }}
                className="absolute inset-0 pointer-events-none rounded-[24px]"
            />
        </motion.div>
    );
};

export default TradingCard;

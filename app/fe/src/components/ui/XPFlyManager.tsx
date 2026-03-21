import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Particle {
    id: number;
    startX: number;
    startY: number;
}

interface XPFlyManagerProps {
    targetX: number; // The screen X coordinate of the Level bar
    targetY: number; // The screen Y coordinate of the Level bar
}

/**
 * Global XP Fly Effect Manager
 * Listens for custom events to trigger star bursts
 */
const XPFlyManager: React.FC<XPFlyManagerProps> = ({ targetX, targetY }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    const spawnParticles = useCallback((e: any) => {
        const { x, y, count = 5 } = e.detail;
        const newParticles = Array.from({ length: count }).map(() => ({
            id: Math.random(),
            startX: x,
            startY: y
        }));
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    useEffect(() => {
        window.addEventListener('trigger-xp-fly', spawnParticles);
        return () => window.removeEventListener('trigger-xp-fly', spawnParticles);
    }, [spawnParticles]);

    const removeParticle = (id: number) => {
        setParticles(prev => prev.filter(p => p.id !== id));
    };

    const handleAnimationComplete = (id: number) => {
        removeParticle(id);

        // Dispatch event to increment display XP
        window.dispatchEvent(new CustomEvent('xp-particle-arrived'));

        // Haptic feedback on impact
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10); // Very light tick
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[999]">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{
                            x: p.startX,
                            y: p.startY,
                            scale: 0,
                            opacity: 1
                        }}
                        animate={{
                            x: [p.startX, p.startX + (Math.random() * 150 - 75), targetX],
                            y: [p.startY, p.startY - (Math.random() * 150 + 50), targetY],
                            scale: [0, 1.5, 0.8],
                            opacity: [1, 1, 0.8],
                            rotate: 360
                        }}
                        transition={{
                            duration: 0.5 + Math.random() * 0.2, // Faster flight: 0.5s to 0.7s
                            ease: "easeInOut",
                            times: [0, 0.4, 1]
                        }}
                        onAnimationComplete={() => handleAnimationComplete(p.id)}
                        className="absolute text-3xl drop-shadow-[0_0_8px_rgba(255,210,52,0.8)] filter"
                    >
                        ⭐
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default XPFlyManager;

/**
 * Utility to trigger the effect from anywhere
 */
export const triggerXPFly = (x: number, y: number, count = 5) => {
    window.dispatchEvent(new CustomEvent('trigger-xp-fly', {
        detail: { x, y, count }
    }));
};

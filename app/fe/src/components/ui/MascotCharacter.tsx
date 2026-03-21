import React from 'react';
import { motion } from 'framer-motion';

export type MascotState = 'idle' | 'talking' | 'thinking' | 'excited' | 'shy';

interface MascotCharacterProps {
    state?: MascotState;
    size?: number;
    className?: string;
    showSpeechBubble?: boolean;
    speechText?: string;
}

const MascotCharacter: React.FC<MascotCharacterProps> = ({
    state = 'idle',
    size = 200,
    className = "",
    showSpeechBubble = false,
    speechText = ""
}) => {
    // Animation Variants
    const variants = {
        idle: {
            y: [0, -10, 0],
            rotate: [0, 1, -1, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        },
        thinking: {
            rotate: [0, -5, 5, 0],
            scale: [1, 1.02, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        },
        talking: {
            y: [0, -5, 0],
            scaleX: [1, 1.05, 1],
            transition: {
                duration: 0.3,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        },
        excited: {
            y: [0, -30, 0],
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.2, 1],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "backOut" as const
            }
        },
        shy: {
            x: [0, 5, -5, 0],
            rotate: [0, -5, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <div className={`relative flex flex-col items-center ${className}`} style={{ width: size, height: size }}>
            {/* Speech Bubble */}
            {showSpeechBubble && speechText && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute bottom-full mb-4 bg-white px-6 py-4 rounded-[32px] shadow-level-3 border-2 border-slate-100 min-w-[200px] z-20"
                >
                    <p className="text-sm font-bold text-deepNavy text-center leading-snug">
                        {speechText}
                    </p>
                    {/* Bubble Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-100 rotate-45 -translate-y-2" />
                </motion.div>
            )}

            {/* Mascot Image */}
            <motion.div
                variants={variants}
                animate={state}
                className="w-full h-full relative"
            >
                {/* Thinking Cloud Effect */}
                {state === 'thinking' && (
                    <div className="absolute -top-4 -right-4 flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                    y: [0, -20 * i]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4
                                }}
                                className="w-3 h-3 bg-white/40 rounded-full"
                            />
                        ))}
                    </div>
                )}

                <img
                    src="/owl-mascot.png"
                    alt="Wise Owl Mascot"
                    className="w-full h-full object-contain drop-shadow-xl"
                />

                {/* Eyes blinking */}
                <motion.div
                    animate={{
                        scaleY: [1, 1, 0.1, 1, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        times: [0, 0.9, 0.92, 0.94, 1]
                    }}
                    style={{ originY: 0.35 }}
                    className="absolute inset-0 pointer-events-none"
                />
            </motion.div>
        </div>
    );
};

export default MascotCharacter;

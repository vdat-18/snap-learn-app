import React from 'react';
import { motion } from 'framer-motion';

interface AIProcessingLoadingProps {
  isVisible: boolean;
  progress?: number; // 0-100, optional
}

const AIProcessingLoading: React.FC<AIProcessingLoadingProps> = ({
  isVisible,
  progress = 0
}) => {
  // Animated particles for scanning effect
  const scanParticles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    delay: i * 0.1,
  }));

  return (
    <>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[280] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
        >
          <div className="flex flex-col items-center gap-8 max-w-sm">
            {/* Mysterious Question Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-white font-black text-3xl mb-2 leading-tight">
                Bạn tìm thấy gì đây...?
              </h2>
              <p className="text-white/70 font-bold text-sm">
                Cú thông thái đang nghĩ...
              </p>
            </motion.div>

            {/* Scanning Effect Circle with particles */}
            <motion.div
              className="relative w-48 h-48"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-skyBlue border-r-sunshineYellow"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Middle ring */}
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-transparent border-b-skyBlue border-l-sunshineYellow"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Scanning particles */}
              {scanParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 rounded-full bg-skyBlue"
                  style={{
                    left: '50%',
                    top: '0%',
                    originX: '0',
                    originY: '5rem',
                  }}
                  animate={{
                    rotate: 360,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: particle.delay,
                    repeat: Infinity,
                  }}
                />
              ))}

              {/* Central pulsing dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-sunshineYellow -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-sunshineYellow"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Progress Bar (if progress is provided) */}
            {progress > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-xs"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-white/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-skyBlue via-sunshineYellow to-skyBlue"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-white/60 font-bold text-xs text-center mt-2">
                  {progress}%
                </p>
              </motion.div>
            )}

            {/* Loading dots animation */}
            <motion.div
              className="flex gap-2 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AIProcessingLoading;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ErrorType = 
  | 'mic-denied' 
  | 'api-error' 
  | 'low-confidence' 
  | 'no-internet' 
  | 'time-limit' 
  | 'storage-full'
  | 'camera-denied'
  | 'generic';

interface ErrorOverlayProps {
  type: ErrorType;
  isVisible: boolean;
  onAction?: () => void;
  onClose?: () => void;
  actionLabel?: string;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ 
  type, 
  isVisible, 
  onAction, 
  onClose,
  actionLabel 
}) => {
  // Define error configurations
  const errorConfigs: Record<ErrorType, {
    emoji: string;
    title: string;
    message: string;
    actionText: string;
  }> = {
    'mic-denied': {
      emoji: '🎤',
      title: 'Cho mình nghe giọng bạn nhé!',
      message: 'SnapLearn cần quyền truy cập microphone để luyện phát âm.',
      actionText: 'Cho phép Microphone'
    },
    'api-error': {
      emoji: '😴',
      title: 'AI hơi buồn ngủ!',
      message: 'Máy chủ đang bận. Thử lại trong vài giây nhé!',
      actionText: 'Thử Lại'
    },
    'low-confidence': {
      emoji: '🤔',
      title: 'Hmm, mình thấy chưa rõ.',
      message: 'Lại gần hơn hoặc xoay vật thể một chút nhé!',
      actionText: 'Thử Lại'
    },
    'no-internet': {
      emoji: '📡',
      title: 'Mất tín hiệu!',
      message: 'Xem bộ sưu tập trong lúc chờ mạng phục hồi nhé.',
      actionText: 'Đã Hiểu'
    },
    'time-limit': {
      emoji: '⏰',
      title: 'Bạn đã học đủ hôm nay rồi!',
      message: 'Hãy nghỉ ngơi một chút. Ngày mai gặp lại nhé! 🌟',
      actionText: 'Xem Bộ Sưu Tập'
    },
    'storage-full': {
      emoji: '📦',
      title: 'Bộ sưu tập đầy rồi!',
      message: 'Nhờ bố mẹ giúp xóa một vài ảnh nhé.',
      actionText: 'Đã Hiểu'
    },
    'camera-denied': {
      emoji: '📸',
      title: 'Cho mình xem thế giới nhé!',
      message: 'SnapLearn cần quyền camera để tìm các từ vựng xung quanh bạn.',
      actionText: 'Cho Phép Camera'
    },
    'generic': {
      emoji: '⚠️',
      title: 'Có chút lỗi xảy ra',
      message: 'Vui lòng thử lại sau!',
      actionText: 'Đóng'
    }
  };

  const config = errorConfigs[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`error-${type}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <div className="flex flex-col items-center gap-6 max-w-sm">
            {/* Emoji Icon - Large and Expressive */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="text-7xl drop-shadow-lg"
            >
              {config.emoji}
            </motion.div>

            {/* Error Message Content */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3"
            >
              <h2 className="text-3xl font-black text-white leading-tight">
                {config.title}
              </h2>
              <p className="text-white/70 font-bold text-sm leading-relaxed">
                {config.message}
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                onAction?.();
                onClose?.();
              }}
              className="w-full bg-gradient-to-br from-skyBlue to-skyBlue/80 hover:from-skyBlue/90 hover:to-skyBlue/70 text-white font-black text-lg py-4 px-8 rounded-[28px] shadow-level-3 border-t-2 border-white/20 transition-all active:scale-95"
            >
              ✨ {actionLabel || config.actionText}
            </motion.button>

            {/* Dismiss Option - Icon Only */}
            {type !== 'time-limit' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onClose}
                className="text-white/40 hover:text-white/60 text-2xl transition-colors"
              >
                ✕
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorOverlay;

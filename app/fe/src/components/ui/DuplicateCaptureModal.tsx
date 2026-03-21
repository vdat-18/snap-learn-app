import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface DuplicateState {
    isDuplicate: boolean;
    wordEn: string;
    wordVi: string;
    rarity: string;
}

const DuplicateCaptureModal: React.FC = () => {
    const [duplicateState, setDuplicateState] = useState<DuplicateState | null>(null);
    const { addXP, recordCapture } = useGameStore();

    // This would be called when a capture is attempted
    // For now, it's a placeholder for the capture flow
    /* 
    const handleDuplicateCapture = (wordEn: string, wordVi: string, rarity: string) => {
        if (useGameStore.getState().isDuplicate(wordEn)) {
            setDuplicateState({ isDuplicate: true, wordEn, wordVi, rarity });
        }
    };
    */

    const handleContinueCapture = () => {
        if (duplicateState) {
            // Award reduced XP for duplicate capture (50% of normal)
            const baseXP = 100;
            const bonusXP = baseXP * 0.5;
            addXP(Math.round(bonusXP));
            recordCapture(duplicateState.rarity);
        }
        setDuplicateState(null);
    };

    const handleCancel = () => {
        setDuplicateState(null);
    };

    const rarityLabels: Record<string, string> = {
        'Common': 'Thường nè',
        'Uncommon': 'Đặc biệt đó',
        'Rare': 'Hiếm quá đi',
        'Epic': 'Siêu hiếm',
        'Legendary': 'Huyền thoại luôn'
    };

    return (
        <AnimatePresence>
            {duplicateState && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-deepNavy/90 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-level-3 border-b-4 border-slate-100"
                    >
                        {/* Header with Icon */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-lavenderPurple/20 rounded-2xl flex items-center justify-center">
                                    <AlertCircle className="w-7 h-7 text-lavenderPurple" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-deepNavy">Bạn đã có thẻ này rồi nè!</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thẻ bị trùng mất rồi</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Word Info */}
                        <div className="bg-slate-50 rounded-[28px] p-6 mb-6 border-2 border-slate-100">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                                Bạn đã sưu tập được
                            </p>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-black text-deepNavy">
                                    {duplicateState.wordVi}
                                </span>
                                <span className="text-lg text-slate-500 font-bold">
                                    ({duplicateState.wordEn})
                                </span>
                            </div>

                            {/* Rarity Badge */}
                            <div className="inline-block">
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${duplicateState.rarity === 'Legendary'
                                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                                    : duplicateState.rarity === 'Epic'
                                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                                        : 'bg-slate-100 border-slate-300 text-slate-700'
                                    }`}>
                                    {rarityLabels[duplicateState.rarity]}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm font-bold text-slate-600 mb-8 leading-relaxed">
                            Bạn có thể tiếp tục chụp ảnh khác để thêm vào bộ sưu tập của từ này. Bạn sẽ nhận được thêm sao may mắn khi chụp lại từ đã có nhé!
                        </p>

                        {/* XP Preview */}
                        <div className="bg-sunshineYellow/10 rounded-[24px] p-4 mb-8 border-2 border-sunshineYellow/20">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                ⭐ Quà tặng nè
                            </p>
                            <p className="text-2xl font-black text-sunshineYellow">
                                +50 Sao (Quà tặng)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 rounded-[20px] font-black text-sm uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                ← Quay Lại
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleContinueCapture}
                                className="flex-1 px-6 py-3 rounded-[20px] font-black text-sm uppercase tracking-wider bg-sunshineYellow text-deepNavy hover:bg-sunshineYellow/90 transition-colors shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1 border-t-2 border-white/40"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Chụp Thêm
                                </span>
                            </motion.button>
                        </div>

                        {/* Tip */}
                        <p className="text-xs text-slate-400 text-center mt-6 font-medium">
                            💡 Mẹo nhỏ nè: Bạn hãy chụp từ nhiều hướng khác nhau để hình đẹp hơn nhé!
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DuplicateCaptureModal;

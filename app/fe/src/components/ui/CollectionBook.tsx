import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Star, Lock, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { CapturedWord } from '../../store/gameStore';
import VocabDetail from './VocabDetail';

interface CollectionBookProps {
    isOpen: boolean;
    onClose: () => void;
}

const categories = [
    { id: 'Animals', name: 'Động vật', icon: '🐾', total: 20 },
    { id: 'Food', name: 'Đồ ăn', icon: '🍎', total: 15 },
    { id: 'Nature', name: 'Tự nhiên', icon: '🌿', total: 25 },
    { id: 'School', name: 'Trường học', icon: '🏫', total: 18 },
    { id: 'Home', name: 'Nhà cửa', icon: '🏠', total: 22 },
    { id: 'Transportation', name: 'Giao thông', icon: '🚗', total: 12 },
];

const CollectionBook: React.FC<CollectionBookProps> = ({ isOpen, onClose }) => {
    const collections = useGameStore((state) => state.collections);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedWord, setSelectedWord] = useState<CapturedWord | null>(null);

    const getCategoryProgress = (catId: string) => {
        return collections.filter(w => w.category === catId).length;
    };

    const getCategoryWords = (catId: string) => {
        return collections.filter(w => w.category === catId);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[150] bg-snowWhite flex flex-col font-outfit"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 bg-white shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {selectedCategory ? (
                                <button onClick={() => setSelectedCategory(null)} className="p-2 -ml-2">
                                    <ArrowLeft className="w-8 h-8 text-deepNavy" />
                                </button>
                            ) : (
                                <button onClick={onClose} className="p-2 -ml-2">
                                    <X className="w-8 h-8 text-deepNavy" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-black text-deepNavy uppercase tracking-tight">
                                    {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '📖 Collection Book'}
                                </h1>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    {collections.length} words collected
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6">
                        {!selectedCategory ? (
                            /* Category Grid */
                            <div className="grid grid-cols-2 gap-4">
                                {categories.map((cat) => {
                                    const count = getCategoryProgress(cat.id);
                                    const progressPercent = (count / cat.total) * 100;

                                    return (
                                        <motion.button
                                            key={cat.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className="bg-white rounded-[24px] p-5 shadow-level-2 border-b-4 border-slate-100 flex flex-col items-center text-center group"
                                        >
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                                {cat.icon}
                                            </div>
                                            <h3 className="font-black text-deepNavy mb-1 uppercase text-sm tracking-wide">
                                                {cat.name}
                                            </h3>
                                            <div className="w-full mt-2">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1">
                                                    <span>{count}/{cat.total}</span>
                                                    <span>{Math.round(progressPercent)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPercent}%` }}
                                                        className="h-full bg-sky-400"
                                                    />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Vocab Word Grid - 3-4 columns for compact view */
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {getCategoryWords(selectedCategory).map((word) => (
                                    <motion.button
                                        key={word.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedWord(word)}
                                        className="bg-white rounded-[16px] overflow-hidden shadow-level-1 border-b-2 border-slate-100 text-left"
                                    >
                                        <div className="aspect-square w-full relative">
                                            <img src={word.image} alt={word.word_en} className="w-full h-full object-cover" />
                                            {word.isEvolved && (
                                                <div className="absolute top-1 left-1 bg-sunshineYellow p-0.5 rounded-lg shadow-sm">
                                                    <Sparkles className="w-3 h-3 text-deepNavy" />
                                                </div>
                                            )}
                                            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-white/90 backdrop-blur rounded text-[8px] font-black text-deepNavy shadow-sm uppercase tracking-tighter">
                                                {word.rarity.substring(0, 3)}
                                            </div>
                                        </div>
                                        <div className="p-2 text-center">
                                            <h4 className="font-black text-deepNavy leading-tight text-xs mb-0.5">{word.word_vi}</h4>
                                            <p className="text-[10px] font-bold text-sky-400">{word.word_en}</p>
                                            <div className="flex justify-center mt-1 gap-0.5">
                                                {[1, 2, 3].map(s => (
                                                    <Star
                                                        key={s}
                                                        className={`w-2 h-2 ${s <= word.stars ? 'text-sunshineYellow fill-sunshineYellow' : 'text-slate-200 fill-slate-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}

                                {/* Locked Placeholders */}
                                {Array.from({ length: Math.max(0, 12 - getCategoryWords(selectedCategory).length) }).map((_, i) => (
                                    <div key={`lock-${i}`} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[16px] aspect-square flex flex-col items-center justify-center opacity-40 grayscale">
                                        <Lock className="w-5 h-5 text-slate-300" />
                                        <span className="text-[8px] font-black mt-1 text-slate-300">LOCKED</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <VocabDetail
                        word={selectedWord}
                        isOpen={!!selectedWord}
                        onClose={() => setSelectedWord(null)}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CollectionBook;

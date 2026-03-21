import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Star, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { collectionApi, type CollectionOverview, type CategoryDetail } from '../../services/collectionApi';
import { MOCK_REFERENCE_VOCAB } from '../../store/mockData';
import VocabDetail from './VocabDetail';

interface CollectionBookProps {
    isOpen: boolean;
    onClose: () => void;
    onCategorySelectChange?: (isSelected: boolean) => void;
}

const categories = [
    { id: 'Animals', name: 'Động vật', icon: '/icon-cat-animals.png' },
    { id: 'Food', name: 'Đồ ăn', icon: '/icon-cat-food.png' },
    { id: 'Nature', name: 'Tự nhiên', icon: '🌿' },
    { id: 'School', name: 'Trường học', icon: '🏫' },
    { id: 'Home', name: 'Nhà cửa', icon: '🏠' },
    { id: 'Vehicles', name: 'Giao thông', icon: '🚗' },
];

const CollectionBook: React.FC<CollectionBookProps> = ({ isOpen, onClose, onCategorySelectChange }) => {
    const { collections } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
    const selectedWord = collections.find(w => w.id === selectedWordId) || null;
    const { playPop, playChime } = useSoundEffects();

    // Server data state
    const [serverCategories, setServerCategories] = useState<CollectionOverview | null>(null);
    const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Notify parent about category selection to show/hide nav
    React.useEffect(() => {
        if (onCategorySelectChange) {
            onCategorySelectChange(isOpen && !!selectedCategory);
        }
    }, [selectedCategory, isOpen, onCategorySelectChange]);

    // Fetch collection overview when opened
    useEffect(() => {
        if (isOpen && !selectedCategory) {
            setIsLoading(true);
            collectionApi.getCollection()
                .then(data => setServerCategories(data))
                .catch(err => console.error('Failed to fetch collection:', err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, selectedCategory]);

    // Fetch category detail when a category is selected
    useEffect(() => {
        if (selectedCategory) {
            setIsLoading(true);
            setCategoryDetail(null);
            collectionApi.getCategoryDetail(selectedCategory)
                .then(data => setCategoryDetail(data))
                .catch(err => console.error('Failed to fetch category:', err))
                .finally(() => setIsLoading(false));
        }
    }, [selectedCategory]);

    const getCategoryProgress = (catId: string) => {
        // Prefer server data, fallback to local collections
        if (serverCategories) {
            const cat = serverCategories.categories.find(c => c.name === catId || c.name.toLowerCase() === catId.toLowerCase());
            if (cat) return { captured: cat.captured, total: cat.total };
        }
        const captured = collections.filter(w => w.category === catId).length;
        const total = MOCK_REFERENCE_VOCAB.filter(w => w.category === catId).length;
        return { captured, total };
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[150] bg-snowWhite flex flex-col font-sans overflow-hidden"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            {selectedCategory ? (
                                <button onClick={() => { playPop(); setSelectedCategory(null); setCategoryDetail(null); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                    <ArrowLeft className="w-8 h-8 text-deepNavy" />
                                </button>
                            ) : (
                                <button onClick={() => { playPop(); onClose(); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                    <X className="w-8 h-8 text-deepNavy" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-lg font-black text-deepNavy tracking-tight flex items-center gap-3">
                                    {selectedCategory ? (
                                        <>
                                            {categories.find(c => c.id === selectedCategory)?.icon.startsWith('/') ? (
                                                <img src={categories.find(c => c.id === selectedCategory)?.icon} alt="" className="w-8 h-8 object-contain mix-blend-multiply" />
                                            ) : (
                                                <span>{categories.find(c => c.id === selectedCategory)?.icon}</span>
                                            )}
                                            {categories.find(c => c.id === selectedCategory)?.name}
                                        </>
                                    ) : (
                                        <>
                                            <img src="/icon-book.png" alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
                                            📖 Kho báu của Bạn
                                        </>
                                    )}
                                </h1>
                                <p className="text-xs font-black text-sky-400 uppercase tracking-widest mt-0.5">
                                    {serverCategories ? `${serverCategories.total_words} Thẻ bài đã bắt` : `${collections.length} Thẻ bài đã bắt`}
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-skyBlue animate-spin" />
                            </div>
                        )}

                        {!isLoading && !selectedCategory && (
                            /* Category Grid */
                            <div className="grid grid-cols-2 gap-5 pb-20">
                                {categories.map((cat, i) => {
                                    const { captured: count, total } = getCategoryProgress(cat.id);
                                    const progressPercent = total > 0 ? (count / total) * 100 : 0;

                                    return (
                                        <motion.button
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { playPop(); setSelectedCategory(cat.id); }}
                                            className="bg-white rounded-[32px] p-5 shadow-level-2 border-b-[6px] border-slate-100 flex flex-col items-center text-center group relative overflow-hidden"
                                        >
                                            <div className="w-24 h-24 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                {cat.icon.startsWith('/') ? (
                                                    <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                ) : (
                                                    <span className="text-5xl drop-shadow-lg">{cat.icon}</span>
                                                )}
                                            </div>
                                            <h3 className="font-black text-deepNavy text-base mb-1">{cat.name}</h3>
                                            <div className="w-full mt-2">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1.5 px-1">
                                                    <span>{count}/{total}</span>
                                                    <span>{Math.round(progressPercent)}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPercent}%` }}
                                                        className="h-full bg-sunshineYellow rounded-full shadow-[0_0_8px_rgba(255,210,52,0.6)]"
                                                    />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {!isLoading && selectedCategory && (
                            /* Vocab Word Grid */
                            <div className="grid grid-cols-3 gap-4 pb-24">
                                {MOCK_REFERENCE_VOCAB.filter(w => w.category === selectedCategory).map((refWord, i) => {
                                    const word = collections.find(w => w.word_en === refWord.word_en);
                                    const isCaptured = !!word;
                                    const isEvolved = word?.isEvolved;

                                    const rarityColors: any = {
                                        'Common': 'from-mintGreen/20 to-mintGreen/5',
                                        'Uncommon': 'from-skyBlue/20 to-skyBlue/5',
                                        'Rare': 'from-sunshineYellow/20 to-sunshineYellow/5',
                                        'Legendary': 'from-coralRed/20 to-coralRed/5'
                                    };

                                    const rarityLabels: any = {
                                        'Common': 'Thường nè',
                                        'Uncommon': 'Đặc biệt đó',
                                        'Rare': 'Hiếm quá đi',
                                        'Legendary': 'Huyền thoại luôn'
                                    };

                                    if (!isCaptured) {
                                        return (
                                            <div
                                                key={refWord.id}
                                                className="relative aspect-[3/4] rounded-[24px] bg-slate-100 border-[3px] border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center opacity-60"
                                            >
                                                <Lock className="w-6 h-6 text-slate-400 mb-2" />
                                                <span className="text-[10px] font-black text-slate-400 tracking-wider">BÍ MẬT</span>
                                                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black bg-slate-300 text-white shadow-md uppercase">
                                                    {rarityLabels[refWord.rarity_tier] || 'Thường'}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <motion.button
                                            key={word.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            whileTap={{ scale: 0.92 }}
                                            onClick={() => { playChime(); setSelectedWordId(word.id); }}
                                            className={`relative aspect-[3/4] rounded-[24px] bg-gradient-to-br ${rarityColors[word.rarity] || 'bg-white'} border-[3px] border-white shadow-level-2 overflow-hidden flex flex-col`}
                                        >
                                            <div className="flex-1 w-full relative p-2">
                                                <div className="w-full h-full rounded-[18px] overflow-hidden bg-white/50 backdrop-blur-sm shadow-inner">
                                                    <img src={word.image} alt={word.word_en} className="w-full h-full object-cover" />
                                                </div>
                                                {isEvolved && (
                                                    <div className="absolute top-3 left-3 bg-sunshineYellow p-1 rounded-full shadow-lg">
                                                        <Sparkles className="w-4 h-4 text-deepNavy" />
                                                    </div>
                                                )}
                                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black text-white shadow-md uppercase tracking-wide ${word.rarity === 'Legendary' ? 'bg-coralRed' :
                                                    word.rarity === 'Rare' ? 'bg-sunshineYellow text-deepNavy' :
                                                        word.rarity === 'Uncommon' ? 'bg-skyBlue' : 'bg-mintGreen'
                                                    }`}>
                                                    {rarityLabels[word.rarity]}
                                                </div>
                                            </div>
                                            <div className="px-2 pb-3 pt-1 text-center bg-white/40 backdrop-blur">
                                                <h4 className="font-black text-deepNavy leading-tight text-[10px] truncate mb-0.5">{word.word_vi}</h4>
                                                <p className="text-[8px] font-bold text-sky-500 leading-none">{word.word_en}</p>
                                                <div className="flex justify-center mt-1.5 gap-0.5">
                                                    {[1, 2, 3].map(s => (
                                                        <Star
                                                            key={s}
                                                            className={`w-2.5 h-2.5 ${s <= word.stars ? 'text-sunshineYellow fill-sunshineYellow' : 'text-slate-200 fill-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {selectedWord && (
                        <VocabDetail
                            key={selectedWord.id}
                            word={selectedWord}
                            onClose={() => setSelectedWordId(null)}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CollectionBook;

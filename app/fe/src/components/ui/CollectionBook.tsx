import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Star, Lock, Sparkles, Volume2 } from 'lucide-react';
import { mascotSpeak } from '../../utils/feedbackUtils';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { collectionApi, type CollectionOverview, type CategoryDetail, type CategoryProgress } from '../../services/collectionApi';
import { CollectionSkeleton } from './Skeleton';
import VocabDetail from './VocabDetail';
import TradingCard from './TradingCard';

interface CollectionBookProps {
    isOpen: boolean;
    onClose: () => void;
    onCategorySelectChange?: (isSelected: boolean) => void;
}

const CollectionBook: React.FC<CollectionBookProps> = ({ isOpen, onClose, onCategorySelectChange }) => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryProgress | null>(null);
    const [selectedVocabId, setSelectedVocabId] = useState<string | null>(null);
    const { playPop, playChime } = useSoundEffects();

    const [serverData, setServerData] = useState<CollectionOverview | null>(null);
    const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    React.useEffect(() => {
        if (onCategorySelectChange) {
            onCategorySelectChange(isOpen && !!selectedCategory);
        }
    }, [selectedCategory, isOpen, onCategorySelectChange]);

    const loadCollection = () => {
        setIsLoading(true);
        setFetchError(false);
        collectionApi.getCollection()
            .then(data => setServerData(data))
            .catch(() => setFetchError(true))
            .finally(() => setIsLoading(false));
    };

    const loadCategory = (catName: string) => {
        setIsLoading(true);
        setFetchError(false);
        setCategoryDetail(null);
        collectionApi.getCategoryDetail(catName)
            .then(data => setCategoryDetail(data))
            .catch(() => setFetchError(true))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (isOpen && !selectedCategory) {
            loadCollection();
        }
    }, [isOpen, selectedCategory]);

    useEffect(() => {
        if (selectedCategory) {
            loadCategory(selectedCategory.name);
        }
    }, [selectedCategory]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
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
                                            <span className="text-2xl">{selectedCategory.icon}</span>
                                            {selectedCategory.display_name}
                                        </>
                                    ) : (
                                        <>
                                            <motion.img
                                                layoutId="book-icon"
                                                src="/icon-book.png"
                                                alt=""
                                                className="w-10 h-10 object-contain mix-blend-multiply"
                                            />
                                            Kho báu của Bạn
                                        </>
                                    )}
                                </h1>
                                <p className="text-xs font-black text-sky-400 uppercase tracking-widest mt-0.5">
                                    {serverData ? `${serverData.total_words} Thẻ bài đã bắt` : 'Đang tải...'}
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 pb-32">
                        {isLoading && (
                            <CollectionSkeleton />
                        )}

                        {fetchError && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <span className="text-5xl">😴</span>
                                <p className="text-base font-black text-deepNavy">Ối! Không tải được dữ liệu</p>
                                <p className="text-sm text-slate-400 font-bold">Kiểm tra kết nối mạng rồi thử lại nhé!</p>
                                <button
                                    onClick={() => selectedCategory ? loadCategory(selectedCategory.name) : loadCollection()}
                                    className="bg-skyBlue text-white px-6 py-3 rounded-2xl font-black text-sm shadow-level-2"
                                >
                                    🔄 Thử lại
                                </button>
                            </div>
                        )}

                        {!isLoading && !fetchError && !selectedCategory && serverData && (
                            /* Category Grid — server-sorted by most captured first */
                            <div className="grid grid-cols-2 gap-5 pb-20">
                                {serverData.categories.map((cat, i) => {
                                    const progressPercent = cat.total > 0 ? (cat.captured / cat.total) * 100 : 0;

                                    return (
                                        <motion.button
                                            key={cat.name}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { playPop(); setSelectedCategory(cat); }}
                                            className={`bg-white rounded-[32px] p-5 shadow-level-2 border-b-[6px] border-slate-100 flex flex-col items-center text-center group relative overflow-hidden ${cat.captured === 0 ? 'opacity-50' : ''
                                                }`}
                                        >
                                            <div className="w-24 h-24 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <span className="text-5xl drop-shadow-lg">{cat.icon}</span>
                                            </div>
                                            <h3 className="font-black text-deepNavy text-base mb-1">{cat.display_name}</h3>
                                            <div className="w-full mt-2">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1.5 px-1">
                                                    <span>{cat.captured}/{cat.total}</span>
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

                        {!isLoading && !fetchError && selectedCategory && categoryDetail && (
                            /* Vocab Word Grid - Trading Card Style */
                            <div className="grid grid-cols-3 gap-4 pb-24">
                                {categoryDetail.captured_words.map((card) => {
                                    const rarityColors: Record<string, string> = {
                                        'common': 'from-mintGreen/20 to-mintGreen/5',
                                        'uncommon': 'from-skyBlue/20 to-skyBlue/5',
                                        'rare': 'from-sunshineYellow/20 to-sunshineYellow/5',
                                        'epic': 'from-lavenderPurple/20 to-lavenderPurple/5',
                                        'legendary': 'from-coralRed/20 to-coralRed/5',
                                    };

                                    const rarityLabels: Record<string, string> = {
                                        'common': 'Thường nè',
                                        'uncommon': 'Đặc biệt đó',
                                        'rare': 'Hiếm quá đi',
                                        'epic': 'Siêu hiếm',
                                        'legendary': 'Huyền thoại luôn',
                                    };

                                    const tier = card.rarity_tier.toLowerCase();
                                    const masteryMax = Math.max(card.mastery_en, card.mastery_vi, card.mastery_zh);

                                    return (
                                        <TradingCard
                                            key={card.id}
                                            onClick={() => { playChime(); setSelectedVocabId(card.id); }}
                                            className={`relative aspect-[3/4] rounded-[24px] bg-gradient-to-br ${rarityColors[tier] || 'bg-white'} border-[3px] border-white shadow-level-2 overflow-hidden flex flex-col`}
                                        >
                                            <div className="flex-1 w-full relative p-2">
                                                <div className="w-full h-full rounded-[18px] overflow-hidden bg-white/50 backdrop-blur-sm shadow-inner">
                                                    {card.photo_url ? (
                                                        <img src={card.photo_url} alt={card.word_en} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">📷</div>
                                                    )}
                                                </div>
                                                {card.evolved && (
                                                    <div className="absolute top-3 left-3 bg-sunshineYellow p-1 rounded-full shadow-lg">
                                                        <Sparkles className="w-4 h-4 text-deepNavy" />
                                                    </div>
                                                )}
                                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black text-white shadow-md uppercase tracking-wide ${tier === 'legendary' ? 'bg-coralRed' :
                                                        tier === 'epic' ? 'bg-lavenderPurple' :
                                                            tier === 'rare' ? 'bg-sunshineYellow text-deepNavy' :
                                                                tier === 'uncommon' ? 'bg-skyBlue' : 'bg-mintGreen'
                                                    }`}>
                                                    {rarityLabels[tier] || 'Thường'}
                                                </div>
                                            </div>
                                            <div className="px-2 pb-3 pt-1 bg-white/40 backdrop-blur">
                                                <div className="flex items-center justify-center gap-1">
                                                    <h4 className="font-black text-deepNavy leading-tight text-[10px] truncate">{card.word_en}</h4>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); mascotSpeak(card.word_en, 'en-US'); }}
                                                        className="flex-shrink-0 p-0.5 rounded-full text-skyBlue active:scale-90 transition-transform"
                                                    >
                                                        <Volume2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-[8px] font-bold text-slate-400 leading-none text-center mt-0.5">{card.word_vi}</p>
                                                <div className="flex justify-center mt-1.5 gap-0.5">
                                                    {[1, 2, 3].map(s => (
                                                        <Star
                                                            key={s}
                                                            className={`w-2.5 h-2.5 ${s <= masteryMax ? 'text-sunshineYellow fill-sunshineYellow' : 'text-slate-200 fill-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </TradingCard>
                                    );
                                })}

                                {/* Undiscovered placeholder cards */}
                                {Array.from({ length: categoryDetail.undiscovered_count }).map((_, i) => (
                                    <div
                                        key={`undiscovered-${i}`}
                                        className="relative aspect-[3/4] rounded-[24px] bg-slate-100 border-[3px] border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center opacity-60"
                                    >
                                        <Lock className="w-6 h-6 text-slate-400 mb-2" />
                                        <span className="text-[10px] font-black text-slate-400 tracking-wider">BÍ MẬT</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedVocabId && (
                        <VocabDetail
                            key={selectedVocabId}
                            vocabId={selectedVocabId}
                            onClose={() => setSelectedVocabId(null)}
                        />
                    )}
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};

export default CollectionBook;

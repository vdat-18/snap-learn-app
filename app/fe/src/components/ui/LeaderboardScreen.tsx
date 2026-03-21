import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Timer } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { MOCK_LEADERBOARD } from '../../store/mockData';

interface LeaderboardScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ isOpen, onClose }) => {
    const { xp, level, userName } = useGameStore();
    const { playPop } = useSoundEffects();
    const [activeTab, setActiveTab] = useState('All');

    const currentPlayers = MOCK_LEADERBOARD[activeTab] || [];
    const top3 = currentPlayers.slice(0, 3);
    const others = currentPlayers.slice(3);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[150] bg-snowWhite flex flex-col font-sans"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { playPop(); onClose(); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                            <h1 className="text-lg font-black text-deepNavy tracking-tight flex items-center gap-3">
                                <img src="/icon-rank.png" alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
                                👑 Siêu nhân Snap
                            </h1>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl relative mb-8">
                            {['Class', 'Friends', 'All'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => { playPop(); setActiveTab(tab); }}
                                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all relative z-10 ${activeTab === tab ? 'text-deepNavy' : 'text-slate-400'}`}
                                >
                                    {tab === 'Class' ? '🏫 Lớp mình' : tab === 'Friends' ? '👫 Bạn bè' : '🌍 Thế giới'}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center justify-center gap-2 mb-8 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-2 rounded-full border border-slate-100">
                            <Timer className="w-3 h-3" />
                            ⏳ Sắp có nhà vô địch mới trong: 12 ngày
                        </div>

                        {/* Podium Section */}
                        <div className="flex items-end justify-center gap-2 mb-10 h-64 border-b-2 border-slate-50 pb-4">
                            {/* #2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div className="text-4xl mb-2 relative">
                                    <span className="relative z-10">{top3[1]?.avatar || '👤'}</span>
                                    <div className="absolute -top-1 -right-1 text-xl">🥈</div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-t-2xl shadow-sm p-3 text-center border-t-4 border-slate-300 h-28 flex flex-col justify-end">
                                    <span className="block font-black text-xs text-deepNavy truncate">{top3[1]?.name || '---'}</span>
                                    <span className="block font-bold text-[10px] text-skyBlue">{top3[1]?.points || 0} XP</span>
                                </div>
                            </motion.div>

                            {/* #1 */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                                className="flex-1 flex flex-col items-center -mb-4"
                            >
                                <div className="relative mb-3">
                                    <Crown className="w-10 h-10 text-sunshineYellow absolute -top-8 left-1/2 -translate-x-1/2 fill-sunshineYellow rotate-12 drop-shadow-sm" />
                                    <div className="text-6xl relative z-10">{top3[0]?.avatar || '👤'}</div>
                                </div>
                                <div className="w-full bg-sunshineYellow rounded-t-3xl shadow-level-2 p-3 text-center border-t-8 border-yellow-500 h-44 flex flex-col justify-end">
                                    <span className="block font-black text-xs text-deepNavy truncate">{top3[0]?.name || '---'}</span>
                                    <span className="block font-bold text-xs text-slate-700">{top3[0]?.points || 0} XP</span>
                                </div>
                            </motion.div>

                            {/* #3 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div className="text-4xl mb-2 relative">
                                    <span className="relative z-10">{top3[2]?.avatar || '👤'}</span>
                                    <div className="absolute -top-1 -right-1 text-xl">🥉</div>
                                </div>
                                <div className="w-full bg-amber-50 rounded-t-2xl shadow-sm p-3 text-center border-t-4 border-amber-400 h-20 flex flex-col justify-end">
                                    <span className="block font-black text-xs text-deepNavy truncate">{top3[2]?.name || '---'}</span>
                                    <span className="block font-bold text-[10px] text-amber-600">{top3[2]?.points || 0} XP</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Others List */}
                        <div className="space-y-4">
                            {others.map((player, idx) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="bg-white p-4 rounded-[20px] shadow-sm flex items-center justify-between border-b-2 border-slate-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">
                                            {player.rank === 4 ? '4️⃣' : player.rank === 5 ? '5️⃣' : player.rank === 6 ? '6️⃣' : player.rank === 7 ? '7️⃣' : '8️⃣'}
                                        </span>
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-white">
                                            {player.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-deepNavy text-xs">{player.name}</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-skyBlue text-xs">⭐ {player.points}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / User Stick Position */}
                    <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 absolute bottom-0 left-0 right-0 z-50">
                        <div className="max-w-md mx-auto bg-deepNavy rounded-[24px] p-5 flex items-center justify-between shadow-level-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-skyBlue rounded-full flex items-center justify-center text-xl text-white font-black border-2 border-white/20">
                                    {level}
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-xs">BÉ ({userName})</h4>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sunshineYellow text-base">⭐ {xp}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LeaderboardScreen;
